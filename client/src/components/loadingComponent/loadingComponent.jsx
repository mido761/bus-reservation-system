import React, { useState } from "react";
import "./loadingComponent.css";

function LoadingComponent() {

  return (
    <div className="loading-component">
      <section className="dots-container">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </section>
    </div>
  );
}

export default LoadingComponent;