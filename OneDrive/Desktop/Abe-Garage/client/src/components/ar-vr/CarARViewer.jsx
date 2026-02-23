import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ViewfinderCircleIcon,
  CameraIcon,
  CubeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const CarARViewer = ({ className = "" }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  return (
    <motion.div
      className={`car-ar-viewer relative overflow-hidden rounded-3xl bg-black ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ minHeight: "500px" }}
    >
      {/* Fake Camera Feed Background */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale blur-sm scale-110"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>
      </div>

      {/* AR HUD Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-mono tracking-widest">LIVE FEED</span>
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10">
              <CubeIcon className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10">
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/30 rounded-3xl flex items-center justify-center">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white"></div>

          {isScanning ? (
            <div className="text-center">
              <motion.div
                className="w-16 h-16 border-t-2 border-blue-500 rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-blue-400 font-mono text-xs tracking-wider">ANALYZING SURFACE...</p>
              <p className="text-white font-mono text-sm mt-1">{scanProgress}%</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <ViewfinderCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-2 opacity-80" />
              <p className="text-green-400 font-mono text-xs tracking-wider border border-green-400/30 bg-green-400/10 px-3 py-1 rounded inline-block">TARGET LOCKED</p>
            </motion.div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="w-full">
          <div className="flex justify-center mb-6">
            <button
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${isScanning ? 'border-gray-500 opacity-50 cursor-not-allowed' : 'border-white hover:scale-110 cursor-pointer'
                }`}
            >
              <div className="w-12 h-12 bg-white rounded-full"></div>
            </button>
          </div>

          <div className="bg-black/60 backdrop-blur-xl border-t border-white/10 -mx-6 -mb-6 p-4">
            <div className="flex justify-around text-white/60 text-xs font-medium">
              <div className="flex flex-col items-center gap-1 text-blue-400">
                <CubeIcon className="w-5 h-5" />
                <span>AR MODE</span>
              </div>
              <div className="flex flex-col items-center gap-1 hover:text-white cursor-pointer transition-colors">
                <CameraIcon className="w-5 h-5" />
                <span>SCAN</span>
              </div>
              <div className="flex flex-col items-center gap-1 hover:text-white cursor-pointer transition-colors">
                <ViewfinderCircleIcon className="w-5 h-5" />
                <span>MEASURE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarARViewer;
