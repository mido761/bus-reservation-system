import React from "react";

const ScrollArea = ({ children, className = "" }) => {
  return (
    <div
      className={`overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded-md ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollArea;
