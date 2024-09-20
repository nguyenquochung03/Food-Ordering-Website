import React, { useEffect, useRef, useState } from 'react'
import './AddDeliveryStaff.css'
import { toast } from 'react-toastify';

import axios from 'axios';
import { images } from '../../../constants/data';

const AddDeliveryStaff = ({ url, setIsAdd, setIsLoading, fetchList }) => {

    const inputRef = useRef(null)
    const [data, setData] = useState({
        name: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

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

            const response = await axios.post(`${url}/api/deliveryStaff/add`, {
                name: data.name,
                phone: data.phone,
                email: data.email
            });

            if (response.data.success) {
                setData({
                    name: '',
                    phone: '',
                    email: '',
                });
                toast.success(response.data.message);
                fetchList();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('An error occurred: ', error);
            toast.error('An error occurred while adding delivery staff.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-delivery-staff-container">
            <div className='add-delivery-staff'>
                <img onClick={() => setIsAdd(false)} className='add-admin-container-img' src={images.back_arrow} alt="" />
                <div className='add-delivery-staff_title'>
                    <p>Add Delivery Staff</p>
                </div>
                <form className='add-delivery-staff_input' onSubmit={onSubmitHandler}>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type='text'
                        name='name'
                        required
                        placeholder='name'
                        ref={inputRef}
                    />
                    <input
                        onChange={onChangeHandler}
                        value={data.phone}
                        type='text'
                        name='phone'
                        required
                        placeholder='(888) 555-4800'
                    />
                    <input
                        onChange={onChangeHandler}
                        value={data.email}
                        type='email'
                        name='email'
                        required
                        placeholder='email@example.com'
                    />
                    <button type='submit'>Submit</button>
                </form>
            </div>
        </div>
    )
}

export default AddDeliveryStaff