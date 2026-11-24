import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Tower() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * .16) * .11 - .18;
      group.current.position.y = Math.sin(state.clock.elapsedTime * .45) * .045;
    }
  });
  const levels = 8; const floors = [];
  for (let i = 0; i <= levels; i++) {
    const y = i * .42;
    floors.push(<Line key={`f${i}`} points={[[-1.25,y,-.85],[1.25,y,-.85],[1.25,y,.85],[-1.25,y,.85],[-1.25,y,-.85]]} color={i === levels ? '#d6ff58' : '#54d8e8'} lineWidth={i === levels ? 1.8 : .75} transparent opacity={i === levels ? .95 : .38} />);
  }
  const columns = [];
  for (let i=0;i<4;i++) for(let j=0;j<4;j++) columns.push(<Line key={`c${i}${j}`} points={[[i*.83-1.25,0,j*.56-.85],[i*.83-1.25,levels*.42,j*.56-.85]]} color="#8ca6b2" lineWidth={.8} transparent opacity={.48}/>);
  const crane = <group position={[0,3.65,0]}><Line points={[[0,0,0],[0,.6,0],[2.5,.6,0],[2.5,.48,0]]} color="#d6ff58" lineWidth={2}/><Line points={[[0,.6,0],[-1.15,.6,0],[-1.15,.48,0]]} color="#d6ff58" lineWidth={2}/><Line points={[[0,.6,0],[.8,0,0]]} color="#d6ff58" lineWidth={1}/><Line points={[[1.85,.6,0],[1.85,-.55,0]]} color="#d6ff58" lineWidth={1}/><mesh position={[1.85,-.58,0]}><boxGeometry args={[.2,.12,.2]}/><meshStandardMaterial color="#d6ff58" emissive="#8cae28" emissiveIntensity={1}/></mesh></group>;
  return <group ref={group} position={[.2,-1.65,0]}>{floors}{columns}{crane}<mesh position={[0,1.45,0]}><boxGeometry args={[2.5,3.36,1.7]}/><meshBasicMaterial color="#1a3039" wireframe transparent opacity={.08}/></mesh></group>;
}

function Orbital() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => { if (ref.current) { ref.current.rotation.z = state.clock.elapsedTime * .06; ref.current.rotation.x = .25 + Math.sin(state.clock.elapsedTime*.15)*.04; } });
  return <group ref={ref}><mesh rotation={[Math.PI/2.8,.2,0]}><torusGeometry args={[2.75,.006,8,180]}/><meshBasicMaterial color="#d6ff58" transparent opacity={.55}/></mesh><mesh rotation={[1.3,0,.4]}><torusGeometry args={[3.15,.004,8,180]}/><meshBasicMaterial color="#55d8e8" transparent opacity={.35}/></mesh></group>;
}

export default function BuildScene() {
  return <div className="scene-wrap"><Canvas camera={{ position:[5,3.1,7.4], fov:35 }} dpr={[1,1.6]} gl={{ antialias:true, alpha:true }}>
    <ambientLight intensity={1.15}/><pointLight position={[4,5,4]} intensity={2.2} color="#b7f6ff"/><pointLight position={[-4,1,-3]} intensity={2.4} color="#8d62ff"/><Stars radius={35} depth={30} count={700} factor={2.1} saturation={.2} fade speed={.35}/>
    <Float speed={1.2} rotationIntensity={.06} floatIntensity={.14}><Tower/></Float><Orbital/>
  </Canvas><div className="scene-vignette"/></div>;
}
