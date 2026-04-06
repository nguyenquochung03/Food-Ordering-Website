import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

let _cache = {
  dashboardContext: null,
  updatedAt: 0,
};

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

function _isCacheValid() {
  return Date.now() - _cache.updatedAt < CACHE_TTL && _cache.dashboardContext;
}

export async function getMonthlyRevenueSummary() {
  // Aggregate revenue grouped by year-month for the last 2 months
  const res = await orderModel.aggregate([
    {
      $project: {
        amount: 1,
        yearMonth: { $dateToString: { format: "%Y-%m", date: "$date" } },
      },
    },
    { $group: { _id: "$yearMonth", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
    { $sort: { _id: -1 } },
    { $limit: 2 },
  ]);

  const current = res[0] || { _id: null, revenue: 0, orders: 0 };
  const previous = res[1] || { _id: null, revenue: 0, orders: 0 };

  const revenueChange = previous.revenue
    ? ((current.revenue - previous.revenue) / previous.revenue) * 100
    : 0;
  const ordersChange = previous.orders
    ? ((current.orders - previous.orders) / previous.orders) * 100
    : 0;

  return {
    currentMonth: { revenue: current.revenue || 0, orders: current.orders || 0, month: current._id },
    previousMonth: { revenue: previous.revenue || 0, orders: previous.orders || 0, month: previous._id },
    revenueChange: Number(revenueChange.toFixed(2)),
    ordersChange: Number(ordersChange.toFixed(2)),
  };
}

export async function getTopCustomers(limit = 5, month = null) {
  // Aggregate orders by userId
  const pipeline = [
    { $group: { _id: "$userId", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        name: { $ifNull: ["$user.name", "Khách vãng lai"] },
        revenue: 1,
        orders: 1,
      },
    },
  ];

  const result = await orderModel.aggregate(pipeline);
  return result.map((r) => ({ name: r.name, revenue: r.revenue, orders: r.orders }));
}

export async function getProductionSummary(period = "month") {
  // Not applicable for this project (food ordering). Return defaults.
  return {
    totalProduction: null,
    unit: null,
    change: 0,
    byProduct: [],
  };
}

export async function getInventorySummary() {
  // Not available in this project; return safe defaults
  return {
    totalItems: null,
    highStock: [],
    lowStock: [],
    totalValue: null,
  };
}

export async function buildDashboardContext() {
  try {
    if (_isCacheValid()) return _cache.dashboardContext;

    const revenue = await getMonthlyRevenueSummary();
    const topCustomers = await getTopCustomers(5);
    const production = await getProductionSummary();
    const inventory = await getInventorySummary();

    const ctx = {
      revenue,
      topCustomers,
      production,
      inventory,
      generatedAt: new Date().toISOString(),
    };

    _cache.dashboardContext = ctx;
    _cache.updatedAt = Date.now();

    return ctx;
  } catch (error) {
    console.error("analyticsService.buildDashboardContext error:", error);
    return {
      revenue: null,
      topCustomers: [],
      production: null,
      inventory: null,
      generatedAt: new Date().toISOString(),
    };
  }
}

export default { getMonthlyRevenueSummary, getTopCustomers, getProductionSummary, getInventorySummary, buildDashboardContext };
