import React, { useEffect, useState } from "react";
import "./Header.css";
import { images } from "../../constants/data";

const Header = () => {
  const imgs = [
    images.header_top_view,
    images.header_img,
    images.header_thanks,
  ];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImgIndex((prevIndex) => (prevIndex + 1) % imgs.length);
        setFade(true);
      }, 100);
    }, 3000);

    return () => clearInterval(interval);
  }, [imgs.length]);

  return (
    <div
      className={`header ${fade ? "fade-in" : "fade-out"}`}
      style={{ backgroundImage: `url(${imgs[currentImgIndex]})` }}
    >
      <div className="header-contents">
        <h3>Order Tasty &</h3>
        <h3>
          Fresh Food <span>anytime!</span>
        </h3>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes
          crafted with the finest ingredients and culinary expertise. Our
          mission is to satisfy your cravings and elevate your dining
          experience, one delicious meal at the time.
        </p>
        <a href="#explore-menu">
          <button>View Menu</button>
        </a>
      </div>
    </div>
  );
};

export default Header;
