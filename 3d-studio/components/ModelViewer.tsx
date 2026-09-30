"use client";

import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

function LoadedMesh({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}

function Placeholder() {
  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      <icosahedronGeometry args={[1.1, 0]} />
      <meshStandardMaterial color="#7dd3fc" wireframe />
    </mesh>
  );
}

export default function ModelViewer({ modelSrc }: { modelSrc: string | null }) {
  return (
    <Canvas camera={{ position: [2.4, 1.6, 2.8], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={["#070b12"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} />
      <Suspense fallback={<Placeholder />}>
        {modelSrc ? <LoadedMesh key={modelSrc} url={modelSrc} /> : <Placeholder />}
      </Suspense>
      <Environment preset="city" />
      <OrbitControls enablePan makeDefault />
      <gridHelper args={[8, 16, "#1e293b", "#0f172a"]} />
    </Canvas>
  );
}
