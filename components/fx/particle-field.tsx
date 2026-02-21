"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMousePosition } from "@/hooks/useMousePosition";

interface ParticleFieldProps {
  count?: number;
  color?: string;
  size?: number;
}

interface ParticlesProps {
  count: number;
  color: string;
  size: number;
  mouseX: number;
  mouseY: number;
}

function Particles({ count, color, size, mouseX, mouseY }: ParticlesProps) {
  const mesh = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    return [positions, velocities];
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!mesh.current) return;

    const positionAttribute = mesh.current.geometry.attributes.position;
    const positionArray = positionAttribute.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update positions with velocity
      positionArray[i3] += velocities[i3];
      positionArray[i3 + 1] += velocities[i3 + 1];
      positionArray[i3 + 2] += velocities[i3 + 2];

      // Mouse interaction
      const dx = positionArray[i3] - mouseX * viewport.width * 0.5;
      const dy = positionArray[i3 + 1] - mouseY * viewport.height * 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        const force = (2 - dist) * 0.01;
        positionArray[i3] += dx * force;
        positionArray[i3 + 1] += dy * force;
      }

      // Boundary check - wrap around
      if (positionArray[i3] > 5) positionArray[i3] = -5;
      if (positionArray[i3] < -5) positionArray[i3] = 5;
      if (positionArray[i3 + 1] > 5) positionArray[i3 + 1] = -5;
      if (positionArray[i3 + 1] < -5) positionArray[i3 + 1] = 5;
      if (positionArray[i3 + 2] > 5) positionArray[i3 + 2] = -5;
      if (positionArray[i3 + 2] < -5) positionArray[i3 + 2] = 5;
    }

    positionAttribute.needsUpdate = true;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ConnectionLines({ count, mouseX, mouseY }: ParticlesProps) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const { viewport } = useThree();

  const [positions, particlePositions] = useMemo(() => {
    const linePositions = new Float32Array(count * 6); // 2 points * 3 coords
    const particles = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      particles[i3] = (Math.random() - 0.5) * 10;
      particles[i3 + 1] = (Math.random() - 0.5) * 10;
      particles[i3 + 2] = (Math.random() - 0.5) * 10;
    }

    return [linePositions, particles];
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame(() => {
    if (!linesRef.current) return;

    const lineArray = linesRef.current.geometry.attributes.position
      .array as Float32Array;
    let lineIndex = 0;

    for (let i = 0; i < count && lineIndex < count * 6 - 6; i++) {
      const i3 = i * 3;

      for (let j = i + 1; j < count && lineIndex < count * 6 - 6; j++) {
        const j3 = j * 3;

        const dx = particlePositions[i3] - particlePositions[j3];
        const dy = particlePositions[i3 + 1] - particlePositions[j3 + 1];
        const dz = particlePositions[i3 + 2] - particlePositions[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 1.5) {
          lineArray[lineIndex++] = particlePositions[i3];
          lineArray[lineIndex++] = particlePositions[i3 + 1];
          lineArray[lineIndex++] = particlePositions[i3 + 2];
          lineArray[lineIndex++] = particlePositions[j3];
          lineArray[lineIndex++] = particlePositions[j3 + 1];
          lineArray[lineIndex++] = particlePositions[j3 + 2];
        }
      }
    }

    // Clear remaining lines
    for (let i = lineIndex; i < count * 6; i++) {
      lineArray[i] = 0;
    }

    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#FF6B00" transparent opacity={0.15} />
    </lineSegments>
  );
}

export function ParticleField({
  count = 100,
  color = "#FF6B00",
  size = 0.05,
}: ParticleFieldProps) {
  const { normalizedX, normalizedY } = useMousePosition();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10"
      style={{ touchAction: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <Particles
          count={count}
          color={color}
          size={size}
          mouseX={normalizedX}
          mouseY={normalizedY}
        />
        <ConnectionLines
          count={count}
          color={color}
          size={size}
          mouseX={normalizedX}
          mouseY={normalizedY}
        />
      </Canvas>
    </div>
  );
}
