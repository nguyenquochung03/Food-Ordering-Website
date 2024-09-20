import React, { useEffect, useState } from 'react';
import './Account.css';
import { toast } from 'react-toastify';
import axios from 'axios';

import AddAdmin from '../../components/AdminAccount/AddAdmin/AddAdmin';
import UpdateAdmin from '../../components/AdminAccount/UpdateAdmin/UpdateAdmin';
import { images } from '../../constants/data';
import SkeletonLoadingListAdd from '../../components/SkeletonLoading/SkeletonLoadingListAdd/SkeletonLoadingListAdd';
import NormalPagination from '../../components/Pagination/NormalPagination/NormalPagination';

const Account = ({ url, setIsLoading }) => {
    const [listUser, setListUser] = useState([]);
    const [filterListUser, setFilterListUser] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isAdd, setIsAdd] = useState(false);
    const [dataUpdate, setDataUpdate] = useState({
        id: '',
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${url}/api/user/admin`);
            if (response.data.success) {
                setListUser(response.data.data);
                setLoading(false);
            } else {
                toast.error('Error fetching user list');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while fetching the list.');
        } finally {
            setIsLoading(false);
        }
    };

    const removeAccount = async (id) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                setIsLoading(true);
                const response = await axios.post(`${url}/api/user/deleteAdmin/`, { id });
                if (response.data.success) {
                    toast.success(response.data.message);
                    await fetchList();
                    localStorage.removeItem('token');
                } else {
                    toast.error('Error deleting account');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred while deleting the account.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const updateAccount = (item) => {
        setDataUpdate({
            id: item._id,
            name: item.name,
            email: item.email
        });
        setIsUpdate(true);
    };

    return (
        <React.Fragment>
            {loading ? (
                <SkeletonLoadingListAdd />
            ) : isAdd ? (
                <AddAdmin url={url} setIsAdd={setIsAdd} setIsLoading={setIsLoading} fetchList={fetchList} />
            ) : isUpdate ? (
                <UpdateAdmin
                    url={url}
                    dataUpdate={dataUpdate}
                    setIsUpdate={setIsUpdate}
                    setIsLoading={setIsLoading}
                    fetchList={fetchList}
                />
            ) : (
                <div className='list-account'>
                    <div className='list-account_add'>
                        <button onClick={() => setIsAdd(true)} type='button'>
                            <img src={images.add_icon} alt='Add' /> Add
                        </button>
                    </div>
                    <div className='flex-col'>
                        <div className='list-table'>
                            <div className='list-table-format title'>
                                <b>Name</b>
                                <b>Email</b>
                                <b>Action</b>
                            </div>
                            {filterListUser.map((item, index) => (
                                <div key={index} className='list-table-format'>
                                    <p>{item.name}</p>
                                    <p>{item.email}</p>
                                    <div className='list-table-format-action'>
                                        <button onClick={() => updateAccount(item)} className='edit' type='button'>
                                            Edit
                                        </button>
                                        <button onClick={() => removeAccount(item._id)} className='remove'>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <NormalPagination
                        food_list={listUser}
                        setList={setFilterListUser}
                        setIsLoading={setIsLoading}
                    />
                </div>
            )}
        </React.Fragment>
    );
};

export default Account;
