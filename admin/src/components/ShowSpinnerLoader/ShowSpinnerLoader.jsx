import React from 'react'
import './ShowSpinnerLoader.css'
import { images } from '../../constants/data'

const ShowSpinnerLoader = () => {
    return (
        <div className='loading-spinner'>
            <img src={images.spinner_loader} alt="spinner loader" />
        </div>
    )
}

export default ShowSpinnerLoader