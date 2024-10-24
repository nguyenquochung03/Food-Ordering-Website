import React, { useContext, useEffect, useRef, useState } from "react";
import "./ResetPassword.css";
import { images } from "../../constants/data";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import PageTracker from "../PageTracker/PageTracker";

const ResetPassword = ({
  setShowLogin,
  setShowResetPassword,
  setIsLoading,
}) => {
  const { url } = useContext(StoreContext);
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const popupRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowResetPassword(false);
        setShowLogin(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowLogin, setShowResetPassword]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    if (email.length === 0) {
      setError("Please enter your email address");
    } else if (!validateEmail(email)) {
      setError("Please enter a valid email address");
    } else {
      try {
        const res = await axios.post(`${url}/api/user/forgotPassword`, {
          mail: email,
        });
        if (!res.data.success) {
          setError(res.data.message);
        } else {
          toast.success("Check your email");
          setEmail("");
          setShowResetPassword(false);
          setShowLogin(true);
        }
      } catch (error) {
        console.error(error);
        setError("An error occurred. Please try again later.");
      }
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsLoading(false);
  };

  const onCancelHandler = () => {
    setShowResetPassword(false);
    setShowLogin(true);
  };

  return (
    <React.Fragment>
      <div className="reset-password">
        <div className="reset-password-container" ref={popupRef}>
          <h1>Password Reset</h1>
          <p>You will receive instructions for resetting your password.</p>
          <form onSubmit={onSubmitHandler} className="reset-password-confirm">
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="text"
              placeholder="Enter your email"
              ref={inputRef}
            />
            <span className="error">{error}</span>
            <button type="submit">
              <img src={images.mail_reset_password} alt="mail reset password" />
              Send
            </button>
            <span onClick={onCancelHandler} className="cancel">
              Cancel
            </span>
          </form>
        </div>
      </div>
      <PageTracker pageUrl={`${url}/resetPassword`} />
    </React.Fragment>
  );
};

export default ResetPassword;
