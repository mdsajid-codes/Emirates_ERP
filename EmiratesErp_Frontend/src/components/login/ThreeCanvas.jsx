import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas({ activeSlideIndex, loginTheme }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const currentObjectsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  const hexToNum = (hexStr) => {
    if (!hexStr) return 0x5eead4;
    return parseInt(hexStr.replace('#', ''), 16);
  };

  const animPrimary = hexToNum(loginTheme?.animPrimary);
  const animSecondary = hexToNum(loginTheme?.animSecondary);
  const animAccent = hexToNum(loginTheme?.animAccent);
  const animLight = hexToNum(loginTheme?.animLight);
  const animGlow = hexToNum(loginTheme?.animGlow);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 500;
    const h = container.clientHeight || 600;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const pl1 = new THREE.PointLight(animPrimary, 5.5, 80);
    pl1.position.set(8, 8, 8);
    scene.add(pl1);

    const pl2 = new THREE.PointLight(animAccent, 5.5, 80);
    pl2.position.set(-8, -8, 8);
    scene.add(pl2);

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (!nw || !nh) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const resizeObs = new ResizeObserver(onResize);
    resizeObs.observe(container);
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();

    const tick = () => {
      animFrameRef.current = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      camera.position.x += (mouseRef.current.x * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseRef.current.y * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      currentObjectsRef.current.forEach((obj) => {
        if (typeof obj.userData.animate === 'function') {
          obj.userData.animate(t);
        }
      });

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      resizeObs.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [animPrimary, animAccent]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    currentObjectsRef.current.forEach((obj) => {
      scene.remove(obj);
      obj.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
    });
    currentObjectsRef.current = [];

    // SLIDE 0 — HR & Workforce Org-Chart Mesh Network
    if (activeSlideIndex === 0) {
      const group = new THREE.Group();

      const hubMat = new THREE.MeshStandardMaterial({
        color: animPrimary,
        emissive: animPrimary,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const hubNode = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), hubMat);
      group.add(hubNode);

      const nodeCount = 10;
      const nodes = [];
      const lineGeom = new THREE.BufferGeometry();
      const linePositions = new Float32Array(nodeCount * 6);

      for (let i = 0; i < nodeCount; i++) {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 16, 16),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? animSecondary : animAccent,
            emissive: animSecondary,
            emissiveIntensity: 0.8,
          })
        );
        group.add(node);
        nodes.push({
          mesh: node,
          angle: (i / nodeCount) * Math.PI * 2,
          radius: 2.2 + (i % 3) * 0.3,
          speed: 0.4 + (i % 3) * 0.1,
          yOffset: (i % 2 === 0 ? 1 : -1) * 0.5,
        });
      }

      const lineMat = new THREE.LineBasicMaterial({ color: animLight, transparent: true, opacity: 0.8 });
      const connectionLines = new THREE.LineSegments(lineGeom, lineMat);
      group.add(connectionLines);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3.2, 0.03, 16, 100),
        new THREE.MeshBasicMaterial({ color: animAccent, transparent: true, opacity: 0.6 })
      );
      ring.rotation.x = Math.PI / 3;
      group.add(ring);

      group.userData.animate = (t) => {
        hubNode.rotation.x = t * 0.3;
        hubNode.rotation.y = t * 0.5;
        ring.rotation.z = -t * 0.3;

        nodes.forEach((n, idx) => {
          const a = n.angle + t * n.speed;
          const x = Math.cos(a) * n.radius;
          const y = Math.sin(t * 1.5 + idx) * 0.3 + n.yOffset;
          const z = Math.sin(a) * n.radius;
          n.mesh.position.set(x, y, z);

          linePositions[idx * 6] = 0;
          linePositions[idx * 6 + 1] = 0;
          linePositions[idx * 6 + 2] = 0;
          linePositions[idx * 6 + 3] = x;
          linePositions[idx * 6 + 4] = y;
          linePositions[idx * 6 + 5] = z;
        });

        lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeom.attributes.position.needsUpdate = true;
      };

      scene.add(group);
      currentObjectsRef.current.push(group);
    }

    // SLIDE 1 — Finance & Accounting Dynamic Bar Chart & Coin Discs
    else if (activeSlideIndex === 1) {
      const group = new THREE.Group();

      const chartGroup = new THREE.Group();
      const bars = [];
      const barCount = 5;
      const barSpacing = 0.7;

      for (let i = 0; i < barCount; i++) {
        const height = 1.0 + i * 0.45;
        const barMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 1, 0.4),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? animPrimary : animAccent,
            emissive: animPrimary,
            emissiveIntensity: 0.5,
            metalness: 0.7,
          })
        );
        barMesh.position.x = (i - (barCount - 1) / 2) * barSpacing;
        barMesh.position.y = -1;
        chartGroup.add(barMesh);
        bars.push({ mesh: barMesh, targetHeight: height, phase: i * 0.8 });
      }
      group.add(chartGroup);

      const coinCount = 6;
      const coins = [];
      for (let i = 0; i < coinCount; i++) {
        const coin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.06, 24),
          new THREE.MeshStandardMaterial({
            color: animSecondary,
            emissive: animSecondary,
            emissiveIntensity: 0.8,
            metalness: 0.9,
          })
        );
        group.add(coin);
        coins.push({
          mesh: coin,
          angle: (i / coinCount) * Math.PI * 2,
          radius: 2.5,
          speed: 0.6,
        });
      }

      group.userData.animate = (t) => {
        bars.forEach((b) => {
          const dynamicScale = b.targetHeight + Math.sin(t * 2 + b.phase) * 0.3;
          b.mesh.scale.set(1, Math.max(0.2, dynamicScale), 1);
          b.mesh.position.y = -1.2 + dynamicScale / 2;
        });

        coins.forEach((c) => {
          const a = c.angle + t * c.speed;
          c.mesh.position.set(Math.cos(a) * c.radius, 1.2 + Math.sin(a * 2) * 0.3, Math.sin(a) * c.radius);
          c.mesh.rotation.x = t * 2;
          c.mesh.rotation.y = t * 3;
        });

        chartGroup.rotation.y = t * 0.3;
      };

      scene.add(group);
      currentObjectsRef.current.push(group);
    }

    // SLIDE 2 — Supply Chain Logistics & Cargo Arc Animation
    else if (activeSlideIndex === 2) {
      const group = new THREE.Group();

      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 20, 20),
        new THREE.MeshStandardMaterial({
          color: animAccent,
          emissive: animPrimary,
          emissiveIntensity: 0.5,
          wireframe: true,
        })
      );
      group.add(globe);

      const cargoCount = 8;
      const cargos = [];
      for (let i = 0; i < cargoCount; i++) {
        const cargoBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.25, 0.25),
          new THREE.MeshStandardMaterial({
            color: animSecondary,
            emissive: animSecondary,
            emissiveIntensity: 0.9,
          })
        );
        group.add(cargoBox);
        cargos.push({
          mesh: cargoBox,
          speed: 0.5 + i * 0.1,
          radius: 2.5 + (i % 3) * 0.3,
          orbitTilt: (i * Math.PI) / 4,
        });
      }

      group.userData.animate = (t) => {
        globe.rotation.y = t * 0.25;
        cargos.forEach((c) => {
          const a = t * c.speed;
          const x = Math.cos(a) * c.radius;
          const y = Math.sin(a) * Math.sin(c.orbitTilt) * c.radius;
          const z = Math.sin(a) * Math.cos(c.orbitTilt) * c.radius;
          c.mesh.position.set(x, y, z);
          c.mesh.rotation.x = t * 1.5;
          c.mesh.rotation.y = t * 1.5;
        });
      };

      scene.add(group);
      currentObjectsRef.current.push(group);
    }

    // SLIDE 3 — CRM Sales Funnel & Deal Intelligence Gems
    else if (activeSlideIndex === 3) {
      const group = new THREE.Group();

      const funnelMat = new THREE.MeshStandardMaterial({
        color: animAccent,
        emissive: animPrimary,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        wireframe: true,
      });

      const topCone = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.4, 16, 1, true), funnelMat);
      topCone.position.y = 0.8;
      topCone.rotation.x = Math.PI;
      group.add(topCone);

      const midCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.3, 1.2, 16, 1, true), funnelMat);
      midCylinder.position.y = -0.3;
      group.add(midCylinder);

      const pCount = 120;
      const pPositions = new Float32Array(pCount * 3);
      const pSpeeds = [];

      for (let i = 0; i < pCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 1.6;
        pPositions[i * 3 + 1] = Math.random() * 2.5 - 0.5;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
        pSpeeds.push(0.02 + Math.random() * 0.03);
      }

      const pGeom = new THREE.BufferGeometry();
      pGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const leadParticles = new THREE.Points(
        pGeom,
        new THREE.PointsMaterial({
          size: 0.08,
          color: animLight,
          transparent: true,
          opacity: 0.9,
        })
      );
      group.add(leadParticles);

      const dealCount = 6;
      const dealGems = [];
      for (let i = 0; i < dealCount; i++) {
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.25, 0),
          new THREE.MeshStandardMaterial({
            color: animSecondary,
            emissive: animSecondary,
            emissiveIntensity: 0.9,
          })
        );
        group.add(gem);
        dealGems.push({
          mesh: gem,
          angle: (i / dealCount) * Math.PI * 2,
          radius: 2.6,
          speed: 0.7,
        });
      }

      group.userData.animate = (t) => {
        topCone.rotation.y = t * 0.5;
        midCylinder.rotation.y = -t * 0.5;

        const positions = pGeom.attributes.position.array;
        for (let i = 0; i < pCount; i++) {
          positions[i * 3 + 1] -= pSpeeds[i];
          if (positions[i * 3 + 1] < -1.2) {
            positions[i * 3 + 1] = 1.6;
            positions[i * 3] = (Math.random() - 0.5) * 1.6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
          }
        }
        pGeom.attributes.position.needsUpdate = true;

        dealGems.forEach((d) => {
          const a = d.angle + t * d.speed;
          d.mesh.position.set(Math.cos(a) * d.radius, -1.0 + Math.sin(a) * 0.4, Math.sin(a) * d.radius);
          d.mesh.rotation.x = t * 2;
          d.mesh.rotation.y = t * 2;
        });
      };

      scene.add(group);
      currentObjectsRef.current.push(group);
    }
  }, [activeSlideIndex, animPrimary, animSecondary, animAccent, animLight]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
