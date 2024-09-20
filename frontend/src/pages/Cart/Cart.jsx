import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import PageTracker from '../../components/PageTracker/PageTracker'

const Cart = ({ setIsLoading }) => {

    const { token, cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext)
    const navigate = useNavigate()

    const onProceedHandler = () => {
        setIsLoading(true)
        let isCartEmpty = true;
        for (const [key, value] of Object.entries(cartItems)) {
            if (value > 0) {
                isCartEmpty = false;
                break;
            }
        }
        setIsLoading(false)

        if (!token) {
            alert("Please log in before paying")
        } else if (isCartEmpty) {
            alert("Please add products to cart before payment")
        } else {
            navigate('/order')
        }
    }

    return (
        <React.Fragment>
            <div className='cart'>
                <div className="cart-items">
                    <div className="cart-items-title">
                        <p>Items</p>
                        <p>Title</p>
                        <p>Price</p>
                        <p>Quantity</p>
                        <p>Total</p>
                        <p>Add</p>
                        <p>Remove</p>
                    </div>
                    <br />
                    <hr />
                    {
                        food_list.map((item, index) => {
                            if (cartItems[item._id] > 0) {
                                return (
                                    <div key={index}>
                                        <div className="cart-items-title cart-items-item">
                                            <img src={url + '/images/' + item.image} alt="" />
                                            <p>{item.name}</p>
                                            <p>${item.price}</p>
                                            <p>{cartItems[item._id]}</p>
                                            <p>${item.price * cartItems[item._id]}</p>
                                            <p onClick={() => addToCart(item._id)} className='cross-add'>+</p>
                                            <p onClick={() => removeFromCart(item._id)} className='cross-delete'>x</p>
                                        </div>
                                        <hr />
                                    </div>
                                )
                            }
                        })
                    }
                </div>
                <div className="cart-bottom">
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
                        <button onClick={() => onProceedHandler()}>PROCEED TO CHECKOUT</button>
                    </div>
                    <div className="cart-promocodes">
                        <div>
                            <p>If you have promo code, Enter it here</p>
                            <div className='cart-promocodes-input'>
                                <input type="text" placeholder='promo code' />
                                <button>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PageTracker pageUrl={`${url}/cart`} />
        </React.Fragment>
    )
}

export default Cart