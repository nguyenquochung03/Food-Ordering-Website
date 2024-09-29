import React, { useEffect, useRef, useState } from "react";
import "./AddAdmin.css";
import { toast } from "react-toastify";
import axios from "axios";
import bcrypt from "bcryptjs";

const AddAdmin = ({ url, setIsAdd, setIsLoading, fetchList }) => {
  const inputRef = useRef(null);
  const [data, setData] = useState({
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

      const response = await axios.post(`${url}/api/user/addAdmin`, {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });

      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An error occurred while adding the admin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-admin-container">
      <div className="add-admin">
        <i
          onClick={() => setIsAdd(false)}
          className="fas fa-arrow-left add-admin-container-icon"
          aria-hidden="true"
          style={{ cursor: "pointer", fontSize: "24px", color: "#ff7e5f" }}
        ></i>
        <div className="add-admin_title">
          <p>Add Admin</p>
        </div>
        <form className="add-admin_input" onSubmit={onSubmitHandler}>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            required
            placeholder="name"
            className="add-admin-input"
            ref={inputRef}
          />
          <input
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            name="email"
            required
            placeholder="email@example.com"
            className="add-admin-input"
          />
          <input
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            name="password"
            required
            placeholder="password"
            className="add-admin-input"
          />
          <input
            onChange={onChangeHandler}
            value={data.confirmPassword}
            type="password"
            name="confirmPassword"
            required
            placeholder="confirm-password"
            className="add-admin-input"
          />
          <button type="submit" className="add-admin-submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
