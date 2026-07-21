"use client";
import { useEffect, useRef } from "react";

/**
 * Fondo 3D con Three.js: un campo de partículas neón con profundidad,
 * deriva lenta, rotación sutil y parallax según el ratón.
 * Three.js se carga dinámicamente dentro de useEffect (solo cliente),
 * evitando cualquier problema de SSR en Next.js.
 */
export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Respeta a quien prefiere menos movimiento: escena estática.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer;
    let frameId;
    let disposed = false;
    // Guardamos la limpieza real una vez que three termina de cargar.
    let cleanup = () => {};

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    import("three").then((THREE) => {
      // El componente pudo desmontarse mientras cargaba el módulo.
      if (disposed || !mountRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        2000
      );
      camera.position.z = 500;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0); // transparente: deja ver el fondo negro
      mount.appendChild(renderer.domElement);

      // --- Campo de partículas ---
      const COUNT = 1400;
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);

      const neon = new THREE.Color(0x39ff14);
      const blue = new THREE.Color(0x3b82f6);

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 1600;
        positions[i3 + 1] = (Math.random() - 0.5) * 1600;
        positions[i3 + 2] = (Math.random() - 0.5) * 1600;

        // Mezcla de verde neón y azul para combinar con la estética del sitio.
        const c = Math.random() > 0.75 ? blue : neon;
        colors[i3] = c.r;
        colors[i3 + 1] = c.g;
        colors[i3 + 2] = c.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);
      if (!reduceMotion) window.addEventListener("pointermove", onPointerMove);

      const clock = new THREE.Clock();
      const render = () => {
        const t = clock.getElapsedTime();
        points.rotation.y = t * 0.04;
        points.rotation.x = t * 0.015;

        // Parallax suave hacia la posición del ratón.
        camera.position.x += (pointer.x * 60 - camera.position.x) * 0.03;
        camera.position.y += (-pointer.y * 60 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      };

      if (reduceMotion) {
        render(); // un solo frame estático
      } else {
        const animate = () => {
          render();
          frameId = requestAnimationFrame(animate);
        };
        animate();
      }

      cleanup = () => {
        if (frameId) cancelAnimationFrame(frameId);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
    />
  );
}
