import express from 'express'
import { confirmOrderDelivered, confirmOrderDeliveredSuccessfully, getNameDeliveryStaffFromOrderId, setDeliveryStaffOrder } from '../controllers/deliveryStaffOrderController.js'

const deliveryStaffOrderRoute = express.Router()

deliveryStaffOrderRoute.post('/setDeliveryStaffOrder', setDeliveryStaffOrder)
deliveryStaffOrderRoute.get('/ConfirmOrderDeliveredSuccessfully/:token', confirmOrderDeliveredSuccessfully)
deliveryStaffOrderRoute.post('/ConfirmOrderDeliveredSuccessfully/:token', confirmOrderDelivered)
deliveryStaffOrderRoute.post('/getNameDeliveryStaffFromOrderId', getNameDeliveryStaffFromOrderId)

export default deliveryStaffOrderRoute