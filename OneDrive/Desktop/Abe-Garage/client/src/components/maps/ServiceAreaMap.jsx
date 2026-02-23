import React, { useState, useCallback, useRef } from "react";
import Map, { Marker, Popup, Source, Layer } from "react-map-gl/mapbox";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import "mapbox-gl/dist/mapbox-gl.css";

const ServiceAreaMap = ({
  className = "",
  center = { longitude: -74.006, latitude: 40.7128, zoom: 15.5, pitch: 45, bearing: -17.6 }, // Default to NYC with 3D view
  showServiceArea = true,
  showDirections = false,
}) => {
  const [viewport, setViewport] = useState({
    longitude: center.longitude,
    latitude: center.latitude,
    zoom: center.zoom,
    pitch: center.pitch,
    bearing: center.bearing,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const mapRef = useRef();

  // Garage location
  const garageLocation = {
    longitude: -74.006,
    latitude: 40.7128,
    name: "Abe Garage",
    address: "123 Main Street, New York, NY 10001",
    phone: "(555) 123-4567",
    hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
  };

  // Service area polygon (simplified NYC area)
  const serviceAreaGeoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "Primary Service Area",
          color: "#3b82f6",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-74.05, 40.68],
              [-74.05, 40.75],
              [-73.95, 40.75],
              [-73.95, 40.68],
              [-74.05, 40.68],
            ],
          ],
        },
      },
    ],
  };

  // Extended service area
  const extendedServiceAreaGeoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "Extended Service Area",
          color: "#10b981",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-74.1, 40.65],
              [-74.1, 40.8],
              [-73.9, 40.8],
              [-73.9, 40.65],
              [-74.1, 40.65],
            ],
          ],
        },
      },
    ],
  };

  const serviceAreaLayer = {
    id: "service-area",
    type: "fill",
    paint: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.2,
    },
  };

  const extendedServiceAreaLayer = {
    id: "extended-service-area",
    type: "fill",
    paint: {
      "fill-color": "#10b981",
      "fill-opacity": 0.1,
    },
  };

  const serviceAreaOutline = {
    id: "service-area-outline",
    type: "line",
    paint: {
      "line-color": "#3b82f6",
      "line-width": 2,
      "line-opacity": 0.8,
    },
  };

  // 3D Buildings Layer
  const buildingLayer = {
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#aaa",
      "fill-extrusion-height": [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        0,
        15.05,
        ["get", "height"],
      ],
      "fill-extrusion-base": [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        0,
        15.05,
        ["get", "min_height"],
      ],
      "fill-extrusion-opacity": 0.6,
    },
  };

  const onMarkerClick = useCallback((event) => {
    event.originalEvent.stopPropagation();
    setSelectedLocation(garageLocation);
    setShowPopup(true);
  }, []);

  const onMapClick = useCallback(() => {
    setShowPopup(false);
    setSelectedLocation(null);
  }, []);

  return (
    <motion.div
      className={`service-area-map ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Map Container */}
      <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-lg">
        <Map
          ref={mapRef}
          {...viewport}
          onMove={(evt) => setViewport(evt.viewState)}
          onClick={onMapClick}
          mapboxAccessToken={
            import.meta.env.VITE_MAPBOX_TOKEN ||
            "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"
          } // Replace with actual token
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Service Areas */}
          {showServiceArea && (
            <>
              <Source
                id="service-area"
                type="geojson"
                data={serviceAreaGeoJSON}
              >
                <Layer {...serviceAreaLayer} />
                <Layer {...serviceAreaOutline} />
              </Source>

              <Source
                id="extended-service-area"
                type="geojson"
                data={extendedServiceAreaGeoJSON}
              >
                <Layer {...extendedServiceAreaLayer} />
              </Source>
            </>
          )}

          {/* 3D Buildings */}
          <Layer {...buildingLayer} />

          {/* Garage Marker */}
          <Marker
            longitude={garageLocation.longitude}
            latitude={garageLocation.latitude}
            anchor="bottom"
            onClick={onMarkerClick}
          >
            <motion.div
              className="cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="bg-blue-600 rounded-full p-2 shadow-lg">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </Marker>

          {/* Popup */}
          {showPopup && selectedLocation && (
            <Popup
              longitude={selectedLocation.longitude}
              latitude={selectedLocation.latitude}
              anchor="bottom"
              onClose={() => setShowPopup(false)}
              closeButton={true}
              closeOnClick={false}
              className="garage-popup"
            >
              <div className="p-4 max-w-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {selectedLocation.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPinIcon className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {selectedLocation.address}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      {selectedLocation.phone}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <ClockIcon className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {selectedLocation.hours}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    Get Directions
                  </button>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() =>
                mapRef.current?.flyTo({
                  center: [garageLocation.longitude, garageLocation.latitude],
                  zoom: 15,
                })
              }
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Center on garage"
            >
              <MapPinIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Service Areas
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 bg-opacity-50 rounded mr-2"></div>
              <span className="text-gray-700">Primary Service Area</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 bg-opacity-30 rounded mr-2"></div>
              <span className="text-gray-700">Extended Service Area</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <motion.div
        className="mt-4 bg-white rounded-lg shadow-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <MapPinIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-xs text-gray-600">{garageLocation.address}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <PhoneIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-xs text-gray-600">{garageLocation.phone}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <ClockIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Hours</p>
              <p className="text-xs text-gray-600">{garageLocation.hours}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceAreaMap;
