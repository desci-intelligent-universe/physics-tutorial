import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DoubleSlitProps {
  wavelength: number;      // nm (400-700)
  slitSeparation: number;  // mm (0.01-1)
  observerMode: boolean;
}

function DoubleSlit({ wavelength, slitSeparation, observerMode }: DoubleSlitProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  // Convert wavelength to color
  const wavelengthToColor = (wl: number): THREE.Color => {
    let r = 0, g = 0, b = 0;
    
    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      b = 1;
    } else if (wl >= 440 && wl < 490) {
      g = (wl - 440) / (490 - 440);
      b = 1;
    } else if (wl >= 490 && wl < 510) {
      g = 1;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1;
    } else if (wl >= 580 && wl < 645) {
      r = 1;
      g = -(wl - 645) / (645 - 580);
    } else if (wl >= 645 && wl <= 780) {
      r = 1;
    }
    
    return new THREE.Color(r, g, b);
  };

  const color = wavelengthToColor(wavelength);

  // Generate interference pattern
  const interferencePattern = useMemo(() => {
    const numPoints = 200;
    const pattern: number[] = [];
    const wavelengthM = wavelength * 1e-9;
    const slitSepM = slitSeparation * 1e-3;
    
    for (let i = 0; i < numPoints; i++) {
      const y = (i - numPoints / 2) * 0.02; // -2 to +2 units
      const theta = Math.atan(y / 3); // screen at z = 3
      
      if (observerMode) {
        // Particle behavior: two bands
        const band1 = Math.exp(-Math.pow((theta + 0.15), 2) / 0.01);
        const band2 = Math.exp(-Math.pow((theta - 0.15), 2) / 0.01);
        pattern.push((band1 + band2) * 0.5);
      } else {
        // Wave behavior: interference
        const phase = Math.PI * slitSepM * Math.sin(theta) / wavelengthM;
        pattern.push(Math.pow(Math.cos(phase), 2));
      }
    }
    
    return pattern;
  }, [wavelength, slitSeparation, observerMode]);

  // Generate particles for visualization
  const particles = useMemo(() => {
    const count = observerMode ? 500 : 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Random x position at source
      const x = (Math.random() - 0.5) * 0.1;
      
      // Y position based on pattern probability
      const patternIndex = Math.floor(Math.random() * interferencePattern.length);
      const probability = interferencePattern[patternIndex];
      
      if (Math.random() < probability) {
        const y = (patternIndex - interferencePattern.length / 2) * 0.02;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.random() * 3 - 1.5; // z from -1.5 to 1.5
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      } else {
        // Hide non-hitting particles
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 100;
        positions[i * 3 + 2] = 0;
      }
    }
    
    return { positions, colors };
  }, [interferencePattern, color, observerMode]);

  // Animate particles
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        // Move particles along z-axis
        positions[i * 3 + 2] += delta * 0.5;
        
        // Reset particles that reach the screen
        if (positions[i * 3 + 2] > 1.5) {
          positions[i * 3 + 2] = -1.5;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Source */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Barrier with slits */}
      <group position={[0, 0, 0]}>
        {/* Top barrier */}
        <mesh position={[0, 1 + slitSeparation / 2, 0]}>
          <boxGeometry args={[0.05, 2 - slitSeparation, 0.5]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        {/* Middle barrier */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.05, slitSeparation * 0.5, 0.5]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        {/* Bottom barrier */}
        <mesh position={[0, -1 - slitSeparation / 2, 0]}>
          <boxGeometry args={[0.05, 2 - slitSeparation, 0.5]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        
        {/* Slit indicators */}
        <mesh position={[0, slitSeparation / 2 + 0.1, 0]}>
          <ringGeometry args={[0.02, 0.03, 16]} />
          <meshBasicMaterial color="#60a5fa" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -slitSeparation / 2 - 0.1, 0]}>
          <ringGeometry args={[0.02, 0.03, 16]} />
          <meshBasicMaterial color="#60a5fa" side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* Detection screen */}
      <mesh ref={screenRef} position={[2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1, 4]} />
        <meshStandardMaterial color="#1f2937" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Interference pattern on screen */}
      <group position={[2.01, 0, 0]}>
        {interferencePattern.map((intensity, i) => (
          <mesh 
            key={i} 
            position={[0, (i - interferencePattern.length / 2) * 0.02, 0]}
          >
            <boxGeometry args={[0.01, 0.02, 0.02]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={intensity * 0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particles.colors.length / 3}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.02} 
          vertexColors 
          transparent 
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Observer indicator */}
      {observerMode && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
      
      {/* Wave visualization (when not observing) */}
      {!observerMode && (
        <WaveVisualization 
          color={color} 
          wavelength={wavelength} 
          slitSeparation={slitSeparation} 
        />
      )}
    </group>
  );
}

// Separate component for wave visualization
function WaveVisualization({ 
  color, 
  wavelength, 
  slitSeparation 
}: { 
  color: THREE.Color; 
  wavelength: number;
  slitSeparation: number;
}) {
  const waveRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (waveRef.current) {
      const positions = waveRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < positions.length / 3; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        
        // Create wave from two slit sources
        const dist1 = Math.sqrt(Math.pow(x, 2) + Math.pow(y - slitSeparation / 2, 2));
        const dist2 = Math.sqrt(Math.pow(x, 2) + Math.pow(y + slitSeparation / 2, 2));
        
        const wave1 = Math.sin(dist1 * 20 - time * 2);
        const wave2 = Math.sin(dist2 * 20 - time * 2);
        
        positions[i * 3 + 2] = (wave1 + wave2) * 0.05;
      }
      
      waveRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <mesh ref={waveRef} position={[1, 0, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[2, 2, 50, 50]} />
      <meshBasicMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default DoubleSlit;
