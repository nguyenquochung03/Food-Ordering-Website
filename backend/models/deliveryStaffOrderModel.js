import mongoose from "mongoose";

const deliveryStaffOrderSchema = new mongoose.Schema({
    deliveryStaffId: { type: String, require: true },
    orderId: { type: String, require: true },
    delivered: { type: Boolean, default: false }
})

const deliveryStaffOrderModel = mongoose.models.deliveryStaffOrder || mongoose.model("deliveryStaffOrder", deliveryStaffOrderSchema)

export default deliveryStaffOrderModel