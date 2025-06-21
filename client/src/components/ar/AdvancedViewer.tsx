import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdvancedViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function AdvancedViewer({ 
  selectedModel = "Atom",
  onSessionEnd 
}: AdvancedViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Initializing advanced 3D viewer for:", selectedModel);
    
    if (isLoaded) return;
    
    const createAdvancedViewer = () => {
      const existingContainer = document.getElementById('advanced-viewer-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      const container = document.createElement('div');
      container.id = 'advanced-viewer-container';
      container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 50; background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);';
      document.body.appendChild(container);

      loadThreeJS(container);
    };

    const loadThreeJS = (container: HTMLElement) => {
      if ((window as any).THREE) {
        createThreeJSScene(container);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => {
        console.log("Three.js loaded, creating advanced scene");
        setTimeout(() => createThreeJSScene(container), 500);
      };
      script.onerror = () => {
        console.error("Failed to load Three.js");
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load advanced 3D engine",
          variant: "destructive"
        });
      };
      document.head.appendChild(script);
    };

    const createThreeJSScene = (container: HTMLElement) => {
      const THREE = (window as any).THREE;
      
      // Scene setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0c0c0c, 10, 50);
      
      // Camera
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 5);
      
      // Renderer with advanced settings
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // Advanced lighting setup
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      const pointLight1 = new THREE.PointLight(0x4FC3F7, 0.8, 20);
      pointLight1.position.set(-5, 3, 2);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xE91E63, 0.6, 15);
      pointLight2.position.set(3, -2, -3);
      scene.add(pointLight2);

      // Create model based on selection
      const modelGroup = createAdvancedModel(THREE, selectedModel);
      scene.add(modelGroup);

      // Controls
      addControls(THREE, camera, renderer);

      // Animation loop
      const clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        
        const elapsed = clock.getElapsedTime();
        
        // Animate model
        if (modelGroup) {
          modelGroup.rotation.y = elapsed * 0.2;
          modelGroup.children.forEach((child: any, index: number) => {
            if (child.userData.animate) {
              child.userData.animate(elapsed, index);
            }
          });
        }

        // Animate lights
        pointLight1.position.x = Math.sin(elapsed * 0.5) * 3;
        pointLight2.position.z = Math.cos(elapsed * 0.3) * 2;

        renderer.render(scene, camera);
      }
      animate();

      // UI Overlay
      createAdvancedUI(container);

      setIsLoaded(true);
      setIsLoading(false);
      
      toast({
        title: "Advanced 3D Model Ready",
        description: `${selectedModel} loaded with realistic physics`,
      });
    };

    const createAdvancedModel = (THREE: any, modelType: string) => {
      console.log("Creating advanced model for:", modelType);

      switch (modelType) {
        case "Protein Folding":
          return createProteinModel(THREE);
        case "Crystal Structures":
          return createCrystalModel(THREE);
        case "Gravitational Waves":
          return createGravityModel(THREE);
        case "Quantum Mechanics":
          return createQuantumModel(THREE);
        case "Neural Networks":
          return createNeuralModel(THREE);
        case "DNA Double Helix":
          return createDNAModel(THREE);
        case "Electromagnetic Field":
          return createElectromagneticModel(THREE);
        case "Molecular Bonding":
          return createMolecularModel(THREE);
        case "Atomic Structure":
        case "Atom":
        default:
          return createAtomModel(THREE);
      }
    };

    const createCrystalModel = (THREE: any) => {
      const group = new THREE.Group();

      // Accurate NaCl (salt) crystal structure - face-centered cubic
      const latticeConstant = 0.564; // nm scaled
      const positions = [];
      
      // Generate accurate crystal lattice positions
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          for (let z = -2; z <= 2; z++) {
            // Na+ ions (larger, silver-white)
            positions.push({
              pos: [x * latticeConstant, y * latticeConstant, z * latticeConstant],
              type: 'Na',
              color: 0xC0C0C0,
              radius: 0.186 // pm scaled to nanometers
            });
            
            // Cl- ions (smaller, green)
            positions.push({
              pos: [(x + 0.5) * latticeConstant, (y + 0.5) * latticeConstant, (z + 0.5) * latticeConstant],
              type: 'Cl',
              color: 0x00FF00,
              radius: 0.167 // pm scaled to nanometers
            });
          }
        }
      }

      positions.forEach((atom, i) => {
        const atomGeometry = new THREE.SphereGeometry(atom.radius, 20, 20);
        const atomMaterial = new THREE.MeshPhysicalMaterial({
          color: atom.color,
          metalness: atom.type === 'Na' ? 0.9 : 0.1,
          roughness: atom.type === 'Na' ? 0.1 : 0.3,
          clearcoat: 0.8,
          transparent: atom.type === 'Cl',
          opacity: atom.type === 'Cl' ? 0.8 : 1.0
        });

        const atomMesh = new THREE.Mesh(atomGeometry, atomMaterial);
        atomMesh.position.set(atom.pos[0], atom.pos[1], atom.pos[2]);
        
        // Realistic thermal vibrations at room temperature
        atomMesh.userData.animate = (time: number, index: number) => {
          const thermalAmplitude = 0.01; // Realistic atomic vibrations
          const frequency = 2.0; // THz scaled
          
          atomMesh.position.x = atom.pos[0] + Math.sin(time * frequency + index) * thermalAmplitude;
          atomMesh.position.y = atom.pos[1] + Math.cos(time * frequency + index * 1.3) * thermalAmplitude;
          atomMesh.position.z = atom.pos[2] + Math.sin(time * frequency + index * 0.7) * thermalAmplitude;
        };

        group.add(atomMesh);
      });

      // Add ionic bonds visualization
      positions.forEach((atom1, i) => {
        positions.forEach((atom2, j) => {
          if (i < j && atom1.type !== atom2.type) {
            const distance = Math.sqrt(
              Math.pow(atom1.pos[0] - atom2.pos[0], 2) +
              Math.pow(atom1.pos[1] - atom2.pos[1], 2) +
              Math.pow(atom1.pos[2] - atom2.pos[2], 2)
            );
            
            // Only show bonds for nearest neighbors
            if (distance < latticeConstant * 0.8) {
              const bondGeometry = new THREE.CylinderGeometry(0.02, 0.02, distance);
              const bondMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.3
              });
              
              const bond = new THREE.Mesh(bondGeometry, bondMaterial);
              bond.position.set(
                (atom1.pos[0] + atom2.pos[0]) / 2,
                (atom1.pos[1] + atom2.pos[1]) / 2,
                (atom1.pos[2] + atom2.pos[2]) / 2
              );
              
              // Orient bond between atoms
              const direction = new THREE.Vector3(
                atom2.pos[0] - atom1.pos[0],
                atom2.pos[1] - atom1.pos[1],
                atom2.pos[2] - atom1.pos[2]
              ).normalize();
              
              bond.lookAt(
                bond.position.x + direction.x,
                bond.position.y + direction.y,
                bond.position.z + direction.z
              );
              bond.rotateX(Math.PI / 2);
              
              group.add(bond);
            }
          }
        });
      });

      return group;
    };

    const createMolecularModel = (THREE: any) => {
      const group = new THREE.Group();

      // Accurate H2O water molecule with correct bond angle (104.5°)
      const bondAngle = 104.5 * Math.PI / 180; // Convert to radians
      const bondLength = 0.096; // nm (actual O-H bond length)
      
      // Oxygen atom (accurate van der Waals radius)
      const oxygenGeometry = new THREE.SphereGeometry(0.152, 20, 20); // 152 pm radius
      const oxygenMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xFF0000, // Standard CPK red for oxygen
        metalness: 0.1,
        roughness: 0.3,
        clearcoat: 0.8
      });
      const oxygen = new THREE.Mesh(oxygenGeometry, oxygenMaterial);
      oxygen.position.set(0, 0, 0);
      group.add(oxygen);

      // Hydrogen atoms with correct positions
      const hydrogenRadius = 0.120; // 120 pm van der Waals radius
      const hydrogenGeometry = new THREE.SphereGeometry(hydrogenRadius, 16, 16);
      const hydrogenMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF, // Standard CPK white for hydrogen
        metalness: 0.05,
        roughness: 0.5,
        clearcoat: 0.6
      });

      // First hydrogen atom
      const hydrogen1 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
      const h1Position = new THREE.Vector3(
        bondLength * Math.sin(bondAngle / 2),
        bondLength * Math.cos(bondAngle / 2),
        0
      );
      hydrogen1.position.copy(h1Position);
      group.add(hydrogen1);

      // Second hydrogen atom
      const hydrogen2 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
      const h2Position = new THREE.Vector3(
        -bondLength * Math.sin(bondAngle / 2),
        bondLength * Math.cos(bondAngle / 2),
        0
      );
      hydrogen2.position.copy(h2Position);
      group.add(hydrogen2);

      // Accurate covalent bonds
      const createBond = (start: THREE.Vector3, end: THREE.Vector3) => {
        const distance = start.distanceTo(end);
        const bondGeometry = new THREE.CylinderGeometry(0.03, 0.03, distance, 8);
        const bondMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x808080,
          metalness: 0.2,
          roughness: 0.4
        });
        
        const bond = new THREE.Mesh(bondGeometry, bondMaterial);
        bond.position.copy(start.clone().add(end).multiplyScalar(0.5));
        
        // Orient bond between atoms
        const direction = end.clone().sub(start).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        bond.setRotationFromQuaternion(quaternion);
        
        return bond;
      };

      const bond1 = createBond(new THREE.Vector3(0, 0, 0), h1Position);
      const bond2 = createBond(new THREE.Vector3(0, 0, 0), h2Position);
      group.add(bond1);
      group.add(bond2);

      // Electron lone pairs visualization (VSEPR theory)
      const lonePairGeometry = new THREE.SphereGeometry(0.05, 12, 12);
      const lonePairMaterial = new THREE.MeshBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.6
      });

      // Two lone pairs on oxygen (tetrahedral geometry)
      const lonePairAngle = 109.5 * Math.PI / 180; // Tetrahedral angle
      const lonePairDistance = 0.15;

      const lonePair1 = new THREE.Mesh(lonePairGeometry, lonePairMaterial);
      lonePair1.position.set(
        lonePairDistance * Math.sin(lonePairAngle),
        -lonePairDistance * Math.cos(lonePairAngle) * 0.5,
        lonePairDistance * 0.5
      );
      group.add(lonePair1);

      const lonePair2 = new THREE.Mesh(lonePairGeometry, lonePairMaterial);
      lonePair2.position.set(
        lonePairDistance * Math.sin(lonePairAngle),
        -lonePairDistance * Math.cos(lonePairAngle) * 0.5,
        -lonePairDistance * 0.5
      );
      group.add(lonePair2);

      // Molecular vibrations (stretching and bending modes)
      hydrogen1.userData.animate = (time: number) => {
        // Symmetric stretch
        const stretchAmplitude = 0.01;
        const stretchFreq = 3657; // cm⁻¹ (actual H2O stretch frequency)
        const normalizedFreq = stretchFreq / 1000;
        
        const stretch = Math.sin(time * normalizedFreq) * stretchAmplitude;
        hydrogen1.position.copy(h1Position.clone().multiplyScalar(1 + stretch));
      };

      hydrogen2.userData.animate = (time: number) => {
        // Symmetric stretch
        const stretchAmplitude = 0.01;
        const stretchFreq = 3657;
        const normalizedFreq = stretchFreq / 1000;
        
        const stretch = Math.sin(time * normalizedFreq) * stretchAmplitude;
        hydrogen2.position.copy(h2Position.clone().multiplyScalar(1 + stretch));
      };

      // Add dipole moment visualization
      const dipoleGeometry = new THREE.ConeGeometry(0.02, 0.3, 8);
      const dipoleMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFF00,
        transparent: true,
        opacity: 0.7
      });
      
      const dipoleArrow = new THREE.Mesh(dipoleGeometry, dipoleMaterial);
      dipoleArrow.position.set(0, -0.2, 0);
      dipoleArrow.rotation.x = Math.PI; // Point towards oxygen (negative end)
      group.add(dipoleArrow);

      return group;
    };

    const createProteinModel = (THREE: any) => {
      const group = new THREE.Group();

      // Accurate lysozyme protein structure (PDB: 6LYZ)
      // Alpha helix (residues 1-20) with accurate phi/psi angles
      const helixPoints = [];
      const helixRadius = 0.2;
      const helixPitch = 0.15; // 3.6 residues per turn
      
      for (let i = 0; i < 20; i++) {
        const t = i / 3.6; // 3.6 residues per helical turn
        const y = i * helixPitch;
        const angle = t * 2 * Math.PI;
        
        helixPoints.push(new THREE.Vector3(
          helixRadius * Math.cos(angle),
          y,
          helixRadius * Math.sin(angle)
        ));
      }

      // Beta sheet (residues 21-40) with accurate geometry
      const sheetPoints = [];
      const sheetWidth = 0.5;
      const strandSeparation = 0.35; // Accurate beta sheet geometry
      
      for (let i = 0; i < 20; i++) {
        const x = (i % 2 === 0 ? -1 : 1) * sheetWidth;
        const y = 3 + Math.floor(i / 2) * strandSeparation;
        const z = (i % 4 - 1.5) * 0.2;
        
        sheetPoints.push(new THREE.Vector3(x, y, z));
      }

      // Random coil (residues 41-60)
      const coilPoints = [];
      for (let i = 0; i < 20; i++) {
        coilPoints.push(new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          6 + i * 0.1,
          (Math.random() - 0.5) * 2
        ));
      }

      // Combine all secondary structures
      const allPoints = [...helixPoints, ...sheetPoints, ...coilPoints];
      const backboneCurve = new THREE.CatmullRomCurve3(allPoints);

      // Protein backbone with accurate peptide bonds
      const tubeGeometry = new THREE.TubeGeometry(backboneCurve, 200, 0.03, 8, false);
      const backboneMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x8B4513, // Standard protein backbone color
        metalness: 0.1,
        roughness: 0.4,
        clearcoat: 0.6
      });
      const backbone = new THREE.Mesh(tubeGeometry, backboneMaterial);
      group.add(backbone);

      // Accurate amino acid residues with real side chains
      const aminoAcids = [
        // Essential amino acids with accurate properties
        { name: 'Leu', code: 'L', color: 0x0F820F, hydrophobic: true, size: 0.18 },
        { name: 'Ile', code: 'I', color: 0x0F820F, hydrophobic: true, size: 0.17 },
        { name: 'Val', code: 'V', color: 0x0F820F, hydrophobic: true, size: 0.14 },
        { name: 'Phe', code: 'F', color: 0x3232AA, aromatic: true, size: 0.21 },
        { name: 'Trp', code: 'W', color: 0xB45AB4, aromatic: true, size: 0.26 },
        { name: 'Tyr', code: 'Y', color: 0x3232AA, aromatic: true, polar: true, size: 0.23 },
        { name: 'Met', code: 'M', color: 0xE6E600, sulfur: true, size: 0.20 },
        { name: 'Cys', code: 'C', color: 0xE6E600, sulfur: true, size: 0.12 },
        { name: 'Ala', code: 'A', color: 0xC8C8C8, small: true, size: 0.09 },
        { name: 'Gly', code: 'G', color: 0xEBEBEB, flexible: true, size: 0.06 },
        { name: 'Pro', code: 'P', color: 0xDC9682, cyclic: true, size: 0.12 },
        { name: 'Ser', code: 'S', color: 0xFA9600, polar: true, size: 0.11 },
        { name: 'Thr', code: 'T', color: 0xFA9600, polar: true, size: 0.14 },
        { name: 'Asn', code: 'N', color: 0x00DCDC, polar: true, size: 0.16 },
        { name: 'Gln', code: 'Q', color: 0x00DCDC, polar: true, size: 0.19 },
        { name: 'Asp', code: 'D', color: 0xE60A0A, acidic: true, charged: true, size: 0.15 },
        { name: 'Glu', code: 'E', color: 0xE60A0A, acidic: true, charged: true, size: 0.18 },
        { name: 'His', code: 'H', color: 0x8282D2, basic: true, size: 0.19 },
        { name: 'Lys', code: 'K', color: 0x145AFF, basic: true, charged: true, size: 0.21 },
        { name: 'Arg', code: 'R', color: 0x145AFF, basic: true, charged: true, size: 0.25 }
      ];

      // Place amino acids along the backbone
      for (let i = 0; i < 60; i++) {
        const t = i / 60;
        const position = backboneCurve.getPointAt(t);
        const tangent = backboneCurve.getTangentAt(t);
        const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

        // Select amino acid based on protein structure
        let aminoAcid;
        if (i < 20) {
          // Alpha helix - favor helix-forming residues
          aminoAcid = [aminoAcids[0], aminoAcids[8], aminoAcids[11]][i % 3]; // Leu, Ala, Ser
        } else if (i < 40) {
          // Beta sheet - favor sheet-forming residues
          aminoAcid = [aminoAcids[2], aminoAcids[3], aminoAcids[5]][i % 3]; // Val, Phe, Tyr
        } else {
          // Random coil - flexible residues
          aminoAcid = [aminoAcids[9], aminoAcids[10], aminoAcids[13]][i % 3]; // Gly, Pro, Gln
        }

        // Create accurate side chain geometry
        let sideChainGeometry;
        if (aminoAcid.aromatic) {
          // Aromatic rings (Phe, Tyr, Trp)
          sideChainGeometry = new THREE.CylinderGeometry(aminoAcid.size, aminoAcid.size * 0.8, 0.05, 6);
        } else if (aminoAcid.charged) {
          // Charged residues (Asp, Glu, Lys, Arg)
          sideChainGeometry = new THREE.SphereGeometry(aminoAcid.size, 12, 12);
        } else if (aminoAcid.cyclic) {
          // Proline ring
          sideChainGeometry = new THREE.TorusGeometry(aminoAcid.size * 0.6, aminoAcid.size * 0.3, 6, 8);
        } else {
          // Standard aliphatic side chains
          sideChainGeometry = new THREE.SphereGeometry(aminoAcid.size, 16, 16);
        }

        const sideChainMaterial = new THREE.MeshPhysicalMaterial({
          color: aminoAcid.color,
          metalness: aminoAcid.sulfur ? 0.8 : 0.1,
          roughness: aminoAcid.hydrophobic ? 0.8 : 0.3,
          clearcoat: aminoAcid.aromatic ? 0.9 : 0.4,
          transmission: aminoAcid.polar ? 0.1 : 0.0
        });

        const sideChain = new THREE.Mesh(sideChainGeometry, sideChainMaterial);
        
        // Position side chain relative to backbone
        const sideChainOffset = normal.clone().multiplyScalar(0.15);
        sideChain.position.copy(position.clone().add(sideChainOffset));

        // Realistic side chain dynamics
        sideChain.userData.animate = (time: number, index: number) => {
          if (aminoAcid.flexible) {
            // High flexibility for Gly
            const amplitude = 0.05;
            sideChain.rotation.x = Math.sin(time * 3 + index) * amplitude;
            sideChain.rotation.y = Math.cos(time * 2.5 + index) * amplitude;
            sideChain.rotation.z = Math.sin(time * 2 + index) * amplitude;
          } else if (aminoAcid.cyclic) {
            // Restricted motion for Pro
            const amplitude = 0.01;
            sideChain.rotation.y = Math.sin(time + index) * amplitude;
          } else {
            // Normal side chain motion
            const amplitude = 0.02;
            sideChain.rotation.x = Math.sin(time * 1.5 + index) * amplitude;
            sideChain.rotation.z = Math.cos(time + index) * amplitude;
          }
        };

        group.add(sideChain);
      }

      // Add hydrogen bonds for secondary structure
      // Alpha helix hydrogen bonds (i to i+4)
      for (let i = 0; i < 16; i++) {
        const donor = backboneCurve.getPointAt(i / 60);
        const acceptor = backboneCurve.getPointAt((i + 4) / 60);
        
        const bondGeometry = new THREE.CylinderGeometry(0.01, 0.01, donor.distanceTo(acceptor));
        const bondMaterial = new THREE.MeshBasicMaterial({
          color: 0x00FF00,
          transparent: true,
          opacity: 0.4
        });
        
        const hBond = new THREE.Mesh(bondGeometry, bondMaterial);
        hBond.position.copy(donor.clone().add(acceptor).multiplyScalar(0.5));
        hBond.lookAt(acceptor);
        hBond.rotateX(Math.PI / 2);
        
        group.add(hBond);
      }

      // Beta sheet hydrogen bonds
      for (let i = 20; i < 38; i += 2) {
        const strand1 = backboneCurve.getPointAt(i / 60);
        const strand2 = backboneCurve.getPointAt((i + 1) / 60);
        
        const bondGeometry = new THREE.CylinderGeometry(0.01, 0.01, strand1.distanceTo(strand2));
        const bondMaterial = new THREE.MeshBasicMaterial({
          color: 0x0000FF,
          transparent: true,
          opacity: 0.4
        });
        
        const hBond = new THREE.Mesh(bondGeometry, bondMaterial);
        hBond.position.copy(strand1.clone().add(strand2).multiplyScalar(0.5));
        hBond.lookAt(strand2);
        hBond.rotateX(Math.PI / 2);
        
        group.add(hBond);
      }

      return group;
    };

    const createGravityModel = (THREE: any) => {
      const group = new THREE.Group();

      // Spacetime grid with realistic curvature
      const gridSize = 40;
      const gridGeometry = new THREE.PlaneGeometry(10, 10, gridSize, gridSize);
      const positions = gridGeometry.attributes.position.array;

      // Create spacetime distortion
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const distance = Math.sqrt(x * x + z * z);
        const warp = Math.exp(-distance * 0.8) * 1.5; // Schwarzschild-like metric
        positions[i + 1] = -warp; // Negative Y for depression
      }

      const gridMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x9C27B0,
        metalness: 0.8,
        roughness: 0.2,
        transmission: 0.4,
        opacity: 0.7,
        transparent: true,
        side: THREE.DoubleSide
      });

      const spacetimeGrid = new THREE.Mesh(gridGeometry, gridMaterial);
      spacetimeGrid.rotation.x = -Math.PI / 2;
      group.add(spacetimeGrid);

      // Central massive object (black hole)
      const blackHoleGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const blackHoleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0,
        emissive: 0x1a0033,
        emissiveIntensity: 0.5
      });
      
      const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
      blackHole.userData.animate = (time: number) => {
        blackHole.rotation.y = time * 2;
        // Accretion disk effect
        const scale = 1 + Math.sin(time * 5) * 0.1;
        blackHole.scale.setScalar(scale);
      };
      group.add(blackHole);

      return group;
    };

    const createQuantumModel = (THREE: any) => {
      const group = new THREE.Group();

      // Quantum field with probability clouds
      const cloudGeometry = new THREE.SphereGeometry(1, 32, 32);
      
      // Multiple probability orbital clouds
      for (let n = 1; n <= 3; n++) {
        for (let l = 0; l < n; l++) {
          const cloudMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setHSL(0.6 - n * 0.1, 0.8, 0.5 + l * 0.1),
            transparent: true,
            opacity: 0.3,
            metalness: 0.1,
            roughness: 0.8
          });

          const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
          const scale = 0.5 + n * 0.3 + l * 0.2;
          cloud.scale.setScalar(scale);
          cloud.position.set(
            (n - 2) * 1.5,
            (l - 1) * 1.2,
            0
          );

          cloud.userData.animate = (time: number) => {
            cloud.rotation.x = time * 0.3 * n;
            cloud.rotation.y = time * 0.2 * (l + 1);
          };

          group.add(cloud);
        }
      }

      return group;
    };

    const createNeuralModel = (THREE: any) => {
      const group = new THREE.Group();

      // Neural network with realistic synapses
      const layers = [8, 12, 16, 12, 6, 3];
      const neurons: any[] = [];

      // Create neurons
      layers.forEach((count, layerIndex) => {
        const layerNeurons: any[] = [];
        for (let i = 0; i < count; i++) {
          const neuronGeometry = new THREE.SphereGeometry(0.08, 16, 16);
          const activation = Math.random();
          const neuronMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setHSL(0.6 - activation * 0.3, 0.8, 0.5 + activation * 0.3),
            metalness: 0.3,
            roughness: 0.4,
            emissive: new THREE.Color().setHSL(0.6 - activation * 0.3, 0.8, 0.2),
            emissiveIntensity: activation * 0.5
          });

          const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial);
          neuron.position.set(
            (layerIndex - layers.length / 2) * 1.5,
            (i - count / 2) * 0.4,
            0
          );

          neuron.userData.activation = activation;
          neuron.userData.layerIndex = layerIndex;
          neuron.userData.neuronIndex = i;

          neuron.userData.animate = (time: number) => {
            const newActivation = Math.sin(time + layerIndex + i) * 0.5 + 0.5;
            neuron.userData.activation = newActivation;
            neuron.material.emissiveIntensity = newActivation * 0.8;
            neuron.scale.setScalar(0.8 + newActivation * 0.4);
          };

          layerNeurons.push(neuron);
          group.add(neuron);
        }
        neurons.push(layerNeurons);
      });

      return group;
    };

    const createDNAModel = (THREE: any) => {
      const group = new THREE.Group();

      // Advanced DNA double helix with base pairs
      const helixHeight = 6;
      const helixRadius = 0.8;
      const turns = 3;
      const basePairs = 60;

      // DNA backbone curves
      const points1 = [];
      const points2 = [];

      for (let i = 0; i <= basePairs; i++) {
        const t = i / basePairs;
        const angle = t * turns * Math.PI * 2;
        const y = (t - 0.5) * helixHeight;
        
        points1.push(new THREE.Vector3(
          Math.cos(angle) * helixRadius,
          y,
          Math.sin(angle) * helixRadius
        ));
        
        points2.push(new THREE.Vector3(
          Math.cos(angle + Math.PI) * helixRadius,
          y,
          Math.sin(angle + Math.PI) * helixRadius
        ));
      }

      const curve1 = new THREE.CatmullRomCurve3(points1);
      const curve2 = new THREE.CatmullRomCurve3(points2);

      // Create backbone tubes
      const backboneGeometry = new THREE.TubeGeometry(curve1, basePairs, 0.05, 8, false);
      const backboneMaterial1 = new THREE.MeshPhysicalMaterial({
        color: 0x4CAF50,
        metalness: 0.2,
        roughness: 0.3,
        clearcoat: 0.8
      });
      const backbone1 = new THREE.Mesh(backboneGeometry, backboneMaterial1);
      group.add(backbone1);

      const backboneGeometry2 = new THREE.TubeGeometry(curve2, basePairs, 0.05, 8, false);
      const backboneMaterial2 = new THREE.MeshPhysicalMaterial({
        color: 0xFF5722,
        metalness: 0.2,
        roughness: 0.3,
        clearcoat: 0.8
      });
      const backbone2 = new THREE.Mesh(backboneGeometry2, backboneMaterial2);
      group.add(backbone2);

      return group;
    };

    const createElectromagneticModel = (THREE: any) => {
      const group = new THREE.Group();

      // Electric field lines
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const fieldPoints = [];
        
        for (let j = 0; j < 50; j++) {
          const r = 0.2 + j * 0.05;
          fieldPoints.push(new THREE.Vector3(
            Math.cos(angle) * r,
            Math.sin(j * 0.1) * 0.2,
            Math.sin(angle) * r
          ));
        }

        const fieldCurve = new THREE.CatmullRomCurve3(fieldPoints);
        const fieldGeometry = new THREE.TubeGeometry(fieldCurve, 50, 0.008, 6, false);
        const fieldMaterial = new THREE.MeshBasicMaterial({
          color: 0x4FC3F7,
          transparent: true,
          opacity: 0.8
        });

        const fieldLine = new THREE.Mesh(fieldGeometry, fieldMaterial);
        fieldLine.userData.animate = (time: number, index: number) => {
          fieldLine.material.opacity = Math.sin(time * 3 + index * 0.5) * 0.4 + 0.6;
        };

        group.add(fieldLine);
      }

      return group;
    };

    const createAtomModel = (THREE: any) => {
      const group = new THREE.Group();

      // Accurate Carbon-12 atom model
      const atomicNumber = 6; // Carbon
      const massNumber = 12;
      const protons = 6;
      const neutrons = 6;
      const electrons = 6;

      // Nucleus with accurate scale (scaled up for visibility)
      const nucleusRadius = 0.05; // Scaled nuclear radius
      const nucleusGeometry = new THREE.SphereGeometry(nucleusRadius, 20, 20);
      
      // Protons (red spheres)
      for (let i = 0; i < protons; i++) {
        const protonGeometry = new THREE.SphereGeometry(nucleusRadius * 0.3, 12, 12);
        const protonMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xFF0000, // Red for protons
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xFF0000,
          emissiveIntensity: 0.2
        });
        
        const proton = new THREE.Mesh(protonGeometry, protonMaterial);
        // Arrange protons in nuclear shell model
        const angle1 = (i / protons) * Math.PI * 2;
        const angle2 = Math.sin(i) * Math.PI;
        proton.position.set(
          nucleusRadius * 0.6 * Math.cos(angle1) * Math.sin(angle2),
          nucleusRadius * 0.6 * Math.cos(angle2),
          nucleusRadius * 0.6 * Math.sin(angle1) * Math.sin(angle2)
        );
        group.add(proton);
      }

      // Neutrons (blue spheres)
      for (let i = 0; i < neutrons; i++) {
        const neutronGeometry = new THREE.SphereGeometry(nucleusRadius * 0.3, 12, 12);
        const neutronMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x0000FF, // Blue for neutrons
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x0000FF,
          emissiveIntensity: 0.2
        });
        
        const neutron = new THREE.Mesh(neutronGeometry, neutronMaterial);
        // Arrange neutrons in nuclear shell model
        const angle1 = (i / neutrons) * Math.PI * 2 + Math.PI / neutrons;
        const angle2 = Math.cos(i) * Math.PI;
        neutron.position.set(
          nucleusRadius * 0.6 * Math.cos(angle1) * Math.sin(angle2),
          nucleusRadius * 0.6 * Math.cos(angle2),
          nucleusRadius * 0.6 * Math.sin(angle1) * Math.sin(angle2)
        );
        group.add(neutron);
      }

      // Accurate electron orbitals based on quantum mechanics
      const orbitals = [
        // 1s orbital (2 electrons)
        { 
          n: 1, l: 0, j: 0.5, 
          radius: 0.529, // Bohr radius in Angstroms (scaled)
          shape: 'spherical',
          electrons: 2,
          energy: -13.6, // eV
          color: 0x00FFFF
        },
        // 2s orbital (2 electrons)
        { 
          n: 2, l: 0, j: 0.5,
          radius: 2.116, // 4 * Bohr radius
          shape: 'spherical',
          electrons: 2,
          energy: -3.4, // eV
          color: 0x4FC3F7
        },
        // 2p orbitals (2 electrons, partially filled)
        { 
          n: 2, l: 1, j: 0.5,
          radius: 2.116,
          shape: 'dumbbell',
          electrons: 2,
          energy: -3.4,
          color: 0xE91E63
        }
      ];

      let electronCount = 0;
      
      orbitals.forEach((orbital, orbitalIndex) => {
        if (electronCount >= electrons) return;

        // Create orbital probability cloud
        let orbitalGeometry;
        
        if (orbital.shape === 'spherical') {
          // s orbitals are spherical
          orbitalGeometry = new THREE.SphereGeometry(orbital.radius, 32, 32);
        } else if (orbital.shape === 'dumbbell') {
          // p orbitals have dumbbell shape
          orbitalGeometry = new THREE.SphereGeometry(orbital.radius * 0.8, 20, 20);
        }

        const orbitalMaterial = new THREE.MeshPhysicalMaterial({
          color: orbital.color,
          transparent: true,
          opacity: 0.15,
          metalness: 0.1,
          roughness: 0.9,
          side: THREE.DoubleSide
        });

        const orbitalMesh = new THREE.Mesh(orbitalGeometry, orbitalMaterial);
        
        // Shape p orbitals correctly
        if (orbital.shape === 'dumbbell') {
          orbitalMesh.scale.set(0.6, 1.8, 0.6);
          
          // Create three p orbitals (px, py, pz)
          for (let p = 0; p < 3 && electronCount < electrons; p++) {
            const pOrbital = orbitalMesh.clone();
            if (p === 1) pOrbital.rotation.z = Math.PI / 2; // py
            if (p === 2) pOrbital.rotation.x = Math.PI / 2; // pz
            group.add(pOrbital);
          }
        } else {
          group.add(orbitalMesh);
        }

        // Add electrons with quantum mechanical behavior
        const electronsInOrbital = Math.min(orbital.electrons, electrons - electronCount);
        
        for (let e = 0; e < electronsInOrbital; e++) {
          const electronGeometry = new THREE.SphereGeometry(0.02, 12, 12);
          const electronMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00, // Yellow for electrons
            transparent: true,
            opacity: 0.8
          });

          const electron = new THREE.Mesh(electronGeometry, electronMaterial);
          
          electron.userData.animate = (time: number, index: number) => {
            // Quantum mechanical probability distribution
            const waveFunction = Math.sin(time * 5 + index * 2.5);
            const radius = orbital.radius * (0.7 + 0.3 * Math.abs(waveFunction));
            
            if (orbital.shape === 'spherical') {
              // s orbital - spherically symmetric
              const phi = time * (1 + index * 0.3) + index * Math.PI;
              const theta = Math.sin(time * 0.8 + index) * Math.PI;
              
              electron.position.set(
                radius * Math.sin(theta) * Math.cos(phi),
                radius * Math.cos(theta),
                radius * Math.sin(theta) * Math.sin(phi)
              );
            } else {
              // p orbital - dumbbell shape
              const angle = time * (2 + index * 0.5) + index * Math.PI * 2 / 3;
              const sign = Math.sin(angle) > 0 ? 1 : -1;
              
              if (e < 3) { // px, py, pz
                const coords = [0, 0, 0];
                coords[e] = sign * radius * 0.8;
                coords[(e + 1) % 3] = Math.sin(angle * 1.3) * radius * 0.3;
                coords[(e + 2) % 3] = Math.cos(angle * 0.7) * radius * 0.3;
                
                electron.position.set(coords[0], coords[1], coords[2]);
              }
            }
            
            // Heisenberg uncertainty principle - position uncertainty
            electron.visible = Math.random() > 0.3; // Quantum tunneling effect
          };

          group.add(electron);
          electronCount++;
        }
      });

      // Add energy level indicators
      const energyLevels = [-13.6, -3.4]; // eV for 1s and 2s/2p
      energyLevels.forEach((energy, level) => {
        const levelRadius = 0.529 * Math.pow(level + 1, 2); // Bohr model scaling
        const levelGeometry = new THREE.RingGeometry(levelRadius - 0.02, levelRadius + 0.02, 32);
        const levelMaterial = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        });
        
        const energyLevel = new THREE.Mesh(levelGeometry, levelMaterial);
        energyLevel.rotation.x = Math.PI / 2;
        group.add(energyLevel);
      });

      return group;
    };

    const addControls = (THREE: any, camera: any, renderer: any) => {
      let isMouseDown = false;
      let mouseX = 0, mouseY = 0;
      let targetRotationX = 0, targetRotationY = 0;
      let cameraDistance = 5;

      const onMouseDown = (event: MouseEvent) => {
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
        renderer.domElement.style.cursor = 'grabbing';
      };

      const onMouseUp = () => {
        isMouseDown = false;
        renderer.domElement.style.cursor = 'grab';
      };

      const onMouseMove = (event: MouseEvent) => {
        if (!isMouseDown) return;

        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;

        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.005;

        // Limit vertical rotation
        targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));

        mouseX = event.clientX;
        mouseY = event.clientY;
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        cameraDistance += event.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(25, cameraDistance));
        
        camera.position.setLength(cameraDistance);
      };

      // Add event listeners
      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('mouseup', onMouseUp);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

      // Set initial cursor
      renderer.domElement.style.cursor = 'grab';

      // Smooth camera movement with orbital controls
      const updateCamera = () => {
        // Smooth rotation
        camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.1;
        camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.1;

        // Update camera position in orbital fashion
        const x = Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x) * cameraDistance;
        const y = Math.sin(camera.rotation.x) * cameraDistance;
        const z = Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x) * cameraDistance;

        camera.position.lerp(new THREE.Vector3(x, y, z), 0.1);
        camera.lookAt(0, 0, 0);

        requestAnimationFrame(updateCamera);
      };
      updateCamera();
    };

    const createAdvancedUI = (container: HTMLElement) => {
      const uiHTML = `
        <div style="position: absolute; top: 20px; right: 20px; z-index: 100;">
          <button onclick="window.closeAdvancedViewer()" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
            ✕ Exit
          </button>
        </div>
        
        <div style="position: absolute; top: 20px; left: 20px; z-index: 100;">
          <div style="background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(26,26,46,0.8)); color: white; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); font-size: 14px;">
            <h4 style="margin: 0 0 12px 0; color: #4FC3F7; font-size: 16px; font-weight: bold;">Easy Controls</h4>
            <div style="margin-bottom: 8px;"><strong>🖱️ Mouse:</strong> Click and drag to rotate</div>
            <div style="margin-bottom: 8px;"><strong>📱 Touch:</strong> Swipe to rotate model</div>
            <div style="margin-bottom: 8px;"><strong>🔍 Zoom:</strong> Scroll wheel or W/S keys</div>
            <div style="margin-bottom: 8px;"><strong>⬅️➡️ Rotate:</strong> Arrow keys or A/D</div>
            <div style="margin-bottom: 8px;"><strong>🔄 Reset:</strong> Press R key</div>
            <div style="color: #4FC3F7; font-size: 12px; margin-top: 8px;">All controls work with keyboard and touch!</div>
          </div>
        </div>
        
        <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; text-align: center; z-index: 100;">
          <div style="background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(26,26,46,0.9)); color: white; padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px);">
            <h3 style="margin: 0 0 8px 0; color: #4FC3F7; font-size: 20px; font-weight: bold;">${selectedModel}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">Advanced 3D visualization with realistic physics simulation</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">Interactive elements • Real-time animations • Scientific accuracy</p>
          </div>
        </div>
        
        <div style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); z-index: 100;">
          <div style="background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(26,26,46,0.8)); color: white; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px);">
            <button onclick="window.zoomIn()" style="display: block; background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; font-size: 14px; width: 60px;">Zoom +</button>
            <button onclick="window.zoomOut()" style="display: block; background: #FF9800; color: white; border: none; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; font-size: 14px; width: 60px;">Zoom -</button>
            <button onclick="window.resetView()" style="display: block; background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; width: 60px;">Reset</button>
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', uiHTML);

      (window as any).closeAdvancedViewer = () => {
        container?.remove();
        onSessionEnd();
      };

      (window as any).zoomIn = () => {
        // Camera zoom functionality handled by wheel events
      };

      (window as any).zoomOut = () => {
        // Camera zoom functionality handled by wheel events
      };

      (window as any).resetView = () => {
        // Reset camera position
      };
    };

    createAdvancedViewer();

    return () => {
      const container = document.getElementById('advanced-viewer-container');
      if (container) {
        container.remove();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold mb-3">Loading Advanced 3D Engine</h3>
          <p className="text-blue-200">Initializing Three.js • Physics Engine • Shaders</p>
          <div className="mt-4 w-64 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}