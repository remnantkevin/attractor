import React, { useState, useEffect } from "react";

import Suggestions from "./Suggestions.jsx";
import Chart from "./Chart.jsx";
import Progress from "./Progress.jsx";

export default function App() {
  const [type, setType] = useState(window.type || "rb");
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Progress isAnimating={isLoading} key={type} />
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <a className="navbar-brand" href="#">
          <img
            src="images/attractor_logo.svg"
            alt=""
            width="36"
            className="mr-3"
          ></img>
          Attractor
        </a>
        <ul className="navbar-nav mx-auto">
          {Object.entries(window.types).map(([shortType, longType]) => (
            <li className={`nav-item ${type === shortType ? "active" : ""}`}>
              <a
                className="nav-link"
                href={window.serveStatic ? `index.${shortType}.html` : "#"}
                onClick={() => {
                  if (!window.serveStatic) {
                    setIsLoading(true);
                    setType(shortType);
                  }
                }}
              >
                {longType}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="container">
        <Chart
          type={type}
          finishedLoadingCallback={() => {
            setIsLoading(false);
          }}
        />

        <div className="row mt-3">
          <div className="col-12">
            <Suggestions />
          </div>
        </div>
      </div>
    </>
  );
}
