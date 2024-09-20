import React, { useEffect, useState } from 'react';
import '../../pages/Add/Add.css';
import './Update.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { images } from '../../constants/data.js'

const Update = ({ url, dataUp, setIsUpdate, fetchList, isUpdateInSearch, setIsUpdateInSearch, setIsLoading }) => {
    const [image, setImage] = useState('')
    const [isChangeImage, setIsChangeImage] = useState('false')
    const [data, setData] = useState({
        id: "",
        name: "",
        description: "",
        price: "",
        category: "Salad"
    });

    useEffect(() => {
        setData({
            id: dataUp.id,
            name: dataUp.name,
            description: dataUp.description,
            price: dataUp.price,
            category: dataUp.category,
            image: dataUp.image
        });
        setImage(dataUp.image)
    }, [dataUp]);

    const onBackToListHandler = () => {
        if (isUpdateInSearch) {
            setIsUpdateInSearch(false)
        }
        else {
            setIsUpdate(false)
        }
    }

    const onChangeImageHandler = (img) => {
        setImage(img)
        setIsChangeImage('true')
    }

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(data => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            setIsLoading(true)
            const formData = new FormData()
            formData.append("id", data.id)
            formData.append("name", data.name)
            formData.append("description", data.description)
            formData.append("price", Number(data.price))
            formData.append("category", data.category)
            formData.append("image", image)
            formData.append("isChangeImage", isChangeImage)

            const response = await axios.post(`${url}/api/food/update`, formData);
            if (response.data.success) {
                if (isUpdateInSearch) {
                    setIsUpdateInSearch(false)
                }
                else {
                    setIsUpdate(false)
                }
                await fetchList()
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("An error occurred while updating the product.");
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className='update'>
            <div className="update-title">
                <img src={images.back_arrow} alt="" onClick={() => onBackToListHandler()} />
            </div>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        {
                            <img src={isChangeImage === 'true' ? URL.createObjectURL(image) : `${url}/images/${image}`} alt="" />
                        }
                    </label>
                    <input onChange={(e) => onChangeImageHandler(e.target.files[0])} type="file" id='image' hidden />
                </div>
                <div className="add-product-name flex-col">
                    <p>Product name</p>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        name="name"
                        placeholder='Type here'
                        required
                    />
                </div>
                <div className="add-product-description flex-col">
                    <p>Product description</p>
                    <textarea
                        onChange={onChangeHandler}
                        value={data.description}
                        name="description"
                        rows="6"
                        placeholder='Write content here'
                        required
                    />
                </div>
                <div className="add-category-price">
                    <div className="add-category flex-col">
                        <p>Product category</p>
                        <select
                            onChange={onChangeHandler}
                            value={data.category}
                            name="category"
                        >
                            <option value="Salad">Salad</option>
                            <option value="Rolls">Rolls</option>
                            <option value="Deserts">Deserts</option>
                            <option value="Sandwich">Sandwich</option>
                            <option value="Cake">Cake</option>
                            <option value="Pure Veg">Pure Veg</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Noodles">Noodles</option>
                        </select>
                    </div>
                    <div className="add-price flex-col">
                        <p>Product price</p>
                        <input
                            onChange={onChangeHandler}
                            value={data.price}
                            type="number"
                            name='price'
                            placeholder='$20'
                            required
                        />
                    </div>
                </div>
                <button type="submit" className='add-btn'>UPDATE</button>
            </form>
        </div>
    );
};

export default Update;
