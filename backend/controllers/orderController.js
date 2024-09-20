import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import moment from "moment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing user order from frontend
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5174";
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      paymentType: "Transfer",
    });
    await newOrder.save();

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    console.log("Stripe session created:", session.url);
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Error in placeOrder:", error);
    res.json({ success: false, message: "Error" });
  }
};

const order = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      paymentType: "Cash",
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    return res.json({ success: true, data: newOrder });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { success, orderId } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user order for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const getOrderById = async (req, res) => {
  const { orderId } = req.query;

  try {
    const order = await orderModel.findById(orderId);
    if (order) {
      return res.json({ success: true, data: order });
    }
    res.json({ success: false, message: "Order not found" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// listing orders with status
const listStatusOrders = async (req, res) => {
  try {
    const status = req.query.status;
    const orders = await orderModel.find({ status: status });
    if (orders) {
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "Food not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating order status
const updateStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const updateData = { status };

    if (order.paymentType === "Cash" && status === "Delivered") {
      updateData.payment = true;
    }

    await orderModel.findByIdAndUpdate(orderId, updateData);

    res.status(200).json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getOrderCountByStatuses = async (req, res) => {
  try {
    const statuses = [
      "Successful",
      "Delivered",
      "Cancelled",
      "Wait for Confirmation",
      "Out for delivery",
      "Food Processing",
    ];

    const orderCounts = await orderModel.aggregate([
      {
        $match: {
          status: { $in: statuses },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const statusCount = {};
    statuses.forEach((status) => {
      statusCount[status] = 0;
    });

    orderCounts.forEach((item) => {
      statusCount[item._id] = item.count;
    });

    res.json({ success: true, data: statusCount });
  } catch (error) {
    console.error("Error fetching order counts by status:", error);
    res.json({ success: false, message: "Error" });
  }
};

const calculateIncome = async (req, res) => {
  const { month, year } = req.query;
  const inputMonth = parseInt(month) - 1;
  const inputYear = parseInt(year);

  const startOfMonth = new Date(inputYear, inputMonth, 1);
  const startOfNextMonth = new Date(inputYear, inputMonth + 1, 1);

  const startOfPreviousMonth = new Date(inputYear, inputMonth - 1, 1);
  const startOfCurrentMonth = startOfMonth;

  try {
    const totalIncome = await orderModel.aggregate([
      { $match: { payment: true } },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
    ]);

    const currentMonthIncome = await orderModel.aggregate([
      {
        $match: {
          date: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
          payment: true,
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
    ]);

    const previousMonthIncome = await orderModel.aggregate([
      {
        $match: {
          date: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth },
          payment: true,
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
    ]);

    const currentIncome = currentMonthIncome[0]?.total || 0;
    const previousIncome = previousMonthIncome[0]?.total || 0;

    const percentageDifference =
      currentIncome > 0 && previousIncome > 0
        ? ((currentIncome - previousIncome) / previousIncome) * 100
        : currentIncome > 0 && previousIncome <= 0
        ? currentIncome
        : currentIncome <= 0 && previousIncome > 0
        ? -1 * previousIncome
        : 0;

    res.json({
      success: true,
      totalIncome: totalIncome[0]?.total || 0,
      currentMonthIncome: currentIncome,
      previousMonthIncome: previousIncome,
      percentageDifference: percentageDifference.toFixed(0),
    });
  } catch (error) {
    console.error("Error calculating income:", error);
    res.json({ success: false, message: "Error calculating income" });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    const startOfMonth = moment(`${year}-${month}`, "YYYY-MM")
      .startOf("month")
      .toDate();
    const endOfMonth = moment(`${year}-${month}`, "YYYY-MM")
      .endOf("month")
      .toDate();

    const startOfPreviousMonth = moment(startOfMonth)
      .subtract(1, "month")
      .startOf("month")
      .toDate();
    const endOfPreviousMonth = moment(startOfMonth)
      .subtract(1, "month")
      .endOf("month")
      .toDate();

    const calculateRevenue = (startDate, endDate) => {
      return orderModel.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
            payment: true,
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $multiply: ["$items.quantity", "$items.price"],
              },
            },
          },
        },
      ]);
    };

    const currentMonthRevenue = await calculateRevenue(
      startOfMonth,
      endOfMonth
    );
    const previousMonthRevenue = await calculateRevenue(
      startOfPreviousMonth,
      endOfPreviousMonth
    );

    const currentRevenue = currentMonthRevenue[0]?.totalRevenue || 0;
    const previousRevenue = previousMonthRevenue[0]?.totalRevenue || 0;

    const percentageChange =
      previousRevenue > 0 && currentRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : previousRevenue <= 0 && currentRevenue > 0
        ? currentRevenue
        : previousRevenue > 0 && currentRevenue <= 0
        ? -1 * previousRevenue
        : 0;

    res.json({
      success: true,
      data: {
        currentRevenue,
        previousRevenue,
        percentageChange: percentageChange.toFixed(0),
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching revenue statistics" });
  }
};

const getTotalOrdersByMonth = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.json({ success: false, message: "Year is required" });
    }

    const currentYear = parseInt(year, 10);
    const previousYear = currentYear - 1;

    const result = await orderModel.aggregate([
      {
        $project: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
      },
      {
        $match: { year: { $in: [currentYear, previousYear] } },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedResult = [currentYear, previousYear].map((year) => {
      return monthNames.map((month, index) => {
        const dataForMonth = result.find(
          (item) => item._id.year === year && item._id.month === index + 1
        );
        return {
          year: year,
          month: month,
          totalOrders: dataForMonth ? dataForMonth.totalOrders : 0,
        };
      });
    });

    res.json({ success: true, data: formattedResult });
  } catch (error) {
    console.error("Error fetching total orders by month:", error);
    res.json({
      success: false,
      message: "Error fetching total orders by month",
    });
  }
};

const getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    res.json({ success: true, data: totalOrders });
  } catch (error) {
    console.error("Error fetching total number of orders:", error);
    res.json({ success: false, message: "Error" });
  }
};

const getTotalOrdersByYear = async (req, res) => {
  const { year } = req.query;

  try {
    const yearInt = parseInt(year, 10);

    const ordersThisYear = await orderModel.countDocuments({
      date: {
        $gte: new Date(`${yearInt}-01-01T00:00:00.000Z`),
        $lt: new Date(`${yearInt + 1}-01-01T00:00:00.000Z`),
      },
    });

    const ordersLastYear = await orderModel.countDocuments({
      date: {
        $gte: new Date(`${yearInt - 1}-01-01T00:00:00.000Z`),
        $lt: new Date(`${yearInt}-01-01T00:00:00.000Z`),
      },
    });

    res.json({
      success: true,
      ordersThisYear: ordersThisYear,
      ordersLastYear: ordersLastYear,
    });
  } catch (error) {
    console.error("Error fetching total orders by year:", error);
    res.json({ success: false, message: "Error" });
  }
};

const getMonthlyOrderTotals = async (req, res) => {
  const { year } = req.query;

  if (!year || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
    return res.status(400).json({ success: false, message: "Invalid year" });
  }

  try {
    const orders = await orderModel.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(Number(year) + 1, 0, 1),
          },
          status: { $in: ["Successful", "Delivered"] },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          successfulCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "Successful"] }, "$count", 0],
            },
          },
          deliveredCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "Delivered"] }, "$count", 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = monthNames.map((month, index) => {
      const order = orders.find((o) => o._id === index + 1) || {};
      return {
        month,
        successfulCount: order.successfulCount || 0,
        deliveredCount: order.deliveredCount || 0,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error occurred while fetching data" });
  }
};

export const hasOrderedFood = async (req, res) => {
  const { userId, foodId } = req.body;
  try {
    const order = await orderModel.findOne({
      userId,
      "items._id": foodId,
    });

    if (order) {
      res.json({ success: true, data: order });
    } else {
      res.json({
        success: false,
        message: "The user has not purchased this product",
      });
    }
  } catch (error) {
    console.error("Error checking order:", error);
    res.json({ success: false, message: `Error checking order: ${error}` });
  }
};

export {
  placeOrder,
  order,
  verifyOrder,
  userOrders,
  getOrderById,
  listOrders,
  updateStatus,
  listStatusOrders,
  getRevenueStats,
  getOrderCountByStatuses,
  calculateIncome,
  getTotalOrdersByMonth,
  getTotalOrders,
  getTotalOrdersByYear,
  getMonthlyOrderTotals,
};
