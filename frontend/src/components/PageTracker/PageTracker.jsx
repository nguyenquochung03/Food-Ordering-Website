import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const PageTracker = ({ pageUrl }) => {
    const { url } = useContext(StoreContext);

    useEffect(() => {
        const trackVisit = async () => {
            const token = localStorage.getItem('token');
            try {
                if (token) {
                    await axios.post(`${url}/api/visit/trackVisit`, { pageUrl }, {
                        headers: { token }
                    });
                } else {
                    await axios.post(`${url}/api/visit/trackVisit`, { pageUrl });
                }
            } catch (error) {
                console.error('Error tracking visit:', error);
            }
        };

        const recordLeaveTime = async () => {
            const token = localStorage.getItem('token');
            try {
                if (token) {
                    await axios.post(`${url}/api/visit/leavePage`, { pageUrl }, {
                        headers: { token }
                    });
                } else {
                    await axios.post(`${url}/api/visit/leavePage`, { pageUrl });
                }
            } catch (error) {
                console.error('Error recording leave time:', error);
            }
        };

        trackVisit();

        window.addEventListener('beforeunload', recordLeaveTime);

        return () => {
            window.removeEventListener('beforeunload', recordLeaveTime);
            recordLeaveTime();
        };
    }, [pageUrl]);

    return null;
};

export default PageTracker;
