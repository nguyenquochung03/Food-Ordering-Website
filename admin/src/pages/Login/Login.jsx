import React, { useContext, useState } from "react";
import "./Login.css";
import { images } from "../../constants/data";
import axios from "axios";
import bcrypt from "bcryptjs";

const Login = ({
  url,
  setIsLogin,
  setShowResetPassword,
  setToken,
  setIsLoading,
}) => {
  const [data, setData] = useState({
    email: "",
    password: "",
    role: "Admin",
  });
  const [error, setError] = useState("");

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onChangePasswordHandler = () => {
    setShowResetPassword(true);
    setIsLogin(false);
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setError("");

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
            if (response.data.user.role === "Admin") {
              if (!response.data.user.locked) {
                setToken(response.data.token);
                localStorage.setItem("token", response.data.token);
                setIsLogin(false);
              } else {
                setError("Your account has been locked!");
              }
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
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>Login</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={images.cross_icon}
            alt="cross icon"
          />
        </div>
        <div className="login-popup-inputs">
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
        {error && <p className="error-message">{error}</p>}
        <p
          className="login-popup-forgot-password"
          onClick={onChangePasswordHandler}
          href="#"
        >
          Forgotten your password?
        </p>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
