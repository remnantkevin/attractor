import React, { useReducer, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSadTear } from "@fortawesome/free-solid-svg-icons";

import ActiveFileDetails from "./ActiveFileDetails";
import DisplayOptions from "./DisplayOptions";
import ScatterPlot from "./ScatterPlot";
import TreeMap from "./TreeMap";
import Histogram from "./Histogram";
import reducer from "../reducers/chartReducer";

export const RegressionTypes = {
  POWER_LAW: 0,
  LINEAR: 1
};

export const PlotTypes = {
  SCATTER_PLOT: 0,
  TREE_MAP: 1
};

export const MetricTypes = {
  CHURN_COMPLEXITY: 0,
  COMPLEXITY: 1,
  CHURN: 2
};

const initialState = {
  displayRegression: false,
  displayFilenames: false,
  regressionType: RegressionTypes.POWER_LAW,
  metricType: MetricTypes.CHURN_COMPLEXITY,
  values: [],
  filePrefix: "",
  path: "",
  activeFile: {}
};

const Chart = ({ type, finishedLoadingCallback, errorCallback }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activePlot, setActivePlot] = useState(0);
  const [loadingError, setLoadingError] = useState(false);

  const fetchValues = async () => {
    let data;
    if (window.values) {
      data = new Promise((resolve, _reject) => resolve(window.values));
    } else {
      data = await (await fetch(`/values?type=${type}`)).json();
    }

    return data;
  };

  const fetchFilePrefix = async () => {
    let data;
    if (window.filePrefix) {
      data = new Promise((resolve, _reject) => resolve(window.filePrefix));
    } else {
      data = await (await fetch("/file_prefix")).json();
    }

    return data;
  };

  function fileClickCallback(data) {
    dispatch({ type: "SET_ACTIVE_FILE", activeFile: data });
  }

  useEffect(() => {
    (async () => {
      const [values, filePrefix] = await Promise.all([
        fetchValues(),
        fetchFilePrefix()
      ]);

      if (values.error === undefined) {
        setLoadingError(false);

        dispatch({ type: "SET_VALUES", values });

        if (filePrefix["file_prefix"]) {
          dispatch({
            type: "SET_FILE_PREFIX",
            filePrefix: filePrefix["file_prefix"]
          });
        }
      } else {
        setLoadingError(true);
      }

      finishedLoadingCallback();
    })();
  }, [type]);

  const handlePathChange = e => {
    e.preventDefault();

    dispatch({
      type: "SET_PATH",
      path: e.target.value
    });
  };

  const handleMetricTypeChange = e => {
    e.preventDefault();

    dispatch({
      type: "SET_METRIC_TYPE",
      metricType: parseInt(e.target.value)
    });
  };

  return (
    <div className="row pt-4">
      <div
        className={
          !state.activeFile || Object.keys(state.activeFile).length === 0
            ? "col-12"
            : "col-8"
        }
      >
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Churn vs Complexity</h5>
            <h6 className="text-muted">
              Click on a point for additional information
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-12 col-lg-4">
                <div id="path-input-group">
                  <label htmlFor="path" className="text-muted">
                    <small>Base Path</small>
                  </label>
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="path-text">
                        {`./${state.filePrefix || ""}`}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder=""
                      aria-label=""
                      aria-describedby="path-text"
                      id="path"
                      value={state.path}
                      onChange={handlePathChange}
                    />
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-4">
                <label htmlFor="path" className="text-muted d-block">
                  <small>Plot Type</small>
                </label>
                <div
                  className="btn-group btn-group-toggle"
                  role="toolbar"
                  aria-label="Plot Type"
                >
                  <button
                    className={`btn btn-secondary ${activePlot ===
                      PlotTypes.SCATTER_PLOT && "active"}`}
                    onClick={e => {
                      e.preventDefault();
                      setActivePlot(PlotTypes.SCATTER_PLOT);
                    }}
                  >
                    Scatterplot/Hist
                  </button>
                  <button
                    className={`btn btn-secondary ${activePlot ===
                      PlotTypes.TREE_MAP && "active"}`}
                    onClick={e => {
                      e.preventDefault();
                      setActivePlot(PlotTypes.TREE_MAP);
                    }}
                  >
                    Treemap
                  </button>
                </div>
              </div>
              <div className="col-6 col-lg-4">
                <div className="form-group">
                  <label htmlFor="metric-type" className="text-muted">
                    <small>Metric</small>
                  </label>
                  <select
                    id="metric-type"
                    className="form-control"
                    onChange={handleMetricTypeChange}
                  >
                    <option selected value="0">
                      Churn * Complexity
                    </option>
                    <option value="1">Complexity</option>
                    <option value="2">Churn</option>
                  </select>
                </div>
              </div>
            </div>
            <div
              className={`d-flex ${
                loadingError
                  ? "justify-content-center align-items-center"
                  : "justify-content-start"
              }`}
              id="canvas-wrapper"
            >
              {loadingError ? (
                <div className="text-center error">
                  <FontAwesomeIcon icon={faSadTear} size="6x" />
                  <h3>Oh snap!</h3>
                  There has been an error loading the churn count.
                </div>
              ) : (
                <>
                  {activePlot === PlotTypes.SCATTER_PLOT ? (
                    state.metricType === MetricTypes.CHURN_COMPLEXITY ? (
                      <ScatterPlot
                        fileClickCallback={fileClickCallback}
                        {...state}
                      />
                    ) : (
                      <Histogram
                        fileClickCallback={fileClickCallback}
                        {...state}
                      />
                    )
                  ) : (
                    <TreeMap fileClickCallback={fileClickCallback} {...state} />
                  )}
                </>
              )}
            </div>
            <DisplayOptions
              state={state}
              dispatch={dispatch}
              activePlot={activePlot}
            />
          </div>
        </div>
      </div>
      {state.activeFile && Object.keys(state.activeFile).length > 0 && (
        <ActiveFileDetails
          activeFile={state.activeFile}
          handleClose={() => {
            dispatch({
              type: "SET_ACTIVE_FILE",
              activeFile: {}
            });
          }}
        />
      )}
    </div>
  );
};

export default Chart;
