import React, { useEffect, useState } from "react";
import "./StaffDelivery.css";
import { toast } from "react-toastify";
import axios from "axios";
import AddDeliveryStaff from "../../components/DeliveryStaff/AddDeliveryStaff/AddDeliveryStaff";
import UpdateDeliveryStaff from "../../components/DeliveryStaff/UpdateDeliveryStaff/UpdateDeliveryStaff";
import SkeletonLoadingListAdd from "../../components/SkeletonLoading/SkeletonLoadingListAdd/SkeletonLoadingListAdd";
import NormalPagination from "../../components/Pagination/NormalPagination/NormalPagination";

const StaffDelivery = ({ url, setIsLoading }) => {
  const [listDeliveryStaff, setListDeliveryStaff] = useState([]);
  const [filterListDeliveryStaff, setFilterListDeliveryStaff] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  const [dataUpdate, setDataUpdate] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    workingAreas: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/deliveryStaff/getAll`);
      if (response.data.success) {
        setListDeliveryStaff(response.data.data);
        setFilterListDeliveryStaff(response.data.data); // Ensure the filter list is populated
        setLoading(false);
      } else {
        toast.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching the list.");
      setLoading(false);
    }
  };

  const removeDeliveryStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff?")) {
      try {
        setIsLoading(true);
        const response = await axios.post(`${url}/api/deliveryStaff/delete/`, {
          id,
        });
        await fetchList();
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateDeliveryStaff = (item) => {
    setDataUpdate({
      id: item._id,
      name: item.name,
      phone: item.phone,
      email: item.email,
      vehicleType: item.vehicleType,
      workingAreas: item.workingAreas || [
        { province: "", district: "", ward: "" },
      ],
    });
    setIsUpdate(true);
  };

  return (
    <React.Fragment>
      {loading ? (
        <SkeletonLoadingListAdd />
      ) : isAdd ? (
        <AddDeliveryStaff
          url={url}
          setIsAdd={setIsAdd}
          setIsLoading={setIsLoading}
          fetchList={fetchList}
        />
      ) : isUpdate ? (
        <UpdateDeliveryStaff
          url={url}
          setIsUpdate={setIsUpdate}
          setIsLoading={setIsLoading}
          fetchList={fetchList}
          staffData={dataUpdate}
        />
      ) : (
        <div className="list-delivery-staff">
          <div
            className="list-delivery-staff_add"
            title="Add new Delivery Staff"
          >
            <button
              onClick={() => setIsAdd(true)}
              type="button"
              title="Add your delivery staff"
            >
              <i className="fas fa-plus"></i>
              Add
            </button>
          </div>
          <div className="flex-col">
            <div className="list-table">
              <div className="list-table-format title">
                <b>Name</b>
                <b>Phone</b>
                <b>Vehicle</b>
                <b>Action</b>
              </div>
              {filterListDeliveryStaff.map((item, index) => (
                <div key={index} className="list-table-format">
                  <p>{item.name}</p>
                  <p>{item.phone}</p>
                  <p>{item.vehicleType}</p> {/* Use vehicleType here */}
                  <div className="list-delivery-staff-action">
                    <button
                      onClick={() => updateDeliveryStaff(item)}
                      className="edit"
                      type="button"
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => removeDeliveryStaff(item._id)}
                      className="remove"
                    >
                      <i className="fas fa-trash-alt"></i>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <NormalPagination
            food_list={listDeliveryStaff}
            setList={setFilterListDeliveryStaff}
            setIsLoading={setIsLoading}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default StaffDelivery;
