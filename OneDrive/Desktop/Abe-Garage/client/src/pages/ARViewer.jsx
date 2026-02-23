import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CubeIcon,
  DevicePhoneMobileIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  CameraIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import CarARViewer from "../components/ar-vr/CarARViewer";
import "./ARViewer.css";

const ARViewer = () => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("honda-civic-2023");
  const [arSettings, setArSettings] = useState({
    showWireframe: false,
    showDiagnostics: true,
    showMaintenance: true,
    animationSpeed: 1,
  });

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    if (navigator.xr && navigator.xr.isSessionSupported) {
      try {
        const supported = await navigator.xr.isSessionSupported("immersive-ar");
        setIsARSupported(supported);
      } catch (error) {
        console.log("AR not supported");
        setIsARSupported(false);
      }
    }
  };

  const vehicles = [
    {
      id: "honda-civic-2023",
      name: "Honda Civic 2023",
      model: "3d-civic-2023.glb",
      thumbnail: "/api/placeholder/200/150",
      description: "Popular compact sedan with excellent fuel economy",
    },
    {
      id: "toyota-camry-2023",
      name: "Toyota Camry 2023",
      model: "3d-camry-2023.glb",
      thumbnail: "/api/placeholder/200/150",
      description: "Reliable midsize sedan with hybrid options",
    },
    {
      id: "ford-f150-2023",
      name: "Ford F-150 2023",
      model: "3d-f150-2023.glb",
      thumbnail: "/api/placeholder/200/150",
      description: "America's best-selling truck with advanced features",
    },
  ];

  const handleStartAR = () => {
    setIsARActive(true);
    // In a real implementation, this would initialize WebXR
    console.log("Starting AR experience...");
  };

  const handleStopAR = () => {
    setIsARActive(false);
  };

  const toggleWireframe = () => {
    setArSettings({ ...arSettings, showWireframe: !arSettings.showWireframe });
  };

  return (
    <div className="ar-viewer-page">
      <div className="container-fluid">
        {/* Header */}
        <motion.div
          className="ar-header mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">
                <CubeIcon className="me-3 text-primary" />
                AR Vehicle Viewer
              </h1>
              <p className="text-muted">
                Explore vehicles in augmented reality. Point your camera at any
                surface to place the vehicle.
              </p>
            </div>
            <div className="ar-status">
              {isARSupported ? (
                <div className="badge bg-success">
                  <ArrowsPointingOutIcon className="w-4 h-4 me-1" />
                  AR Supported
                </div>
              ) : (
                <div className="badge bg-warning">
                  <ArrowsPointingInIcon className="w-4 h-4 me-1" />
                  AR Not Supported
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Vehicle Selection */}
        <motion.div
          className="vehicle-selection mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <DevicePhoneMobileIcon className="me-2" />
                Select Vehicle
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="col-md-4">
                    <div
                      className={`vehicle-card border rounded-3 p-3 cursor-pointer ${
                        selectedVehicle === vehicle.id
                          ? "border-primary bg-primary bg-opacity-10"
                          : ""
                      }`}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <div className="vehicle-thumbnail mb-2">
                        <img
                          src={vehicle.thumbnail}
                          alt={vehicle.name}
                          className="img-fluid rounded"
                          style={{
                            height: "120px",
                            objectFit: "cover",
                            width: "100%",
                          }}
                        />
                      </div>
                      <h6 className="mb-1">{vehicle.name}</h6>
                      <p className="text-muted small mb-0">
                        {vehicle.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AR Viewer */}
        <motion.div
          className="ar-viewer-section mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <CameraIcon className="me-2" />
                  AR Experience
                </h6>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={toggleWireframe}
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4 me-1" />
                    {arSettings.showWireframe ? "Hide" : "Show"} Wireframe
                  </button>
                  {!isARActive ? (
                    <button
                      className="btn btn-primary"
                      onClick={handleStartAR}
                      disabled={!isARSupported}
                    >
                      <PlayIcon className="w-4 h-4 me-1" />
                      Start AR
                    </button>
                  ) : (
                    <button className="btn btn-danger" onClick={handleStopAR}>
                      <PauseIcon className="w-4 h-4 me-1" />
                      Stop AR
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="ar-viewer-container">
                {isARActive ? (
                  <div className="ar-active-view">
                    <CarARViewer
                      vehicleId={selectedVehicle}
                      settings={arSettings}
                      onError={(error) => console.error("AR Error:", error)}
                    />
                  </div>
                ) : (
                  <div className="ar-placeholder text-center py-5">
                    <CubeIcon className="w-24 h-24 text-muted mb-3" />
                    <h5 className="text-muted mb-3">AR Viewer Ready</h5>
                    <p className="text-muted mb-4">
                      {isARSupported
                        ? "Select a vehicle and click 'Start AR' to begin the augmented reality experience."
                        : "Your device doesn't support AR. You can still view the 3D model in the preview below."}
                    </p>
                    <div className="preview-mode">
                      <h6 className="mb-3">3D Preview Mode</h6>
                      <div
                        className="preview-placeholder bg-light rounded d-flex align-items-center justify-content-center"
                        style={{ height: "400px" }}
                      >
                        <div className="text-center">
                          <CubeIcon className="w-16 h-16 text-muted mb-2" />
                          <p className="text-muted">3D Model Preview</p>
                          <small className="text-muted">
                            {
                              vehicles.find((v) => v.id === selectedVehicle)
                                ?.name
                            }
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AR Controls */}
        {isARActive && (
          <motion.div
            className="ar-controls mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <AdjustmentsHorizontalIcon className="me-2" />
                  AR Controls
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Show Diagnostics</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={arSettings.showDiagnostics}
                        onChange={(e) =>
                          setArSettings({
                            ...arSettings,
                            showDiagnostics: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label">
                        Vehicle Diagnostics
                      </label>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Show Maintenance</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={arSettings.showMaintenance}
                        onChange={(e) =>
                          setArSettings({
                            ...arSettings,
                            showMaintenance: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label">
                        Maintenance Info
                      </label>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Animation Speed</label>
                    <input
                      type="range"
                      className="form-range"
                      min="0.5"
                      max="2"
                      step="0.5"
                      value={arSettings.animationSpeed}
                      onChange={(e) =>
                        setArSettings({
                          ...arSettings,
                          animationSpeed: parseFloat(e.target.value),
                        })
                      }
                    />
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">Slow</small>
                      <small className="text-muted">Fast</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Actions</label>
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-info btn-sm">
                        Take Screenshot
                      </button>
                      <button className="btn btn-outline-success btn-sm">
                        Save to Gallery
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          className="ar-instructions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <InformationCircleIcon className="me-2" />
                How to Use AR Viewer
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-center">
                    <div
                      className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      1
                    </div>
                    <h6>Select Vehicle</h6>
                    <p className="text-muted small">
                      Choose from available vehicle models
                    </p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div
                      className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      2
                    </div>
                    <h6>Start AR</h6>
                    <p className="text-muted small">
                      Grant camera permission and tap to place
                    </p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div
                      className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      3
                    </div>
                    <h6>Explore</h6>
                    <p className="text-muted small">
                      Walk around and view from different angles
                    </p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <div
                      className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{ width: "40px", height: "40px" }}
                    >
                      4
                    </div>
                    <h6>Interact</h6>
                    <p className="text-muted small">
                      Tap parts for detailed information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ARViewer;
