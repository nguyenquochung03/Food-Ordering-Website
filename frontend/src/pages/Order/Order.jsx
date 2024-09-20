import React, { useContext, useState } from 'react'
import './Order.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import PageTracker from '../../components/PageTracker/PageTracker'

const Order = ({ setIsLoading }) => {
    const { getTotalCartAmount, token, food_list, cartItems, url, loadCartData } = useContext(StoreContext)
    const [paymentMethod, setPaymentMethod] = useState("")
    const navigate = useNavigate()

    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    })

    const handleChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const onChangeHanlder = (event) => {
        setIsLoading(true)
        const name = event.target.name
        const value = event.target.value

        setData(prev => ({ ...prev, [name]: value }))
        setIsLoading(false)
    }

    const placeOrder = async (event) => {
        event.preventDefault()
        setIsLoading(true)
        let orderItems = []
        food_list.map((item) => {
            if (cartItems[item._id]) {
                let itemInfo = item
                itemInfo["quantity"] = cartItems[item._id]
                orderItems.push(itemInfo)
            }
        })
        let orderData = {
            address: data,
            items: orderItems,
            amount: getTotalCartAmount() + 2
        }
        let orderUrl = ''
        if (paymentMethod && paymentMethod === "Transfer") {
            orderUrl = '/api/order/place'
        } else if (paymentMethod && paymentMethod === "Cash") {
            orderUrl = '/api/order/order'
        } else {
            return;
        }
        let response = await axios.post(url + orderUrl, orderData, { headers: { token } })
        setIsLoading(false)
        if (response.data.success) {
            if (paymentMethod === "Transfer") {
                const { session_url } = response.data
                window.location.replace(session_url)
            } else if (paymentMethod === "Cash") {
                toast.success("The order has been placed")
                loadCartData(token)
                navigate('/myorders')
            } else {
                navigate('/cart')
            }
        } else {
            alert("Error")
        }
    }

    return (
        <React.Fragment>
            <form onSubmit={placeOrder} className='order'>
                <div className="order-left">
                    <p className='title'>Delivery infomation</p>
                    <div className="multi-fields">
                        <input required name='firstName' onChange={onChangeHanlder} value={data.firstName} type="text" placeholder='First Name' />
                        <input required name='lastName' onChange={onChangeHanlder} value={data.lastName} type="text" placeholder='Last Name' />
                    </div>
                    <input required name='email' onChange={onChangeHanlder} value={data.email} type="email" placeholder='Email address' />
                    <input required name='street' onChange={onChangeHanlder} value={data.street} type="text" placeholder='Street' />
                    <div className="multi-fields">
                        <input required name='city' onChange={onChangeHanlder} value={data.city} type="text" placeholder='City' />
                        <input required name='state' onChange={onChangeHanlder} value={data.state} type="text" placeholder='State' />
                    </div>
                    <div className="multi-fields">
                        <input required name='zipcode' onChange={onChangeHanlder} value={data.zipcode} type="text" placeholder='Zip code' />
                        <input required name='country' onChange={onChangeHanlder} value={data.country} type="text" placeholder='Country' />
                    </div>
                    <input required name='phone' onChange={onChangeHanlder} value={data.phone} type="text" placeholder='Phone' />
                </div>
                <div className="order-right">
                    <div className="cart-total">
                        <h2>Cart Totals</h2>
                        <div>
                            <div className="cart-total-details">
                                <p>Subtotal</p>
                                <p>${getTotalCartAmount()}</p>
                            </div>
                            <hr />
                            <div className="cart-total-details">
                                <p>Delivery Fee</p>
                                <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
                            </div>
                            <hr />
                            <div className="cart-total-details">
                                <b>Total</b>
                                <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
                            </div>
                        </div>
                        <div className="order-payment-type">
                            <h2>Payment method</h2>
                            <select id="paymentMethod" value={paymentMethod} onChange={handleChange}>
                                <option value="">-- Select Payment Method --</option>
                                <option value="Transfer">Transfer</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>
                        {paymentMethod ? (
                            paymentMethod === "Transfer" ? (
                                <button type="submit">PROCEED TO PAYMENT</button>
                            ) : (
                                <button type="submit">ORDER</button>
                            )
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            </form>
            <PageTracker pageUrl={`${url}/order`} />
        </React.Fragment>
    )
}

export default Order