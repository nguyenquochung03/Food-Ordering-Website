import mongoose from "mongoose";

const deliveryStaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  vehicleType: { type: String, required: true },
  workingAreas: [
    {
      district: { type: String, required: true },
      ward: { type: String, required: true },
      province: { type: String, required: true },
    },
  ],

  status: {
    type: String,
    enum: ["active", "inactive", "on-leave"],
    default: "active",
  },

  deliveredOrders: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      deliveryStatus: {
        type: String,
        enum: ["success", "failed", "in-progress"],
        required: true,
      },
    },
  ],
});

const deliveryStaffModel =
  mongoose.models.deliveryStaff ||
  mongoose.model("deliveryStaff", deliveryStaffSchema);

export default deliveryStaffModel;
