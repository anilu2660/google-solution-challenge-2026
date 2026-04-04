import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* Google brand colors */
const G_DARK  = [0x4285F4, 0xEA4335, 0xFBBC05, 0x34A853]; // vivid for dark bg
const G_LIGHT = [0x1a73e8, 0xd93025, 0xf9ab00, 0x188038]; // slightly deeper for light bg

const ParticleBackground = ({ isDark = true }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const colors = isDark ? G_DARK : G_LIGHT;
    const ptOpacity  = isDark ? 0.55 : 0.35;   // lighter on white bg
    const lineOpacity = isDark ? 0.05 : 0.08;  // lines more visible on light bg
    const ptSize      = isDark ? 1.2 : 1.0;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0); // always transparent — underlying bg shows through
    mount.appendChild(renderer.domElement);

    // ── Particles — one group per Google color ────────────────────────────────
    const PER_COLOR = 18;  // 18 × 4 = 72 total
    const allGroups = [];

    colors.forEach(color => {
      const pos = new Float32Array(PER_COLOR * 3);
      const vel = new Float32Array(PER_COLOR * 3);

      for (let i = 0; i < PER_COLOR; i++) {
        pos[i*3]   = (Math.random() - 0.5) * 200;
        pos[i*3+1] = (Math.random() - 0.5) * 120;
        pos[i*3+2] = (Math.random() - 0.5) * 40;
        vel[i*3]   = (Math.random() - 0.5) * 0.042;
        vel[i*3+1] = (Math.random() - 0.5) * 0.028;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color, size: ptSize, transparent: true, opacity: ptOpacity });
      scene.add(new THREE.Points(geo, mat));
      allGroups.push({ geo, mat, pos, vel });
    });

    // ── Pre-allocated LineSegments ─────────────────────────────────────────────
    const TOTAL   = PER_COLOR * 4;
    const MAX_SEG = TOTAL * TOTAL;
    const lineBuf = new Float32Array(MAX_SEG * 6);
    const lineGeo = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(lineBuf, 3);
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute('position', linePosAttr);
    lineGeo.setDrawRange(0, 0);

    const lineMesh = new THREE.LineSegments(lineGeo,
      new THREE.LineBasicMaterial({ color: colors[0], transparent: true, opacity: lineOpacity })
    );
    scene.add(lineMesh);

    const MAX_DIST_SQ = 30 * 30;

    const updateLines = () => {
      const all = allGroups.flatMap(g => Array.from(g.pos));
      let seg = 0;
      for (let i = 0; i < TOTAL; i++) {
        for (let j = i + 1; j < TOTAL; j++) {
          const dx = all[i*3] - all[j*3], dy = all[i*3+1] - all[j*3+1];
          if (dx*dx + dy*dy < MAX_DIST_SQ) {
            lineBuf[seg*6]   = all[i*3];   lineBuf[seg*6+1] = all[i*3+1]; lineBuf[seg*6+2] = all[i*3+2];
            lineBuf[seg*6+3] = all[j*3];   lineBuf[seg*6+4] = all[j*3+1]; lineBuf[seg*6+5] = all[j*3+2];
            if (++seg >= MAX_SEG - 1) { i = TOTAL; break; }
          }
        }
      }
      linePosAttr.needsUpdate = true;
      lineGeo.setDrawRange(0, seg * 2);
    };

    // ── Animate ────────────────────────────────────────────────────────────────
    let frameId, tick = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      tick++;

      allGroups.forEach(({ pos, vel, geo }) => {
        for (let i = 0; i < PER_COLOR; i++) {
          pos[i*3]   += vel[i*3];
          pos[i*3+1] += vel[i*3+1];
          if (pos[i*3]   >  100) pos[i*3]   = -100;
          if (pos[i*3]   < -100) pos[i*3]   =  100;
          if (pos[i*3+1] >   60) pos[i*3+1] =  -60;
          if (pos[i*3+1] <  -60) pos[i*3+1] =   60;
        }
        geo.attributes.position.needsUpdate = true;
      });

      if (tick % 4 === 0) updateLines();

      // Cycle line color through Google colors every ~2s
      lineMesh.material.color.set(colors[Math.floor(tick / 120) % 4]);

      camera.position.x = Math.sin(tick * 0.0008) * 4;
      camera.position.y = Math.cos(tick * 0.0006) * 2.5;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ────────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      allGroups.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
      lineGeo.dispose();
      lineMesh.material.dispose();
      renderer.dispose();
      if (mount?.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [isDark]); // re-run when theme changes

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', overflow: 'hidden',
      }}
    />
  );
};

export default ParticleBackground;
