import React from 'react';
import './SkeletonLoadingListAdd.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonLoadingListAdd = () => {
    return (
        <div className="skeleton-list-add">
            <SkeletonTheme baseColor="#ebebeb" highlightColor="#f5f5f5">
                <Skeleton width={200} height={40} style={{ margin: "0 0 15px 0" }} />
                <Skeleton count={30} height={40} />
            </SkeletonTheme>
        </div>
    );
};

export default SkeletonLoadingListAdd;
