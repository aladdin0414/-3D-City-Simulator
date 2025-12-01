import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CarData } from '../../types';

interface TrafficProps {
  initialCars: CarData[];
  boundary: number;
  isNight: boolean;
}

export const Traffic: React.FC<TrafficProps> = ({ initialCars, boundary, isNight }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const headLightRef = useRef<THREE.InstancedMesh>(null); 
  const tailLightRef = useRef<THREE.InstancedMesh>(null); 

  const carsRef = useRef<CarData[]>(JSON.parse(JSON.stringify(initialCars)));

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lightDummy = useMemo(() => new THREE.Object3D(), []);

  // Material for lights
  const headLightMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fffebb' }), []);
  const tailLightMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ef4444' }), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !headLightRef.current || !tailLightRef.current) return;

    // Adjust light color intensity based on night mode
    // We modify the material color or just rely on the Bloom threshold.
    // Since we use MeshBasicMaterial, >1 color values work with tone mapping or just plain bloom.
    // Let's dynamically set color intensity.
    const headIntensity = isNight ? 2 : 1;
    const tailIntensity = isNight ? 3 : 1;
    
    headLightMat.color.setScalar(headIntensity); 
    headLightMat.color.setHex(0xfffebb); // Reset tint then scale
    headLightMat.color.multiplyScalar(headIntensity);

    tailLightMat.color.setScalar(tailIntensity);
    tailLightMat.color.setHex(0xff0000);
    tailLightMat.color.multiplyScalar(tailIntensity);
    
    headLightRef.current.material = headLightMat;
    tailLightRef.current.material = tailLightMat;


    carsRef.current.forEach((car, i) => {
      // Update position along axis
      const axisIndex = car.axis === 'x' ? 0 : 2;
      car.position[axisIndex] += car.speed * (delta * 60);

      // Loop logic based on boundary
      const limit = boundary; 
      if (car.position[axisIndex] > limit) {
        car.position[axisIndex] = -limit;
      } else if (car.position[axisIndex] < -limit) {
        car.position[axisIndex] = limit;
      }

      // 1. Update Car Body
      dummy.position.set(car.position[0], car.position[1], car.position[2]);
      
      // Orientation
      const isX = car.axis === 'x';
      const rotY = isX 
        ? (car.direction > 0 ? Math.PI / 2 : -Math.PI / 2)
        : (car.direction > 0 ? 0 : Math.PI);
      
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(0.6, 0.5, 1.3); // Car dimensions
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new THREE.Color(car.color));

      // Light Offsets
      const halfLength = 0.65; // Half car length + tiny bit
      
      // 2. Headlights (Front)
      // Front is where direction points
      const hx = car.position[0] + (isX ? halfLength * car.direction : 0);
      const hz = car.position[2] + (!isX ? halfLength * car.direction : 0);
      
      lightDummy.position.set(hx, car.position[1], hz);
      lightDummy.rotation.set(0, rotY, 0);
      lightDummy.scale.set(0.4, 0.2, 0.1); 
      lightDummy.updateMatrix();
      headLightRef.current!.setMatrixAt(i, lightDummy.matrix);

      // 3. Taillights (Back)
      const tx = car.position[0] - (isX ? halfLength * car.direction : 0);
      const tz = car.position[2] - (!isX ? halfLength * car.direction : 0);
      
      lightDummy.position.set(tx, car.position[1], tz);
      lightDummy.rotation.set(0, rotY, 0);
      lightDummy.scale.set(0.4, 0.2, 0.1); 
      lightDummy.updateMatrix();
      tailLightRef.current!.setMatrixAt(i, lightDummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    
    headLightRef.current.instanceMatrix.needsUpdate = true;
    tailLightRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Car Bodies */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, initialCars.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} metalness={0.6} />
      </instancedMesh>

      {/* Headlights */}
      <instancedMesh
        ref={headLightRef}
        args={[undefined, undefined, initialCars.length]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={headLightMat} attach="material" />
      </instancedMesh>

      {/* Taillights */}
      <instancedMesh
        ref={tailLightRef}
        args={[undefined, undefined, initialCars.length]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={tailLightMat} attach="material" />
      </instancedMesh>
    </group>
  );
};