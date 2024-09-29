import React, { useEffect, useRef, useState } from "react";
import "./UpdateAdmin.css";
import { toast } from "react-toastify";
import axios from "axios";
import bcrypt from "bcryptjs";
import { images } from "../../../constants/data";

const UpdateAdmin = ({
  url,
  dataUpdate,
  setIsUpdate,
  setIsLoading,
  fetchList,
}) => {
  const inputRef = useRef(null);
  const [data, setData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setData({
      id: dataUpdate.id,
      name: dataUpdate.name,
      email: dataUpdate.email,
      password: "",
      confirmPassword: "",
    });
  }, [dataUpdate]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const checkPassword = (password, confirmPassword) => {
    const errors = [];

    if (password !== confirmPassword) {
      return "Password and confirmation password do not match";
    }

    if (password.length < 8) {
      errors.push("at least 8 characters long");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("contain at least one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("contain at least one uppercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("contain at least one number");
    }
    if (!/[.#@$!%*?&]/.test(password)) {
      errors.push("contain at least one special character (.#@$!%*?&)");
    }

    if (errors.length > 0) {
      const message = `Password must ${errors.join(", ")}.`;
      return message;
    }
    return null;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const passwordError = checkPassword(data.password, data.confirmPassword);
    if (passwordError) {
      toast.error(passwordError);
      setIsLoading(false);
      return;
    }
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const response = await axios.post(`${url}/api/user/updateAdmin`, {
        id: data.id,
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });

      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
        });
        setIsUpdate(false);
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An error occurred while updating the admin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="update-admin-container">
      <div className="update-admin">
        <i
          onClick={() => setIsUpdate(false)}
          className="fas fa-arrow-left update-admin-icon"
          aria-hidden="true"
        ></i>
        <div className="update-admin_title">
          <p>Update Admin</p>
        </div>
        <form className="update-admin_input" onSubmit={onSubmitHandler}>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            required
            placeholder="name"
            className="update-admin-input"
            ref={inputRef}
          />
          <input
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            name="email"
            required
            placeholder="email@example.com"
            className="update-admin-input"
          />
          <input
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            name="password"
            required
            placeholder="password"
            className="update-admin-input"
          />
          <input
            onChange={onChangeHandler}
            value={data.confirmPassword}
            type="password"
            name="confirmPassword"
            required
            placeholder="confirm-password"
            className="update-admin-input"
          />
          <button type="submit" className="update-admin-submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateAdmin;
