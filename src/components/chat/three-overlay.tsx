'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeOverlayProps {
  className?: string;
  autoRotate?: boolean;
  intensity?: number;
}

// const FALLBACK_GRADIENT =
//   'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.18), transparent 65%), radial-gradient(circle at 80% 30%, rgba(14,165,233,0.16), transparent 70%)';

export const ThreeOverlay = ({
  className,
  autoRotate = true,
  intensity = 1,
}: ThreeOverlayProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fallbackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') {
      return;
    }

    if (!window.WebGLRenderingContext) {
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const coreGeometry = new THREE.IcosahedronGeometry(6.2, 2);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.18 * intensity,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    const auraGeometry = new THREE.SphereGeometry(7.8, 48, 48);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08 * intensity,
      wireframe: false,
    });
    const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
    scene.add(auraMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55 * intensity);
    const highlightLight = new THREE.PointLight(0xf97316, 1.2 * intensity, 60);
    highlightLight.position.set(9, 12, 14);
    scene.add(ambientLight, highlightLight);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 160;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 9 * Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[index * 3 + 2] = radius * Math.cos(phi);
    }
    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.16,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let animationFrame = 0;

    const handleResize = () => {
      if (!container) return;
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      if (autoRotate) {
        coreMesh.rotation.x += 0.0028;
        coreMesh.rotation.y += 0.0032;
        particles.rotation.y -= 0.0015;
        auraMesh.rotation.z += 0.0012;
      }
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', handleResize);
    fallbackRef.current?.classList.add('opacity-40');

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      auraGeometry.dispose();
      auraMaterial.dispose();
      ambientLight.dispose?.();
      highlightLight.dispose?.();
      if (renderer.domElement.parentNode === container) {
        renderer.domElement.remove();
      }
      fallbackRef.current?.classList.remove('opacity-40');
    };
  }, [autoRotate, intensity]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen',
        className
      )}
      aria-hidden
    >
      <div
        ref={fallbackRef}
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_60%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.14),transparent_70%)] blur-3xl transition-opacity duration-700"
      />
    </div>
  );
};
