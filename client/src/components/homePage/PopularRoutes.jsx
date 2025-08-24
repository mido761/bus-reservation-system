import React from "react";
import "./PopularRoutes.css";

const PopularRoutes = ({ routes, onSelect }) => (
  <div className="popular-routes">
    <h3>Popular Routes</h3>
    <div className="popular-routes-list">
      {routes.map((route) => (
        <div
          key={route.id}
          className="route-card"
          onClick={() => onSelect(route.route)}
        >
          {route.route}
        </div>
      ))}
    </div>
  </div>
);

export default PopularRoutes;
