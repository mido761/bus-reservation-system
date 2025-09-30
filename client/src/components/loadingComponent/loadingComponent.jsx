
import React from "react";
import "./loadingComponent.css";

function LoadingComponent() {
  return (
    <div className="loading-component">
      <div className="bus-loader">
        <svg
          className="bus-icon"
          width="60"
          height="40"
          viewBox="0 0 60 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="10" width="50" height="20" rx="5" fill="#1976d2" />
          <rect x="10" y="15" width="40" height="10" rx="2" fill="#fff" />
          <circle cx="15" cy="32" r="4" fill="#333" />
          <circle cx="45" cy="32" r="4" fill="#333" />
          <rect x="52" y="18" width="4" height="8" rx="2" fill="#1976d2" />
        </svg>
      </div>
    </div>
  );
}

export default LoadingComponent;
