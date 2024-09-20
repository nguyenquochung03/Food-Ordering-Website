import React from 'react'
import './Slidebar.css'
import { images } from '../../constants/data'
import { NavLink } from 'react-router-dom'

const Slidebar = () => {
    return (
        <div className='sidebar'>
            <div className="sidebar-options">
                <NavLink to={'/add'} className="sidebar-option" >
                    <img src={images.add_icon} alt="add icon" />
                    <p>Add Items</p>
                </NavLink>
                <NavLink to={'/list'} className="sidebar-option" >
                    <img src={images.order_icon} alt="add icon" />
                    <p>List Items</p>
                </NavLink>
                <NavLink to={'/order'} className="sidebar-option" >
                    <img className='sidebar-option_order-flavor' src={images.order_flavor} alt="add icon" />
                    <p>Orders</p>
                </NavLink>
                <NavLink to={'/deliveryStaff'} className="sidebar-option" >
                    <img className='sidebar-option_order-flavor' src={images.delivery} alt="add icon" />
                    <p>Delivery Staff</p>
                </NavLink>
                <NavLink to={'/account'} className="sidebar-option" >
                    <img className='sidebar-option_order-flavor' src={images.account} alt="add icon" />
                    <p>Accounts</p>
                </NavLink>
            </div>
        </div>
    )
}

export default Slidebar