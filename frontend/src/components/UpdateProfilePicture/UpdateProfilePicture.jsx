import React, { useContext, useEffect, useRef, useState } from 'react'
import './UpdateProfilePicture.css'
import { images } from '../../constants/data'
import axios from "axios"
import { toast } from 'react-toastify'
import { StoreContext } from '../../context/StoreContext'
import PageTracker from '../PageTracker/PageTracker'

const UpdateProfilePicture = ({ url, setIsUpdateProfileImage, setIsLoading }) => {
    const { setUserImage, token } = useContext(StoreContext)
    const [image, setImage] = useState(null)
    const popupRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsUpdateProfileImage(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsUpdateProfileImage]);

    const isImageFile = (file) => {
        return file.type.startsWith('image/');
    };

    const onUpdateProfileImageHandler = async (event) => {
        event.preventDefault();

        if (!image || !isImageFile(image)) {
            toast.error("Please select a file image.");
            return;
        }

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('image', image);

            const response = await axios.post("http://localhost:4000/api/user/updateAvartar", formData, { headers: { token } });
            if (response.data.success) {
                setImage(null);
                setUserImage(response.data.data);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("An error occurred while updating the profile picture.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    }

    const resetImage = async () => {
        setImage(null);

        try {
            setIsLoading(true);
            const response = await axios.post("http://localhost:4000/api/user/resetAvartar", {}, { headers: { token } });
            if (response.data.success) {
                setUserImage(response.data.data);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("An error occurred while updating the profile picture.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <React.Fragment>
            <div className='update-profile-image'>
                <form ref={popupRef} onSubmit={onUpdateProfileImageHandler} className='update-profile-image-container'>
                    <div className="update-profile-image-title">
                        <img onClick={() => setIsUpdateProfileImage(false)} src={images.cross_icon} alt='cross icon' />
                        <p>Update Profile Image</p>
                    </div>
                    <div className="update-profile-img-upload flex-col">
                        <label htmlFor="image">
                            <img src={image ? URL.createObjectURL(image) : images.upload_area} alt="" />
                        </label>
                        <input onChange={handleImageChange} type="file" id='image' required />
                    </div>
                    <button type='submit'>Update Image</button>
                    <div className="reset-profile-image">
                        <p onClick={resetImage}>Reset Profile Image</p>
                    </div>
                </form>
            </div>
            <PageTracker pageUrl={`${url}/updateProfilePicture`} />
        </React.Fragment>
    )
}

export default UpdateProfilePicture