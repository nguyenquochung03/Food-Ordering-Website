import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import PageTracker from '../../components/PageTracker/PageTracker'

const Verify = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")

    const { url, token, updateToken, loadCartData } = useContext(StoreContext)
    const navigate = useNavigate()

    const verifyPayment = async () => {
        const response = await axios.post(url + '/api/order/verify', { success, orderId }, { headers: { token } })

        if (response.data.success) {
            loadCartData(token)
            navigate('/myorders')
        } else {
            navigate('/cart')
        }
    }

    useEffect(() => {
        if (!token) {
            updateToken();
        } else {
            verifyPayment();
        }
    }, [token])

    return (
        <React.Fragment>
            <div className='verify'>
                <div className="spinner">
                </div>
            </div>
            <PageTracker pageUrl={`${url}/verify`} />
        </React.Fragment>
    )
}

export default Verify