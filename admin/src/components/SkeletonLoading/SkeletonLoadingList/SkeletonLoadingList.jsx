import React from 'react';
import './SkeletonLoadingList.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonLoadingList = () => {
    return (
        <SkeletonTheme baseColor="#ebebeb" highlightColor="#f5f5f5">
            <div className="skeleton-loading-header">
                <Skeleton width={110} height={40} />
                <Skeleton width={40} height={40} />
            </div>
            <Skeleton count={30} height={40} />
        </SkeletonTheme>
    );
};

export default SkeletonLoadingList;
