import React from 'react'
import './ShowLoadingSpinner.css'
import { images } from '../../constants/data'

const ShowLoadingSpinner = () => {
    return (
        <div className='loading-spinner'>
            <img src={images.spinner_loader} alt="spinner loader" />
        </div>
    )
}

export default ShowLoadingSpinner