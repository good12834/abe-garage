import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  ArrowRightIcon,
  TruckIcon,
  CalendarDaysIcon,
  StarIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ServiceAreaMap from "../components/maps/ServiceAreaMap";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Locations = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          // Default location if permission denied
          setUserLocation({ lat: 40.7128, lng: -74.006 }); // New York City
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  const locations = [
    {
      id: 1,
      name: "Abe Garage - Main Location",
      address: "123 Auto Service Boulevard, New York, NY 10001",
      phone: "(555) 123-4567",
      hours: {
        weekdays: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "Closed",
      },
      services: [
        "Full Service Repair",
        "Oil Changes",
        "Brake Service",
        "Engine Diagnostics",
        "Transmission Service",
        "AC/Heating Repair",
        "Tire Service",
        "Battery Replacement",
      ],
      features: [
        "Comfortable Waiting Area",
        "Free WiFi",
        "Coffee Bar",
        "Kids Play Area",
        "Shuttle Service",
        "Online Appointment Booking",
      ],
      rating: 4.8,
      reviewCount: 342,
      coordinates: { lat: 40.7128, lng: -74.006 },
      distance: 0,
      estimatedTravelTime: "0 min",
    },
    {
      id: 2,
      name: "Abe Garage - Brooklyn Branch",
      address: "456 Brooklyn Avenue, Brooklyn, NY 11201",
      phone: "(555) 234-5678",
      hours: {
        weekdays: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "10:00 AM - 2:00 PM",
      },
      services: [
        "General Repairs",
        "Oil Changes",
        "Brake Service",
        "Tire Service",
        "State Inspections",
        "Battery Service",
      ],
      features: [
        "Comfortable Waiting Area",
        "Free WiFi",
        "Coffee",
        "Online Booking",
      ],
      rating: 4.6,
      reviewCount: 189,
      coordinates: { lat: 40.6892, lng: -73.9442 },
      distance: 0,
      estimatedTravelTime: "0 min",
    },
    {
      id: 3,
      name: "Abe Garage - Queens Location",
      address: "789 Queens Boulevard, Queens, NY 11375",
      phone: "(555) 345-6789",
      hours: {
        weekdays: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "Closed",
      },
      services: [
        "Full Service Repair",
        "Oil Changes",
        "Brake Service",
        "Engine Diagnostics",
        "Transmission Service",
        "AC Repair",
        "Tire Service",
      ],
      features: [
        "Comfortable Waiting Area",
        "Free WiFi",
        "Coffee",
        "Shuttle Service",
      ],
      rating: 4.7,
      reviewCount: 267,
      coordinates: { lat: 40.7282, lng: -73.7949 },
      distance: 0,
      estimatedTravelTime: "0 min",
    },
  ];

  // Calculate distances and travel times
  useEffect(() => {
    if (userLocation) {
      locations.forEach((location) => {
        const distance = calculateDistance(userLocation, location.coordinates);
        const travelTime = Math.round(distance * 2); // Rough estimate: 2 minutes per mile
        location.distance = distance;
        location.estimatedTravelTime = `${travelTime} min`;
      });
      setSelectedLocation(locations[0]);
    }
  }, [userLocation]);

  const calculateDistance = (pos1, pos2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(pos2.lat - pos1.lat);
    const dLon = toRad(pos2.lng - pos1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(pos1.lat)) *
        Math.cos(toRad(pos2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  const getDirections = (location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;
    window.open(url, "_blank");
  };

  const bookAppointment = (location) => {
    window.location.href = `/book-appointment?location=${location.id}`;
  };

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <MapPinIcon className="me-2 text-primary" />
            Our Locations
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="locations-page">
      <div className="container-fluid">
        {/* Header */}
        <motion.div
          className="locations-header mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h1 className="mb-3">
              <MapPinIcon className="me-3 text-primary" />
              Our Locations
            </h1>
            <p className="text-muted">
              Find the nearest Abe Garage location for all your automotive
              service needs.
            </p>
          </div>
        </motion.div>

        <div className="row g-4">
          {/* Location List */}
          <div className="col-lg-4">
            <motion.div
              className="location-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {locations.map((location, index) => (
                <motion.div
                  key={location.id}
                  className={`location-card card mb-3 cursor-pointer ${
                    selectedLocation?.id === location.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedLocation(location)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">{location.name}</h6>
                      {index === 0 && (
                        <span className="badge bg-primary">Main</span>
                      )}
                    </div>

                    <p className="text-muted small mb-2">{location.address}</p>

                    <div className="d-flex align-items-center mb-2">
                      <PhoneIcon className="w-4 h-4 text-muted me-2" />
                      <a
                        href={`tel:${location.phone}`}
                        className="text-decoration-none"
                      >
                        {location.phone}
                      </a>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <StarIcon className="w-4 h-4 text-warning me-1" />
                      <span className="fw-bold me-1">{location.rating}</span>
                      <span className="text-muted small">
                        ({location.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block">Distance</small>
                        <span className="fw-medium">
                          {location.distance.toFixed(1)} mi
                        </span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">
                          Travel Time
                        </small>
                        <span className="fw-medium">
                          {location.estimatedTravelTime}
                        </span>
                      </div>
                    </div>

                    <div className="d-grid gap-2 mt-3">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => bookAppointment(location)}
                      >
                        <CalendarDaysIcon className="w-4 h-4 me-1" />
                        Book Appointment
                      </button>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => getDirections(location)}
                      >
                        <ArrowRightIcon className="w-4 h-4 me-1" />
                        Get Directions
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Map and Details */}
          <div className="col-lg-8">
            <motion.div
              className="map-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {selectedLocation && (
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <MapPinIcon className="me-2" />
                        {selectedLocation.name}
                      </h6>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => getDirections(selectedLocation)}
                        >
                          <ArrowRightIcon className="w-4 h-4 me-1" />
                          Directions
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => bookAppointment(selectedLocation)}
                        >
                          <CalendarDaysIcon className="w-4 h-4 me-1" />
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-0">
                    {/* Map */}
                    <div className="map-container" style={{ height: "400px" }}>
                      {userLocation && (
                        <MapContainer
                          center={[
                            selectedLocation.coordinates.lat,
                            selectedLocation.coordinates.lng,
                          ]}
                          zoom={13}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker
                            position={[
                              selectedLocation.coordinates.lat,
                              selectedLocation.coordinates.lng,
                            ]}
                          >
                            <Popup>
                              <div>
                                <h6>{selectedLocation.name}</h6>
                                <p className="mb-1">
                                  {selectedLocation.address}
                                </p>
                                <p className="mb-0">{selectedLocation.phone}</p>
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      )}
                    </div>

                    {/* Location Details */}
                    <div className="location-details p-4">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <h6 className="mb-3">Contact Information</h6>
                          <div className="contact-info">
                            <div className="d-flex align-items-center mb-2">
                              <MapPinIcon className="w-5 h-5 text-muted me-3" />
                              <span>{selectedLocation.address}</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                              <PhoneIcon className="w-5 h-5 text-muted me-3" />
                              <a
                                href={`tel:${selectedLocation.phone}`}
                                className="text-decoration-none"
                              >
                                {selectedLocation.phone}
                              </a>
                            </div>
                            <div className="d-flex align-items-center">
                              <ClockIcon className="w-5 h-5 text-muted me-3" />
                              <div>
                                <div className="small">
                                  Mon-Fri: {selectedLocation.hours.weekdays}
                                </div>
                                <div className="small">
                                  Saturday: {selectedLocation.hours.saturday}
                                </div>
                                <div className="small">
                                  Sunday: {selectedLocation.hours.sunday}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <h6 className="mb-3">Services Available</h6>
                          <div className="services-grid">
                            <div className="row g-2">
                              {selectedLocation.services.map(
                                (service, index) => (
                                  <div key={index} className="col-6">
                                    <div className="d-flex align-items-center">
                                      <CheckCircleIcon className="w-4 h-4 text-success me-2" />
                                      <small>{service}</small>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <h6 className="mb-3">Location Features</h6>
                          <div className="features-grid">
                            <div className="row g-2">
                              {selectedLocation.features.map(
                                (feature, index) => (
                                  <div key={index} className="col-md-4">
                                    <div className="d-flex align-items-center">
                                      <CheckCircleIcon className="w-4 h-4 text-success me-2" />
                                      <small>{feature}</small>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Service Area Map */}
        <motion.div
          className="service-area-section mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <TruckIcon className="me-2" />
                Service Area Coverage
              </h6>
            </div>
            <div className="card-body">
              <ServiceAreaMap />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="quick-actions mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5 className="mb-3">Need Immediate Assistance?</h5>
              <p className="mb-4">
                Our emergency service is available 24/7 for urgent automotive
                needs.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-light">
                  <PhoneIcon className="w-4 h-4 me-1" />
                  Call Emergency Line
                </button>
                <button className="btn btn-outline-light">
                  <InformationCircleIcon className="w-4 h-4 me-1" />
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Locations;
