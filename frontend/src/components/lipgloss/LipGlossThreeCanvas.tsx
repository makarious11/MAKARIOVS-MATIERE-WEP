'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Move3d } from 'lucide-react';
import { LIP_GLOSS_SHADES } from './LipGloss3DBottle';

interface LipGlossThreeCanvasProps {
  activeShadeId: string;
  isOpenWand?: boolean;
  onToggleOpenWand?: () => void;
  scrollY?: number;
  className?: string;
  isArabic?: boolean;
}

export const LipGlossThreeCanvas: React.FC<LipGlossThreeCanvasProps> = ({
  activeShadeId,
  isOpenWand = false,
  onToggleOpenWand,
  scrollY = 0,
  className = '',
  isArabic = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const currentShade = LIP_GLOSS_SHADES.find((s) => s.id === activeShadeId) || LIP_GLOSS_SHADES[1];

  const [hasInteracted, setHasInteracted] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bottleGroupRef = useRef<THREE.Group | null>(null);
  const liquidMatsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const capGroupRef = useRef<THREE.Group | null>(null);
  const wandGroupRef = useRef<THREE.Group | null>(null);
  const dropletMeshRef = useRef<THREE.Mesh | null>(null);
  const bottomGlowRef = useRef<THREE.PointLight | null>(null);
  const targetColorRef = useRef(new THREE.Color(currentShade.hex));

  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const manualRotRef = useRef({ x: 0, y: 0 });
  const mouseTiltRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    targetColorRef.current.set(currentShade.hex);
  }, [currentShade.hex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─────────────────── SCENE ────────────────────────────────────────
    const scene = new THREE.Scene();
    const W = container.clientWidth || 400;
    const H = container.clientHeight || 560;

    // ─────────────────── CAMERA ───────────────────────────────────────
    // Narrow FOV, pulled back to show full slim bottle without distortion
    const camera = new THREE.PerspectiveCamera(26, W / H, 0.1, 100);
    camera.position.set(0, 0.4, 9.2);

    // ─────────────────── RENDERER ─────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ─────────────────── LIGHTING ─────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));

    const keyL = new THREE.DirectionalLight(0xfff8f2, 3.0);
    keyL.position.set(3.5, 6, 5);
    keyL.castShadow = true;
    scene.add(keyL);

    const rimL = new THREE.DirectionalLight(0xffe0ea, 2.4);
    rimL.position.set(-4, 4, -5);
    scene.add(rimL);

    const fillL = new THREE.DirectionalLight(0xffffff, 1.0);
    fillL.position.set(0, 0, 6);
    scene.add(fillL);

    const topL = new THREE.DirectionalLight(0xffffff, 0.9);
    topL.position.set(0, 7, 2);
    scene.add(topL);

    const bottomGlow = new THREE.PointLight(new THREE.Color(currentShade.hex), 2.8, 12);
    bottomGlow.position.set(0, -5, 3);
    bottomGlowRef.current = bottomGlow;
    scene.add(bottomGlow);

    // ─────────────────── MASTER GROUP ─────────────────────────────────
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    bottleGroupRef.current = masterGroup;

    // ─────────────────── SHARED MATERIALS ─────────────────────────────

    // Clear acrylic / heavy crystal glass for outer case
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8f8f8,
      transmission: 0.97,
      opacity: 1,
      transparent: true,
      roughness: 0.025,
      ior: 1.50,
      reflectivity: 0.98,
      thickness: 0.7,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      specularIntensity: 1.0,
    });

    // Chrome collar
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xc8c8c8,
      metalness: 0.95,
      roughness: 0.08,
    });

    // Inner gloss liquid material (the colorful part)
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentShade.hex),
      emissive: new THREE.Color(currentShade.hex),
      emissiveIntensity: 0.10,
      roughness: 0.07,
      metalness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      transmission: 0.10,
      opacity: 0.98,
      transparent: true,
      ior: 1.47,
    });
    liquidMatsRef.current = [liquidMat];

    // ══════════════════════════════════════════════════════════════════
    // A. BODY OUTER CASE
    //    Slim rectangular transparent acrylic tube
    //    Reference: square cross-section, tall and slender
    //    Width=1.0, Depth=0.95, Height=4.5
    //    Y center = -0.85 → bottom y=-3.1, top y=1.4
    // ══════════════════════════════════════════════════════════════════
    const bodyGeo = new THREE.BoxGeometry(1.0, 4.5, 0.95, 1, 1, 1);
    masterGroup.add(new THREE.Mesh(bodyGeo, crystalMat));
    // Position y default = 0, we'll offset the whole group instead

    // Solid base plate at the very bottom (thicker to suggest weight)
    const basePlateGeo = new THREE.BoxGeometry(1.0, 0.22, 0.95);
    const basePlateMesh = new THREE.Mesh(basePlateGeo, crystalMat);
    basePlateMesh.position.y = -2.36;
    masterGroup.add(basePlateMesh);

    // ══════════════════════════════════════════════════════════════════
    // B. INNER GLOSS VIAL — the pill/capsule shape inside the case
    //    This is the main colored element. Rounded cylinder.
    //    Diameter ~0.64, sits in BOTTOM portion of the body case.
    //    The vial extends from y=-2.1 (bottom rounded) to y=0.3 (top dome)
    // ══════════════════════════════════════════════════════════════════

    // Main cylinder body
    const vialCylGeo = new THREE.CylinderGeometry(0.32, 0.32, 2.2, 36);
    const vialCylMesh = new THREE.Mesh(vialCylGeo, liquidMat);
    vialCylMesh.position.y = -1.0; // center of cylinder
    masterGroup.add(vialCylMesh);

    // Rounded dome TOP of vial
    const vialTopGeo = new THREE.SphereGeometry(0.32, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    const vialTopMesh = new THREE.Mesh(vialTopGeo, liquidMat);
    vialTopMesh.position.y = 0.1; // top cap
    masterGroup.add(vialTopMesh);

    // Rounded dome BOTTOM of vial
    const vialBotGeo = new THREE.SphereGeometry(0.32, 36, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const vialBotMesh = new THREE.Mesh(vialBotGeo, liquidMat);
    vialBotMesh.position.y = -2.1; // bottom cap
    masterGroup.add(vialBotMesh);

    // ══════════════════════════════════════════════════════════════════
    // C. L'VENUS LOGO — embossed on front of inner vial
    // ══════════════════════════════════════════════════════════════════
    const lc = document.createElement('canvas');
    lc.width = 512; lc.height = 1024;
    const lctx = lc.getContext('2d')!;
    lctx.clearRect(0, 0, 512, 1024);
    lctx.fillStyle = 'rgba(255,255,255,0.90)';
    lctx.textAlign = 'center';
    // Brand name
    lctx.font = 'italic 56px "Cormorant Garamond", Georgia, serif';
    lctx.fillText("L'VENUS", 256, 530);
    // Fine hairline above/below
    lctx.strokeStyle = 'rgba(255,255,255,0.65)';
    lctx.lineWidth = 2;
    lctx.beginPath(); lctx.moveTo(175, 492); lctx.lineTo(337, 492); lctx.stroke();
    lctx.beginPath(); lctx.moveTo(195, 565); lctx.lineTo(317, 565); lctx.stroke();

    const labelTex = new THREE.CanvasTexture(lc);
    const labelGeo = new THREE.PlaneGeometry(0.56, 2.0);
    const labelMesh = new THREE.Mesh(labelGeo, new THREE.MeshBasicMaterial({
      map: labelTex, transparent: true, opacity: 0.92, depthWrite: false,
    }));
    labelMesh.position.set(0, -1.0, 0.33);
    masterGroup.add(labelMesh);

    // ══════════════════════════════════════════════════════════════════
    // D. NECK COLLAR — chrome ring between body top and cap
    //    At y = 1.4 (top of body case)
    // ══════════════════════════════════════════════════════════════════
    const collarGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.22, 36);
    const collarMesh = new THREE.Mesh(collarGeo, chromeMat);
    collarMesh.position.y = 1.42;
    masterGroup.add(collarMesh);

    // Inner wiper ring (white silicone look)
    const wiperGeo = new THREE.TorusGeometry(0.3, 0.038, 12, 32);
    const wiperMat = new THREE.MeshStandardMaterial({ color: 0xeeeae5, roughness: 0.5 });
    const wiperMesh = new THREE.Mesh(wiperGeo, wiperMat);
    wiperMesh.rotation.x = Math.PI / 2;
    wiperMesh.position.y = 1.56;
    masterGroup.add(wiperMesh);

    // ══════════════════════════════════════════════════════════════════
    // E. CAP GROUP
    //    - Square transparent acrylic cap (same width as body case)
    //    - Ornate decorative sculptural topper on top
    //    Cap body: Width=1.0, Depth=0.95, Height=2.5
    //    Center y = 2.9 → bottom y=1.65, top y=4.15
    // ══════════════════════════════════════════════════════════════════
    const capGroup = new THREE.Group();
    capGroupRef.current = capGroup;

    const capCaseGeo = new THREE.BoxGeometry(1.0, 2.5, 0.95, 1, 1, 1);
    const capCaseMesh = new THREE.Mesh(capCaseGeo, crystalMat);
    capCaseMesh.position.y = 2.9;
    capGroup.add(capCaseMesh);

    // ── DECORATIVE CAP TOPPER ──────────────────────────────────────────
    // Based on reference: a clear acrylic sculptural floral/rose cameo figure
    // that sits prominently on top of the square cap
    const topperMat = new THREE.MeshPhysicalMaterial({
      color: 0xfafafa,
      transmission: 0.88,
      roughness: 0.07,
      ior: 1.50,
      thickness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      transparent: true,
    });

    // Topper base disc (transitions from square cap top to round topper)
    const tBaseGeo = new THREE.CylinderGeometry(0.45, 0.46, 0.14, 36);
    const tBaseMesh = new THREE.Mesh(tBaseGeo, topperMat);
    tBaseMesh.position.y = 4.22;
    capGroup.add(tBaseMesh);

    // Lower ring / skirt of topper
    const tSkirtGeo = new THREE.TorusGeometry(0.34, 0.07, 12, 32);
    const tSkirtMesh = new THREE.Mesh(tSkirtGeo, topperMat);
    tSkirtMesh.position.y = 4.35;
    capGroup.add(tSkirtMesh);

    // Middle organic bulb
    const tBulbGeo = new THREE.SphereGeometry(0.3, 32, 24);
    tBulbGeo.scale(1, 1.1, 1);
    const tBulbMesh = new THREE.Mesh(tBulbGeo, topperMat);
    tBulbMesh.position.y = 4.72;
    capGroup.add(tBulbMesh);

    // Rose petals — 5 organic lobes around the central bulb
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.14, 16, 10);
      petalGeo.scale(0.7, 1.5, 0.65);
      const petalMesh = new THREE.Mesh(petalGeo, topperMat);
      const r = 0.28;
      petalMesh.position.set(Math.cos(angle) * r, 4.55, Math.sin(angle) * r);
      petalMesh.lookAt(new THREE.Vector3(0, 4.55, 0));
      capGroup.add(petalMesh);
    }

    // Inner rose petals (second layer, rotated offset)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + Math.PI / 5;
      const petalGeo = new THREE.SphereGeometry(0.1, 12, 8);
      petalGeo.scale(0.65, 1.3, 0.6);
      const petalMesh = new THREE.Mesh(petalGeo, topperMat);
      const r = 0.18;
      petalMesh.position.set(Math.cos(angle) * r, 4.78, Math.sin(angle) * r);
      capGroup.add(petalMesh);
    }

    // Center pearl/apex of topper
    const tApexGeo = new THREE.SphereGeometry(0.1, 20, 14);
    const tApexMesh = new THREE.Mesh(tApexGeo, topperMat);
    tApexMesh.position.y = 5.08;
    capGroup.add(tApexMesh);

    // Top tiny pearl jewel
    const tJewelGeo = new THREE.SphereGeometry(0.055, 16, 12);
    const tJewelMat = new THREE.MeshStandardMaterial({ color: 0xd0bfae, metalness: 0.3, roughness: 0.2 });
    const tJewelMesh = new THREE.Mesh(tJewelGeo, tJewelMat);
    tJewelMesh.position.y = 5.2;
    capGroup.add(tJewelMesh);

    masterGroup.add(capGroup);

    // ══════════════════════════════════════════════════════════════════
    // F. APPLICATOR WAND (revealed when cap lifts)
    // ══════════════════════════════════════════════════════════════════
    const wandGroup = new THREE.Group();
    wandGroupRef.current = wandGroup;

    const wandMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transmission: 0.9, roughness: 0.07, transparent: true,
    });

    const wandStemGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.1, 12);
    const wandStemMesh = new THREE.Mesh(wandStemGeo, wandMat);
    wandStemMesh.position.y = 0.5;
    wandGroup.add(wandStemMesh);

    const doeFootGeo = new THREE.SphereGeometry(0.07, 16, 10);
    doeFootGeo.scale(1.0, 0.65, 1.0);
    const doeFootMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentShade.hex), roughness: 0.6,
    });
    const doeFootMesh = new THREE.Mesh(doeFootGeo, doeFootMat);
    doeFootMesh.position.y = -0.5;
    wandGroup.add(doeFootMesh);

    const dropletGeo = new THREE.SphereGeometry(0.05, 14, 10);
    dropletGeo.scale(1, 1.65, 1);
    const dropletMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentShade.hex),
      transmission: 0.4, roughness: 0.03, clearcoat: 1.0, transparent: true, opacity: 0.9,
    });
    const dropletMesh = new THREE.Mesh(dropletGeo, dropletMat);
    dropletMesh.position.set(0.01, -0.65, 0);
    dropletMeshRef.current = dropletMesh;
    wandGroup.add(dropletMesh);

    wandGroup.visible = false;
    scene.add(wandGroup);

    // ─── Scale & Position master group ───────────────────────────────
    // Keep scale at 1.0 — bottle is designed at correct proportions already
    // Offset slightly down so it's visually centered in the viewport
    masterGroup.scale.set(1.0, 1.0, 1.0);
    masterGroup.position.set(0, -0.5, 0);

    // ══════════════════════════════════════════════════════════════════
    // G. EVENT HANDLERS
    // ══════════════════════════════════════════════════════════════════
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      setIsInteracting(true); setHasInteracted(true);
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseTiltRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      };
      if (!isDraggingRef.current) return;
      manualRotRef.current.y += (e.clientX - prevMouseRef.current.x) * 0.008;
      manualRotRef.current.x += (e.clientY - prevMouseRef.current.y) * 0.008;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDraggingRef.current = false; setIsInteracting(false); };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDraggingRef.current = true; setIsInteracting(true); setHasInteracted(true);
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      manualRotRef.current.y += (e.touches[0].clientX - prevMouseRef.current.x) * 0.01;
      manualRotRef.current.x += (e.touches[0].clientY - prevMouseRef.current.y) * 0.01;
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => { isDraggingRef.current = false; setIsInteracting(false); };

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    // ══════════════════════════════════════════════════════════════════
    // H. ANIMATION LOOP
    // ══════════════════════════════════════════════════════════════════
    let rafId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth color transition when shade changes
      liquidMatsRef.current.forEach((mat) => {
        mat.color.lerp(targetColorRef.current, 0.07);
        mat.emissive.lerp(targetColorRef.current, 0.07);
      });
      if (dropletMeshRef.current) {
        (dropletMeshRef.current.material as THREE.MeshPhysicalMaterial).color.lerp(targetColorRef.current, 0.07);
      }
      if (bottomGlowRef.current) {
        bottomGlowRef.current.color.lerp(targetColorRef.current, 0.07);
      }

      // Scroll-based gentle rotation
      const scrollY_ = window.scrollY || 0;
      const scrollRotY = Math.sin(scrollY_ * 0.0020) * 0.28;
      const scrollRotX = Math.cos(scrollY_ * 0.0016) * 0.10;
      const scrollTransY = scrollY_ * -0.0004;

      // Idle float & gentle sway
      const idleFloat = Math.sin(t * 1.4) * 0.055;
      const idleSway = Math.sin(t * 0.75) * 0.06;

      if (bottleGroupRef.current) {
        const tgtY = manualRotRef.current.y + scrollRotY + idleSway + mouseTiltRef.current.x * 0.22;
        const tgtX = manualRotRef.current.x + scrollRotX + (-mouseTiltRef.current.y * 0.18);
        bottleGroupRef.current.rotation.y += (tgtY - bottleGroupRef.current.rotation.y) * 0.1;
        bottleGroupRef.current.rotation.x += (tgtX - bottleGroupRef.current.rotation.x) * 0.1;
        bottleGroupRef.current.position.y = -0.5 + idleFloat + scrollTransY;
      }

      // Cap open/close animation
      if (capGroupRef.current && wandGroupRef.current) {
        if (isOpenWand) {
          capGroupRef.current.position.y += (1.8 - capGroupRef.current.position.y) * 0.1;
          capGroupRef.current.position.x += (1.3 - capGroupRef.current.position.x) * 0.1;
          capGroupRef.current.rotation.z += (0.38 - capGroupRef.current.rotation.z) * 0.1;

          wandGroupRef.current.visible = true;
          wandGroupRef.current.position.set(1.2, 0.3 + idleFloat, 0.5);
          wandGroupRef.current.rotation.z = -0.28 + Math.sin(t * 2.2) * 0.03;

          if (dropletMeshRef.current) {
            dropletMeshRef.current.scale.y = 1.5 + Math.sin(t * 4.5) * 0.18;
          }
        } else {
          capGroupRef.current.position.y += (0 - capGroupRef.current.position.y) * 0.12;
          capGroupRef.current.position.x += (0 - capGroupRef.current.position.x) * 0.12;
          capGroupRef.current.rotation.z += (0 - capGroupRef.current.rotation.z) * 0.12;
          wandGroupRef.current.visible = false;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpenWand]);

  const handleResetView = () => { manualRotRef.current = { x: 0, y: 0 }; };

  return (
    <div
      ref={mountRef}
      className={`relative select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ width: '100%', height: '560px', maxHeight: '86vh', background: 'transparent' }}
    >
      {/* Dynamic color glow behind the floating bottle */}
      <div
        className="absolute inset-0 m-auto w-[280px] h-[380px] rounded-full blur-[90px] pointer-events-none -z-10 transition-colors duration-700 opacity-50"
        style={{
          background: `radial-gradient(ellipse at center, ${currentShade.hex} 0%, ${currentShade.secondary_hex}22 55%, transparent 78%)`,
        }}
      />

      {/* Top status pill & reset button */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-20">
        <div
          className="px-4 py-1.5 rounded-full text-xs font-display tracking-widest uppercase backdrop-blur-md border shadow-md flex items-center gap-2 pointer-events-auto"
          style={{
            backgroundColor: `${currentShade.hex}20`,
            borderColor: `${currentShade.hex}55`,
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentShade.hex }} />
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {isArabic ? currentShade.name_ar : currentShade.name_en}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {hasInteracted && (
            <button
              type="button"
              onClick={handleResetView}
              title={isArabic ? 'إعادة ضبط الزاوية' : 'Reset View'}
              className="p-2 rounded-full backdrop-blur-md bg-white/70 dark:bg-stone-900/70 border border-[#B08D57]/40 hover:scale-110 transition-all shadow-md cursor-pointer"
            >
              <RotateCw size={13} className="text-[#2B171D] dark:text-[#FDFBF7]" />
            </button>
          )}
          <div className="px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/70 dark:bg-stone-900/70 border border-[#B08D57]/30 text-[11px] font-display uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5 shadow-sm">
            <Move3d size={13} className="text-[#B08D57]" />
            <span>{isArabic ? 'تدوير 360°' : 'Rotate 360°'}</span>
          </div>
        </div>
      </div>

      {/* Wand toggle button */}
      {onToggleOpenWand && (
        <div className="absolute bottom-4 z-20 pointer-events-auto left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={onToggleOpenWand}
            className="px-6 py-2.5 rounded-full backdrop-blur-md bg-white/85 dark:bg-stone-900/90 border border-[#B08D57]/50 shadow-xl hover:bg-white dark:hover:bg-stone-800 transition-all text-xs font-display tracking-wider text-[#2B171D] dark:text-[#FDFBF7] flex items-center gap-2 cursor-pointer group"
          >
            <Sparkles size={14} className="text-[#B08D57] group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">
              {isOpenWand
                ? isArabic ? 'إغلاق الغطاء' : 'Close Cap'
                : isArabic ? 'استعراض الموزع' : 'Reveal Applicator'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
