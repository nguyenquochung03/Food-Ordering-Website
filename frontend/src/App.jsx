import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import Order from './pages/Order/Order';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Verify from './pages/Verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import { useContext } from 'react';
import { StoreContext } from './context/StoreContext';
import axios from 'axios';
import ResetPassword from './components/ResetPassword/ResetPassword';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShowLoadingSpinner from './components/ShowLoadingSpinner/ShowLoadingSpinner';
import DetailCategory from './pages/DetailCategory/DetailCategory';
import UpdateProfilePicture from './components/UpdateProfilePicture/UpdateProfilePicture';

const App = () => {
  const { url, setTokenExpires } = useContext(StoreContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateProfileImage, setIsUpdateProfileImage] = useState(false)

  useEffect(() => {
    loadData()
  }, []);

  const checkTokenExpires = async (token) => {
    try {
      const response = await axios.post(url + '/api/user/verifyToken', {}, { headers: { token } })
      return response.data.success
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async function loadData() {
    setIsLoading(true)
    const token = localStorage.getItem("token")
    if (token) {
      const isValidToken = await checkTokenExpires(token)
      if (isValidToken) {
        setShowLogin(false);
        setTokenExpires(false);
      } else {
        localStorage.removeItem("token");
        setShowLogin(true);
        setTokenExpires(true);
      }
    }
    setIsLoading(false)
  }

  return (
    <React.Fragment>
      {isLoading && <ShowLoadingSpinner />}
      {showResetPassword ? <ResetPassword setShowLogin={setShowLogin} setShowResetPassword={setShowResetPassword} setIsLoading={setIsLoading} /> : null}
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} setShowResetPassword={setShowResetPassword} setIsLoading={setIsLoading} /> : null}
      {
        isUpdateProfileImage && <UpdateProfilePicture setIsUpdateProfileImage={setIsUpdateProfileImage} setIsLoading={setIsLoading} />
      }
      <div style={{ zIndex: "2" }}>
        <div className='app'>
          <ToastContainer />
          <Navbar setShowLogin={setShowLogin} setIsUpdateProfileImage={setIsUpdateProfileImage} />
          <Routes>
            <Route path='/' element={<Home url={url} setIsLoading={setIsLoading} />} />
            <Route path='/detailCategory/:id' element={<DetailCategory setIsLoading={setIsLoading} setShowLogin={setShowLogin} />} />
            <Route path='/cart' element={<Cart setIsLoading={setIsLoading} />} />
            <Route path='/order' element={<Order setIsLoading={setIsLoading} />} />
            <Route path='/verify' element={<Verify />} />
            <Route path='/myorders' element={<MyOrders setIsLoading={setIsLoading} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
}

export default App;