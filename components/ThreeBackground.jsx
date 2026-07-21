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

    // Detecta pantallas pequeñas para bajar la carga en móviles.
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const pointer = { x: 0, y: 0 };
    const setPointerFrom = (clientX, clientY) => {
      pointer.x = (clientX / window.innerWidth) * 2 - 1;
      pointer.y = (clientY / window.innerHeight) * 2 - 1;
    };
    const onPointerMove = (e) => setPointerFrom(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) setPointerFrom(t.clientX, t.clientY);
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

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
      // Menor pixelRatio en móvil para no exigir de más a la GPU.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0); // transparente: deja ver el fondo/rejilla detrás
      renderer.domElement.style.display = "block";
      mount.appendChild(renderer.domElement);

      // Sprite de punto suave (degradado radial) generado en runtime.
      // Evita el cuadrado por defecto y, con NormalBlending, se compositan
      // correctamente sobre un canvas transparente también en GPUs móviles
      // (AdditiveBlending sobre alpha suele salir invisible en móvil).
      const makeDotTexture = () => {
        const size = 64;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d");
        const g = ctx.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2
        );
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.4, "rgba(255,255,255,0.6)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };
      const dotTexture = makeDotTexture();

      // --- Campo de partículas (menos densidad en móvil) ---
      const COUNT = isMobile ? 650 : 1400;
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
        // Partículas algo más grandes en móvil para que se aprecien.
        size: isMobile ? 9 : 7,
        map: dotTexture,
        alphaMap: dotTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.NormalBlending,
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
      if (!reduceMotion) {
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("touchmove", onTouchMove, { passive: true });
      }

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
        window.removeEventListener("touchmove", onTouchMove);
        geometry.dispose();
        material.dispose();
        dotTexture.dispose();
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
