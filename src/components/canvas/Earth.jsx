// import React, { Suspense } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

// const Earth = () => {
//   const earth = useGLTF("./planet/scene.gltf");
//   return (
//     <primitive object={earth.scene} scale={3} position-y={0} rotation-y={0} />
//   );
// };

// const EarthCanvas = () => {
//   return (
//     <Canvas
//       shadows
//       frameloop="demand"
//       dpr={[1, 2]}
//       gl={{ preserveDrawingBuffer: true }}
//       camera={{
//         fov: 45,
//         near: 0.1,
//         far: 200,
//         position: [-4, 3, 6],
//       }}
//     >
//       <Suspense fallback={null}>
//         <OrbitControls
//           autoRotate
//           enableZoom={false}
//           maxPolarAngle={Math.PI / 2}
//           minPolarAngle={Math.PI / 2}
//         />
//         <Earth />
//         <Preload all />
//       </Suspense>
//     </Canvas>
//   );
// };

// export default EarthCanvas;

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import { ShaderMaterial, Color } from "three";

// Custom ShaderMaterial
const shaderMaterial = new ShaderMaterial({
  uniforms: {
    color1: { value: new Color("#0c4a73") }, // Blue base color
    color2: { value: new Color("#00b7ff") }, // Lighter color for dynamic effect
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec3 color = mix(color1, color2, sin(time + vUv.x * 10.0) * 0.5 + 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  transparent: true,
});

const Earth = () => {
  const earth = useGLTF("./planet/scene.gltf");
  const meshRef = useRef(null);
  const [time, setTime] = useState(0);

  // Update the time for animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 0.02);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Apply the custom shader material once the model is loaded
  useEffect(() => {
    if (earth && earth.scene) {
      earth.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = shaderMaterial; // Apply the shader material
        }
      });
    }
  }, [earth]);

  // Update the time uniform in the shader material
  useEffect(() => {
    if (earth && earth.scene) {
      earth.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.uniforms.time.value = time;
        }
      });
    }
  }, [time]);

  return <primitive object={earth.scene} scale={3} position-y={0} rotation-y={0} ref={meshRef} dispose={null} />;
};

const EarthCanvas = () => {
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    //   gl={{ preserveDrawingBuffer: true, context: { antialias: false, powerPreference: "high-performance" }}}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [-4, 3, 6],
      }}
    >
      <Suspense fallback={null}>
        <OrbitControls
          autoRotate
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Earth />
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
