import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BASE_VERTEX_SHADER, CLOUD_FRAGMENT_SHADER } from '../../constants';

interface CloudLayerProps {
  density: number;
  speed: number;
  color: string;
  opacity: number;
}

export const CloudLayer: React.FC<CloudLayerProps> = ({ density, speed, color, opacity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uDensity: { value: density },
      uOpacity: { value: opacity },
    }),
    [color, density, opacity]
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime * speed;
      material.uniforms.uDensity.value = density;
      material.uniforms.uOpacity.value = opacity;
      material.uniforms.uColor.value.set(color);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 5]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={BASE_VERTEX_SHADER}
        fragmentShader={CLOUD_FRAGMENT_SHADER}
      />
    </mesh>
  );
};
