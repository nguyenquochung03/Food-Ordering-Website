import React, { useEffect, useRef, useState } from 'react';
import './FindFoodByName.css';
import { images } from '../../constants/data';
import Update from '../Update/Update';
import axios from 'axios';
import { toast } from 'react-toastify';

const FindFoodByName = ({ url, setIsSearch, setIsLoading }) => {
    const [value, setValue] = useState('');
    const [isUpdateInSearch, setIsUpdateInSearch] = useState(false);
    const [filterList, setFilterList] = useState([]);
    const [data, setData] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [dataUpdate, setDataUpdate] = useState({
        id: "",
        name: "",
        description: "",
        price: "",
        category: "",
        image: ""
    });
    const searchInputRef = useRef(null);

    useEffect(() => {
        searchInputRef.current.focus();
    }, []);

    const onChangeValueHandler = (e) => {
        setValue(e.target.value);
        if (e.target.value.trim().length === 0) {
            setIsSuccess(false)
        }
        else {
            onSearchHandler()
        }
    };

    const removeFood = async (foodId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                setIsLoading(true)
                await axios.post(`${url}/api/food/remove/`, { id: foodId });
                fetchList();
                toast.success("Food deleted successfully.");
            } catch (error) {
                console.error(error);
                toast.error("An error occurred while deleting.");
            } finally {
                setIsLoading(false)
            }
        }
    };

    const updateFood = (item) => {
        setDataUpdate({
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image
        });
        setIsUpdateInSearch(true);
    };

    const fetchList = async () => {
        onSearchHandler()
    };

    const onSearchHandler = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get(`${url}/api/food/getFoodByName?name=${value}`);
            if (response.data.success) {
                if (response.data.data.length === 1) {
                    setData(response.data.data[0]);
                    setFilterList([]);
                    setIsSuccess(true);
                } else if (response.data.data.length > 1) {
                    setFilterList(response.data.data);
                    setData({});
                    setIsSuccess(true);
                } else {
                    setIsSuccess(false);
                }
            } else {
                setIsSuccess(false);
            }
        } catch (error) {
            setIsSuccess(false);
            console.error(error);
            toast.error("An error occurred while fetching data.");
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className='search-food-by-name-container'>
            {isUpdateInSearch ? (
                <Update url={url} dataUp={dataUpdate} isUpdateInSearch={isUpdateInSearch} setIsUpdateInSearch={setIsUpdateInSearch} fetchList={fetchList} setIsLoading={setIsLoading} />
            ) : (
                <div>
                    <div className="search">
                        <img className='search-food-by-name-img' onClick={() => setIsSearch(false)} src={images.back_arrow} alt="" />
                        <div className="search-food-by-name">
                            <div className="search-food-by-name-input">
                                <input
                                    onChange={onChangeValueHandler}
                                    type="text"
                                    value={value}
                                    ref={searchInputRef}
                                    placeholder='food name'
                                />
                                <img src={images.search_icon} alt="Search" />
                            </div>
                        </div>
                    </div>
                    <div className='search-food-by-name-list-table-container'>
                        {isSuccess ? (
                            <div className='list-table'>
                                <div className="list-table-format title">
                                    <b>Image</b>
                                    <b>Name</b>
                                    <b>Category</b>
                                    <b>Price</b>
                                    <b>Action</b>
                                </div>
                                {filterList.length > 0 ? (
                                    filterList.map((item, index) => (
                                        <div key={index} className='list-table-format'>
                                            <img src={`${url}/images/${item.image}`} alt={item.name} />
                                            <p>{item.name}</p>
                                            <p>{item.category}</p>
                                            <p>{item.price}</p>
                                            <div className="list-table-format-action">
                                                <button onClick={() => updateFood(item)} className='edit' type='button'>Edit</button>
                                                <button onClick={() => removeFood(item._id)} className='remove'>Remove</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='list-table-format'>
                                        <img src={`${url}/images/${data.image}`} alt={data.name} />
                                        <p>{data.name}</p>
                                        <p>{data.category}</p>
                                        <p>{data.price}</p>
                                        <div className="list-table-format-action">
                                            <button onClick={() => updateFood(data)} className='edit' type='button'>Edit</button>
                                            <button onClick={() => removeFood(data._id)} className='remove'>Remove</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className='search-food-by-name-list-table-not-found'>Food not found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindFoodByName;