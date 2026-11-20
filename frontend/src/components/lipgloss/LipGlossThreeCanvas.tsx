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

  const [isInteracting, setIsInteracting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // References to 3D objects for dynamic updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bottleGroupRef = useRef<THREE.Group | null>(null);
  const liquidMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const liquidBottomMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const capGroupRef = useRef<THREE.Group | null>(null);
  const wandGroupRef = useRef<THREE.Group | null>(null);
  const doeFootMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const dropletMeshRef = useRef<THREE.Mesh | null>(null);
  const targetColorRef = useRef(new THREE.Color(currentShade.hex));

  // User drag rotation state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const manualRotationRef = useRef({ x: 0, y: 0 });
  const mouseTiltRef = useRef({ x: 0, y: 0 });

  // Update target color when active shade changes
  useEffect(() => {
    targetColorRef.current.set(currentShade.hex);
  }, [currentShade.hex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 640;

    // 2. Camera setup - Positioned closer so the 3D bottle is enlarged and prominent
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 4.8);

    // 3. WebGL Renderer with full transparency and anti-aliasing
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig for glass refraction and liquid gloss
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8f4, 3.2);
    keyLight.position.set(3.5, 5, 4.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffe8ec, 2.6);
    rimLight.position.set(-4, 3.5, -3.5);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(new THREE.Color(currentShade.hex), 2.8, 7);
    bottomGlow.position.set(0, -3.0, 2);
    scene.add(bottomGlow);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
    fillLight.position.set(0, -2.5, 3.5);
    scene.add(fillLight);

    // 5. MASTER BOTTLE GROUP
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    bottleGroupRef.current = masterGroup;

    // ========================================================
    // A. OUTER CRYSTAL BEVELLED FLACON (HEAVY LUXURY ACRYLIC)
    // ========================================================
    // Main body flacon with thick crystal walls
    const outerGlassGeo = new THREE.BoxGeometry(1.5, 2.6, 0.95, 4, 4, 4);
    const outerGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      ior: 1.54,
      reflectivity: 0.95,
      thickness: 0.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      specularIntensity: 1.0,
    });
    const outerGlassMesh = new THREE.Mesh(outerGlassGeo, outerGlassMat);
    outerGlassMesh.position.y = -0.5;
    masterGroup.add(outerGlassMesh);

    // Solid heavy crystal bottom base (luxury weight characteristic)
    const baseGeo = new THREE.BoxGeometry(1.48, 0.42, 0.93);
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      roughness: 0.02,
      ior: 1.56,
      thickness: 0.6,
      clearcoat: 1.0,
      transparent: true,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.6;
    masterGroup.add(baseMesh);

    // ========================================================
    // B. INNER LIP GLOSS LIQUID CORE (ROUNDED CAPSULE VIAL)
    // ========================================================
    // Cylindrical reservoir inside the square flacon
    const liquidCylinderGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.7, 32);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentShade.hex),
      emissive: new THREE.Color(currentShade.hex),
      emissiveIntensity: 0.18,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.28,
      opacity: 0.96,
      transparent: true,
      ior: 1.48,
    });
    liquidMaterialRef.current = liquidMat;

    const liquidCylinderMesh = new THREE.Mesh(liquidCylinderGeo, liquidMat);
    liquidCylinderMesh.position.y = -0.42;
    masterGroup.add(liquidCylinderMesh);

    // Hemispherical rounded bottom for the inner vial (like real lip gloss)
    const liquidBottomGeo = new THREE.SphereGeometry(0.48, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const liquidBottomMesh = new THREE.Mesh(liquidBottomGeo, liquidMat);
    liquidBottomMesh.position.y = -1.27;
    masterGroup.add(liquidBottomMesh);
    liquidBottomMaterialRef.current = liquidMat;

    // ========================================================
    // C. CRISP EMBOSSED "L'VENUS" SIGNATURE LOGO
    // ========================================================
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 1024;
    const ctx = labelCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 1024);
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';

      // Brand Title
      ctx.font = 'bold 50px "Cormorant Garamond", Georgia, serif';
      ctx.letterSpacing = '14px';
      ctx.fillText("L'VENUS", 256, 490);

      // Sub-brand
      ctx.font = '22px "Cormorant Garamond", Georgia, serif';
      ctx.letterSpacing = '7px';
      ctx.fillText('LE CAIRE · PARIS', 256, 545);

      // Delicate Hairline Accent
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(165, 575);
      ctx.lineTo(347, 575);
      ctx.stroke();

      ctx.font = 'italic 22px "EB Garamond", serif';
      ctx.fillText('Élixir Lèvres Satiné', 256, 615);
    }
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.needsUpdate = true;

    const labelPlaneGeo = new THREE.PlaneGeometry(1.2, 2.4);
    const labelMat = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
    });
    const labelMesh = new THREE.Mesh(labelPlaneGeo, labelMat);
    labelMesh.position.set(0, -0.5, 0.49);
    masterGroup.add(labelMesh);

    // Subtle back face reflection
    const backLabelMesh = labelMesh.clone();
    backLabelMesh.position.set(0, -0.5, -0.49);
    backLabelMesh.rotation.y = Math.PI;
    masterGroup.add(backLabelMesh);

    // ========================================================
    // D. BOTTLE THREADED COLLAR & STOPPER
    // ========================================================
    const collarGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.38, 32);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.y = 0.98;
    masterGroup.add(collarMesh);

    // Inner wiper ring (soft white silicone)
    const wiperGeo = new THREE.TorusGeometry(0.36, 0.05, 16, 32);
    const wiperMat = new THREE.MeshStandardMaterial({ color: 0xf5f0eb, roughness: 0.4 });
    const wiperMesh = new THREE.Mesh(wiperGeo, wiperMat);
    wiperMesh.rotation.x = Math.PI / 2;
    wiperMesh.position.y = 1.15;
    masterGroup.add(wiperMesh);

    // ========================================================
    // E. CRYSTAL CAP WITH TOP ENGRAVED VENUS CAMEO
    // ========================================================
    const capGroup = new THREE.Group();
    capGroupRef.current = capGroup;

    // Clear acrylic square cap
    const capGeo = new THREE.BoxGeometry(1.5, 1.38, 0.95, 4, 4, 4);
    const capMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      roughness: 0.04,
      ior: 1.54,
      thickness: 0.45,
      clearcoat: 1.0,
      transparent: true,
      opacity: 1,
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.y = 1.82;
    capGroup.add(capMesh);

    // Inner cap core / screw insert
    const innerCapPlugGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.65, 32);
    const innerCapPlugMat = new THREE.MeshStandardMaterial({
      color: 0xe6dfd5,
      metalness: 0.45,
      roughness: 0.2,
    });
    const innerCapPlugMesh = new THREE.Mesh(innerCapPlugGeo, innerCapPlugMat);
    innerCapPlugMesh.position.y = 1.55;
    capGroup.add(innerCapPlugMesh);

    // Gold Venus Cameo Medallion on Top of Cap
    const crestGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.04, 32);
    const crestMat = new THREE.MeshStandardMaterial({
      color: 0xb08d57,
      metalness: 0.85,
      roughness: 0.2,
    });
    const crestMesh = new THREE.Mesh(crestGeo, crestMat);
    crestMesh.position.y = 2.52;
    capGroup.add(crestMesh);

    masterGroup.add(capGroup);

    // ========================================================
    // F. APPLICATOR WAND & DRIPPING GLOSS DROPLET
    // ========================================================
    const wandGroup = new THREE.Group();
    wandGroupRef.current = wandGroup;

    // Translucent acrylic applicator stem
    const stemGeo = new THREE.CylinderGeometry(0.068, 0.068, 1.9, 16);
    const stemMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      roughness: 0.08,
      transparent: true,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.y = 0.55;
    wandGroup.add(stemMesh);

    // Angled velvet doe-foot applicator tip
    const doeFootGeo = new THREE.ConeGeometry(0.125, 0.38, 16);
    const doeFootMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentShade.hex),
      roughness: 0.75,
      metalness: 0.05,
    });
    doeFootMaterialRef.current = doeFootMat;
    const doeFootMesh = new THREE.Mesh(doeFootGeo, doeFootMat);
    doeFootMesh.position.y = -0.48;
    doeFootMesh.rotation.z = 0.22;
    wandGroup.add(doeFootMesh);

    // Saturated glossy teardrop hanging from tip
    const dropletGeo = new THREE.SphereGeometry(0.095, 16, 16);
    dropletGeo.scale(1, 1.55, 1);
    const dropletMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentShade.hex),
      transmission: 0.45,
      roughness: 0.03,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.92,
    });
    const dropletMesh = new THREE.Mesh(dropletGeo, dropletMat);
    dropletMesh.position.set(0.02, -0.76, 0);
    dropletMeshRef.current = dropletMesh;
    wandGroup.add(dropletMesh);

    // Initially hide wand inside bottle unless open
    wandGroup.visible = false;
    scene.add(wandGroup);

    // Scale up master bottle to be heroic and prominent
    masterGroup.scale.set(1.5, 1.5, 1.5);
    masterGroup.position.set(0, 0.15, 0);

    // ========================================================
    // G. MOUSE & DRAG INTERACTION HANDLERS
    // ========================================================
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      setIsInteracting(true);
      setHasInteracted(true);
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseTiltRef.current = { x, y };

      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      manualRotationRef.current.y += deltaX * 0.008;
      manualRotationRef.current.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsInteracting(false);
    };

    // Touch events for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        setIsInteracting(true);
        setHasInteracted(true);
        previousMousePositionRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      manualRotationRef.current.y += deltaX * 0.01;
      manualRotationRef.current.x += deltaY * 0.01;

      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      setIsInteracting(false);
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // ========================================================
    // H. RESIZE OBSERVER
    // ========================================================
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ========================================================
    // I. ANIMATION / RENDER LOOP
    // ========================================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth color morphing to active shade
      if (liquidMaterialRef.current) {
        liquidMaterialRef.current.color.lerp(targetColorRef.current, 0.08);
        liquidMaterialRef.current.emissive.lerp(targetColorRef.current, 0.08);
      }
      if (liquidBottomMaterialRef.current) {
        liquidBottomMaterialRef.current.color.lerp(targetColorRef.current, 0.08);
      }
      if (doeFootMaterialRef.current) {
        doeFootMaterialRef.current.color.lerp(targetColorRef.current, 0.08);
      }
      if (bottomGlow) {
        bottomGlow.color.lerp(targetColorRef.current, 0.08);
      }
      if (dropletMeshRef.current && (dropletMeshRef.current.material as THREE.MeshPhysicalMaterial)) {
        (dropletMeshRef.current.material as THREE.MeshPhysicalMaterial).color.lerp(targetColorRef.current, 0.08);
      }

      // Parallax scroll calculation
      const scrollRotY = Math.sin((window.scrollY || 0) * 0.0022) * 0.35;
      const scrollRotX = Math.cos((window.scrollY || 0) * 0.0018) * 0.15;
      const scrollTransY = (window.scrollY || 0) * -0.0006;

      // Natural idle floating animation
      const idleFloatY = Math.sin(elapsed * 1.5) * 0.06;
      const idleRotY = Math.sin(elapsed * 0.8) * 0.07;

      // Apply combined rotations to master bottle
      if (bottleGroupRef.current) {
        const targetRotY =
          manualRotationRef.current.y +
          scrollRotY +
          idleRotY +
          mouseTiltRef.current.x * 0.25;

        const targetRotX =
          manualRotationRef.current.x +
          scrollRotX +
          -mouseTiltRef.current.y * 0.2;

        bottleGroupRef.current.rotation.y += (targetRotY - bottleGroupRef.current.rotation.y) * 0.1;
        bottleGroupRef.current.rotation.x += (targetRotX - bottleGroupRef.current.rotation.x) * 0.1;
        bottleGroupRef.current.position.y = 0.15 + idleFloatY + scrollTransY;
      }

      // Open Wand Animation State
      if (capGroupRef.current && wandGroupRef.current) {
        if (isOpenWand) {
          // Lift cap up and to the side
          capGroupRef.current.position.y += (1.7 - capGroupRef.current.position.y) * 0.1;
          capGroupRef.current.position.x += (1.45 - capGroupRef.current.position.x) * 0.1;
          capGroupRef.current.rotation.z += (0.42 - capGroupRef.current.rotation.z) * 0.1;

          // Reveal Wand floating next to bottle
          wandGroup.visible = true;
          wandGroup.position.set(1.35, 0.45 + idleFloatY, 0.65);
          wandGroup.rotation.z = -0.3 + Math.sin(elapsed * 2) * 0.03;

          // Droplet surface tension oscillation
          if (dropletMeshRef.current) {
            dropletMeshRef.current.scale.y = 1.45 + Math.sin(elapsed * 4.2) * 0.16;
          }
        } else {
          // Return cap to closed position
          capGroupRef.current.position.y += (0 - capGroupRef.current.position.y) * 0.12;
          capGroupRef.current.position.x += (0 - capGroupRef.current.position.x) * 0.12;
          capGroupRef.current.rotation.z += (0 - capGroupRef.current.rotation.z) * 0.12;
          wandGroup.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpenWand]);

  const handleResetView = () => {
    manualRotationRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={mountRef}
      className={`relative select-none flex flex-col items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
      style={{
        width: '100%',
        height: '620px',
        maxHeight: '88vh',
        background: 'transparent',
      }}
    >
      {/* Soft Dynamic Glow Directly Behind Floating 3D Bottle */}
      <div
        className="absolute inset-0 m-auto w-[340px] h-[340px] rounded-full blur-[85px] pointer-events-none -z-10 transition-colors duration-700 opacity-60"
        style={{
          background: `radial-gradient(circle, ${currentShade.hex} 0%, ${currentShade.secondary_hex}33 45%, transparent 72%)`,
        }}
      />

      {/* Floating 3D Control Hints & Status */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-20">
        <div
          className="px-4 py-1.5 rounded-full text-xs font-display tracking-widest uppercase backdrop-blur-md border shadow-md flex items-center gap-2 pointer-events-auto"
          style={{
            backgroundColor: `${currentShade.hex}22`,
            borderColor: `${currentShade.hex}60`,
            color: '#2B171D',
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse"
            style={{ backgroundColor: currentShade.hex }}
          />
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {isArabic ? currentShade.name_ar : currentShade.name_en}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {hasInteracted && (
            <button
              type="button"
              onClick={handleResetView}
              title={isArabic ? 'إعادة ضبط الزاوية' : 'Reset 3D Angle'}
              className="p-2 rounded-full backdrop-blur-md bg-white/70 dark:bg-stone-900/70 border border-[#B08D57]/40 text-[#2B171D] dark:text-[#FDFBF7] hover:scale-110 transition-all shadow-md cursor-pointer"
            >
              <RotateCw size={13} />
            </button>
          )}

          <div className="px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/70 dark:bg-stone-900/70 border border-[#B08D57]/30 text-[11px] font-display uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5 shadow-sm">
            <Move3d size={13} className="text-[#B08D57]" />
            <span>{isArabic ? 'تدوير 3D حر 360°' : 'Rotate 360°'}</span>
          </div>
        </div>
      </div>

      {/* Open/Close Wand Toggle Button */}
      {onToggleOpenWand && (
        <div className="absolute bottom-4 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={onToggleOpenWand}
            className="px-6 py-2.5 rounded-full backdrop-blur-md bg-white/85 dark:bg-stone-900/90 border border-[#B08D57]/50 shadow-xl hover:bg-white dark:hover:bg-stone-800 transition-all text-xs font-display tracking-wider text-[#2B171D] dark:text-[#FDFBF7] flex items-center gap-2 cursor-pointer group"
          >
            <Sparkles size={14} className="text-[#B08D57] group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">
              {isOpenWand
                ? isArabic
                  ? 'إغلاق الغطاء الكريستالي'
                  : 'Close Crystal Flacon Cap'
                : isArabic
                ? 'استكشفي الموزع والقطرة اللامعة'
                : 'Reveal Wand & Gloss Droplet'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
