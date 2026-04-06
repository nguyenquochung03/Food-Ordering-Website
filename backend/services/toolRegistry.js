import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import visitModel from "../models/visitModel.js";
import deliveryStaffModel from "../models/deliveryStaffModel.js";
import deliveryStaffOrderModel from "../models/deliveryStaffOrderModel.js";

function periodMatch(period) {
  const now = new Date();
  let start;
  switch ((period || "month").toLowerCase()) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case "quarter":
      start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "month":
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  return { $gte: start, $lte: now };
}

async function get_revenue_summary({ period = "month" } = {}) {
  try {
    const range = periodMatch(period);
    const res = await orderModel.aggregate([
      { $match: { date: range } },
      { $group: { _id: null, total: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
    ]).allowDiskUse(true);

    const current = res[0] || { total: 0, orderCount: 0 };

    // previous period (naive: shift month)
    const prevStart = new Date(range.$gte);
    const prevEnd = new Date(range.$gte);
    if (period === "month") {
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevEnd.setMonth(prevEnd.getMonth() - 1);
    } else {
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevEnd.setMonth(prevEnd.getMonth() - 1);
    }

    const prev = await orderModel.aggregate([
      { $match: { date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
    ]).allowDiskUse(true);

    const previous = prev[0] || { total: 0, orderCount: 0 };

    const change = previous.total ? Number((((current.total - previous.total) / previous.total) * 100).toFixed(2)) : 0;

    return { total: current.total || 0, orderCount: current.orderCount || 0, changePercent: change };
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_top_foods({ period = "month", limit = 5 } = {}) {
  try {
    const range = periodMatch(period);
    // items in orders: assume items array has { name, price, quantity }
    const res = await orderModel.aggregate([
      { $unwind: "$items" },
      { $match: { date: range } },
      { $group: { _id: "$items.name", sold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      { $project: { _id: 0, name: "$_id", sold: 1, revenue: 1 } },
    ]).allowDiskUse(true);
    return res;
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_order_status_breakdown({ period = "month" } = {}) {
  try {
    const range = periodMatch(period);
    const res = await orderModel.aggregate([
      { $match: { date: range } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).allowDiskUse(true);
    const out = { pending: 0, done: 0, cancelled: 0, cancelRatePercent: 0 };
    let total = 0;
    res.forEach((r) => {
      total += r.count;
      if (/cancel/i.test(r._id)) out.cancelled += r.count;
      else if (/delivered|done|completed/i.test(r._id)) out.done += r.count;
      else out.pending += r.count;
    });
    out.cancelRatePercent = total ? Number(((out.cancelled / total) * 100).toFixed(22)) : 0;
    return out;
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_customer_insights({ period = "month", limit = 5 } = {}) {
  try {
    const range = periodMatch(period);
    const res = await orderModel.aggregate([
      { $match: { date: range } },
      { $group: { _id: "$userId", totalSpent: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, name: { $ifNull: ["$user.name", "Khách vãng lai"] }, totalSpent: 1, orderCount: 1 } },
    ]).allowDiskUse(true);
    return res;
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_food_availability({} = {}) {
  try {
    const res = await foodModel.aggregate([
      { $project: { _id: 0, name: "$name", category: "$category", available: { $cond: [{ $eq: ["$status", "serving"] }, true, false] } } },
    ]).allowDiskUse(true);
    return res;
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_delivery_performance({ period = "month", limit = 10 } = {}) {
  try {
    const range = periodMatch(period);
    // join deliveryStaffOrder -> orders -> compute avgTime (not available) — return counts
    const res = await deliveryStaffOrderModel.aggregate([
      { $lookup: { from: "orders", localField: "orderId", foreignField: "_id", as: "order" } },
      { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
      { $match: { "order.date": range } },
      { $group: { _id: "$deliveryStaffId", delivered: { $sum: { $cond: ["$delivered", 1, 0] } }, total: { $sum: 1 } } },
      { $lookup: { from: "deliverystaffs", localField: "_id", foreignField: "_id", as: "staff" } },
      { $unwind: { path: "$staff", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, staffName: { $ifNull: ["$staff.name", "Unknown"] }, delivered: 1, avgTime: null } },
      { $limit: limit },
    ]).allowDiskUse(true);
    return res;
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_visit_analytics({ period = "month" } = {}) {
  try {
    const range = periodMatch(period);
    const res = await visitModel.aggregate([
      { $match: { timestamp: range } },
      { $group: { _id: null, totalVisits: { $sum: 1 } } },
    ]).allowDiskUse(true);
    const total = res[0]?.totalVisits || 0;
    return { totalVisits: total, peakHour: null, trend: [] };
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_category_breakdown({ period = "month" } = {}) {
  try {
    const range = periodMatch(period);
    const res = await orderModel.aggregate([
      { $unwind: "$items" },
      { $match: { date: range } },
      { $lookup: { from: "foods", localField: "items.name", foreignField: "name", as: "food" } },
      { $unwind: { path: "$food", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$food.category", revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $project: { _id: 0, category: "$_id", revenue: 1 } },
      { $sort: { revenue: -1 } },
    ]).allowDiskUse(true);
    const total = res.reduce((s, r) => s + (r.revenue || 0), 0);
    return res.map((r) => ({ category: r.category, revenue: r.revenue, percentage: total ? Number(((r.revenue / total) * 100).toFixed(2)) : 0 }));
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_cancellation_analysis({ period = "month" } = {}) {
  try {
    const range = periodMatch(period);
    const res = await orderModel.aggregate([
      { $match: { date: range, status: /cancel/i } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", cancelled: { $sum: 1 } } },
      { $sort: { cancelled: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: "$_id", cancelled: 1 } },
    ]).allowDiskUse(true);
    return { total: res.reduce((s, r) => s + r.cancelled, 0), topCancelledFoods: res, trend: [] };
  } catch (error) {
    return { error: String(error) };
  }
}

async function get_time_series_data({ period = "month", granularity = "day" } = {}) {
  try {
    const range = periodMatch(period);
    // group by day for month
    const res = await orderModel.aggregate([
      { $match: { date: range } },
      { $project: { amount: 1, day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } } },
      { $group: { _id: "$day", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).allowDiskUse(true);
    const labels = res.map((r) => r._id);
    const revenue = res.map((r) => r.revenue || 0);
    const orders = res.map((r) => r.orders || 0);
    return { labels, revenue, orders };
  } catch (error) {
    return { error: String(error) };
  }
}

const tools = {
  get_revenue_summary,
  get_top_foods,
  get_order_status_breakdown,
  get_customer_insights,
  get_food_availability,
  get_delivery_performance,
  get_visit_analytics,
  get_category_breakdown,
  get_cancellation_analysis,
  get_time_series_data,
};

export function getToolNames() {
  return Object.keys(tools);
}

export function getAllToolDefinitions() {
  return [
    { name: "get_revenue_summary", description: "Doanh thu + số đơn, so sánh kỳ trước", params: { period: "month" } },
    { name: "get_top_foods", description: "Top món bán chạy", params: { period: "month", limit: 5 } },
    { name: "get_order_status_breakdown", description: "Phân tích trạng thái đơn hàng", params: { period: "month" } },
    { name: "get_customer_insights", description: "Top khách hàng theo doanh thu", params: { period: "month", limit: 5 } },
    { name: "get_food_availability", description: "Món đang có / hết", params: {} },
    { name: "get_delivery_performance", description: "Hiệu suất shipper", params: { period: "month" } },
    { name: "get_visit_analytics", description: "Lượt truy cập theo thời gian", params: { period: "month" } },
    { name: "get_category_breakdown", description: "Doanh thu theo danh mục", params: { period: "month" } },
    { name: "get_cancellation_analysis", description: "Phân tích đơn bị hủy", params: { period: "month" } },
    { name: "get_time_series_data", description: "Chuỗi thời gian cho biểu đồ", params: { period: "month", granularity: "day" } },
  ];
}

export async function executeTool(name, params = {}) {
  const fn = tools[name];
  if (!fn) return { error: `Tool ${name} not found` };
  try {
    const out = await fn(params);
    return out;
  } catch (error) {
    return { error: String(error) };
  }
}

export default { getAllToolDefinitions, executeTool, getToolNames };
