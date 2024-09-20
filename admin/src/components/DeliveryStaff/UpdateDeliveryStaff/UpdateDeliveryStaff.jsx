import React, { useEffect, useRef, useState } from 'react'
import './UpdateDeliveryStaff.css'
import { toast } from 'react-toastify'

import axios from 'axios'
import { images } from '../../../constants/data';

const UpdateDeliveryStaff = ({ url, dataUpdate, setIsUpdate, setIsLoading, fetchList }) => {

    const inputRef = useRef(null)
    const [data, setData] = useState({
        id: '',
        phone: '',
        name: '',
        email: '',
    });

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    useEffect(() => {
        setData({
            id: dataUpdate.id,
            phone: dataUpdate.phone,
            name: dataUpdate.name,
            email: dataUpdate.email,
        });
    }, [dataUpdate]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const isValidPhoneNumber = (phoneNumber) => {
        const phonePattern = /^\d{7,15}$/;

        if (!phonePattern.test(phoneNumber)) {
            return false;
        }

        for (let i = 0; i < phoneNumber.length; i++) {
            if (isNaN(parseInt(phoneNumber[i]))) {
                return false;
            }
        }

        return true;
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!isValidPhoneNumber(data.phone)) {
            toast.error('Please enter a valid phone number');
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post(`${url}/api/deliveryStaff/update`, {
                id: data.id,
                phone: data.phone,
                name: data.name,
                email: data.email,
            });

            if (response.data.success) {
                setData({
                    name: '',
                    email: '',
                    password: '',
                });
                setIsUpdate(false);
                toast.success(response.data.message);
                fetchList();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            toast.error('An error occurred while updating delivery staff.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="update-delivery-staff-container">
            <div className='update-delivery-staff'>
                <img onClick={() => setIsUpdate(false)} className='add-admin-container-img' src={images.back_arrow} alt="" />
                <div className='update-delivery-staff_title'>
                    <p>Update Delivery Staff</p>
                </div>
                <form className='update-delivery-staff_input' onSubmit={onSubmitHandler}>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type='text'
                        name='name'
                        required
                        placeholder='Name'
                        ref={inputRef}
                    />
                    <input
                        onChange={onChangeHandler}
                        value={data.phone}
                        type='text'
                        name='phone'
                        required
                        placeholder='Name'
                    />
                    <input
                        onChange={onChangeHandler}
                        value={data.email}
                        type='email'
                        name='email'
                        required
                        placeholder='Email@example.com'
                    />
                    <button type='submit'>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default UpdateDeliveryStaff