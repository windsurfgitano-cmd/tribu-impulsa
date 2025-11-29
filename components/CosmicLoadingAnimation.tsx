import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CosmicLoadingAnimationProps {
  onComplete?: () => void;
  duration?: number; // en ms, default 8000
}

export const CosmicLoadingAnimation: React.FC<CosmicLoadingAnimationProps> = ({ 
  onComplete, 
  duration = 8000 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [statusText, setStatusText] = useState('Iniciando conexión tribal...');
  const animationRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Textos de estado durante la animación
    const statusMessages = [
      { time: 0, text: 'Iniciando conexión tribal...' },
      { time: 1500, text: 'Analizando perfiles de la comunidad...' },
      { time: 3000, text: 'Calculando afinidades...' },
      { time: 4500, text: 'Formando tu tribu ideal...' },
      { time: 6000, text: 'Cristalizando conexiones...' },
      { time: 7000, text: '¡Tu tribu está lista!' },
    ];

    // Configuración
    const PARTICLE_COUNT = 35000;
    const TOTAL_TIME = duration / 1000;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.003);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 10, 120);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Fondo de estrellas simple
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starsPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starsPositions[i] = (Math.random() - 0.5) * 1000;
      starsPositions[i + 1] = (Math.random() - 0.5) * 1000;
      starsPositions[i + 2] = (Math.random() - 0.5) * 1000;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Función para crear la forma del "Ente Tribal" (silueta humanoide)
    const createFaceTargets = (count: number) => {
      const vertices = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        let radius = 15;
        let yOffset = 0;

        if (phi < Math.PI * 0.6) {
          radius = 12 + Math.random() * 2;
          yOffset = 15;
        } else {
          radius = 20 + Math.random() * 5;
          yOffset = 0;
        }

        let x = radius * Math.sin(phi) * Math.cos(theta);
        let y = (radius * Math.cos(phi)) * 1.2 + yOffset;
        let z = radius * Math.sin(phi) * Math.sin(theta);

        x += (Math.random() - 0.5) * 1.5;
        y += (Math.random() - 0.5) * 1.5;
        z += (Math.random() - 0.5) * 1.5;

        vertices[i3] = x;
        vertices[i3 + 1] = y;
        vertices[i3 + 2] = z;
      }
      return vertices;
    };

    // Sistema de partículas
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const randomness = new Float32Array(PARTICLE_COUNT);
    const initialRadius = 200;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = initialRadius * Math.cbrt(Math.random());

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.cos(phi);
      positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      randomness[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomness, 1));
    geometry.setAttribute('targetPos', new THREE.BufferAttribute(createFaceTargets(PARTICLE_COUNT), 3));

    // Shaders
    const vertexShader = `
      uniform float uTime;
      uniform float uTornadoMix;
      uniform float uFaceMix;
      attribute float aRandom;
      attribute vec3 targetPos;
      varying vec3 vPos;
      varying float vRandom;

      vec3 rotateY(vec3 v, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return vec3(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
      }

      void main() {
        vRandom = aRandom;
        vec3 pos = position;

        float angleOffset = pos.y * 0.1 + uTime * (2.0 + aRandom);
        float radiusConstrict = smoothstep(-100.0, 50.0, pos.y);
        vec3 tornadoTarget = pos;
        tornadoTarget.x *= 0.1 + (1.0 - radiusConstrict) * 2.0;
        tornadoTarget.z *= 0.1 + (1.0 - radiusConstrict) * 2.0;
        tornadoTarget = rotateY(tornadoTarget, angleOffset);
        pos = mix(pos, tornadoTarget, uTornadoMix);

        vec3 noise = vec3(
          sin(uTime * 5.0 + position.x * 0.1),
          cos(uTime * 4.0 + position.y * 0.1),
          sin(uTime * 3.0 + position.z * 0.1)
        ) * (1.0 - uFaceMix) * 2.0;

        pos = mix(pos + noise, targetPos, uFaceMix);
        vPos = pos;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float size = 80.0 * (1.0 + uFaceMix * 0.5);
        gl_PointSize = size * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vPos;
      varying float vRandom;
      uniform float uFaceMix;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5, 0.5));
        if (dist > 0.5) discard;

        // Colores Tribu Impulsa: púrpura (#6161FF) y verde (#00CA72)
        vec3 colorScattered = vec3(0.38, 0.38, 1.0); // Púrpura
        vec3 colorMid = vec3(0.0, 0.79, 0.45); // Verde
        vec3 colorFace = mix(colorScattered, colorMid, vRandom);

        vec3 finalColor = mix(colorScattered, colorFace, uFaceMix);
        float alpha = smoothstep(0.5, 0.0, dist);

        gl_FragColor = vec4(finalColor, alpha * (0.6 + uFaceMix * 0.4));
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uTornadoMix: { value: 0 },
      uFaceMix: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Clock
    const clock = new THREE.Clock();
    let lastStatusIndex = -1;

    // Animation loop
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const elapsedMs = elapsedTime * 1000;

      // Actualizar texto de estado
      for (let i = statusMessages.length - 1; i >= 0; i--) {
        if (elapsedMs >= statusMessages[i].time && i !== lastStatusIndex) {
          setStatusText(statusMessages[i].text);
          lastStatusIndex = i;
          break;
        }
      }

      // Fase 1: Tornado (0s a 3.5s)
      uniforms.uTornadoMix.value = THREE.MathUtils.smoothstep(elapsedTime, 0.0, 3.5);

      // Fase 2: Morphing a ente (3.5s a 5.5s)
      uniforms.uFaceMix.value = THREE.MathUtils.smoothstep(elapsedTime, 3.5, 5.5);

      // Fase 3: Zoom (5.5s a 7.5s)
      if (elapsedTime > 5.5 && elapsedTime < TOTAL_TIME) {
        const zoomProgress = THREE.MathUtils.smoothstep(elapsedTime, 5.5, 7.5);
        camera.position.z = THREE.MathUtils.lerp(120, 45, zoomProgress);
        camera.position.y = THREE.MathUtils.lerp(10, 15, zoomProgress);
        camera.lookAt(0, 15, 0);
      }

      // Fase 4: Fade out (7s)
      if (elapsedTime > (TOTAL_TIME - 1)) {
        setFadeOut(true);
      }

      // Completar
      if (elapsedTime > TOTAL_TIME) {
        if (onComplete) onComplete();
        return;
      }

      uniforms.uTime.value = elapsedTime;
      particleSystem.rotation.y = elapsedTime * 0.05;
      stars.rotation.y = elapsedTime * 0.01;

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center">
      {/* Three.js container */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Overlay con texto */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none">
        {/* Logo / Título */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6161FF] to-[#00CA72] bg-clip-text text-transparent">
            Algoritmo Tribal X
          </h1>
          <p className="text-white/60 text-sm mt-1">Inteligencia de conexión</p>
        </div>
        
        {/* Estado actual */}
        <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
          <p className="text-white text-sm font-medium animate-pulse">
            {statusText}
          </p>
        </div>
      </div>
      
      {/* Fade overlay */}
      <div 
        className={`absolute inset-0 bg-[#F5F7FB] pointer-events-none transition-opacity duration-1000 ${
          fadeOut ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default CosmicLoadingAnimation;
