import React from "react";
import { FaTimes } from "react-icons/fa";

const CloseIcon = ({ size, color }) => {
  return (
    <div>
      <FaTimes size={size} color={color} />
    </div>
  );
};

export default CloseIcon;
