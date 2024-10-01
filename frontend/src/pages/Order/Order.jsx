import React, { useContext, useEffect, useState } from "react";
import "./Order.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PageTracker from "../../components/PageTracker/PageTracker";

const Order = ({ setIsLoading }) => {
  const { getTotalCartAmount, token, food_list, cartItems, url, loadCartData } =
    useContext(StoreContext);
  const [paymentMethod, setPaymentMethod] = useState("");
  const navigate = useNavigate();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [street, setStreet] = useState("");
  const [provinceValue, setProvinceValue] = useState("");
  const [districtValue, setDistrictValue] = useState("");
  const [wardValue, setWardValue] = useState("");

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    ward: "",
    province: "",
    district: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/p/"
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when a province is selected
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) return;
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
        );
        setDistricts(response.data.districts);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when a district is selected
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) return;
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
        );
        setWards(response.data.wards);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  const handleProvincesChange = (provinceCode) => {
    if (provinces) {
      const selectedProvince = provinces.find(
        (province) => province.code.toString() === provinceCode
      );

      if (selectedProvince) {
        setProvinceValue(selectedProvince.name);
      }
    }
  };

  const handleDistrictChange = (districtCode) => {
    if (districts) {
      const selectedDistrict = districts.find(
        (district) => district.code.toString() === districtCode
      );

      if (selectedDistrict) {
        setDistrictValue(selectedDistrict.name);
      }
    }
  };

  const handleWardChange = (wardCode) => {
    if (wards) {
      const selectedWard = wards.find(
        (ward) => ward.code.toString() === wardCode
      );

      if (selectedWard) {
        setWardValue(selectedWard.name);
      }
    }
  };

  const checkAddress = async () => {
    const query = `${data.street}, ${wardValue}, ${districtValue}, ${provinceValue}, ${data.country}`;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        return true;
      } else {
        setIsLoading((prevState) => !prevState);
        alert("Invalid address, please check again.");
        return false;
      }
    } catch (error) {
      console.error("Error checking address:", error);
      alert("Error checking address");
      return false;
    }
  };

  const handleChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const onChangeHandler = (event) => {
    setIsLoading(true);
    const name = event.target.name;
    const value = event.target.value;

    setData((prev) => ({ ...prev, [name]: value }));
    setIsLoading(false);
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const isAddressValid = await checkAddress();
    if (!isAddressValid) {
      return;
    }

    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id]) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    const orderData = {
      address: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        street: data.street,
        ward: wardValue,
        district: districtValue,
        province: provinceValue,
        country: data.country,
        phone: data.phone,
      },
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };

    console.log(orderData);

    let orderUrl = "";
    if (paymentMethod && paymentMethod === "Transfer") {
      orderUrl = "/api/order/place";
    } else if (paymentMethod && paymentMethod === "Cash") {
      orderUrl = "/api/order/order";
    } else {
      return;
    }

    let response = await axios.post(url + orderUrl, orderData, {
      headers: { token },
    });
    setIsLoading(false);
    if (response.data.success) {
      if (paymentMethod === "Transfer") {
        const { session_url } = response.data;
        window.location.replace(session_url);
      } else if (paymentMethod === "Cash") {
        toast.success("The order has been placed");
        loadCartData(token);
        navigate("/myorders");
      } else {
        navigate("/cart");
      }
    } else {
      alert("Error");
    }
  };

  return (
    <React.Fragment>
      <form onSubmit={placeOrder} className="order">
        <div className="order-left">
          <p className="title">Delivery Information</p>
          <div className="multi-fields">
            <input
              required
              name="firstName"
              onChange={onChangeHandler}
              value={data.firstName}
              type="text"
              placeholder="First Name"
            />
            <input
              required
              name="lastName"
              onChange={onChangeHandler}
              value={data.lastName}
              type="text"
              placeholder="Last Name"
            />
          </div>
          <input
            required
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Email address"
          />
          <input
            required
            name="street"
            onChange={onChangeHandler}
            value={data.street}
            type="text"
            placeholder="Street"
          />
          <div className="multi-fields">
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedDistrict("");
                setSelectedWard("");
                handleProvincesChange(e.target.value);
              }}
              required
            >
              <option value="">Select Province/City</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedWard("");
                handleDistrictChange(e.target.value);
              }}
              disabled={!selectedProvince}
              required
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
          <div className="multi-fields">
            <select
              value={selectedWard}
              onChange={(e) => {
                setSelectedWard(e.target.value);
                handleWardChange(e.target.value);
              }}
              disabled={!selectedDistrict}
              required
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
            <input
              required
              name="country"
              onChange={onChangeHandler}
              value={data.country}
              type="text"
              placeholder="Country"
            />
          </div>
          <input
            required
            name="phone"
            onChange={onChangeHandler}
            value={data.phone}
            type="text"
            placeholder="Phone number"
          />
        </div>
        <div className="order-right">
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>${getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>
                  ${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
                </b>
              </div>
            </div>
            <div className="order-payment-type">
              <h2>Payment method</h2>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={handleChange}
              >
                <option value="">-- Select Payment Method --</option>
                <option value="Transfer">Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            {paymentMethod ? (
              paymentMethod === "Transfer" ? (
                <button type="submit">PROCEED TO PAYMENT</button>
              ) : (
                <button type="submit">ORDER</button>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </form>
      <PageTracker pageUrl={`${url}/order`} />
    </React.Fragment>
  );
};

export default Order;
