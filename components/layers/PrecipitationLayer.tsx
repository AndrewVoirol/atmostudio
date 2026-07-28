
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BASE_VERTEX_SHADER, PRECIPITATION_FRAGMENT_SHADER } from '../../constants';

interface PrecipitationLayerProps {
  rainIntensity: number;
  snowIntensity: number;
  windAngle: number;
}

export const PrecipitationLayer: React.FC<PrecipitationLayerProps> = ({ rainIntensity, snowIntensity, windAngle }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Convert angle to vector
  const rad = (windAngle * Math.PI) / 180;
  const windX = Math.sin(rad);
  const windY = Math.cos(rad);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRainIntensity: { value: rainIntensity },
      uSnowIntensity: { value: snowIntensity },
      uWindX: { value: windX },
      uWindY: { value: windY },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uRainIntensity.value = rainIntensity;
      material.uniforms.uSnowIntensity.value = snowIntensity;
      material.uniforms.uWindX.value = Math.sin((windAngle * Math.PI) / 180);
      material.uniforms.uWindY.value = Math.cos((windAngle * Math.PI) / 180) + 1.0; // Fall speed offset
    }
  });

  // Removed early return to allow dust/mist to be visible even if rain/snow is 0
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 5]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={BASE_VERTEX_SHADER}
        fragmentShader={PRECIPITATION_FRAGMENT_SHADER}
      />
    </mesh>
  );
};
