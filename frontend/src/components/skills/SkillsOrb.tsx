import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useInView } from '../../hooks/useInView';

class OrbBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.setState({ failed: true }); }
  render() { return this.state.failed ? null : this.props.children; }
}

function SkillSphere({ names }: { names: string[] }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState('');
  const points = useMemo(() => names.map((name, index) => {
    const y = 1 - (index / Math.max(names.length - 1, 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = Math.PI * (3 - Math.sqrt(5)) * index;
    return { name, position: [Math.cos(theta) * radius * 2.25, y * 2.25, Math.sin(theta) * radius * 2.25] as [number, number, number] };
  }), [names]);

  useFrame((_, delta) => { if (group.current && !hovered) group.current.rotation.y += delta * 0.035; });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.9, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.06} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[2.2, 2.22, 64]} />
        <meshBasicMaterial color="#54e3ff" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 3, 0, 0]}>
        <ringGeometry args={[2.2, 2.22, 64]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>
      {points.map(({ name, position }) => (
        <Html key={name} position={position} center sprite distanceFactor={10.5}>
          <span
            className={`orb-skill${hovered === name ? ' orb-skill--active' : ''}`}
            onPointerEnter={() => setHovered(name)}
            onPointerLeave={() => setHovered('')}
          >
            {name}
          </span>
        </Html>
      ))}
    </group>
  );
}

export default function SkillsOrb({ names }: { names: string[] }) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.15 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    const isVisible = inView || (bounds.bottom > 0 && bounds.top < window.innerHeight);
    setVisible(isVisible);
    window.dispatchEvent(new CustomEvent('skills-orb-visibility', { detail: isVisible }));
    return () => { window.dispatchEvent(new CustomEvent('skills-orb-visibility', { detail: false })); };
  }, [inView, ref]);

  if (names.length === 0) return null;
  return <div ref={ref} className="skills-orb" aria-hidden="true">
    <OrbBoundary><Canvas dpr={[1, 1.5]} frameloop={visible ? 'always' : 'never'} camera={{ position: [0, 0, 7.8], fov: 42 }}>
      <ambientLight intensity={1} />
      <SkillSphere names={names} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={visible} autoRotateSpeed={0.2} />
    </Canvas></OrbBoundary>
  </div>;
}
