import { Float, Html } from '@react-three/drei';
import type { IconType } from 'react-icons';
import {
  SiCss,
  SiExpress,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';

const technologies: { name: string; Icon: IconType; color: string; position: [number, number, number] }[] = [
  { name: 'React.js', Icon: SiReact, color: '#61dafb', position: [-5.2, 1.8, -1] },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#83cd29', position: [4.2, 1.9, -1] },
  { name: 'MongoDB', Icon: SiMongodb, color: '#47a248', position: [4.3, -1.2, -1] },
  { name: 'Express', Icon: SiExpress, color: '#e8efff', position: [-5.1, -1.2, -1] },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178c6', position: [5.9, 0.4, -2] },
  { name: 'JavaScript', Icon: SiJavascript, color: '#f7df1e', position: [-6.2, 0.4, -2] },
  { name: 'HTML5', Icon: SiHtml5, color: '#e44d26', position: [-2.2, 1.9, -2] },
  { name: 'CSS3', Icon: SiCss, color: '#1572b6', position: [2.0, 2.0, -2] },
  { name: 'Tailwind', Icon: SiTailwindcss, color: '#38bdf8', position: [1.1, -3.2, -2] },
  { name: 'Git', Icon: SiGit, color: '#f05032', position: [-2.1, -3.4, -2] },
  { name: 'GitHub', Icon: SiGithub, color: '#ffffff', position: [0.8, 0.6, -2] },
];

export function FloatingIcons() {
  return (
    <group>
      {technologies.map(({ name, Icon, color, position }, index) => (
        <Float key={name} speed={0.7 + index * 0.08} rotationIntensity={0.14} floatIntensity={0.3}>
          <Html position={position} center transform distanceFactor={9} style={{ pointerEvents: 'auto' }}>
            <div
              className="tech-float-card"
              aria-label={name}
              style={{ '--tech-glow': color } as React.CSSProperties}
            >
              <Icon size={24} color={color} aria-hidden="true" />
              <span>{name}</span>
            </div>
          </Html>
        </Float>
      ))}
    </group>
  );
}
