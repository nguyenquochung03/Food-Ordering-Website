import React, { createContext, useState } from 'react';

export const PaginationContext = createContext();

export const PaginationProvider = ({ children }) => {
    const [postsPerPage, setPostsPerPage] = useState(10);
    const [pagination, setPagination] = useState([]);
    const [indexPagination, setIndexPagination] = useState('All food list');

    const updatePagination = (name, foodCategory, currentPage, currentPosts) => {
        const exists = pagination.some(item => item.name === name);

        if (exists) {
            setPagination(prevState => {
                const updatedPagination = prevState.map(item =>
                    item.name === name
                        ? { ...item, name, foodCategory, currentPage, currentPosts }
                        : item
                );
                return updatedPagination;
            });
        } else {
            setPagination(prevState => [
                ...prevState,
                { name, foodCategory, currentPage, currentPosts }
            ]);
        }
    };

    return (
        <PaginationContext.Provider value={{ postsPerPage, pagination, indexPagination, updatePagination, setIndexPagination }}>
            {children}
        </PaginationContext.Provider>
    );
};