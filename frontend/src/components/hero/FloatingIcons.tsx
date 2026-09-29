import { Float, Html } from '@react-three/drei';
import type { IconType } from 'react-icons';
import { SiExpress, SiJavascript, SiMongodb, SiNodedotjs, SiReact, SiTypescript } from 'react-icons/si';

const technologies: { name: string; Icon: IconType; color: string; position: [number, number, number] }[] = [
  { name: 'React', Icon: SiReact, color: '#61dafb', position: [-4.9, 1.7, -1] },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#83cd29', position: [4.7, 2.4, -1] },
  { name: 'MongoDB', Icon: SiMongodb, color: '#47a248', position: [4.5, -1.8, -1] },
  { name: 'Express', Icon: SiExpress, color: '#e8efff', position: [-4.8, -1.6, -1] },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178c6', position: [5.9, 0.3, -2] },
  { name: 'JavaScript', Icon: SiJavascript, color: '#f7df1e', position: [-5.8, 0.1, -2] },
];

export function FloatingIcons() {
  return <group>{technologies.map(({ name, Icon, color, position }, index) => (
    <Float key={name} speed={0.7 + index * 0.08} rotationIntensity={0.12} floatIntensity={0.25}>
      <Html position={position} center transform distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="tech-float-card" aria-label={name}>
          <Icon size={25} color={color} aria-hidden="true" /><span>{name}</span>
        </div>
      </Html>
    </Float>
  ))}</group>;
}
