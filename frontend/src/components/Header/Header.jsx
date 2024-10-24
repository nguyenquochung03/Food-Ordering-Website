import React, { useEffect, useState } from "react";
import "./Header.css";
import { images } from "../../constants/data";
import axios from "axios";

const Header = ({ url, setIsLoading }) => {
  const imgs = [
    images.header_top_view,
    images.header_img,
    images.header_thanks,
  ];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const [timeOperate, setTimeOperate] = useState("non-fixed");
  const [nonFixedTime, setNonFixedTime] = useState({
    start: "",
    end: "",
  });
  const [customTimes, setCustomTimes] = useState({
    morning: { start: "", end: "" },
    afternoon: { start: "", end: "" },
    evening: { start: "", end: "" },
  });
  const [closedPeriods, setClosedPeriods] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImgIndex((prevIndex) => (prevIndex + 1) % imgs.length);
        setFade(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [imgs.length]);

  useEffect(() => {
    fetchOperatingData();
  }, []);

  const fetchOperatingData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/operating/getOperatingData`);
      const data = response.data;

      if (data.success) {
        setTimeOperate(data.data.timeOperate || "non-fixed");
        setNonFixedTime(data.data.nonFixedTime || { start: "", end: "" });
        setCustomTimes(
          data.data.customTimes || {
            morning: { start: "", end: "" },
            afternoon: { start: "", end: "" },
            evening: { start: "", end: "" },
          }
        );
        setClosedPeriods(
          data.data.closedPeriods || {
            morning: false,
            afternoon: false,
            evening: false,
          }
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching data:", error);
      toast.error("Error loading operating data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`header ${fade ? "fade-in" : "fade-out"}`}
      style={{ backgroundImage: `url(${imgs[currentImgIndex]})` }}
    >
      <div className="header-contents">
        <p className="header-title">Our operating hours</p>
        {timeOperate === "non-fixed" ? (
          <div className="header-content-operating-hours-nonfixed">
            <p>
              From {nonFixedTime.start} to {nonFixedTime.end}
            </p>
          </div>
        ) : (
          <div className="header-content-operating-hours-custom">
            <p>
              Morning:{" "}
              {!closedPeriods.morning
                ? `From ${customTimes.morning.start} to ${customTimes.morning.end} `
                : "We close"}
            </p>
            <p>
              Afternoon:{" "}
              {!closedPeriods.afternoon
                ? `From ${customTimes.afternoon.start} to ${customTimes.afternoon.end} `
                : "We close"}
            </p>
            <p>
              Evening:{" "}
              {!closedPeriods.evening
                ? `From ${customTimes.evening.start} to ${customTimes.evening.end} `
                : "We close"}
            </p>
          </div>
        )}
        <hr />
        <p>
          Choose from a diverse menu featuring a delectable array of dishes
          crafted with the finest ingredients and culinary expertise. Our
          mission is to satisfy your cravings and elevate your dining
          experience, one delicious meal at a time.
        </p>
        <a href="#explore-menu">
          <button>View Menu</button>
        </a>
      </div>
    </div>
  );
};

export default Header;
