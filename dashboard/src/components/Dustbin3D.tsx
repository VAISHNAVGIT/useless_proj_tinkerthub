import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Dustbin3DProps {
  lidOpen: boolean;
  rejectionOpen: boolean;
  distance: number;
  isAngry?: boolean;
  isAdored?: boolean;
  theme?: 'dark' | 'light';
  onToggleLid?: () => void;
  onCaress?: () => void;
}

export const Dustbin3D: React.FC<Dustbin3DProps> = ({
  lidOpen,
  rejectionOpen,
  distance,
  isAngry = false,
  isAdored = false,
  theme = 'dark',
  onToggleLid,
  onCaress,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const lidPivotRef = useRef<THREE.Group | null>(null);
  const lidMeshRef = useRef<THREE.Mesh | null>(null);
  const binMeshRef = useRef<THREE.Mesh | null>(null);
  const rejectPivotRef = useRef<THREE.Group | null>(null);
  const wasteMeshRef = useRef<THREE.Mesh | null>(null);
  const pupilLeftRef = useRef<THREE.Mesh | null>(null);
  const pupilRightRef = useRef<THREE.Mesh | null>(null);
  const eyeLeftRef = useRef<THREE.Mesh | null>(null);
  const eyeRightRef = useRef<THREE.Mesh | null>(null);
  const redLightRef = useRef<THREE.PointLight | null>(null);
  const stinkGroupRef = useRef<THREE.Group | null>(null);

  const binGroupRef = useRef<THREE.Group | null>(null);
  const blushLeftRef = useRef<THREE.Mesh | null>(null);
  const blushRightRef = useRef<THREE.Mesh | null>(null);
  const smileMeshRef = useRef<THREE.Mesh | null>(null);
  const angryMouthGroupRef = useRef<THREE.Group | null>(null);

  const targetLidAngle = useRef(0);
  const currentLidAngle = useRef(0);

  const targetRejectAngle = useRef(0);
  const currentRejectAngle = useRef(0);
  const wasteY = useRef(0.5);
  const rejectionOpenRef = useRef(rejectionOpen);
  const lidOpenRef = useRef(lidOpen);
  const isAngryRef = useRef(isAngry);
  const isAdoredRef = useRef(isAdored);

  const [comicText, setComicText] = useState<string | null>(null);

  const isLight = theme === 'light';

  // Comic Sound & Action Text Popups for Lid
  useEffect(() => {
    targetLidAngle.current = lidOpen ? -Math.PI / 2 : 0;
    lidOpenRef.current = lidOpen;

    if (lidOpen) {
      setComicText('CHOMP! 😋');
    } else {
      setComicText('SLAM! 💥');
    }

    const timer = setTimeout(() => setComicText(null), 1200);
    return () => clearTimeout(timer);
  }, [lidOpen]);

  // Comic Text Popup when Rejection Servo is in action
  useEffect(() => {
    targetRejectAngle.current = rejectionOpen ? Math.PI * 0.80 : 0;
    rejectionOpenRef.current = rejectionOpen;

    if (rejectionOpen) {
      setComicText('🤬 ANGRY TEETH OUT! DENIED! 🚀');
      const timer = setTimeout(() => setComicText(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [rejectionOpen]);

  // Comic Text Popup when Caressed / Adored
  useEffect(() => {
    isAdoredRef.current = isAdored;
    if (isAdored) {
      const cuteTexts = ['SO LOVED! 🥰💖', 'PURRRR~ 💕', 'HEART MELTED! ✨', 'AWHHH! BEST BIN! 🌸'];
      setComicText(cuteTexts[Math.floor(Math.random() * cuteTexts.length)]);
      const timer = setTimeout(() => setComicText(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [isAdored]);

  useEffect(() => {
    isAngryRef.current = isAngry;
  }, [isAngry]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isLight ? 0xffffff : 0x0f172a);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.5, 3.6, 6.5);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // 4. Interactive Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.target.set(0, 1.2, 0);
    controls.update();

    // 5. Cartoon Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const mainDirLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    mainDirLight.position.set(6, 12, 8);
    mainDirLight.castShadow = true;
    mainDirLight.shadow.mapSize.width = 2048;
    mainDirLight.shadow.mapSize.height = 2048;
    scene.add(mainDirLight);

    const fillDirLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillDirLight.position.set(-6, 6, -6);
    scene.add(fillDirLight);

    const redLight = new THREE.PointLight(0xef4444, 0, 15);
    redLight.position.set(0, 4, 3);
    scene.add(redLight);
    redLightRef.current = redLight;

    // 6. Ground & Pedestal Base
    const pedestalGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.18, 32);
    const pedestalMat = new THREE.MeshToonMaterial({ color: 0x0f172a });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.09;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const ringGeo = new THREE.TorusGeometry(2.4, 0.05, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.18;
    scene.add(ringMesh);

    // 7. CARTOON DUSTBIN BODY GROUP
    const binGroup = new THREE.Group();
    binGroup.position.y = 0.18;
    scene.add(binGroup);
    binGroupRef.current = binGroup;

    // Vibrant Sky Blue Cyan Body
    const binGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.3, 32);
    const binMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.1,
    });
    const binMesh = new THREE.Mesh(binGeo, binMat);
    binMesh.position.y = 1.15;
    binMesh.castShadow = true;
    binMesh.receiveShadow = true;
    binGroup.add(binMesh);
    binMeshRef.current = binMesh;

    // Cartoon Stripes & Outlines
    const stripeGeo = new THREE.TorusGeometry(0.92, 0.045, 16, 32);
    const stripeMat = new THREE.MeshToonMaterial({ color: 0xfacc15 });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.rotation.x = Math.PI / 2;
    stripeMesh.position.y = 0.6;
    binGroup.add(stripeMesh);

    const stripe2Geo = new THREE.TorusGeometry(0.92, 0.045, 16, 32);
    const stripe2Mat = new THREE.MeshToonMaterial({ color: 0xec4899 });
    const stripe2Mesh = new THREE.Mesh(stripe2Geo, stripe2Mat);
    stripe2Mesh.rotation.x = Math.PI / 2;
    stripe2Mesh.position.y = 1.8;
    binGroup.add(stripe2Mesh);

    // 8. CUTE CARTOON 3D GOOGLY EYES WITH EXPRESSION CONTROL
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(0, 1.45, 0.92);
    binGroup.add(eyeGroup);

    const eyeWhiteGeo = new THREE.SphereGeometry(0.19, 32, 32);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });

    const pupilGeo = new THREE.SphereGeometry(0.085, 16, 16);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const eyeLeft = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeLeft.position.set(-0.22, 0, 0);
    eyeGroup.add(eyeLeft);
    eyeLeftRef.current = eyeLeft;

    const pupilLeft = new THREE.Mesh(pupilGeo, pupilMat);
    pupilLeft.position.set(-0.22, 0, 0.15);
    eyeGroup.add(pupilLeft);
    pupilLeftRef.current = pupilLeft;

    const eyeRight = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeRight.position.set(0.22, 0, 0);
    eyeGroup.add(eyeRight);
    eyeRightRef.current = eyeRight;

    const pupilRight = new THREE.Mesh(pupilGeo, pupilMat);
    pupilRight.position.set(0.22, 0, 0.15);
    eyeGroup.add(pupilRight);
    pupilRightRef.current = pupilRight;

    // Eyebrows for Angry & Happy Expressions
    const browGeo = new THREE.BoxGeometry(0.22, 0.04, 0.05);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const browLeft = new THREE.Mesh(browGeo, browMat);
    browLeft.position.set(-0.22, 0.22, 0.15);
    browLeft.rotation.z = -0.3;
    eyeGroup.add(browLeft);

    const browRight = new THREE.Mesh(browGeo, browMat);
    browRight.position.set(0.22, 0.22, 0.15);
    browRight.rotation.z = 0.3;
    eyeGroup.add(browRight);

    // 9. ROSY BLUSH CHEEKS (For Caress & Adore Reaction)
    const blushGeo = new THREE.SphereGeometry(0.12, 16, 16);
    blushGeo.scale(1.4, 0.7, 0.4);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0 });

    const blushLeft = new THREE.Mesh(blushGeo, blushMat);
    blushLeft.position.set(-0.44, 1.25, 0.88);
    binGroup.add(blushLeft);
    blushLeftRef.current = blushLeft;

    const blushRight = new THREE.Mesh(blushGeo, blushMat);
    blushRight.position.set(0.44, 1.25, 0.88);
    binGroup.add(blushRight);
    blushRightRef.current = blushRight;

    // 10. CUTE SMILING MOUTH (For Caress & Adore Reaction)
    const smileGeo = new THREE.TorusGeometry(0.15, 0.03, 16, 32, Math.PI);
    const smileMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const smileMesh = new THREE.Mesh(smileGeo, smileMat);
    smileMesh.position.set(0, 1.15, 0.92);
    smileMesh.rotation.z = Math.PI; // Curved upward U-shape smile!
    smileMesh.visible = false;
    binGroup.add(smileMesh);
    smileMeshRef.current = smileMesh;

    // 11. ANGRY TEETH & MOUTH GROUP (Pops out when Reject Servo active or Angry Mode)
    const angryMouthGroup = new THREE.Group();
    angryMouthGroup.position.set(0, 1.12, 0.93);
    angryMouthGroup.visible = false;
    binGroup.add(angryMouthGroup);
    angryMouthGroupRef.current = angryMouthGroup;

    // Dark red inner mouth cavity
    const cavityGeo = new THREE.BoxGeometry(0.55, 0.28, 0.08);
    const cavityMat = new THREE.MeshBasicMaterial({ color: 0x500707 });
    const cavityMesh = new THREE.Mesh(cavityGeo, cavityMat);
    angryMouthGroup.add(cavityMesh);

    // Sharp white teeth popping out (Top row)
    const toothTopGeo = new THREE.ConeGeometry(0.045, 0.12, 4);
    toothTopGeo.rotateX(Math.PI); // Point down
    const toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });

    for (let i = 0; i < 5; i++) {
      const tooth = new THREE.Mesh(toothTopGeo, toothMat);
      tooth.position.set(-0.2 + i * 0.1, 0.08, 0.05);
      angryMouthGroup.add(tooth);
    }

    // Sharp white teeth popping out (Bottom row)
    const toothBottomGeo = new THREE.ConeGeometry(0.045, 0.12, 4); // Point up
    for (let i = 0; i < 5; i++) {
      const tooth = new THREE.Mesh(toothBottomGeo, toothMat);
      tooth.position.set(-0.2 + i * 0.1, -0.08, 0.05);
      angryMouthGroup.add(tooth);
    }

    // 12. CARTOON SUNSHINE YELLOW LID
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, 2.3, -0.9);
    binGroup.add(lidPivot);
    lidPivotRef.current = lidPivot;

    const lidMeshGeo = new THREE.CylinderGeometry(0.96, 0.96, 0.18, 32);
    const lidMeshMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 });
    const lidMesh = new THREE.Mesh(lidMeshGeo, lidMeshMat);
    lidMesh.position.set(0, 0.09, 0.9);
    lidMesh.castShadow = true;
    lidPivot.add(lidMesh);
    lidMeshRef.current = lidMesh;

    const handleGeo = new THREE.BoxGeometry(0.35, 0.15, 0.18);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.set(0, 0.22, 0.9);
    lidPivot.add(handleMesh);

    // 13. CARTOON VIVID ORANGE REJECTION TRAPDOOR
    const rejectPivot = new THREE.Group();
    rejectPivot.position.set(0, 0.06, -0.9);
    binGroup.add(rejectPivot);
    rejectPivotRef.current = rejectPivot;

    const rejectMeshGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.12, 32);
    const rejectMeshMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const rejectMesh = new THREE.Mesh(rejectMeshGeo, rejectMeshMat);
    rejectMesh.position.set(0, -0.06, 0.9);
    rejectMesh.castShadow = true;
    rejectPivot.add(rejectMesh);

    // 14. Cartoon Stink Particle System (Floating green spheres when lid opens)
    const stinkGroup = new THREE.Group();
    stinkGroup.position.set(0, 2.4, 0);
    binGroup.add(stinkGroup);
    stinkGroupRef.current = stinkGroup;

    const stinkParticles: { mesh: THREE.Mesh; speed: number; phase: number }[] = [];
    const stinkGeo = new THREE.DodecahedronGeometry(0.08, 1);
    const stinkMat = new THREE.MeshToonMaterial({ color: 0x84cc16, transparent: true, opacity: 0.8 });

    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(stinkGeo, stinkMat);
      mesh.position.set(
        (Math.random() - 0.5) * 0.8,
        Math.random() * 0.5,
        (Math.random() - 0.5) * 0.8
      );
      stinkGroup.add(mesh);
      stinkParticles.push({
        mesh,
        speed: 0.8 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 15. FLOATING HEART PARTICLES SYSTEM (For Caress & Adore reaction)
    const heartGroup = new THREE.Group();
    heartGroup.position.set(0, 2.4, 0);
    binGroup.add(heartGroup);

    const heartGeo = new THREE.SphereGeometry(0.07, 12, 12);
    heartGeo.scale(1, 1.25, 0.5);
    const heartMat = new THREE.MeshBasicMaterial({ color: 0xff1493 });
    const heartParticles: { mesh: THREE.Mesh; speed: number; phase: number }[] = [];

    for (let i = 0; i < 8; i++) {
      const hMesh = new THREE.Mesh(heartGeo, heartMat);
      hMesh.position.set(
        (Math.random() - 0.5) * 0.9,
        Math.random() * 0.6,
        (Math.random() - 0.5) * 0.9
      );
      hMesh.visible = false;
      heartGroup.add(hMesh);
      heartParticles.push({
        mesh: hMesh,
        speed: 1.0 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 16. Cartoon Crumpled Waste Object
    const wasteGeo = new THREE.DodecahedronGeometry(0.36, 1);
    const wasteMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
    const wasteMesh = new THREE.Mesh(wasteGeo, wasteMat);
    wasteMesh.position.set(0, 0.5, 0);
    wasteMesh.castShadow = true;
    binGroup.add(wasteMesh);
    wasteMeshRef.current = wasteMesh;

    // 17. Raycaster for Direct Click Interaction (Lid click vs Caress click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (lidMeshRef.current || binMeshRef.current) {
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          const hitObject = intersects[0].object;
          if (onToggleLid && (hitObject === lidMeshRef.current || lidPivot.children.includes(hitObject))) {
            onToggleLid();
          } else if (onCaress) {
            onCaress();
          }
        }
      }
    };

    container.addEventListener('click', handlePointerDown);

    // 18. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      const isRejectingOrAngry = rejectionOpenRef.current || isAngryRef.current;
      const isAdoredMode = isAdoredRef.current && !isRejectingOrAngry;

      // Top Lid Rotation
      if (lidPivotRef.current) {
        const lidDiff = targetLidAngle.current - currentLidAngle.current;
        if (Math.abs(lidDiff) > 0.001) {
          const lidStep = Math.sign(lidDiff) * Math.min(Math.abs(lidDiff), delta * 2.5);
          currentLidAngle.current += lidStep;
          lidPivotRef.current.rotation.x = currentLidAngle.current;
        } else {
          currentLidAngle.current = targetLidAngle.current;
          lidPivotRef.current.rotation.x = targetLidAngle.current;
        }
      }

      // Rejection Door Rotation
      if (rejectPivotRef.current) {
        const rejectDiff = targetRejectAngle.current - currentRejectAngle.current;
        if (Math.abs(rejectDiff) > 0.001) {
          const rejectStep = Math.sign(rejectDiff) * Math.min(Math.abs(rejectDiff), delta * 2.5);
          currentRejectAngle.current += rejectStep;
          rejectPivotRef.current.rotation.x = currentRejectAngle.current;
        } else {
          currentRejectAngle.current = targetRejectAngle.current;
          rejectPivotRef.current.rotation.x = targetRejectAngle.current;
        }
      }

      // Stink Particle Float Loop
      stinkParticles.forEach((p) => {
        if (lidOpenRef.current) {
          p.mesh.visible = true;
          p.mesh.position.y += delta * p.speed;
          p.mesh.position.x += Math.sin(elapsedTime * 4 + p.phase) * 0.01;
          if (p.mesh.position.y > 1.8) {
            p.mesh.position.y = 0;
          }
        } else {
          p.mesh.visible = false;
        }
      });

      // Blush Cheeks Opacity & Glow Animation
      if (blushLeftRef.current && blushRightRef.current) {
        const leftMat = blushLeftRef.current.material as THREE.MeshBasicMaterial;
        const rightMat = blushRightRef.current.material as THREE.MeshBasicMaterial;

        if (isAdoredMode) {
          leftMat.opacity = Math.min(1, leftMat.opacity + delta * 5);
          rightMat.opacity = Math.min(1, rightMat.opacity + delta * 5);
          const blushPulse = 1 + Math.sin(elapsedTime * 8) * 0.12;
          blushLeftRef.current.scale.set(blushPulse, blushPulse, blushPulse);
          blushRightRef.current.scale.set(blushPulse, blushPulse, blushPulse);
        } else {
          leftMat.opacity = Math.max(0, leftMat.opacity - delta * 4);
          rightMat.opacity = Math.max(0, rightMat.opacity - delta * 4);
        }
      }

      // Mouth Expressions (Smile vs Angry Teeth)
      if (smileMeshRef.current) {
        smileMeshRef.current.visible = isAdoredMode;
      }

      if (angryMouthGroupRef.current) {
        if (isRejectingOrAngry) {
          angryMouthGroupRef.current.visible = true;
          // Angry teeth popping forward out of face with vicious chomping animation!
          angryMouthGroupRef.current.position.z = 0.94 + Math.sin(elapsedTime * 25) * 0.04;
          const teethScale = 1.25 + Math.sin(elapsedTime * 20) * 0.15;
          angryMouthGroupRef.current.scale.set(teethScale, teethScale, teethScale);
        } else {
          angryMouthGroupRef.current.visible = false;
        }
      }

      // Googly Eyes & Angry Eyebrows
      if (pupilLeftRef.current && pupilRightRef.current) {
        const eyeOffset = Math.sin(elapsedTime * 3) * 0.035;

        if (isRejectingOrAngry) {
          // FEROCIOUS ANGRY REJECTION FACE
          pupilLeftRef.current.position.x = -0.22 + eyeOffset;
          pupilRightRef.current.position.x = 0.22 + eyeOffset;
          pupilLeftRef.current.scale.set(1.5, 0.35, 1);
          pupilRightRef.current.scale.set(1.5, 0.35, 1);
          browLeft.rotation.z = -0.65; // Furious downward inner slant
          browRight.rotation.z = 0.65;
        } else if (isAdoredMode) {
          // LOVING BLUSHING HAPPY SMILE EYES
          pupilLeftRef.current.position.x = -0.22;
          pupilRightRef.current.position.x = 0.22;
          pupilLeftRef.current.scale.set(1.3, 0.3, 1); // Happy squished curved eyes!
          pupilRightRef.current.scale.set(1.3, 0.3, 1);
          browLeft.rotation.z = 0.35; // Sweet upward happy eyebrows
          browRight.rotation.z = -0.35;
        } else if (lidOpenRef.current) {
          pupilLeftRef.current.position.x = -0.22 + eyeOffset;
          pupilRightRef.current.position.x = 0.22 + eyeOffset;
          pupilLeftRef.current.scale.set(1.3, 1.3, 1);
          pupilRightRef.current.scale.set(1.3, 1.3, 1);
          browLeft.rotation.z = -0.1;
          browRight.rotation.z = 0.1;
        } else {
          pupilLeftRef.current.position.x = -0.22 + eyeOffset;
          pupilRightRef.current.position.x = 0.22 + eyeOffset;
          pupilLeftRef.current.scale.set(1, 1, 1);
          pupilRightRef.current.scale.set(1, 1, 1);
          browLeft.rotation.z = -0.25;
          browRight.rotation.z = 0.25;
        }
      }

      // Bin Body Movement (Sway when adored vs Jitter when angry/rejecting)
      if (binGroupRef.current) {
        if (isRejectingOrAngry) {
          binGroupRef.current.rotation.z = (Math.random() - 0.5) * 0.08;
          binGroupRef.current.rotation.x = (Math.random() - 0.5) * 0.04;
        } else if (isAdoredMode) {
          binGroupRef.current.rotation.z = Math.sin(elapsedTime * 6) * 0.09;
          binGroupRef.current.rotation.x = Math.cos(elapsedTime * 6) * 0.04;
        } else {
          binGroupRef.current.rotation.set(0, 0, 0);
        }
      }

      // Heart Particles Floating Effect (Caress & Adore mode)
      heartParticles.forEach((p) => {
        if (isAdoredMode) {
          p.mesh.visible = true;
          p.mesh.position.y += delta * p.speed;
          p.mesh.position.x += Math.sin(elapsedTime * 5 + p.phase) * 0.02;
          if (p.mesh.position.y > 2.0) {
            p.mesh.position.y = 0;
          }
        } else {
          p.mesh.visible = false;
        }
      });

      // Waste Drop & Purge Effect
      if (wasteMeshRef.current) {
        if (rejectionOpenRef.current) {
          wasteY.current -= delta * 4;
          if (wasteY.current < -2.8) wasteY.current = -2.8;
          wasteMeshRef.current.position.y = wasteY.current;
          wasteMeshRef.current.rotation.x += delta * 4;
        } else {
          wasteY.current = 0.5;
          wasteMeshRef.current.position.y = 0.5;
        }
      }

      // Angry Strobe Light
      if (redLightRef.current) {
        if (isRejectingOrAngry) {
          redLightRef.current.intensity = Math.sin(elapsedTime * 24) > 0 ? 14 : 0;
        } else {
          redLightRef.current.intensity = 0;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 19. Dynamic Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('click', handlePointerDown);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onToggleLid, onCaress, isLight]);

  return (
    <div className={`relative w-full h-[58vh] min-h-[380px] md:min-h-[470px] max-h-[650px] rounded-3xl overflow-hidden transition-colors ${
      isLight ? 'bg-white border-4 border-slate-900 shadow-cartoon-xl text-slate-900' : 'bg-slate-900 border-4 border-slate-900 shadow-cartoon-xl text-slate-100'
    }`}>
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Comic Action Popup Text */}
      {comicText && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-pop-in">
          <div className="bg-yellow-300 border-4 border-slate-900 text-slate-950 font-black font-sans px-6 py-3 rounded-2xl text-2xl md:text-3xl shadow-cartoon-xl uppercase tracking-wider -rotate-3">
            {comicText}
          </div>
        </div>
      )}

      {/* Cartoon Telemetry Overlay */}
      <div className={`absolute top-4 left-4 border-3 border-slate-900 px-4 py-2.5 rounded-2xl font-mono text-xs space-y-1 shadow-cartoon pointer-events-none ${
        isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-950/95 text-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-black uppercase tracking-wide">AUTHORIZED BIN UNIT</span>
        </div>
        <div className={isLight ? 'text-slate-700 font-bold' : 'text-slate-300'}>
          Servo #1 (Lid): <span className="text-sky-500 font-black">{lidOpen ? 'OPEN (90°)' : 'CLOSED (0°)'}</span>
        </div>
        <div className={isLight ? 'text-slate-700 font-bold' : 'text-slate-300'}>
          Servo #2 (Reject Door): <span className="text-red-500 font-black">{rejectionOpen ? 'PURGE & REJECT (180°)' : 'CLOSED (0°)'}</span>
        </div>
      </div>

      <div className={`absolute top-4 right-4 border-3 border-slate-900 px-4 py-2.5 rounded-2xl font-mono text-xs font-bold shadow-cartoon pointer-events-none ${
        isLight ? 'bg-white/95 text-slate-900' : 'bg-slate-950/95 text-slate-100'
      }`}>
        Sensor: <span className={distance <= 25 ? 'text-red-500 font-black' : 'text-emerald-500 font-black'}>{distance.toFixed(0)} cm</span>
      </div>

      <div className={`absolute bottom-4 right-4 text-xs font-mono font-black px-4 py-2 rounded-xl border-3 border-slate-900 shadow-cartoon pointer-events-none -rotate-1 ${
        isLight ? 'bg-yellow-300 text-slate-950' : 'bg-yellow-400 text-slate-950'
      }`}>
        💡 Click bin to caress/adore or lid to open
      </div>
    </div>
  );
};

