import React, { useMemo } from 'react';
import * as THREE from 'three';
import { extend, ReactThreeFiber } from '@react-three/fiber';

// Simple gradient shader
const GradientMaterialShader = {
  uniforms: {
    uColorA: { value: new THREE.Color('#000000') },
    uColorB: { value: new THREE.Color('#ffffff') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(mix(uColorB, uColorA, vUv.y), 1.0);
    }
  `
};

export const BackgroundLayer: React.FC<{ top: string; bottom: string }> = ({ top, bottom }) => {
  const uniforms = useMemo(
    () => ({
      uColorA: { value: new THREE.Color(top) },
      uColorB: { value: new THREE.Color(bottom) },
    }),
    [top, bottom]
  );

  return (
    <mesh>
      <planeGeometry args={[4, 5]} />
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={GradientMaterialShader.vertexShader}
        fragmentShader={GradientMaterialShader.fragmentShader}
      />
    </mesh>
  );
};
