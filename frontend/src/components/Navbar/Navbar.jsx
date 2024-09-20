import React, { useContext, useState } from 'react'
import './Navbar.css'

import { images } from '../../constants/data'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const Navbar = ({ setShowLogin, setIsUpdateProfileImage }) => {
    const [menu, setMenu] = useState("home")
    const { url, getTotalCartAmount, token, setToken, setCartItems, userName, userImage } = useContext(StoreContext)
    const navigate = useNavigate()

    const logout = () => {
        setCartItems({})
        localStorage.removeItem("token")
        setToken("")
        navigate("/")
    }

    return (
        <div className='navbar'>
            <Link to='/'>
                <p className='logo'>Orange.</p>
            </Link>
            <ul className="navbar-menu">
                <Link to='/' onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''}>Home</Link>
                <a href='#explore-menu' onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''}>Menu</a >
                <a href='#app-download' onClick={() => setMenu('mobile-app')} className={menu === 'mobile-app' ? 'active' : ''}>Mobile App</a >
                <a href='#footer' onClick={() => setMenu('contact-us')} className={menu === 'contact-us' ? 'active' : ''}>Contact Us</a >
            </ul>
            <div className='navbar-right'>
                <div className="navbar-search-icon">
                    <Link to='/cart'><img src={images.basket_icon} alt='basket icon' /></Link>
                    <div className={getTotalCartAmount() === 0 ? '' : 'dot'}></div>
                </div>
                {
                    !token
                        ? <button onClick={() => setShowLogin(true)}>Sign In</button>
                        : <div className='navbar-profile'>
                            <div className="nabar-profile-avatar-container">
                                <img className='navbar-profile-avatar' src={`${url}/images/${userImage}`} alt="" />
                            </div>
                            <ul className="navbar-profile-dropdown">
                                <div className='navbar-profile-dropdown-username'>{userName}</div>
                                <li onClick={() => navigate('/myorders')}><img src={images.bag_icon} alt="" /><p>Orders</p></li>
                                <hr />
                                <li onClick={logout}><img src={images.logout_icon} alt="" /><p>Logout</p></li>
                                <hr />
                                <li onClick={() => setIsUpdateProfileImage(prevState => !prevState)}><img src={images.person} alt="" /><p>Image</p></li>
                            </ul>
                        </div>
                }
            </div>
        </div>
    )
}

export default Navbar