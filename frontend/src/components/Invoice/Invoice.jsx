import React, { forwardRef } from 'react';
import './Invoice.css'

const Invoice = forwardRef(({ order }, ref) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const calculateTotalAmount = (items) => {
        return items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    return (
        <div ref={ref} className='order-invoice'>
            <div className="order-invoice-header">
                <p>Order Invoice</p>
                <div className="order-invoice-header-right">
                    <p>Date</p>
                    <p>{formatDate(order.date)}</p>
                    <p>Invoice No.</p>
                    <p>{order._id}</p>
                </div>
            </div>
            <div className="order-invoice-container">
                <div className="order-invoice-information">
                    <p>Name</p>
                    <p>{order.address.firstName} {order.address.lastName}</p>
                    <p>Phone Number</p>
                    <p>{order.address.phone}</p>
                    <p>Email</p>
                    <p>{order.address.email}</p>
                    <p>Payment method</p>
                    <div className="order-invoice-information-payment-method">
                        <p>{order.paymentType}</p>
                    </div>
                    <p>Address</p>
                    <p>{order.address.street}, {order.address.state}, {order.address.city}, {order.address.country}, {order.address.zipcode}</p>
                </div>
                <p className="order-invoice-title">Order Details</p>
                <div className="order-invoice-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Unit Price</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <span className="item-name">{item.name}</span> <br />
                                        <span className="item-quantity">x{item.quantity}</span>
                                    </td>
                                    <td><span className="item-price">${item.price.toFixed(2)}</span></td>
                                    <td><span className="item-amount">${(item.price * item.quantity).toFixed(2)}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="order-invoice-total-container">
                    <div className="order-invoice-total">
                        <div className="order-invoice-total-left">
                            <p>Total</p>
                        </div>
                        <div className="order-invoice-total-right">
                            <p>${calculateTotalAmount(order.items).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="order-invoice-footer">
                    <p>Contact us: 42-244-5215 - Email us: orange@example.com</p>
                </div>
            </div>
        </div>
    );
});

export default Invoice;
