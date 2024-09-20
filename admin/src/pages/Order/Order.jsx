import React, { useState, useEffect, useContext, useRef } from 'react';
import './Order.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { images } from '../../constants/data';
import { OrderPaginationContext, OrderPaginationProvider } from '../../context/OrderPaginationContext';
import OrderPagination from '../../components/Pagination/OrderPagination/OrderPagination';
import ReactToPrint from 'react-to-print';
import Invoice from '../../components/Invoice/Invoice';

const Order = ({ url, setIsLoading }) => {
    const { postsPerPage, orderPagination, updateOrderPagination, indexOrderPagination, setIndexOrderPagination } = useContext(OrderPaginationContext);
    const [filterList, setFilterList] = useState([])
    const [listDeliveryStaff, setListDeliveryStaff] = useState([]);
    const [deliveryStaffNames, setDeliveryStaffNames] = useState({});
    const [selectedInfo, setSelectedInfo] = useState({});
    const [orders, setOrders] = useState([]);
    const orderStatuses = [
        "Wait for Confirmation",
        "Food Processing",
        "Out for delivery",
        "Delivered",
        "Successful",
        "Cancelled"
    ];
    const [currentStatus, setCurrentStatus] = useState('Wait for Confirmation');
    const [orderStatus, setOrderStatus] = useState([]);
    const printRefs = useRef({})

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                await fetchAllOrder();
            } catch (error) {
                toast.error("Error loading data");
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData()
    }, []);

    useEffect(() => {
        fetchOrderStatus();
    }, [currentStatus]);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            if (orders.length > 0) {
                await fetchOrderStatus()
                const filteredOrders = orders.filter(order => order.status !== "Out for delivery" && order.status !== "Delivered" && order.status !== "Successful" && order.status !== "Cancelled");

                if (filteredOrders.length > 0) {
                    const latestOrder = filteredOrders.reduce((latest, order) => {
                        return new Date(order.date) < new Date(latest.date) ? order : latest;
                    }, filteredOrders[0]);

                    onChangeStatus(latestOrder.status)
                }
            } else {
                onChangeStatus("Wait for Confirmation")
            }
            setIsLoading(false)
        }

        fetchData()
    }, [orders])

    useEffect(() => {
        orderStatus.forEach(async order => {
            if (currentStatus === "Food Processing") {
                await fetchDeliveryStaff()
            }
            if (currentStatus === "Out for delivery" || currentStatus === "Delivered") {
                await fetchDeliveryStaffName(order._id)
            }
        });
    }, [orderStatus, currentStatus])

    useEffect(() => {
        try {
            setIsLoading(true)
            const currentData = orderPagination.find(item => item.name === indexOrderPagination)
            if (currentData) {
                const currentPages = currentData.currentPage
                const listOrder = orderStatus.filter(item => item.status === indexOrderPagination)
                updateOrderPagination(indexOrderPagination, listOrder, currentPages, listOrder.slice(0, 4))
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }, [orderStatus])

    useEffect(() => {
        try {
            setIsLoading(true)
            const currentData = orderPagination.find(item => item.name === indexOrderPagination)
            const listOrder = orderStatus
            if (currentData) {
                const currPage = currentData.currentPage
                updateOrderPagination(indexOrderPagination, listOrder, currPage, listOrder.slice(postsPerPage * currPage - postsPerPage, postsPerPage * currPage))
            } else {
                updateOrderPagination(indexOrderPagination, listOrder, 1, listOrder.slice(0, postsPerPage))
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }, [indexOrderPagination])

    useEffect(() => {
        const currentData = orderPagination.find(item => item.name === indexOrderPagination);
        if (currentData && currentData.currentPosts !== filterList) {
            setFilterList(currentData.currentPosts);
        }
    }, [orderPagination]);

    const fetchAllOrder = async () => {
        setIsLoading(true)
        const response = await axios.get(url + '/api/order/list');
        if (response.data.success) {
            setOrders(response.data.data);
        } else {
            toast.error("Error");
        }
        setIsLoading(false)
    };

    const fetchOrderStatus = async () => {
        const response = await axios.get(url + `/api/order/listStatus?status=${currentStatus}`);
        if (response.data.success) {
            const sortedData = response.data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
            setOrderStatus(sortedData);
        } else {
            toast.error(response.data.message);
        }
    };

    const fetchDeliveryStaff = async () => {
        const response = await axios.get(url + '/api/deliveryStaff/getAll');

        if (response.data.success) {
            setListDeliveryStaff(response.data.data);
        } else {
            toast.error(response.data.message);
        }
    };

    const onChangeStatus = (status) => {
        setCurrentStatus(status)
        setIndexOrderPagination(status)
    }

    const onFetchDataHandler = async () => {
        await fetchAllOrder()
    }

    const onHandleOrder = async (order, status) => {
        try {
            const updatedOrderResponse = await axios.get(`${url}/api/order/get`, {
                params: { orderId: order._id }
            });
            const updatedOrder = updatedOrderResponse.data.data;
            if (updatedOrder.status === order.status) {
                let str = ""
                if (status === "Cancelled") {
                    str = "Are you sure you want to deny this order?"
                } else if (status === "Food Processing") {
                    str = "Are you sure you want to receive this order?"
                } else if (status === "Delivered") {
                    str = "Are you sure this order has been delivered?"
                } else {
                    str = ""
                }
                const result = window.confirm(str);
                if (result) {
                    const updateSuccess = await statusHandler({ target: { value: status } }, order._id);
                    if (updateSuccess) {
                        toast.success(`Order ${status}`);
                        await fetchOrderStatus()
                    } else {
                        toast.error(`Failed to ${status} order`);
                    }
                }
            } else {
                toast.info(`The order status has already been updated to ${updatedOrder.status}.`);
                await fetchOrderStatus()
            }
        } catch (error) {
            console.error("Error handling order: ", error);
            toast.error("An error occurred while trying to update status the order.");
        }
    };

    const statusHandler = async (event, orderId) => {
        try {
            setIsLoading(true)
            const response = await axios.post(url + '/api/order/status', {
                orderId,
                status: event.target.value
            });
            if (response.data.success) {
                await fetchAllOrder();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            return false;
        } finally {
            setIsLoading(false)
        }
    };

    const clearSelectedInfo = (id) => {
        setSelectedInfo(prevState => {
            const newState = { ...prevState };
            delete newState[id];
            return newState;
        });
    };

    const setOrderAndDeliveryStaffForDelivery = (event, id) => {
        const selectedDeliveryStaff = listDeliveryStaff.find(staff => staff._id === event);
        setSelectedInfo(prevState => ({
            ...prevState,
            [id]: {
                selectedDeliveryStaff: selectedDeliveryStaff,
                selectedOrder: id
            }
        }));
    };

    const onCompleteProcessingOrder = async (selectedDeliveryStaffOrder) => {
        const deliveryStaffId = selectedDeliveryStaffOrder.selectedDeliveryStaff._id
        const orderId = selectedDeliveryStaffOrder.selectedOrder

        try {
            setIsLoading(true)
            const response = await axios.post(`${url}/api/deliveryStaffOrder/setDeliveryStaffOrder`, { deliveryStaffId: deliveryStaffId, orderId: orderId })

            if (response.data.success) {
                toast.success("Complete order")
                await fetchOrderStatus()
            } else {
                toast.error("Error")
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchDeliveryStaffName = async (orderId) => {
        try {
            setIsLoading(true)
            const response = await axios.post(`${url}/api/deliveryStaffOrder/getNameDeliveryStaffFromOrderId`, { orderId: orderId });

            if (response.data.success) {
                setDeliveryStaffNames(prevState => ({
                    ...prevState,
                    [orderId]: response.data.nameDeliveryStaff
                }));
            } else {
                setDeliveryStaffNames(prevState => ({
                    ...prevState,
                    [orderId]: ''
                }));
            }
        } catch (error) {
            console.log(error);
            setDeliveryStaffNames(prevState => ({
                ...prevState,
                [orderId]: ''
            }));
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className='order'>
            <div onClick={() => onFetchDataHandler()} className="order-fetch-data">
                <button><img src={images.rotate_arrow} alt="" />Fetch Data</button>
            </div>
            <div className="order-status">
                {orderStatuses.map((status, index) => (
                    <button onClick={() => onChangeStatus(status)} key={index} className={currentStatus === status ? 'active' : ''}>{status}</button>
                ))}
            </div>
            <div className="order-list">
                {filterList.map((order, index) => (
                    <div className='order-item' key={index}>
                        <div className="flex-col order-item_first-col">
                            {
                                deliveryStaffNames[order._id] && currentStatus !== "Cancelled" &&
                                <p>{deliveryStaffNames[order._id]}</p>
                            }
                            <img src={images.parcel_icon} alt="" />
                        </div>
                        <div>
                            <p className='order-item-food'>
                                {order.items.map((item, idx) =>
                                    `${item.name} x ${item.quantity}${idx === order.items.length - 1 ? '' : ', '}`
                                )}
                            </p>
                            <p className='order-item-name'>{order.address.firstName} {order.address.lastName}</p>
                            <div className='order-item-address'>
                                <p>{order.address.street}, </p>
                                <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
                            </div>
                            <p className='order-item-phone'>{order.address.phone}</p>
                        </div>
                        <p>Items: {order.items.length}</p>
                        <p>${order.amount}</p>

                        {currentStatus === "Wait for Confirmation" && (
                            <div className='order-item-receive-deny-order'>
                                <button onClick={async () => onHandleOrder(order, "Food Processing")}>
                                    Receive Order
                                </button>
                                {order.paymentType === "Cash" && (
                                    <button onClick={async () => onHandleOrder(order, "Cancelled")}>
                                        Deny Order
                                    </button>
                                )}
                            </div>
                        )}

                        {currentStatus === "Food Processing" && (
                            <>
                                <select
                                    value={selectedInfo[order._id] ? selectedInfo[order._id].selectedDeliveryStaff._id : ''}
                                    onChange={(e) => {
                                        if (e.target.value === "") {
                                            clearSelectedInfo(order._id);
                                        } else {
                                            setOrderAndDeliveryStaffForDelivery(e.target.value, order._id);
                                        }
                                    }}
                                >
                                    <option value="">Choose delivery staff</option>
                                    {listDeliveryStaff.map((staff, idx) => (
                                        <option key={idx} value={staff._id}>{staff.name}</option>
                                    ))}
                                </select>
                                {selectedInfo[order._id] && (
                                    <button onClick={() => onCompleteProcessingOrder(selectedInfo[order._id])}>
                                        Done
                                    </button>
                                )}
                            </>
                        )}

                        {(currentStatus === "Out for delivery" || currentStatus === "Delivered" || currentStatus === "Successful") && (
                            <>
                                <div className="order-item_name-delivery-staff">
                                    {currentStatus === "Out for delivery" && (
                                        <button onClick={async () => onHandleOrder(order, "Delivered")}>
                                            Delivered
                                        </button>
                                    )}
                                    <ReactToPrint
                                        trigger={() => <button>Print Invoice</button>}
                                        content={() => printRefs.current[order._id]}
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ display: 'none' }}>
                            <Invoice ref={(el) => (printRefs.current[order._id] = el)} order={order} />
                        </div>

                        {currentStatus === "Cancelled" && (
                            <div className="order-item_cancelled">
                                <p>Cancelled</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <OrderPaginationProvider>
                <OrderPagination orderStatus={orderStatus} postsPerPage={postsPerPage} orderPagination={orderPagination} updateOrderPagination={updateOrderPagination} indexOrderPagination={indexOrderPagination} setIsLoading={setIsLoading} />
            </OrderPaginationProvider>
        </div>
    );
};

export default Order;