import React, { useContext, useEffect, useRef, useState } from "react";
import "./LoginPopup.css";
import { images } from "../../constants/data";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import bcrypt from "bcryptjs";
import PageTracker from "../PageTracker/PageTracker";

const LoginPopup = ({ setShowLogin, setShowResetPassword, setIsLoading }) => {
  const { url, setToken, setUserName, setUserImage } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });
  const [error, setError] = useState("");
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowLogin(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowLogin]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (currentState === "Login") {
      try {
        setIsLoading(true);

        const checkPassword = await axios.post(
          url + "/api/user/getStoredHashedPassword",
          { email: data.email }
        );

        if (checkPassword.data.success) {
          const isMatch = await bcrypt.compare(
            data.password,
            checkPassword.data.data
          );

          if (!isMatch) {
            setError("Your password is not correct");
          } else {
            const response = await axios.post(url + "/api/user/login/", {
              email: data.email,
            });

            if (response.data.success) {
              if (
                response.data.user.role === "User" ||
                response.data.user.role === "Admin"
              ) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                setUserName(response.data.user.name);
                setUserImage(response.data.user.image);
                setShowLogin(false);
              } else {
                setError(
                  "Your username or password appears to be incorrect. Please try again."
                );
              }
            } else {
              setError(response.data.message);
            }
          }
        } else {
          setError(checkPassword.data.message);
        }
      } catch (err) {
        setError(
          "Your username or password appears to be incorrect. Please try again."
        );
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const response = await axios.post(url + "/api/user/register/", {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role,
        });

        if (response.data.success) {
          if (
            response.data.user.role === "User" ||
            response.data.user.role === "Admin"
          ) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
            setShowLogin(false);
          } else {
            setError(response.data.message);
          }
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.log(err);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onChangePasswordHandler = () => {
    setShowResetPassword(true);
    setShowLogin(false);
  };

  return (
    <React.Fragment>
      <div className="login-popup">
        <form
          ref={popupRef}
          onSubmit={onLogin}
          className="login-popup-container"
        >
          <div className="login-popup-title">
            <h2>{currentState}</h2>
            <img
              onClick={() => setShowLogin(false)}
              src={images.cross_icon}
              alt="cross icon"
            />
          </div>
          <div className="login-popup-inputs">
            {currentState === "Login" ? null : (
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Your name"
                required
              />
            )}
            <input
              name="email"
              value={data.email}
              onChange={onChangeHandler}
              type="email"
              placeholder="Your email"
              required
            />
            <input
              name="password"
              value={data.password}
              onChange={onChangeHandler}
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <button type="submit">
            {currentState === "Sign Up" ? "Create account" : "Login"}
          </button>
          {currentState === "Login" ? (
            <p
              className="login-popup-forgot-password"
              onClick={onChangePasswordHandler}
              href="#"
            >
              Forgotten your password?
            </p>
          ) : (
            <div className="login-popup-condition">
              <input type="checkbox" required />
              <p>
                By continuing, I agree to the terms of use & privacy policy.
              </p>
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
          {currentState !== "Sign Up" ? (
            <p>
              Create a new account?{" "}
              <span onClick={() => setCurrentState("Sign Up")}>Click here</span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span onClick={() => setCurrentState("Login")}>Login here</span>
            </p>
          )}
        </form>
      </div>
      <PageTracker pageUrl={`${url}/login`} />
    </React.Fragment>
  );
};

export default LoginPopup;
