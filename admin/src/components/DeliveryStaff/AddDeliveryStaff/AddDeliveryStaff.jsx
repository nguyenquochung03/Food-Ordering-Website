import React, { useEffect, useRef, useState } from "react";
import "./AddDeliveryStaff.css";
import axios from "axios";
import { toast } from "react-toastify";

const AddDeliveryStaff = ({ url, setIsAdd, setIsLoading, fetchList }) => {
  const inputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    workingAreas: [{ district: "", ward: "", province: "" }],
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWorkingAreaChange = (index, e) => {
    const newWorkingAreas = [...formData.workingAreas];
    newWorkingAreas[index][e.target.name] = e.target.value;
    setFormData({ ...formData, workingAreas: newWorkingAreas });
  };

  const addWorkingArea = () => {
    setFormData({
      ...formData,
      workingAreas: [
        ...formData.workingAreas,
        { district: "", ward: "", province: "" },
      ],
    });
  };

  const removeWorkingArea = (index) => {
    const newWorkingAreas = formData.workingAreas.filter((_, i) => i !== index);
    setFormData({ ...formData, workingAreas: newWorkingAreas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${url}/api/deliverystaff/add`,
        formData
      );
      if (response.data.success) {
        setFormData({
          name: "",
          phone: "",
          email: "",
          vehicleType: "",
          workingAreas: [{ district: "", ward: "", province: "" }],
        });
        fetchList();
        toast.success("Add new delivery staff successfully");
      }
    } catch (error) {
      console.error("Error adding delivery staff", error);
      setMessage("An error occurred while adding delivery staff");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="centered-container">
      <div className="add-delivery-staff-container">
        <div
          className="add-delivery-staff-container-icon"
          onClick={() => setIsAdd(false)}
        >
          <i className="fas fa-arrow-left"></i>
        </div>
        <p className="add-delivery-staff-title">Add Delivery Staff</p>
        <form onSubmit={handleSubmit} className="add-delivery-staff-form">
          <div className="add-delivery-staff-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="add-delivery-staff-group">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="add-delivery-staff-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="add-delivery-staff-group">
            <input
              type="text"
              name="vehicleType"
              placeholder="Vehicle Type"
              value={formData.vehicleType}
              onChange={handleChange}
              required
            />
          </div>
          <div className="add-delivery-staff-working-areas">
            <h3>Working Areas</h3>
            {formData.workingAreas.map((area, index) => (
              <div key={index} className="add-delivery-staff-working-area">
                <div className="add-delivery-staff-group">
                  <input
                    type="text"
                    name="district"
                    placeholder="District"
                    value={area.district}
                    onChange={(e) => handleWorkingAreaChange(index, e)}
                    required
                  />
                </div>
                <div className="add-delivery-staff-group">
                  <input
                    type="text"
                    name="ward"
                    placeholder="Ward"
                    value={area.ward}
                    onChange={(e) => handleWorkingAreaChange(index, e)}
                    required
                  />
                </div>
                <div className="add-delivery-staff-group">
                  <input
                    type="text"
                    name="province"
                    placeholder="Province"
                    value={area.province}
                    onChange={(e) => handleWorkingAreaChange(index, e)}
                    required
                  />
                </div>
                {formData.workingAreas.length > 1 && (
                  <button
                    type="button"
                    className="add-delivery-staff-remove-area-button"
                    onClick={() => removeWorkingArea(index)}
                  >
                    Remove Area
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-delivery-staff-add-area-button"
              onClick={addWorkingArea}
            >
              Add Another Area
            </button>
          </div>
          <button type="submit" className="add-delivery-staff-submit-button">
            Add Delivery Staff
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDeliveryStaff;
