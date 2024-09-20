import React, { createContext, useState } from 'react';

export const OrderPaginationContext = createContext();

export const OrderPaginationProvider = ({ children }) => {
    const [postsPerPage, setPostsPerPage] = useState(4);
    const [orderPagination, setOrderPagination] = useState([]);
    const [indexOrderPagination, setIndexOrderPagination] = useState('');

    const updateOrderPagination = (name, orderList, currentPage, currentPosts) => {
        const exists = orderPagination.some(item => item.name === name);

        if (exists) {
            setOrderPagination(prevState => {
                const updatedOrderPagination = prevState.map(item =>
                    item.name === name
                        ? { ...item, name, orderList, currentPage, currentPosts }
                        : item
                );
                return updatedOrderPagination;
            });
        } else {
            setOrderPagination(prevState => [
                ...prevState,
                { name, orderList, currentPage, currentPosts }
            ]);
        }
    };

    return (
        <OrderPaginationContext.Provider value={{ postsPerPage, orderPagination, indexOrderPagination, updateOrderPagination, setIndexOrderPagination }}>
            {children}
        </OrderPaginationContext.Provider>
    );
};