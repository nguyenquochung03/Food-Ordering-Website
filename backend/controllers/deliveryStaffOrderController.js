import jwt from "jsonwebtoken";
import deliveryStaffModel from "../models/deliveryStaffModel.js";
import deliveryStaffOrderModel from "../models/deliveryStaffOrderModel.js";
import orderModel from "../models/orderModel.js";
import nodemailer from "nodemailer";
import { handleOrderMail } from "./orderController.js";

const setDeliveryStaffOrder = async (req, res) => {
  const { deliveryStaffId, orderId } = req.body;

  try {
    const deliveryStaff = await deliveryStaffModel.findById(deliveryStaffId);
    const order = await orderModel.findById(orderId);

    if (!deliveryStaff || !order) {
      return res.json({
        success: false,
        message: "Delivery staff/Order not found",
      });
    }

    const deliveryStaffOrder = new deliveryStaffOrderModel({
      deliveryStaffId: deliveryStaffId,
      orderId: orderId,
    });

    await deliveryStaffOrder.save();

    await orderModel.updateOne(
      {
        _id: order._id,
      },
      {
        $set: {
          status: "Out for delivery",
        },
      }
    );

    await handleOrderMail("Out for delivery", order);

    const token = jwt.sign(
      { deliveryStaffId: deliveryStaff._id, orderId: order._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const link = `${process.env.BASE_URL}/api/deliveryStaffOrder/ConfirmOrderDeliveredSuccessfully/${token}`;

    var transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    var addressInfo = `
        Name: ${order.address.firstName} ${order.address.lastName}
        Email: ${order.address.email}
        Address: ${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zipcode}, ${order.address.country}
        Phone: ${order.address.phone}`;

    var mailOptions = {
      from: process.env.USER,
      to: deliveryStaff.email,
      subject: "Confirm Order Delivered Successfully",
      text: `Order delivered to the following address:\n${addressInfo}\n\nConfirm here: ${link}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ success: true, data: link });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const confirmOrderDeliveredSuccessfully = async (req, res) => {
  const { token } = req.params;

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    const deliveryStaff = await deliveryStaffModel.findById(
      verify.deliveryStaffId
    );
    const order = await orderModel.findById(verify.orderId);

    if (!deliveryStaff || !order) {
      return res.json({
        success: false,
        message: "Delivery staff/Order not found",
      });
    }

    if (order.status === "Delivered" || order.status === "Cancelled") {
      res.render("resultAfterConfirmOrderDelivery", {
        success: false,
        message: "Open link to see the result",
      });
    } else {
      res.render("confirmOrderDelivered", {
        success: false,
        message: "Open link to confirm order delivered",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const confirmOrderDelivered = async (req, res) => {
  const { token } = req.params;
  const { confirmResult } = req.body;

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    const deliveryStaff = await deliveryStaffModel.findById(
      verify.deliveryStaffId
    );
    const order = await orderModel.findById(verify.orderId);

    if (!deliveryStaff || !order) {
      return res.json({
        success: false,
        message: "Delivery staff/Order not found",
      });
    }

    if (confirmResult === "true") {
      await deliveryStaffOrderModel.updateOne(
        {
          orderId: order._id,
        },
        {
          $set: {
            delivered: true,
          },
        }
      );

      await orderModel.updateOne(
        {
          _id: order._id,
        },
        {
          $set: {
            status: "Delivered",
          },
        }
      );

      await handleOrderMail("Delivered", order);
    } else {
      await deliveryStaffOrderModel.updateOne(
        {
          orderId: order._id,
        },
        {
          $set: {
            delivered: false,
          },
        }
      );

      await orderModel.updateOne(
        {
          _id: order._id,
        },
        {
          $set: {
            status: "Cancelled",
          },
        }
      );

      await handleOrderMail("Cancelled", order);
    }

    res.render("confirmOrderDelivered", {
      success: true,
      message: "Confirm order delivered",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const getNameDeliveryStaffFromOrderId = async (req, res) => {
  const { orderId } = req.body;

  try {
    const deliveryStaffOrder = await deliveryStaffOrderModel.findOne({
      orderId: orderId,
    });

    if (!deliveryStaffOrder) {
      return res.json({
        success: false,
        message: "Delivery Staff Order not FOUND",
      });
    }

    const deliveryStaff = await deliveryStaffModel.findById(
      deliveryStaffOrder.deliveryStaffId
    );

    if (!deliveryStaff) {
      return res.json({ success: false, message: "Delivery staff not FOUND" });
    }

    res.json({ success: true, nameDeliveryStaff: deliveryStaff.name });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const getOrdersByStaff = async (req, res) => {
  const { deliveryStaffId } = req.query;
  try {
    const staffOrders = await deliveryStaffOrderModel
      .find({
        deliveryStaffId,
      })
      .lean();

    const orderIds = staffOrders.map((order) => order.orderId);

    const orders = await orderModel.find({ _id: { $in: orderIds } }).lean();

    const categorizedOrders = {
      "In processing": [],
      Delivered: [],
      Cancelled: [],
    };

    orders.forEach((order) => {
      if (order.status === "Out for delivery") {
        categorizedOrders["In processing"].push(order);
      } else if (order.status === "Delivered") {
        categorizedOrders["Delivered"].push(order);
      } else if (order.status === "Cancelled") {
        categorizedOrders["Cancelled"].push(order);
      }
    });

    res.json({ success: true, data: categorizedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

export {
  setDeliveryStaffOrder,
  confirmOrderDeliveredSuccessfully,
  confirmOrderDelivered,
  getNameDeliveryStaffFromOrderId,
  getOrdersByStaff,
};
