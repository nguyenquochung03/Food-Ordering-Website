import deliveryStaffModel from "../models/deliveryStaffModel.js";

const addDeliveryStaff = async (req, res) => {
    const { name, phone, email } = req.body;

    const deliveryStaff = await deliveryStaffModel.findOne({ email: email });

    if (deliveryStaff) {
        return res.json({ success: false, message: "Delivery staff with this email already exists" });
    }

    try {
        const addNew = new deliveryStaffModel({
            name: name,
            phone: phone,
            email: email
        });

        const savedUser = await addNew.save();

        if (savedUser) {
            return res.json({ success: true, message: "Delivery staff added successfully", data: savedUser });
        } else {
            return res.json({ success: false, message: "Failed to add delivery staff" });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "An error occurred while adding delivery staff" });
    }
};

const updateDeliveryStaff = async (req, res) => {
    const { id, name, phone, email } = req.body;

    const deliveryStaff = await deliveryStaffModel.findOne({ email: email });

    if (deliveryStaff && deliveryStaff._id.toString() !== id) {
        return res.json({ success: false, message: "Delivery staff with this email already exists" });
    }

    try {
        const updatedStaff = await deliveryStaffModel.findByIdAndUpdate(id, { name, phone, email }, { new: true });

        if (updatedStaff) {
            return res.json({ success: true, message: "Delivery staff updated successfully", data: updatedStaff });
        } else {
            return res.json({ success: false, message: "Failed to update delivery staff" });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "An error occurred while updating delivery staff" });
    }
};

const deleteDeliveryStaff = async (req, res) => {
    const { id } = req.body;

    try {
        const deletedStaff = await deliveryStaffModel.findByIdAndDelete(id);

        if (deletedStaff) {
            return res.json({ success: true, message: "Delivery staff deleted successfully" });
        } else {
            return res.json({ success: false, message: "Failed to delete delivery staff" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "An error occurred while deleting delivery staff" });
    }
};

const getDeliveryStaff = async (req, res) => {
    try {
        const deliveryStaffList = await deliveryStaffModel.find();

        if (deliveryStaffList.length > 0) {
            return res.json({ success: true, data: deliveryStaffList });
        } else {
            return res.json({ success: false, message: "No delivery staff found" });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "An error occurred while fetching delivery staff" });
    }
};

const getDeliveryStaffById = async (req, res) => {
    const { id } = req.params;

    try {
        const deliveryStaff = await deliveryStaffModel.findById(id);

        if (deliveryStaff) {
            return res.json({ success: true, data: deliveryStaff });
        } else {
            return res.json({ success: false, message: "Delivery staff not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "An error occurred while fetching delivery staff" });
    }
};

export { addDeliveryStaff, updateDeliveryStaff, deleteDeliveryStaff, getDeliveryStaff, getDeliveryStaffById };