import React, { useEffect, useState } from "react";
import "./Account.css";
import { toast } from "react-toastify";
import axios from "axios";
import AddAdmin from "../../components/AdminAccount/AddAdmin/AddAdmin";
import UpdateAdmin from "../../components/AdminAccount/UpdateAdmin/UpdateAdmin";
import { images } from "../../constants/data";
import SkeletonLoadingListAdd from "../../components/SkeletonLoading/SkeletonLoadingListAdd/SkeletonLoadingListAdd";
import NormalPagination from "../../components/Pagination/NormalPagination/NormalPagination";
import { FaLock, FaUnlock } from "react-icons/fa";

const Account = ({ url, setIsLoading }) => {
  const [listUser, setListUser] = useState([]);
  const [filterListUser, setFilterListUser] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  const [dataUpdate, setDataUpdate] = useState({ id: "", name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (searchValue.trim().length === 0) {
      setSearchData([]);
      setIsSearching(false);
    }
  }, [searchValue]);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/user/admin`);
      if (response.data.success) {
        setListUser(response.data.data);
        setFilterListUser(response.data.data);
      } else {
        toast.error("Error fetching user list");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching the list.");
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const removeAccount = async (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        setIsLoading(true);
        const response = await axios.post(`${url}/api/user/deleteAdmin/`, {
          id,
        });
        if (response.data.success) {
          toast.success(response.data.message);
          await fetchList();
          localStorage.removeItem("token");
        } else {
          toast.error("Error deleting account");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting the account.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateAccount = (item) => {
    setDataUpdate({ id: item._id, name: item.name, email: item.email });
    setIsUpdate(true);
  };

  const toggleLock = async (id, locked) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${url}/api/user/lockOrUnlockAdmin`, {
        id,
        locked: !locked,
      });
      if (response.data.success) {
        if (response.data.status === "404") {
          toast.error(response.data.message);
          return;
        }
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error("Error updating lock status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the lock status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onHandleSearch();
    }
  };

  const onHandleSearch = async () => {
    if (!searchValue) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${url}/api/user/findAdminByNameAndEmail?value=${searchValue.trim()}`
      );
      if (response.data.success) {
        setIsSearching(true);
        setSearchData(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while trying to find account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <SkeletonLoadingListAdd />
      ) : isAdd ? (
        <AddAdmin
          url={url}
          setIsAdd={setIsAdd}
          setIsLoading={setIsLoading}
          fetchList={fetchList}
        />
      ) : isUpdate ? (
        <UpdateAdmin
          url={url}
          dataUpdate={dataUpdate}
          setIsUpdate={setIsUpdate}
          setIsLoading={setIsLoading}
          fetchList={fetchList}
        />
      ) : (
        <div className="list-account">
          <div className="list-account_add-search">
            <div className="list-account_add" title="Add new Account">
              <button
                onClick={() => setIsAdd(true)}
                type="button"
                title="Add your account"
              >
                <i className="fas fa-plus"></i>
                Add
              </button>
            </div>
            <div className="list-account_search">
              <input
                type="text"
                placeholder="Search by name or email"
                onChange={(e) => handleSearch(e.target.value)}
                value={searchValue}
                onKeyDown={handleKeyDown}
              />
              <i className="fas fa-search" onClick={onHandleSearch}></i>
            </div>
          </div>
          <div className="flex-col">
            <div className="list-account-table">
              <div className="list-account-table-format title">
                <b>Name</b>
                <b>Email</b>
                <b>Action</b>
                <b>Status</b>
              </div>
              {isSearching
                ? searchData.map((item, index) => (
                    <div key={index} className="list-account-table-format">
                      <p>{item.name}</p>
                      <p>{item.email}</p>
                      <div className="list-account-action">
                        <button
                          onClick={() => updateAccount(item)}
                          className="edit"
                          type="button"
                        >
                          <i className="fas fa-edit"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => removeAccount(item._id)}
                          className="remove"
                        >
                          <i className="fas fa-trash-alt"></i>
                          Remove
                        </button>
                      </div>
                      <div className="list-account-table-format-status">
                        {item.locked ? (
                          <FaLock
                            onClick={() => toggleLock(item._id, item.locked)}
                            style={{
                              cursor: "pointer",
                              color: "black",
                              fontSize: "15px",
                            }}
                            title="Unlock this account"
                          />
                        ) : (
                          <FaUnlock
                            onClick={() => toggleLock(item._id, item.locked)}
                            style={{
                              cursor: "pointer",
                              color: "var(--color-main)",
                              fontSize: "15px",
                            }}
                            title="Lock this account"
                          />
                        )}
                      </div>
                    </div>
                  ))
                : filterListUser.map((item, index) => (
                    <div key={index} className="list-account-table-format">
                      <p>{item.name}</p>
                      <p>{item.email}</p>
                      <div className="list-account-action">
                        <button
                          onClick={() => updateAccount(item)}
                          className="edit"
                          type="button"
                        >
                          <i className="fas fa-edit"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => removeAccount(item._id)}
                          className="remove"
                        >
                          <i className="fas fa-trash-alt"></i>
                          Remove
                        </button>
                      </div>
                      <div className="list-account-table-format-status">
                        {item.locked ? (
                          <FaLock
                            onClick={() => toggleLock(item._id, item.locked)}
                            style={{
                              cursor: "pointer",
                              color: "black",
                              fontSize: "15px",
                            }}
                            title="Unlock this account"
                          />
                        ) : (
                          <FaUnlock
                            onClick={() => toggleLock(item._id, item.locked)}
                            style={{
                              cursor: "pointer",
                              color: "var(--color-main)",
                              fontSize: "15px",
                            }}
                            title="Lock this account"
                          />
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
          {!isSearching && (
            <NormalPagination
              food_list={listUser}
              setList={setFilterListUser}
              setIsLoading={setIsLoading}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Account;
