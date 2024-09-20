import mongoose from "mongoose";

const deliveryStaffSchema = new mongoose.Schema({
    name: { type: String, require: true },
    phone: { type: Number, require: true },
    email: { type: String, require: true }
})

const deliveryStaffModel = mongoose.models.deliveryStaff || mongoose.model("deliveryStaff", deliveryStaffSchema)

export default deliveryStaffModel