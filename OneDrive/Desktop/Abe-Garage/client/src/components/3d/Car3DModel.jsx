
import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  Environment,
  Float,
  Text,
  Html,
} from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import "./Car3DModel.css";

// Car model configurations
const CAR_MODELS = {
  sedan: {
    name: "Luxury Sedan",
    scale: 1,
    description: "Perfect for daily commuting and family trips",
  },
  suv: {
    name: "Premium SUV",
    scale: 1.2,
    description: "Spacious and powerful for all terrains",
  },
  sports: {
    name: "Sports Coupe",
    scale: 0.9,
    description: "High-performance driving experience",
  },
};

// Color options
const CAR_COLORS = {
  midnight: { name: "Midnight Blue", value: "#1e3a8a", metallic: true },
  crimson: { name: "Crimson Red", value: "#dc2626", metallic: true },
  pearl: { name: "Pearl White", value: "#f8fafc", metallic: false },
  graphite: { name: "Graphite Gray", value: "#374151", metallic: true },
  emerald: { name: "Emerald Green", value: "#059669", metallic: true },
};

const RealisticCarModel = ({ modelType = "sedan", color = "midnight", highlightedPart = null, onPartClick }) => {
  const group = useRef();
  const [hoveredPart, setHoveredPart] = useState(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 6) / 8;
    group.current.position.y = (1 + Math.sin(t / 2)) / 15;
  });

  const carColor = CAR_COLORS[color] || CAR_COLORS.midnight;
  const scale = CAR_MODELS[modelType]?.scale || 1;

  const createMaterial = (baseColor, metallic = false, roughness = 0.3) => {
    return new THREE.MeshPhysicalMaterial({
      color: baseColor,
      metalness: metallic ? 0.8 : 0.2,
      roughness: roughness,
      clearcoat: metallic ? 0.5 : 0.1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1,
    });
  };

  const handlePartInteraction = (partName, event) => {
    if (event.type === 'click') {
      onPartClick?.(partName);
    } else if (event.type === 'pointerover') {
      setHoveredPart(partName);
      document.body.style.cursor = 'pointer';
    } else if (event.type === 'pointerout') {
      setHoveredPart(null);
      document.body.style.cursor = 'auto';
    }
  };

  // Model-specific geometries
  const getModelGeometry = () => {
    switch (modelType) {
      case "suv":
        return {
          body: [2.4, 0.8, 4.8], // Wider, taller, longer
          hood: [2.0, 0.1, 1.4],
          trunk: [2.0, 0.1, 1.4],
          cabin: [1.8, 0.6, 2.4],
          roof: [1.8, 0.1, 2.4],
          wheelOffset: 1.6,
          wheelSize: [0.4, 0.4, 0.28],
          rimSize: [0.28, 0.28, 0.29],
        };
      case "sports":
        return {
          body: [2.0, 0.5, 4.2], // Sleeker, lower
          hood: [1.6, 0.08, 1.6], // Longer hood
          trunk: [1.6, 0.08, 0.8], // Shorter trunk
          cabin: [1.4, 0.4, 1.8],
          roof: [1.4, 0.08, 1.8],
          wheelOffset: 1.3,
          wheelSize: [0.38, 0.38, 0.26],
          rimSize: [0.26, 0.26, 0.27],
        };
      default: // sedan
        return {
          body: [2.2, 0.6, 4.5],
          hood: [1.8, 0.1, 1.2],
          trunk: [1.8, 0.1, 1.2],
          cabin: [1.6, 0.5, 2.2],
          roof: [1.6, 0.1, 2.2],
          wheelOffset: 1.4,
          wheelSize: [0.35, 0.35, 0.25],
          rimSize: [0.25, 0.25, 0.26],
        };
    }
  };

  const geometry = getModelGeometry();

  return (
    <group ref={group} scale={scale} dispose={null}>
      {/* Main Body */}
      <mesh
        position={[0, 0.4, 0]}
        castShadow
        receiveShadow
        onClick={(e) => handlePartInteraction('body', e)}
        onPointerOver={(e) => handlePartInteraction('body', e)}
        onPointerOut={(e) => handlePartInteraction('body', e)}
      >
        <boxGeometry args={geometry.body} />
        <primitive object={createMaterial(carColor.value, carColor.metallic)} />
      </mesh>

      {/* Hood */}
      <mesh
        position={[0, 0.35, geometry.body[2] / 2 - geometry.hood[2] / 2]}
        castShadow
        receiveShadow
        onClick={(e) => handlePartInteraction('hood', e)}
        onPointerOver={(e) => handlePartInteraction('hood', e)}
        onPointerOut={(e) => handlePartInteraction('hood', e)}
      >
        <boxGeometry args={geometry.hood} />
        <primitive object={createMaterial(carColor.value, carColor.metallic)} />
      </mesh>

      {/* Trunk */}
      <mesh
        position={[0, 0.35, -geometry.body[2] / 2 + geometry.trunk[2] / 2]}
        castShadow
        receiveShadow
        onClick={(e) => handlePartInteraction('trunk', e)}
        onPointerOver={(e) => handlePartInteraction('trunk', e)}
        onPointerOut={(e) => handlePartInteraction('trunk', e)}
      >
        <boxGeometry args={geometry.trunk} />
        <primitive object={createMaterial(carColor.value, carColor.metallic)} />
      </mesh>

      {/* Cabin/Windows */}
      <mesh position={[0, 0.9, 0.2]} castShadow receiveShadow>
        <boxGeometry args={geometry.cabin} />
        <meshPhysicalMaterial
          color="#0f172a"
          metalness={0.1}
          roughness={0.1}
          transmission={0.8}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0}
          opacity={0.7}
          transparent
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 1.1, 0.2]} castShadow receiveShadow>
        <boxGeometry args={geometry.roof} />
        <primitive object={createMaterial(carColor.value, carColor.metallic, 0.4)} />
      </mesh>

      {/* Front Bumper */}
      <mesh position={[0, 0.2, geometry.body[2] / 2 + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[geometry.body[0], 0.3, 0.2]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Rear Bumper */}
      <mesh position={[0, 0.2, -geometry.body[2] / 2 - 0.1]} castShadow receiveShadow>
        <boxGeometry args={[geometry.body[0], 0.3, 0.2]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Wheels */}
      {[
        [-geometry.body[0] / 2 + 0.2, 0.25, geometry.wheelOffset],
        [geometry.body[0] / 2 - 0.2, 0.25, geometry.wheelOffset],
        [-geometry.body[0] / 2 + 0.2, 0.25, -geometry.wheelOffset],
        [geometry.body[0] / 2 - 0.2, 0.25, -geometry.wheelOffset],
      ].map((position, index) => (
        <group key={index} position={position}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={geometry.wheelSize} />
            <meshStandardMaterial color="#1f2937" roughness={0.8} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={geometry.rimSize} />
            <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[-geometry.body[0] / 3, 0.4, geometry.body[2] / 2 + 0.01]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fbbf24"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[geometry.body[0] / 3, 0.4, geometry.body[2] / 2 + 0.01]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fbbf24"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* Taillights */}
      <mesh position={[-geometry.body[0] / 3, 0.4, -geometry.body[2] / 2 - 0.01]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[geometry.body[0] / 3, 0.4, -geometry.body[2] / 2 - 0.01]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Grille */}
      <mesh position={[0, 0.4, geometry.body[2] / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.05]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Exhaust */}
      <mesh position={[-0.4, 0.1, -geometry.body[2] / 2 - 0.1]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.4, 0.1, -geometry.body[2] / 2 - 0.1]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Door handles */}
      <mesh position={[-geometry.body[0] / 2 - 0.01, 0.6, 0.5]} castShadow>
        <boxGeometry args={[0.02, 0.1, 0.15]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[geometry.body[0] / 2 + 0.01, 0.6, 0.5]} castShadow>
        <boxGeometry args={[0.02, 0.1, 0.15]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Model-specific features */}
      {modelType === "suv" && (
        <>
          {/* Roof rails for SUV */}
          <mesh position={[0, 1.3, 0.2]} castShadow>
            <boxGeometry args={[geometry.roof[0] + 0.2, 0.05, 0.05]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.3, 0.6]} castShadow>
            <boxGeometry args={[geometry.roof[0] + 0.2, 0.05, 0.05]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}

      {modelType === "sports" && (
        <>
          {/* Spoiler for sports car */}
          <mesh position={[0, 0.8, -geometry.body[2] / 2 + 0.3]} castShadow>
            <boxGeometry args={[1.2, 0.05, 0.4]} />
            <primitive object={createMaterial(carColor.value, carColor.metallic)} />
          </mesh>
          {/* Side skirts */}
          <mesh position={[-geometry.body[0] / 2 + 0.1, 0.2, 0]} castShadow>
            <boxGeometry args={[0.05, 0.2, geometry.body[2] - 1]} />
            <primitive object={createMaterial(carColor.value, carColor.metallic)} />
          </mesh>
          <mesh position={[geometry.body[0] / 2 - 0.1, 0.2, 0]} castShadow>
            <boxGeometry args={[0.05, 0.2, geometry.body[2] - 1]} />
            <primitive object={createMaterial(carColor.value, carColor.metallic)} />
          </mesh>
        </>
      )}

      {/* Highlight effect for hovered parts */}
      {hoveredPart && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[geometry.body[0] + 0.5, geometry.body[1] + 1, geometry.body[2] + 1]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Part tooltip */}
      {hoveredPart && (
        <Html position={[0, geometry.body[1] + 1.5, 0]} center>
          <div className="part-tooltip">
            <div className="part-name">{hoveredPart.charAt(0).toUpperCase() + hoveredPart.slice(1)}</div>
            <div className="part-info">Click for details</div>
          </div>
        </Html>
      )}
    </group>
  );
};

const Car3DModel = ({
  width = "100%",
  height = "600px",
  className = "",
  showControls = true,
  title = "VEHICLE SHOWROOM",
  subtitle = "INTERACTIVE 3D EXPERIENCE",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [selectedModel, setSelectedModel] = useState("sedan");
  const [selectedColor, setSelectedColor] = useState("midnight");
  const [highlightedPart, setHighlightedPart] = useState(null);
  const [showPartInfo, setShowPartInfo] = useState(false);
  const [partInfo, setPartInfo] = useState({});

  const handlePartClick = (partName) => {
    const partDetails = {
      body: {
        name: "Vehicle Body",
        description: "The main structural component providing protection and aerodynamics",
        maintenance: "Regular washing and waxing recommended"
      },
      hood: {
        name: "Engine Hood",
        description: "Protects the engine compartment and provides access for maintenance",
        maintenance: "Check hinges and latch regularly"
      },
      trunk: {
        name: "Trunk Compartment",
        description: "Storage area for luggage and spare parts",
        maintenance: "Ensure weather stripping is intact"
      }
    };

    if (partDetails[partName]) {
      setPartInfo(partDetails[partName]);
      setShowPartInfo(true);
      setHighlightedPart(partName);
    }
  };

  const closePartInfo = () => {
    setShowPartInfo(false);
    setHighlightedPart(null);
  };

  return (
    <motion.div
      className={`car-3d-container relative overflow-hidden rounded-2xl ${
        !isLoaded ? "loading" : ""
      } ${className}`}
      style={{ width, height }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-400 font-medium">Loading 3D Experience...</p>
          </div>
        </div>
      )}

      {/* Title overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
          {title}
        </h3>
        <p className="text-blue-400 font-mono text-sm mt-1">{subtitle}</p>
      </div>

      {/* Tech badges */}
      <div className="absolute top-6 right-6 z-10 pointer-events-none">
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs font-medium rounded border border-blue-700/50 backdrop-blur-sm">
            WebGL 2.0
          </span>
          <span className="px-2 py-1 bg-emerald-900/50 text-emerald-300 text-xs font-medium rounded border border-emerald-700/50 backdrop-blur-sm">
            Interactive
          </span>
          <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs font-medium rounded border border-purple-700/50 backdrop-blur-sm">
            PBR Materials
          </span>
        </div>
      </div>

      {/* Model Selector */}
      <div className="absolute top-20 left-6 z-10">
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-3 border border-white/10">
          <div className="text-white text-xs font-medium mb-2">SELECT MODEL</div>
          <div className="flex gap-2">
            {Object.entries(CAR_MODELS).map(([key, model]) => (
              <button
                key={key}
                onClick={() => setSelectedModel(key)}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  selectedModel === key
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Selector */}
      <div className="absolute top-20 right-6 z-10">
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-3 border border-white/10">
          <div className="text-white text-xs font-medium mb-2">SELECT COLOR</div>
          <div className="flex gap-2">
            {Object.entries(CAR_COLORS).map(([key, color]) => (
              <button
                key={key}
                onClick={() => setSelectedColor(key)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor === key
                    ? "border-white scale-110"
                    : "border-gray-400 hover:border-gray-300"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Part Information Panel */}
      {showPartInfo && (
        <motion.div
          className="absolute bottom-20 left-6 z-20 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-white/20 max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-semibold text-sm">{partInfo.name}</h4>
            <button
              onClick={closePartInfo}
              className="text-gray-400 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-gray-300 text-xs mb-2">{partInfo.description}</p>
          <p className="text-blue-400 text-xs">{partInfo.maintenance}</p>
        </motion.div>
      )}

      <Canvas
        shadows
        dpr={[1, 2]}
        onCreated={() => setIsLoaded(true)}
        className="absolute inset-0"
      >
        <PerspectiveCamera makeDefault position={[5, 3, 7]} fov={45} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[5, 5, -5]} intensity={0.3} color="#8b5cf6" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#ffffff"
          castShadow
        />

        <Float
          speed={isInteracting ? 0.3 : 1.5}
          rotationIntensity={isInteracting ? 0.1 : 0.3}
          floatIntensity={isInteracting ? 0.1 : 0.3}
        >
          <RealisticCarModel
            modelType={selectedModel}
            color={selectedColor}
            highlightedPart={highlightedPart}
            onPartClick={handlePartClick}
          />
        </Float>

        <ContactShadows
          resolution={1024}
          scale={25}
          blur={2.5}
          opacity={0.4}
          far={5}
          color="#000000"
        />
        <Environment preset="studio" />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={!isInteracting}
          autoRotateSpeed={0.4}
          dampingFactor={0.05}
          enableDamping
        />
      </Canvas>

      {showControls && (
        <div className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-none z-10">
          <div className="controls-indicator">
            <span className="status-dot inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Drag to Rotate • Scroll to Zoom • Click Parts for Info
            {isInteracting && (
              <span className="ml-2 text-blue-300">• Active</span>
            )}
          </div>
        </div>
      )}

      {/* Performance metrics */}
      <div className="absolute bottom-6 left-6 text-xs text-gray-400 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>60 FPS</span>
          </div>
          <div className="text-gray-500">•</div>
          <div className="text-gray-500">{CAR_MODELS[selectedModel]?.name}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default Car3DModel;