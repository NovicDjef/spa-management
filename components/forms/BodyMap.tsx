'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

interface BodyMapProps {
  selectedZones: string[];
  onZonesChange: (zones: string[]) => void;
  gender?: 'HOMME' | 'FEMME';
}

// Zones du corps avec positions anatomiques précises
const BODY_ZONES = [
  // Tête et cou
  { id: 'tete', label: 'Tête', position: { x: 0, y: 1.65, z: 0 }, size: 0.22, color: 0xff6b9d },
  { id: 'cou', label: 'Cou', position: { x: 0, y: 1.35, z: 0 }, size: 0.15, color: 0xff6b9d },
  
  // Épaules et bras supérieurs
  { id: 'epaule-gauche', label: 'Épaule G', position: { x: -0.32, y: 1.25, z: 0 }, size: 0.16, color: 0xffa07a },
  { id: 'epaule-droite', label: 'Épaule D', position: { x: 0.32, y: 1.25, z: 0 }, size: 0.16, color: 0xffa07a },
  { id: 'bras-gauche', label: 'Bras G', position: { x: -0.42, y: 0.95, z: 0 }, size: 0.14, color: 0xffa07a },
  { id: 'bras-droit', label: 'Bras D', position: { x: 0.42, y: 0.95, z: 0 }, size: 0.14, color: 0xffa07a },
  
  // Avant-bras et mains
  { id: 'coude-gauche', label: 'Coude G', position: { x: -0.48, y: 0.70, z: 0 }, size: 0.12, color: 0xffb347 },
  { id: 'coude-droit', label: 'Coude D', position: { x: 0.48, y: 0.70, z: 0 }, size: 0.12, color: 0xffb347 },
  { id: 'avant-bras-gauche', label: 'Avant-bras G', position: { x: -0.52, y: 0.45, z: 0 }, size: 0.13, color: 0xffb347 },
  { id: 'avant-bras-droit', label: 'Avant-bras D', position: { x: 0.52, y: 0.45, z: 0 }, size: 0.13, color: 0xffb347 },
  { id: 'poignet-gauche', label: 'Poignet G', position: { x: -0.54, y: 0.22, z: 0 }, size: 0.10, color: 0xffd700 },
  { id: 'poignet-droit', label: 'Poignet D', position: { x: 0.54, y: 0.22, z: 0 }, size: 0.10, color: 0xffd700 },
  { id: 'main-gauche', label: 'Main G', position: { x: -0.56, y: 0.08, z: 0.05 }, size: 0.11, color: 0xffd700 },
  { id: 'main-droite', label: 'Main D', position: { x: 0.56, y: 0.08, z: 0.05 }, size: 0.11, color: 0xffd700 },
  
  // Torse avant
  { id: 'poitrine', label: 'Poitrine', position: { x: 0, y: 1.10, z: 0.18 }, size: 0.28, color: 0x87ceeb },
  { id: 'abdomen-haut', label: 'Abdomen supérieur', position: { x: 0, y: 0.80, z: 0.18 }, size: 0.26, color: 0x87ceeb },
  { id: 'abdomen-bas', label: 'Abdomen inférieur', position: { x: 0, y: 0.55, z: 0.18 }, size: 0.24, color: 0x87ceeb },
  
  // Torse arrière
  { id: 'dos-haut', label: 'Haut du dos', position: { x: 0, y: 1.10, z: -0.18 }, size: 0.28, color: 0x9370db },
  { id: 'dos-milieu', label: 'Milieu du dos', position: { x: 0, y: 0.80, z: -0.18 }, size: 0.26, color: 0x9370db },
  { id: 'dos-bas', label: 'Bas du dos', position: { x: 0, y: 0.50, z: -0.18 }, size: 0.24, color: 0x9370db },
  { id: 'lombaires', label: 'Lombaires', position: { x: 0, y: 0.30, z: -0.18 }, size: 0.22, color: 0x9370db },
  
  // Bassin et hanches
  { id: 'bassin', label: 'Bassin', position: { x: 0, y: 0.25, z: 0 }, size: 0.26, color: 0x98fb98 },
  { id: 'hanche-gauche', label: 'Hanche G', position: { x: -0.22, y: 0.20, z: 0 }, size: 0.16, color: 0x98fb98 },
  { id: 'hanche-droite', label: 'Hanche D', position: { x: 0.22, y: 0.20, z: 0 }, size: 0.16, color: 0x98fb98 },
  { id: 'fessiers', label: 'Fessiers', position: { x: 0, y: 0.15, z: -0.20 }, size: 0.28, color: 0x98fb98 },
  
  // Cuisses
  { id: 'cuisse-gauche-avant', label: 'Cuisse G avant', position: { x: -0.20, y: -0.10, z: 0.12 }, size: 0.18, color: 0xdda0dd },
  { id: 'cuisse-droite-avant', label: 'Cuisse D avant', position: { x: 0.20, y: -0.10, z: 0.12 }, size: 0.18, color: 0xdda0dd },
  { id: 'cuisse-gauche-arriere', label: 'Cuisse G arrière', position: { x: -0.20, y: -0.10, z: -0.12 }, size: 0.18, color: 0xdda0dd },
  { id: 'cuisse-droite-arriere', label: 'Cuisse D arrière', position: { x: 0.20, y: -0.10, z: -0.12 }, size: 0.18, color: 0xdda0dd },
  
  // Genoux
  { id: 'genou-gauche', label: 'Genou G', position: { x: -0.20, y: -0.40, z: 0 }, size: 0.14, color: 0xf0e68c },
  { id: 'genou-droit', label: 'Genou D', position: { x: 0.20, y: -0.40, z: 0 }, size: 0.14, color: 0xf0e68c },
  
  // Mollets
  { id: 'mollet-gauche', label: 'Mollet G', position: { x: -0.20, y: -0.60, z: -0.08 }, size: 0.14, color: 0xffb6c1 },
  { id: 'mollet-droit', label: 'Mollet D', position: { x: 0.20, y: -0.60, z: -0.08 }, size: 0.14, color: 0xffb6c1 },
  { id: 'tibia-gauche', label: 'Tibia G', position: { x: -0.20, y: -0.60, z: 0.08 }, size: 0.12, color: 0xffb6c1 },
  { id: 'tibia-droit', label: 'Tibia D', position: { x: 0.20, y: -0.60, z: 0.08 }, size: 0.12, color: 0xffb6c1 },
  
  // Chevilles et pieds
  { id: 'cheville-gauche', label: 'Cheville G', position: { x: -0.20, y: -0.80, z: 0 }, size: 0.10, color: 0xffa500 },
  { id: 'cheville-droite', label: 'Cheville D', position: { x: 0.20, y: -0.80, z: 0 }, size: 0.10, color: 0xffa500 },
  { id: 'pied-gauche', label: 'Pied G', position: { x: -0.20, y: -0.92, z: 0.08 }, size: 0.14, color: 0xffa500 },
  { id: 'pied-droit', label: 'Pied D', position: { x: 0.20, y: -0.92, z: 0.08 }, size: 0.14, color: 0xffa500 },
];

export function BodyMap({ selectedZones, onZonesChange, gender = 'HOMME' }: BodyMapProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const zoneMarkersRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas && mountRef.current.contains(existingCanvas)) {
      mountRef.current.removeChild(existingCanvas);
    }

    // Scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    scene.fog = new THREE.Fog(0xf5f5f5, 3, 5);
    sceneRef.current = scene;

    // Caméra
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.8, 3);
    cameraRef.current = camera;

    // Renderer avec meilleure qualité
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lumières améliorées
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb8d4ff, 0.6);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 2, -3);
    scene.add(rimLight);

    // Fonction pour créer un corps anatomiquement précis
    const createAnatomicalBody = (gender: 'HOMME' | 'FEMME') => {
      const group = new THREE.Group();
      
      // Proportions basées sur le canon de 7.5 têtes
      const headHeight = 0.24;
      const isFemale = gender === 'FEMME';
      
      // Matériaux avec sous-surface scattering simulé
      const skinMaterial = new THREE.MeshStandardMaterial({
        color: "#e6c7b3",
        roughness: 0.65,
        metalness: 0.02,
        emissive: 0xffdbcc,
        emissiveIntensity: 0.05,
      });

      // === TÊTE ===
      const headGroup = new THREE.Group();
      
      // Crâne
      const skull = new THREE.Mesh(
        new THREE.SphereGeometry(headHeight * 0.75, 64, 64),
        skinMaterial
      );
      skull.scale.set(1, 1.15, 0.95);
      skull.position.y = 1.65;
      skull.castShadow = true;
      headGroup.add(skull);
      
      // Mâchoire
      const jaw = new THREE.Mesh(
        new THREE.SphereGeometry(headHeight * 0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
        skinMaterial
      );
      jaw.scale.set(0.9, 0.8, 0.85);
      jaw.position.set(0, 1.52, 0.02);
      jaw.castShadow = true;
      headGroup.add(jaw);
      
      group.add(headGroup);

      // === COU ===
      const neckGeometry = new THREE.CylinderGeometry(0.09, 0.11, 0.18, 32);
      const neck = new THREE.Mesh(neckGeometry, skinMaterial);
      neck.position.y = 1.35;
      neck.castShadow = true;
      group.add(neck);

      // === TORSE ===
      const torsoGroup = new THREE.Group();
      
      // Poitrine (avec différence homme/femme)
      const chestWidth = isFemale ? 0.30 : 0.35;
      const chestDepth = isFemale ? 0.26 : 0.24;
      
      const chestGeometry = new THREE.CapsuleGeometry(chestWidth * 0.65, 0.38, 32, 64);
      const chest = new THREE.Mesh(chestGeometry, skinMaterial);
      chest.scale.set(1, 1, chestDepth / chestWidth);
      chest.position.y = 1.08;
      chest.castShadow = true;
      torsoGroup.add(chest);
      
      // Abdomen
      const abdomenGeometry = new THREE.CapsuleGeometry(chestWidth * 0.6, 0.32, 32, 64);
      const abdomen = new THREE.Mesh(abdomenGeometry, skinMaterial);
      abdomen.scale.set(1, 1, (chestDepth - 0.02) / chestWidth);
      abdomen.position.y = 0.72;
      abdomen.castShadow = true;
      torsoGroup.add(abdomen);
      
      // Taille
      const waistGeometry = new THREE.CapsuleGeometry(
        isFemale ? chestWidth * 0.48 : chestWidth * 0.55,
        0.20,
        32,
        64
      );
      const waist = new THREE.Mesh(waistGeometry, skinMaterial);
      waist.position.y = 0.50;
      waist.castShadow = true;
      torsoGroup.add(waist);
      
      // Bassin
      const pelvisWidth = isFemale ? chestWidth * 0.70 : chestWidth * 0.60;
      const pelvisGeometry = new THREE.CapsuleGeometry(pelvisWidth * 0.65, 0.22, 32, 64);
      const pelvis = new THREE.Mesh(pelvisGeometry, skinMaterial);
      pelvis.position.y = 0.28;
      pelvis.castShadow = true;
      torsoGroup.add(pelvis);
      
      group.add(torsoGroup);

      // === BRAS ===
      const createArm = (side: 'left' | 'right') => {
        const dir = side === 'left' ? -1 : 1;
        const armGroup = new THREE.Group();

        // Épaule
        const shoulderGeometry = new THREE.SphereGeometry(0.11, 32, 32);
        const shoulder = new THREE.Mesh(shoulderGeometry, skinMaterial);
        shoulder.position.set(dir * 0.32, 1.25, 0);
        shoulder.scale.set(1, 0.9, 0.95);
        shoulder.castShadow = true;
        armGroup.add(shoulder);

        // Bras supérieur (plus de définition musculaire)
        const upperArmGeometry = new THREE.CapsuleGeometry(0.075, 0.38, 16, 32);
        const upperArm = new THREE.Mesh(upperArmGeometry, skinMaterial);
        upperArm.position.set(dir * 0.42, 0.95, 0);
        upperArm.rotation.z = dir * -0.10;
        upperArm.scale.set(1, 1, 0.95);
        upperArm.castShadow = true;
        armGroup.add(upperArm);

        // Coude
        const elbowGeometry = new THREE.SphereGeometry(0.08, 32, 32);
        const elbow = new THREE.Mesh(elbowGeometry, skinMaterial);
        elbow.position.set(dir * 0.48, 0.70, 0);
        elbow.scale.set(1, 0.85, 0.90);
        elbow.castShadow = true;
        armGroup.add(elbow);

        // Avant-bras
        const forearmGeometry = new THREE.CapsuleGeometry(0.065, 0.36, 16, 32);
        const forearm = new THREE.Mesh(forearmGeometry, skinMaterial);
        forearm.position.set(dir * 0.52, 0.45, 0);
        forearm.rotation.z = dir * -0.08;
        forearm.castShadow = true;
        armGroup.add(forearm);

        // Poignet
        const wristGeometry = new THREE.CylinderGeometry(0.045, 0.050, 0.08, 16);
        const wrist = new THREE.Mesh(wristGeometry, skinMaterial);
        wrist.position.set(dir * 0.54, 0.22, 0);
        wrist.castShadow = true;
        armGroup.add(wrist);

        // Main (plus détaillée)
        const handGeometry = new THREE.SphereGeometry(0.075, 32, 32);
        const hand = new THREE.Mesh(handGeometry, skinMaterial);
        hand.position.set(dir * 0.56, 0.08, 0.05);
        hand.scale.set(1, 1.2, 0.6);
        hand.castShadow = true;
        armGroup.add(hand);

        return armGroup;
      };
      
      group.add(createArm('left'));
      group.add(createArm('right'));

      // === JAMBES ===
      const createLeg = (side: 'left' | 'right') => {
        const dir = side === 'left' ? -1 : 1;
        const legGroup = new THREE.Group();

        // Cuisse (avec définition musculaire)
        const thighGeometry = new THREE.CapsuleGeometry(0.13, 0.50, 32, 64);
        const thigh = new THREE.Mesh(thighGeometry, skinMaterial);
        thigh.position.set(dir * 0.20, 0.05, 0);
        thigh.scale.set(1, 1, 0.92);
        thigh.castShadow = true;
        legGroup.add(thigh);

        // Genou
        const kneeGeometry = new THREE.SphereGeometry(0.10, 32, 32);
        const knee = new THREE.Mesh(kneeGeometry, skinMaterial);
        knee.position.set(dir * 0.20, -0.25, 0.02);
        knee.scale.set(1, 0.75, 0.90);
        knee.castShadow = true;
        legGroup.add(knee);

        // Mollet (forme anatomique)
        const calfGeometry = new THREE.CapsuleGeometry(0.10, 0.45, 32, 64);
        const calf = new THREE.Mesh(calfGeometry, skinMaterial);
        calf.position.set(dir * 0.20, -0.52, 0);
        calf.scale.set(1, 1, 0.88);
        calf.castShadow = true;
        legGroup.add(calf);

        // Cheville
        const ankleGeometry = new THREE.CylinderGeometry(0.055, 0.065, 0.12, 16);
        const ankle = new THREE.Mesh(ankleGeometry, skinMaterial);
        ankle.position.set(dir * 0.20, -0.80, 0);
        ankle.castShadow = true;
        legGroup.add(ankle);

        // Pied (anatomiquement correct)
        const footGroup = new THREE.Group();
        
        // Talon
        const heelGeometry = new THREE.SphereGeometry(0.075, 32, 32);
        const heel = new THREE.Mesh(heelGeometry, skinMaterial);
        heel.position.set(dir * 0.20, -0.90, -0.02);
        heel.scale.set(0.9, 0.7, 1);
        heel.castShadow = true;
        footGroup.add(heel);
        
        // Avant du pied
        const footFrontGeometry = new THREE.CapsuleGeometry(0.070, 0.18, 16, 32);
        const footFront = new THREE.Mesh(footFrontGeometry, skinMaterial);
        footFront.position.set(dir * 0.20, -0.92, 0.10);
        footFront.rotation.x = Math.PI / 2;
        footFront.scale.set(0.95, 1, 0.75);
        footFront.castShadow = true;
        footGroup.add(footFront);
        
        legGroup.add(footGroup);

        return legGroup;
      };
      
      group.add(createLeg('left'));
      group.add(createLeg('right'));

      return group;
    };

    const body = createAnatomicalBody(gender);
    scene.add(body);

    // Marqueurs de zones (invisibles mais cliquables)
    BODY_ZONES.forEach(zone => {
      const markerGeometry = new THREE.SphereGeometry(zone.size, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: zone.color,
        transparent: true,
        opacity: 0,
        depthTest: false,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(zone.position.x, zone.position.y, zone.position.z);
      marker.userData.zoneId = zone.id;
      scene.add(marker);
      zoneMarkersRef.current.set(zone.id, marker);
    });

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.6;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 4;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = 5 * Math.PI / 6;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      
      // Animation des zones sélectionnées
      zoneMarkersRef.current.forEach((marker, zoneId) => {
        if (selectedZones.includes(zoneId)) {
          marker.material.opacity = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
        } else if (hoveredZone === zoneId) {
          marker.material.opacity = 0.3;
        } else {
          marker.material.opacity = 0;
        }
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Gestion du redimensionnement
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      const canvas = mountRef.current?.querySelector('canvas');
      if (canvas && mountRef.current?.contains(canvas)) {
        mountRef.current.removeChild(canvas);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material?.dispose();
            }
          }
        });
      }
      zoneMarkersRef.current.clear();
    };
  }, [gender, selectedZones, hoveredZone]);

  // Gestion des clics et hover
  useEffect(() => {
    if (!mountRef.current || !cameraRef.current) return;

    const handlePointerMove = (event: PointerEvent) => {
      const canvas = mountRef.current?.querySelector('canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(zoneMarkersRef.current.values())
      );

      if (intersects.length > 0) {
        const zoneId = intersects[0].object.userData.zoneId;
        setHoveredZone(zoneId);
        if (canvas instanceof HTMLCanvasElement) {
          canvas.style.cursor = 'pointer';
        }
      } else {
        setHoveredZone(null);
        if (canvas instanceof HTMLCanvasElement) {
          canvas.style.cursor = 'grab';
        }
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const canvas = mountRef.current?.querySelector('canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(zoneMarkersRef.current.values())
      );

      if (intersects.length > 0) {
        const zoneId = intersects[0].object.userData.zoneId;
        toggleZone(zoneId);
      }
    };

    const canvas = mountRef.current.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('pointermove', handlePointerMove as EventListener);
      canvas.addEventListener('pointerdown', handlePointerDown as EventListener);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('pointermove', handlePointerMove as EventListener);
        canvas.removeEventListener('pointerdown', handlePointerDown as EventListener);
      }
    };
  }, []);

  const toggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      onZonesChange(selectedZones.filter(z => z !== zoneId));
    } else {
      onZonesChange([...selectedZones, zoneId]);
    }
  };

  return (
    <div className="card-spa">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Zones de douleur - Modèle 3D anatomique
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isMobile
              ? 'Faites glisser pour tourner, touchez une zone pour la sélectionner'
              : 'Cliquez et faites glisser pour tourner, cliquez sur une zone pour la sélectionner'}
          </p>
        </div>
      </div>

      {hoveredZone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-2 bg-spa-rose-50 border border-spa-rose-200 rounded-lg"
        >
          <p className="text-sm text-spa-rose-700 font-medium">
            Zone survolée: {BODY_ZONES.find(z => z.id === hoveredZone)?.label}
          </p>
        </motion.div>
      )}

      <div
        ref={mountRef}
        className="relative w-full max-w-5xl mx-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl p-6 border border-gray-200 shadow-lg"
        style={{ height: isMobile ? '500px' : '600px' }}
      />

      {selectedZones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <p className="text-sm font-medium text-gray-700 mb-3">
            Zones sélectionnées ({selectedZones.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedZones.map(zoneId => {
                const zone = BODY_ZONES.find(z => z.id === zoneId);
                return (
                  <motion.button
                    key={zoneId}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleZone(zoneId)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-spa-rose-100 text-spa-rose-700 rounded-full text-sm font-medium hover:bg-spa-rose-200 transition-colors shadow-sm"
                  >
                    {zone?.label}
                    <span className="text-spa-rose-500 font-bold">✕</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-r from-spa-beige-50 to-spa-rose-50 rounded-xl border border-spa-beige-200">
        <div className="flex items-center justify-between flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-spa-rose-500 animate-pulse"></div>
            <span className="text-gray-700 font-medium">Zone sélectionnée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-spa-rose-300"></div>
            <span className="text-gray-600">Zone survolée</span>
          </div>
          <div className="text-gray-500 italic">
            {selectedZones.length === 0 && 'Aucune zone sélectionnée'}
          </div>
        </div>
      </div>
    </div>
  );
}