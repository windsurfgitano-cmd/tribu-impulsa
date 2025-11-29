import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CosmicLoadingAnimationProps {
  onComplete?: () => void;
  duration?: number;
}

// Detectar móvil para ajustar rendimiento
const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const CosmicLoadingAnimation: React.FC<CosmicLoadingAnimationProps> = ({ 
  onComplete, 
  duration = 8000 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [statusText, setStatusText] = useState('Conectando con tu tribu...');
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    particles: THREE.Points;
    stars: THREE.Points;
    uniforms: Record<string, { value: number }>;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const TOTAL_TIME = duration / 1000;
    
    // Ajustar partículas según dispositivo
    const PARTICLE_COUNT = isMobile ? 15000 : 30000;
    const STAR_COUNT = isMobile ? 500 : 1500;

    // Mensajes de estado
    const statusMessages = [
      { time: 0, text: 'Conectando con tu tribu...', progress: 0 },
      { time: 1000, text: 'Escaneando la red de emprendedores...', progress: 15 },
      { time: 2000, text: 'Analizando perfiles compatibles...', progress: 30 },
      { time: 3500, text: 'Calculando afinidades empresariales...', progress: 50 },
      { time: 5000, text: 'Formando conexiones estratégicas...', progress: 70 },
      { time: 6500, text: 'Optimizando tu tribu 10+10...', progress: 85 },
      { time: 7500, text: '¡Tu tribu está lista!', progress: 100 },
    ];

    // ============ SCENE SETUP ============
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      1,
      1000
    );
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x0a0a0f, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ============ ESTRELLAS DE FONDO ============
    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(STAR_COUNT * 3);
    const starsSizes = new Float32Array(STAR_COUNT);
    
    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      starsPositions[i3] = (Math.random() - 0.5) * 600;
      starsPositions[i3 + 1] = (Math.random() - 0.5) * 600;
      starsPositions[i3 + 2] = (Math.random() - 0.5) * 400 - 100;
      starsSizes[i] = Math.random() * 2 + 0.5;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starsSizes, 1));
    
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ============ SISTEMA DE PARTÍCULAS PRINCIPAL ============
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const targets = new Float32Array(PARTICLE_COUNT * 3);

    // Colores Tribu
    const colorPurple = new THREE.Color(0x6161FF);
    const colorGreen = new THREE.Color(0x00CA72);
    const colorCyan = new THREE.Color(0x00D4FF);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Posición inicial: esfera grande dispersa
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 80 + Math.random() * 120;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.cos(phi);
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      // Posición objetivo: forma de esfera compacta (logo tribal)
      const targetRadius = 20 + Math.random() * 15;
      targets[i3] = targetRadius * Math.sin(phi) * Math.cos(theta);
      targets[i3 + 1] = targetRadius * Math.cos(phi);
      targets[i3 + 2] = targetRadius * Math.sin(phi) * Math.sin(theta);
      
      // Colores mezclados
      const colorMix = Math.random();
      const color = colorMix < 0.4 ? colorPurple : colorMix < 0.7 ? colorGreen : colorCyan;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      sizes[i] = Math.random() * 3 + 1;
      randoms[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targets, 3));

    // Shader optimizado
    const vertexShader = `
      uniform float uTime;
      uniform float uProgress;
      uniform float uSize;
      
      attribute float size;
      attribute float aRandom;
      attribute vec3 targetPosition;
      attribute vec3 color;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        vColor = color;
        
        // Interpolación suave hacia el objetivo
        float progress = smoothstep(0.0, 1.0, uProgress);
        
        // Movimiento en espiral durante la transición
        float angle = uTime * (1.0 + aRandom) + aRandom * 6.28;
        float spiralRadius = (1.0 - progress) * 20.0 * aRandom;
        
        vec3 spiral = vec3(
          cos(angle) * spiralRadius,
          sin(angle * 0.5) * spiralRadius * 0.5,
          sin(angle) * spiralRadius
        );
        
        // Posición final
        vec3 finalPos = mix(position + spiral, targetPosition, progress);
        
        // Pulso de energía
        float pulse = sin(uTime * 3.0 + aRandom * 6.28) * 0.1 + 1.0;
        finalPos *= pulse;
        
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        
        // Tamaño con perspectiva
        float sizeScale = uSize * size * (1.0 + progress * 0.5);
        gl_PointSize = sizeScale * (300.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.0, 20.0);
        
        gl_Position = projectionMatrix * mvPosition;
        
        // Alpha basado en distancia y progreso
        vAlpha = 0.6 + progress * 0.4;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        // Partícula circular con glow
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
        
        // Brillo en el centro
        float glow = smoothstep(0.3, 0.0, dist);
        vec3 finalColor = vColor + vec3(glow * 0.3);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSize: { value: isMobile ? 0.8 : 1.0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const particles = new THREE.Points(geometry, material);
    particles.frustumCulled = false;
    scene.add(particles);

    // Guardar referencias
    sceneRef.current = { scene, camera, particles, stars, uniforms };

    // ============ ANIMATION LOOP ============
    const clock = new THREE.Clock();
    let lastMessageIndex = -1;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const elapsedMs = elapsed * 1000;

      // Actualizar mensajes y progreso
      for (let i = statusMessages.length - 1; i >= 0; i--) {
        if (elapsedMs >= statusMessages[i].time && i !== lastMessageIndex) {
          setStatusText(statusMessages[i].text);
          setProgress(statusMessages[i].progress);
          lastMessageIndex = i;
          break;
        }
      }

      // Progreso de animación (0 a 1)
      const animProgress = Math.min(elapsed / (TOTAL_TIME * 0.8), 1);
      uniforms.uProgress.value = animProgress;
      uniforms.uTime.value = elapsed;

      // Rotación suave del sistema
      particles.rotation.y = elapsed * 0.1;
      particles.rotation.x = Math.sin(elapsed * 0.2) * 0.1;
      
      // Estrellas se mueven lento
      stars.rotation.y = elapsed * 0.02;
      stars.rotation.z = elapsed * 0.01;

      // Zoom de cámara al final
      if (elapsed > TOTAL_TIME * 0.7) {
        const zoomProgress = (elapsed - TOTAL_TIME * 0.7) / (TOTAL_TIME * 0.3);
        camera.position.z = THREE.MathUtils.lerp(100, 60, Math.min(zoomProgress, 1));
      }

      // Fade out cerca del final
      if (elapsed > TOTAL_TIME - 1) {
        setFadeOut(true);
      }

      // Completar
      if (elapsed >= TOTAL_TIME) {
        if (onComplete) onComplete();
        return;
      }

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      geometry.dispose();
      material.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[99999] bg-[#0a0a0f]">
      {/* Canvas Three.js */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mb-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#6161FF] to-[#00CA72] p-[2px] animate-pulse">
              <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6161FF] via-[#00CA72] to-[#6161FF] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
            Algoritmo Tribal X
          </h1>
          <p className="text-white/50 text-xs mt-1 tracking-wider uppercase">
            Inteligencia de Conexión
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="w-64 mb-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Status text */}
        <div className="bg-white/5 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10">
          <p className="text-white/80 text-sm font-medium">
            {statusText}
          </p>
        </div>
      </div>
      
      {/* Fade overlay */}
      <div 
        className={`absolute inset-0 bg-[#F5F7FB] pointer-events-none transition-opacity duration-700 ${
          fadeOut ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* CSS para animación de gradiente */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default CosmicLoadingAnimation;
