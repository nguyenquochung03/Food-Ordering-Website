import React from "react";
import "./AppDownload.css";

import { images } from "../../constants/data";

const AppDownload = () => {
  return (
    <div className="app-download" id="app-download">
      <p>
        For Better Experience Download <br /> Orange App
      </p>
      <div className="app-download-platforms">
        <img src={images.play_store} alt="play store image" />
        <img src={images.app_store} alt="app store image" />
      </div>
    </div>
  );
};

export default AppDownload;
