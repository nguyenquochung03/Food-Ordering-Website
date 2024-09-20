import React from 'react'
import './Footer.css'
import { images } from '../../constants/data'

const Footer = () => {
    return (
        <div className='footer' id='footer'>
            <div className='footer-content'>
                <div className='footer-content-left'>
                    <p style={{ cursor: "default" }} className='logo'>Orange.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error saepe, nulla soluta voluptatibus sit ipsa optio ut velit itaque tempore earum incidunt iure iste architecto dicta eveniet, maxime dolores nam.</p>
                    <div className="footer-social-icons">
                        <img src={images.facebook_icon} alt='facebook icon' />
                        <img src={images.twitter_icon} alt='twitter icon' />
                        <img src={images.linkedin_icon} alt='linkedin icon' />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li>Home</li>
                        <li>About Us</li>
                        <li>Delivery</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>+1-212-456-7890</li>
                        <li>contact@orange.com</li>
                    </ul>
                </div>
            </div>
            <hr />
            <p className="footer-copyright">
                Copyright 2024 @ orange.com - All Right Resered.
            </p>
        </div>
    )
}

export default Footer