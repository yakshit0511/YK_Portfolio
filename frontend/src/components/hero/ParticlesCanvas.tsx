import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type * as THREE from 'three';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLowPower } from '../../hooks/useLowPower';
import { FloatingIcons } from './FloatingIcons';

function ParticleField({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      points[i * 3] = (Math.random() - 0.5) * 15;
      points[i * 3 + 1] = (Math.random() - 0.5) * 8;
      points[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return points;
  }, [count]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.012;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.025;
  });

  return <group ref={group}><Points positions={positions} stride={3} frustumCulled>
    <PointMaterial transparent color="#53baff" size={0.035} sizeAttenuation depthWrite={false} opacity={0.72} />
  </Points></group>;
}

export default function ParticlesCanvas() {
  const isMobile = useIsMobile();
  const lowPower = useLowPower();
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState === 'visible');
  const [orbActive, setOrbActive] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    const onOrbVisibility = (event: Event) => setOrbActive((event as CustomEvent<boolean>).detail);
    window.addEventListener('skills-orb-visibility', onOrbVisibility);
    return () => window.removeEventListener('skills-orb-visibility', onOrbVisibility);
  }, []);

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 0.08;
      const y = (event.clientY / window.innerHeight - 0.5) * 0.06;
      document.documentElement.style.setProperty('--scene-pointer-x', `${x}rad`);
      document.documentElement.style.setProperty('--scene-pointer-y', `${-y}rad`);
    };
    if (!isMobile && !lowPower) window.addEventListener('pointermove', updatePointer, { passive: true });
    return () => window.removeEventListener('pointermove', updatePointer);
  }, [isMobile, lowPower]);

  const count = isMobile || lowPower ? 100 : 300;
  const active = inView && tabVisible && !orbActive;

  return <div className="particles-canvas" aria-hidden="true">
    <Canvas dpr={[1, 1.5]} frameloop={active ? 'always' : 'demand'} camera={{ position: [0, 0, 10], fov: 46 }}>
      <ambientLight intensity={0.8} />
      <ParticleField key={count} count={count} />
      {!isMobile && !lowPower && <FloatingIcons />}
    </Canvas>
  </div>;
}
