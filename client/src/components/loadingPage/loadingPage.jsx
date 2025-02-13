import React, { useState } from "react";
import "./loadingPage.css";

function LoadingPage() {
  return (
    <div className="loading-page">
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

export default LoadingPage;
