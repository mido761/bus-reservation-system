import React from "react";
// import "../footer/footer.css";

function Footer() {
  return (location.pathname === "/login" || location.pathname === "/register" ? null : 
    <footer className="w-full h-16 border-t border-blue-600"></footer>
  );
}

export default Footer;
