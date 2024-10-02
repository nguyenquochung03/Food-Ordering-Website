import React, { useEffect, useRef, useState } from "react";
import "./UpdateDeliveryStaff.css";
import axios from "axios";
import { toast } from "react-toastify";

const UpdateDeliveryStaff = ({
  url,
  setIsUpdate,
  setIsLoading,
  fetchList,
  staffData,
}) => {
  const inputRef = useRef(null);
  const [formData, setFormData] = useState({
    id: staffData.id || "",
    name: staffData.name || "",
    phone: staffData.phone || "",
    email: staffData.email || "",
    vehicleType: staffData.vehicleType || "",
    workingAreas: staffData.workingAreas || [
      { province: "", district: "", ward: "" },
    ],
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/p/"
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) return;
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
        );
        setDistricts(response.data.districts);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) return;
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
        );
        setWards(response.data.wards);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  const handleProvincesChange = (provinceCode, index) => {
    if (provinces) {
      const selectedProvince = provinces.find(
        (province) => province.code.toString() === provinceCode
      );

      if (selectedProvince) {
        const updatedWorkingAreas = [...formData.workingAreas];
        updatedWorkingAreas[index] = {
          ...updatedWorkingAreas[index],
          province: selectedProvince.name,
        };
        setFormData({ ...formData, workingAreas: updatedWorkingAreas });
      }
    }
  };

  const handleDistrictChange = (districtCode, index) => {
    if (districts) {
      const selectedDistrict = districts.find(
        (district) => district.code.toString() === districtCode
      );

      if (selectedDistrict) {
        const updatedWorkingAreas = [...formData.workingAreas];
        updatedWorkingAreas[index] = {
          ...updatedWorkingAreas[index],
          district: selectedDistrict.name,
        };
        setFormData({ ...formData, workingAreas: updatedWorkingAreas });
      }
    }
  };

  const handleWardChange = (wardCode, index) => {
    if (wards) {
      const selectedWard = wards.find(
        (ward) => ward.code.toString() === wardCode
      );

      if (selectedWard) {
        const updatedWorkingAreas = [...formData.workingAreas];
        updatedWorkingAreas[index] = {
          ...updatedWorkingAreas[index],
          ward: selectedWard.name,
        };
        setFormData({ ...formData, workingAreas: updatedWorkingAreas });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addWorkingArea = () => {
    setFormData({
      ...formData,
      workingAreas: [
        ...formData.workingAreas,
        { province: "", district: "", ward: "" },
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
      const response = await axios.put(
        `${url}/api/deliverystaff/update/${formData.id}`,
        formData
      );
      if (response.data.success) {
        fetchList();
        toast.success("Update delivery staff successfully");
        setIsUpdate(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating delivery staff", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="centered-container">
      <div className="update-delivery-staff-container">
        <div
          className="update-delivery-staff-container-icon"
          onClick={() => setIsUpdate(false)}
        >
          <i className="fas fa-arrow-left"></i>
        </div>
        <p className="update-delivery-staff-title">Update Delivery Staff</p>
        <form onSubmit={handleSubmit} className="update-delivery-staff-form">
          <div className="update-delivery-staff-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="update-delivery-staff-group">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="update-delivery-staff-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="update-delivery-staff-group">
            <input
              type="text"
              name="vehicleType"
              placeholder="Vehicle Type"
              value={formData.vehicleType}
              onChange={handleChange}
              required
            />
          </div>
          <div className="update-delivery-staff-working-areas">
            <h3>Working Areas</h3>
            {formData.workingAreas.map((area, index) => (
              <div key={index} className="update-delivery-staff-working-area">
                <div className="update-delivery-staff-group">
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedDistrict("");
                      setSelectedWard("");
                      handleProvincesChange(e.target.value, index);
                    }}
                    required
                  >
                    <option value="">Select Province/City</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="update-delivery-staff-group">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedWard("");
                      handleDistrictChange(e.target.value, index);
                    }}
                    disabled={!selectedProvince}
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="update-delivery-staff-group">
                  <select
                    value={selectedWard}
                    onChange={(e) => {
                      setSelectedWard(e.target.value);
                      handleWardChange(e.target.value, index);
                    }}
                    disabled={!selectedDistrict}
                    required
                  >
                    <option value="">Select Ward</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.workingAreas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorkingArea(index)}
                    className="update-delivery-staff-remove-area-button"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addWorkingArea}
              className="update-delivery-staff-add-area-button"
            >
              Add Working Area
            </button>
          </div>
          <button type="submit" className="update-delivery-staff-submit-button">
            Update Staff
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateDeliveryStaff;
