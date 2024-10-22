import React, { useEffect, useState } from "react";
import "./StaffDelivery.css";
import { toast } from "react-toastify";
import axios from "axios";
import AddDeliveryStaff from "../../components/DeliveryStaff/AddDeliveryStaff/AddDeliveryStaff";
import UpdateDeliveryStaff from "../../components/DeliveryStaff/UpdateDeliveryStaff/UpdateDeliveryStaff";
import SkeletonLoadingListAdd from "../../components/SkeletonLoading/SkeletonLoadingListAdd/SkeletonLoadingListAdd";
import NormalPagination from "../../components/Pagination/NormalPagination/NormalPagination";
import ViewDetailDeliveryStaff from "../../components/DeliveryStaff/ViewDetailDeliveryStaff/ViewDetailDeliveryStaff";

const StaffDelivery = ({ url, setIsLoading }) => {
  const [listDeliveryStaff, setListDeliveryStaff] = useState([]);
  const [filterListDeliveryStaff, setFilterListDeliveryStaff] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  const [isViewDetail, setIsViewDetail] = useState(false);
  const [dataUpdate, setDataUpdate] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    workingAreas: [],
  });
  const [dataDetail, setDataDetail] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    workingAreas: [],
    status: "",
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
        setFilterListDeliveryStaff(response.data.data);
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

  const handleStatusChange = async (id, status) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${url}/api/deliveryStaff/updateDeliveryStaffStatus`,
        {
          staffId: id,
          newStatus: status,
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating staff status.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeDeliveryStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff?")) {
      try {
        setIsLoading(true);
        const response = await axios.delete(
          `${url}/api/deliveryStaff/delete/`,
          {
            data: { id },
          }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          fetchList();
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
    const clonedItem = { ...item };

    setDataUpdate({
      id: clonedItem._id,
      name: clonedItem.name,
      phone: clonedItem.phone,
      email: clonedItem.email,
      vehicleType: clonedItem.vehicleType,
      workingAreas: clonedItem.workingAreas
        ? clonedItem.workingAreas.map((area) => ({
            province: area.province,
            district: area.district,
            provinces: [],
            districts: [],
            provinceValue: "",
            districtValue: "",
          }))
        : [
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

    setIsUpdate(true);
  };

  const onViewDetailDeliveryStaffHandler = (item) => {
    const clonedItem = { ...item };

    setDataDetail({
      id: clonedItem._id,
      name: clonedItem.name,
      phone: clonedItem.phone,
      email: clonedItem.email,
      vehicleType: clonedItem.vehicleType,
      workingAreas: clonedItem.workingAreas
        ? clonedItem.workingAreas.map((area) => ({
            province: area.province,
            district: area.district,
          }))
        : [
            {
              province: "",
              district: "",
            },
          ],
    });

    setIsViewDetail(true);
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
      ) : isViewDetail ? (
        <ViewDetailDeliveryStaff
          url={url}
          setIsViewDetail={setIsViewDetail}
          setIsLoading={setIsLoading}
          dataDetail={dataDetail}
        />
      ) : (
        <div className="delivery-staff-list">
          <div className="delivery-staff-list_add-search">
            <div
              className="delivery-staff-list_add"
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
            <div className="delivery-staff-list_search">
              <input
                type="text"
                placeholder="Search by name or phone"
                onChange={(e) => handleSearch(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
          </div>
          <span className="delivery-staff-list-note">
            Click on the delivery staff to view details
          </span>
          <div className="delivery-staff-flex-col">
            <div className="delivery-staff-table">
              <div className="delivery-staff-table-format title">
                <b>Name</b>
                <b>Phone</b>
                <b>Vehicle</b>
                <b>Status</b>
                <b>Action</b>
              </div>
              {filterListDeliveryStaff.map((item, index) => (
                <div key={index} className="delivery-staff-table-format">
                  <p>
                    <span
                      title="Click to view detail"
                      onClick={() => onViewDetailDeliveryStaffHandler(item)}
                    >
                      {item.name}
                    </span>
                  </p>
                  <p>{item.phone}</p>
                  <p>{item.vehicleType}</p>
                  <div className="delivery-staff-status">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="delivery-staff-action">
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
