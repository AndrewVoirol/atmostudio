import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import { WeatherConfig } from '../types';
import { BackgroundLayer } from './layers/BackgroundLayer';
import { CloudLayer } from './layers/CloudLayer';
import { PrecipitationLayer } from './layers/PrecipitationLayer';

interface WeatherCardProps {
  config: WeatherConfig;
  exploded: boolean;
}

// Helper component for sun/moon
const Sun: React.FC<{ x: number; y: number; color: string; scale: number }> = ({ x, y, color, scale }) => {
  return (
    <mesh position={[x * 1.5, y * 2, 0]}>
      <circleGeometry args={[0.4 * scale, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ config, exploded }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Refs for individual layers to animate z-position
  const bgRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Group>(null);
  const rainRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Lerp animation for exploded view
    const targetGap = exploded ? 0.8 : 0.001;
    const speed = 4 * delta;

    if (bgRef.current) bgRef.current.position.z = 0; // Anchor
    if (sunRef.current) sunRef.current.position.z = THREE.MathUtils.lerp(sunRef.current.position.z, targetGap * 1, speed);
    if (cloudRef.current) cloudRef.current.position.z = THREE.MathUtils.lerp(cloudRef.current.position.z, targetGap * 2, speed);
    if (rainRef.current) rainRef.current.position.z = THREE.MathUtils.lerp(rainRef.current.position.z, targetGap * 3, speed);
    if (textRef.current) textRef.current.position.z = THREE.MathUtils.lerp(textRef.current.position.z, targetGap * 4, speed);

    // Subtle floating animation for the whole card
    if (groupRef.current && !exploded) {
       groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
       groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.02;
    } else if (groupRef.current && exploded) {
       // Reset rotation when exploded for better inspection
       groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.4, speed); // Tilt back to see layers
       groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -0.4, speed);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Background Layer */}
      <group ref={bgRef}>
        <BackgroundLayer top={config.bgTop} bottom={config.bgBottom} />
      </group>

      {/* 2. Sun/Moon Layer */}
      <group ref={sunRef}>
         <Sun 
            x={config.sunPositionX} 
            y={config.sunPositionY} 
            color={config.sunColor} 
            scale={config.sunScale} 
         />
      </group>

      {/* 3. Cloud Layer */}
      <group ref={cloudRef}>
        <CloudLayer 
          density={config.cloudDensity} 
          speed={config.cloudSpeed} 
          color={config.cloudColor}
          opacity={config.cloudOpacity}
        />
      </group>

      {/* 4. Precipitation Layer */}
      <group ref={rainRef}>
        <PrecipitationLayer 
          rainIntensity={config.rainIntensity}
          snowIntensity={config.snowIntensity}
          windAngle={config.windAngle}
        />
      </group>

      {/* 5. Info/Text Layer */}
      <group ref={textRef}>
          {/* Using 3D Text geometry or HTML overlay? Let's use 3D text for correct depth in exploded view */}
          <Text
            position={[-1.2, 1.8, 0]}
            fontSize={0.3}
            color="white"
            anchorX="left"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {config.conditionLabel}
          </Text>
          <Text
            position={[1.2, 1.8, 0]}
            fontSize={0.8}
            color="white"
            anchorX="right"
             font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {config.temperature}°
          </Text>
          <Text
             position={[-1.2, -2.0, 0]}
             fontSize={0.15}
             color="#cccccc"
             anchorX="left"
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
             H: {config.temperature + 5}° L: {config.temperature - 10}°
          </Text>
          <Text
             position={[1.2, -2.0, 0]}
             fontSize={0.15}
             color="#cccccc"
             anchorX="right"
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
             {config.conditionLabel === 'Raining' ? 'Precip: 100%' : 'Precip: 0%'}
          </Text>
      </group>
    </group>
  );
};