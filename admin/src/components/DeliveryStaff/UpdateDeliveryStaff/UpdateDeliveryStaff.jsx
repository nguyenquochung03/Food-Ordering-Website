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
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    workingAreas: [
      {
        province: "",
        district: "",
        provinces: [],
        districts: [],
        provinceValue: "",
        districtValue: "",
      },
    ],
  });

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [isNewWorkingAreaAdded, setIsNewWorkingAreaAdded] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (staffData) {
      setFormData(staffData);
    }
  }, [staffData]);

  useEffect(() => {
    const fetchProvincesAndDistricts = async () => {
      try {
        const response = await axios.get("https://provinces.open-api.vn/api/p");
        const provincesData = response.data;

        const newWorkingAreas = await Promise.all(
          formData.workingAreas.map(async (area) => {
            area.provinces = provincesData;

            const matchedProvince = provincesData.find(
              (res) => res.name === area.province
            );

            if (matchedProvince) {
              area.province = matchedProvince.code;
              area.provinceValue = matchedProvince.name;

              if (typeof matchedProvince.code === "number") {
                const districtResponse = await axios.get(
                  `https://provinces.open-api.vn/api/p/${matchedProvince.code}?depth=2`
                );

                area.districts = districtResponse.data.districts;

                const matchedDistrict = area.districts.find(
                  (data) => area.district === data.name
                );

                if (matchedDistrict) {
                  area.district = matchedDistrict.code;
                  area.districtValue = matchedDistrict.name;
                }
              }
            }

            return area;
          })
        );

        setFormData((prevFormData) => ({
          ...prevFormData,
          workingAreas: newWorkingAreas,
        }));
      } catch (error) {
        console.error("Error in fetching data:", error);
      }
    };

    if (isFirstLoading && formData.workingAreas.length > 0) {
      fetchProvincesAndDistricts().then(() => {
        setIsFirstLoading(false);
      });
    }
  }, [formData.workingAreas, isFirstLoading]);

  useEffect(() => {
    if (isNewWorkingAreaAdded) {
      const lastIndex = formData.workingAreas.length - 1;
      fetchProvinces(lastIndex);
      setIsNewWorkingAreaAdded(false);
    }
  }, [isNewWorkingAreaAdded, formData.workingAreas]);

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
    updateWorkingAreasValueWithIndex(index, e);
  };

  const updateWorkingAreasValueWithIndex = (index, e) => {
    const newWorkingAreas = [...formData.workingAreas];

    if (e.target.name === "province") {
      const provinces = newWorkingAreas[index].provinces;
      if (provinces) {
        const selectedProvince = provinces.find(
          (province) => province.code.toString() === e.target.value
        );
        if (selectedProvince) {
          newWorkingAreas[index].provinceValue = selectedProvince.name;
        }
      }
    } else if (e.target.name === "district") {
      const districts = newWorkingAreas[index].districts;
      if (districts) {
        const selectedDistrict = districts.find(
          (district) => district.code.toString() === e.target.value
        );
        if (selectedDistrict) {
          newWorkingAreas[index].districtValue = selectedDistrict.name;
        }
      }
    }

    setFormData({ ...formData, workingAreas: newWorkingAreas });
  };

  const addWorkingArea = () => {
    setFormData((prev) => {
      const newWorkingArea = {
        province: "",
        district: "",
        provinces: [],
        districts: [],
        provinceValue: "",
        districtValue: "",
      };
      return {
        ...prev,
        workingAreas: [...prev.workingAreas, newWorkingArea],
      };
    });
    setIsNewWorkingAreaAdded(true);
  };

  const removeWorkingArea = (index) => {
    const newWorkingAreas = formData.workingAreas.filter((_, i) => i !== index);
    setFormData({ ...formData, workingAreas: newWorkingAreas });
  };

  const fetchProvinces = async (index) => {
    try {
      const response = await axios.get("https://provinces.open-api.vn/api/p");
      setFormData((prevFormData) => {
        const newWorkingAreas = [...prevFormData.workingAreas];
        newWorkingAreas[index].provinces = response.data;
        return {
          ...prevFormData,
          workingAreas: newWorkingAreas,
        };
      });
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchDistricts = async (index) => {
    const selectedProvince = formData.workingAreas[index].province;
    if (!selectedProvince) return;

    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
      );
      setFormData((prevFormData) => {
        const newWorkingAreas = [...prevFormData.workingAreas];
        newWorkingAreas[index].districts = response.data.districts;
        newWorkingAreas[index].district = "";
        return { ...prevFormData, workingAreas: newWorkingAreas };
      });
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const handleProvinceChange = (index, provinceCode) => {
    handleWorkingAreaChange(index, {
      target: { name: "province", value: provinceCode },
    });
    fetchDistricts(index);
  };

  const handleDistrictChange = (index, districtCode) => {
    handleWorkingAreaChange(index, {
      target: { name: "district", value: districtCode },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { workingAreas, ...data } = formData;

      const checkDuplicateProvinceDistrict = () => {
        const seen = new Map();

        for (const area of workingAreas) {
          const { provinceValue: province, districtValue: district } = area;

          if (!seen.has(province)) {
            seen.set(province, new Set([district]));
          } else {
            if (seen.get(province).has(district)) {
              return { isDuplicate: true, province, district };
            } else {
              seen.get(province).add(district);
            }
          }
        }
        return { isDuplicate: false };
      };

      const { isDuplicate, province, district } =
        checkDuplicateProvinceDistrict();

      if (isDuplicate) {
        toast.error(
          `The working area has duplicate districts: ${district} in province: ${province}`
        );
        setIsLoading(false);
        return;
      }

      const workingAreasWithValues = workingAreas.map(
        ({ provinceValue: province, districtValue: district }) => ({
          province,
          district,
        })
      );

      const finalDataToSend = {
        ...data,
        workingAreas: workingAreasWithValues,
      };

      const response = await axios.post(
        `${url}/api/deliverystaff/update`,
        finalDataToSend
      );
      if (response.data.success) {
        setFormData({
          name: "",
          phone: "",
          email: "",
          vehicleType: "",
          workingAreas: [
            {
              province: "",
              district: "",
              provinces: [],
              districts: [],
              provinceValue: "",
              districtValue: "",
            },
          ],
        });
        fetchList();
        toast.success("Delivery staff updated successfully");
        setIsUpdate(false);
      }
    } catch (error) {
      console.error("Error updating delivery staff", error);
      toast.error("An error occurred while updating delivery staff");
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
                    value={area.province}
                    onChange={(e) =>
                      handleProvinceChange(index, e.target.value)
                    }
                    required
                  >
                    <option value="">Select Province/City</option>
                    {Array.isArray(area.provinces) &&
                      area.provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="update-delivery-staff-group">
                  <select
                    value={area.district}
                    onChange={(e) =>
                      handleDistrictChange(index, e.target.value)
                    }
                    required
                    disabled={!area.province}
                  >
                    <option value="">Select District</option>
                    {Array.isArray(area.districts) &&
                      area.districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                  </select>
                </div>
                {formData.workingAreas.length > 1 && (
                  <button
                    type="button"
                    className="update-delivery-staff-remove-area-button"
                    onClick={() => removeWorkingArea(index)}
                  >
                    Remove Area
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="update-delivery-staff-add-area-button"
              onClick={addWorkingArea}
            >
              Add Another Area
            </button>
          </div>
          <button type="submit" className="update-delivery-staff-submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateDeliveryStaff;
