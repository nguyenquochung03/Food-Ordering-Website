import mongoose from "mongoose";

const deliveryStaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  vehicleType: { type: String, required: true },
  workingAreas: [
    {
      district: { type: String, required: true },
      province: { type: String, required: true },
    },
  ],

  status: {
    type: String,
    enum: ["active", "inactive", "busy"],
    default: "active",
  },
});

const deliveryStaffModel =
  mongoose.models.deliveryStaff ||
  mongoose.model("deliveryStaff", deliveryStaffSchema);

export default deliveryStaffModel;
