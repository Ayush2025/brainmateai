import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX, 
  Maximize,
  Minimize,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enhanced3DViewerProps {
  tutorId: number;
  tutorName: string;
  subject: string;
  selectedModel?: string;
  onSessionEnd: () => void;
}

export function Enhanced3DViewer({ 
  tutorId, 
  tutorName, 
  subject, 
  selectedModel = "atom",
  onSessionEnd 
}: Enhanced3DViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState(1);
  const { toast } = useToast();

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Auto-start AR when camera is ready
  useEffect(() => {
    if (hasPermission && videoRef.current && !isActive) {
      setTimeout(() => {
        startARSession();
      }, 1000);
    }
  }, [hasPermission]);

  const initializeCamera = async () => {
    setIsLoading(true);
    console.log("Initializing camera...");
    
    try {
      // First try with environment camera (back camera)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: false
        });
        console.log("Environment camera obtained");
      } catch (envError) {
        console.log("Environment camera failed, trying user camera:", envError);
        // Fallback to user camera (front camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: false
        });
        console.log("User camera obtained");
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        
        // Wait for video metadata to load
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded");
              resolve(true);
            };
          }
        });
        
        // Start playing video
        await videoRef.current.play();
        console.log("Video playing successfully");
      }

      setHasPermission(true);
      toast({
        title: "Camera Ready",
        description: "AR viewer is ready to display 3D models.",
      });
    } catch (error) {
      console.error("Camera access error:", error);
      setHasPermission(false);
      toast({
        title: "Camera Required",
        description: "Please allow camera access for AR experience.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startARSession = () => {
    if (!hasPermission || !videoRef.current || !canvasRef.current) {
      return;
    }

    console.log("Starting enhanced 3D AR session...");
    setIsActive(true);
    startRendering();
    
    toast({
      title: "3D AR Active",
      description: `Displaying ${selectedModel} model for ${subject}`,
    });
  };

  const startRendering = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      toast({
        title: "WebGL Not Supported",
        description: "Your device doesn't support 3D graphics.",
        variant: "destructive",
      });
      return;
    }

    const animate = () => {
      if (!isActive) return;

      // Update canvas size to match video
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Set viewport
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      // Clear screen
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      // Render 3D model
      render3DModel(gl);

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const render3DModel = (gl: WebGLRenderingContext) => {
    // Auto-rotate the model
    setRotation(prev => ({
      x: prev.x + 0.01,
      y: prev.y + 0.015,
      z: prev.z + 0.005
    }));

    // Create shader program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, `
      attribute vec3 position;
      attribute vec3 normal;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalMatrix * normal;
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `);

    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform vec3 lightDirection;
      uniform vec3 modelColor;
      
      void main() {
        vec3 normal = normalize(vNormal);
        float light = max(dot(normal, normalize(lightDirection)), 0.3);
        
        // Add some glow effect
        float glow = 1.0 + 0.3 * sin(length(vPosition) * 2.0);
        
        gl_FragColor = vec4(modelColor * light * glow, 0.9);
      }
    `);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program failed to link');
      return;
    }

    gl.useProgram(program);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'position');
    const normalLocation = gl.getAttribLocation(program, 'normal');
    const modelViewLocation = gl.getUniformLocation(program, 'modelViewMatrix');
    const projectionLocation = gl.getUniformLocation(program, 'projectionMatrix');
    const normalMatrixLocation = gl.getUniformLocation(program, 'normalMatrix');
    const lightLocation = gl.getUniformLocation(program, 'lightDirection');
    const colorLocation = gl.getUniformLocation(program, 'modelColor');

    // Create model geometry based on selected model
    const geometry = createModelGeometry(selectedModel);
    
    // Create and bind buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalLocation);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    // Set up matrices
    const modelViewMatrix = createModelViewMatrix();
    const projectionMatrix = createProjectionMatrix(gl.canvas.width / gl.canvas.height);
    const normalMatrix = createNormalMatrix(modelViewMatrix);

    // Set uniforms
    gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);
    gl.uniform3f(lightLocation, 1.0, 1.0, 1.0);
    
    // Set model color based on type
    const color = getModelColor(selectedModel);
    gl.uniform3f(colorLocation, color.r, color.g, color.b);

    // Draw the model
    if (geometry.indices) {
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
      gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, geometry.vertices.length / 3);
    }
  };

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const createModelGeometry = (modelType: string) => {
    switch (modelType) {
      case "Electromagnetic Field":
      case "electromagnetic":
        return createElectromagneticField();
      case "Atomic Structure":
      case "atom":
        return createAtomStructure();
      case "Molecular Bonding":
      case "molecule":
        return createMolecule();
      case "Wave Interference":
      case "wave":
        return createWavePattern();
      case "Chemical Reactions":
      case "reaction":
        return createChemicalReaction();
      case "Periodic Elements":
      case "periodic":
        return createPeriodicStructure();
      default:
        return createCube();
    }
  };

  const createElectromagneticField = () => {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Create field lines around a central core
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 2;
      const z = Math.sin(angle) * 2;
      
      for (let j = 0; j < 20; j++) {
        const y = (j - 10) * 0.3;
        const fieldStrength = 1 / (1 + Math.abs(y) * 0.1);
        
        vertices.push(x * fieldStrength, y, z * fieldStrength);
        normals.push(x, 0, z);
      }
    }

    return { vertices, normals, indices: null };
  };

  const createAtomStructure = () => {
    const vertices = [];
    const normals = [];
    
    // Central nucleus
    const sphereGeometry = createSphere(0.3, 16, 16);
    vertices.push(...sphereGeometry.vertices);
    normals.push(...sphereGeometry.normals);
    
    // Electron orbits
    for (let orbit = 0; orbit < 3; orbit++) {
      const radius = 1 + orbit * 0.8;
      const electronCount = 2 + orbit * 2;
      
      for (let e = 0; e < electronCount; e++) {
        const angle = (e / electronCount) * Math.PI * 2 + orbit * 0.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(Date.now() * 0.001 + e) * 0.2;
        
        const electronGeometry = createSphere(0.1, 8, 8);
        for (let i = 0; i < electronGeometry.vertices.length; i += 3) {
          vertices.push(
            electronGeometry.vertices[i] + x,
            electronGeometry.vertices[i + 1] + y,
            electronGeometry.vertices[i + 2] + z
          );
        }
        normals.push(...electronGeometry.normals);
      }
    }
    
    return { vertices, normals, indices: null };
  };

  const createMolecule = () => {
    const vertices = [];
    const normals = [];
    
    // Create benzene ring structure
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 1.5;
      const z = Math.sin(angle) * 1.5;
      
      const atomGeometry = createSphere(0.4, 12, 12);
      for (let j = 0; j < atomGeometry.vertices.length; j += 3) {
        vertices.push(
          atomGeometry.vertices[j] + x,
          atomGeometry.vertices[j + 1],
          atomGeometry.vertices[j + 2] + z
        );
      }
      normals.push(...atomGeometry.normals);
    }
    
    return { vertices, normals, indices: null };
  };

  const createWavePattern = () => {
    const vertices = [];
    const normals = [];
    
    const time = Date.now() * 0.001;
    
    for (let x = -3; x <= 3; x += 0.2) {
      for (let z = -3; z <= 3; z += 0.2) {
        const distance = Math.sqrt(x * x + z * z);
        const y = Math.sin(distance * 2 - time * 3) * 0.5 * Math.exp(-distance * 0.3);
        
        vertices.push(x, y, z);
        normals.push(0, 1, 0);
      }
    }
    
    return { vertices, normals, indices: null };
  };

  const createChemicalReaction = () => {
    const vertices = [];
    const normals = [];
    
    // Reactants on left, products on right
    const reactantGeometry = createSphere(0.6, 12, 12);
    for (let i = 0; i < reactantGeometry.vertices.length; i += 3) {
      vertices.push(
        reactantGeometry.vertices[i] - 2,
        reactantGeometry.vertices[i + 1],
        reactantGeometry.vertices[i + 2]
      );
    }
    normals.push(...reactantGeometry.normals);
    
    const productGeometry = createSphere(0.6, 12, 12);
    for (let i = 0; i < productGeometry.vertices.length; i += 3) {
      vertices.push(
        productGeometry.vertices[i] + 2,
        productGeometry.vertices[i + 1],
        productGeometry.vertices[i + 2]
      );
    }
    normals.push(...productGeometry.normals);
    
    return { vertices, normals, indices: null };
  };

  const createPeriodicStructure = () => {
    const vertices = [];
    const normals = [];
    
    // Create periodic table grid structure
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 18; col++) {
        const x = (col - 9) * 0.3;
        const y = (row - 3) * 0.3;
        const z = 0;
        
        const cubeGeometry = createCube(0.1);
        for (let i = 0; i < cubeGeometry.vertices.length; i += 3) {
          vertices.push(
            cubeGeometry.vertices[i] + x,
            cubeGeometry.vertices[i + 1] + y,
            cubeGeometry.vertices[i + 2] + z
          );
        }
        normals.push(...cubeGeometry.normals);
      }
    }
    
    return { vertices, normals, indices: null };
  };

  const createSphere = (radius: number, widthSegments: number, heightSegments: number) => {
    const vertices = [];
    const normals = [];
    
    for (let y = 0; y <= heightSegments; y++) {
      const v = y / heightSegments;
      const theta = v * Math.PI;
      
      for (let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments;
        const phi = u * Math.PI * 2;
        
        const sphereX = radius * Math.sin(theta) * Math.cos(phi);
        const sphereY = radius * Math.cos(theta);
        const sphereZ = radius * Math.sin(theta) * Math.sin(phi);
        
        vertices.push(sphereX, sphereY, sphereZ);
        
        const normal = [sphereX, sphereY, sphereZ];
        const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
        normals.push(normal[0] / length, normal[1] / length, normal[2] / length);
      }
    }
    
    return { vertices, normals };
  };

  const createCube = (size: number = 1) => {
    const s = size / 2;
    const vertices = [
      // Front face
      -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,  s,
      // Back face
      -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s, -s,
      // Top face
      -s,  s, -s, -s,  s,  s,  s,  s,  s,  s,  s, -s,
      // Bottom face
      -s, -s, -s,  s, -s, -s,  s, -s,  s, -s, -s,  s,
      // Right face
       s, -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,
      // Left face
      -s, -s, -s, -s, -s,  s, -s,  s,  s, -s,  s, -s
    ];
    
    const normals = [
      // Front face
       0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,
      // Back face
       0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,
      // Top face
       0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,
      // Bottom face
       0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,
      // Right face
       1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,
      // Left face
      -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0
    ];
    
    return { vertices, normals };
  };

  const createModelViewMatrix = () => {
    const matrix = new Float32Array(16);
    
    // Identity matrix
    matrix[0] = 1; matrix[5] = 1; matrix[10] = 1; matrix[15] = 1;
    
    // Apply transformations
    // Translate to center
    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = -5;
    
    // Apply rotation
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const cosZ = Math.cos(rotation.z);
    const sinZ = Math.sin(rotation.z);
    
    // Rotation matrix (simplified)
    matrix[0] = cosY * cosZ * scale;
    matrix[1] = sinX * sinY * cosZ - cosX * sinZ;
    matrix[2] = cosX * sinY * cosZ + sinX * sinZ;
    matrix[4] = cosY * sinZ * scale;
    matrix[5] = sinX * sinY * sinZ + cosX * cosZ;
    matrix[6] = cosX * sinY * sinZ - sinX * cosZ;
    matrix[8] = -sinY * scale;
    matrix[9] = sinX * cosY;
    matrix[10] = cosX * cosY;
    
    return matrix;
  };

  const createProjectionMatrix = (aspect: number) => {
    const matrix = new Float32Array(16);
    const fov = Math.PI / 4; // 45 degrees
    const near = 0.1;
    const far = 100;
    
    const f = 1 / Math.tan(fov / 2);
    
    matrix[0] = f / aspect;
    matrix[5] = f;
    matrix[10] = (far + near) / (near - far);
    matrix[11] = -1;
    matrix[14] = (2 * far * near) / (near - far);
    
    return matrix;
  };

  const createNormalMatrix = (modelViewMatrix: Float32Array) => {
    // Simplified normal matrix (just use upper 3x3 of model view)
    return new Float32Array([
      modelViewMatrix[0], modelViewMatrix[1], modelViewMatrix[2],
      modelViewMatrix[4], modelViewMatrix[5], modelViewMatrix[6],
      modelViewMatrix[8], modelViewMatrix[9], modelViewMatrix[10]
    ]);
  };

  const getModelColor = (modelType: string) => {
    const colors = {
      "Electromagnetic Field": { r: 0.2, g: 0.8, b: 1.0 },
      "electromagnetic": { r: 0.2, g: 0.8, b: 1.0 },
      "Atomic Structure": { r: 1.0, g: 0.3, b: 0.3 },
      "atom": { r: 1.0, g: 0.3, b: 0.3 },
      "Molecular Bonding": { r: 0.3, g: 1.0, b: 0.3 },
      "molecule": { r: 0.3, g: 1.0, b: 0.3 },
      "Wave Interference": { r: 1.0, g: 0.8, b: 0.2 },
      "wave": { r: 1.0, g: 0.8, b: 0.2 },
      "Chemical Reactions": { r: 0.8, g: 0.2, b: 1.0 },
      "reaction": { r: 0.8, g: 0.2, b: 1.0 },
      "Periodic Elements": { r: 0.5, g: 0.5, b: 1.0 },
      "periodic": { r: 0.5, g: 0.5, b: 1.0 },
    };
    
    return colors[modelType as keyof typeof colors] || { r: 0.7, g: 0.7, b: 0.7 };
  };

  const stopARSession = () => {
    setIsActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    onSessionEnd();
  };

  const adjustScale = (delta: number) => {
    setScale(prev => Math.max(0.1, Math.min(3, prev + delta)));
  };

  const resetRotation = () => {
    setRotation({ x: 0, y: 0, z: 0 });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Initializing 3D AR Camera...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md">
          <CameraOff className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Camera Access Required</h2>
          <p className="mb-4">Enable camera permissions to experience 3D AR models</p>
          <Button onClick={initializeCamera} className="mr-2">
            <Camera className="w-4 h-4 mr-2" />
            Enable Camera
          </Button>
          <Button variant="outline" onClick={onSessionEnd}>
            Exit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      {/* 3D WebGL overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Control UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <Badge className="bg-blue-600">
            {selectedModel} - {subject}
          </Badge>
          <Badge variant="outline" className="bg-black/50 text-white">
            3D AR Active
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => adjustScale(0.1)}
            className="bg-black/50 text-white border-white/20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => adjustScale(-0.1)}
            className="bg-black/50 text-white border-white/20"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetRotation}
            className="bg-black/50 text-white border-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 z-10">
        <Button
          size="lg"
          variant="outline"
          onClick={stopARSession}
          className="bg-red-600 text-white border-red-600 hover:bg-red-700"
        >
          End AR Session
        </Button>
      </div>

      {/* Model info */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        <div className="bg-black/70 rounded-lg p-4 text-white">
          <h3 className="font-bold text-lg">{selectedModel}</h3>
          <p className="text-sm opacity-90">Subject: {subject}</p>
          <p className="text-xs mt-2 opacity-75">
            Rotate automatically • Scale: {scale.toFixed(1)}x • WebGL 3D rendering
          </p>
        </div>
      </div>
    </div>
  );
}