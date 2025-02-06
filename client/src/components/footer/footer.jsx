import React from "react";
import "../footer/footer.css";

function Footer() {
  return (location.pathname === "/login" ||
    location.pathname === "/register" ? null : 
    <footer></footer>
  );
}

export default Footer;
