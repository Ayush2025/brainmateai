import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  UserCircle, 
  Crown,
  Sparkles,
  Eye,
  Smile,
  Brain,
  Shuffle,
  Play,
  Pause
} from "lucide-react";
import type { Tutor } from "@shared/schema";

interface AvatarPanelProps {
  tutor: Tutor;
  isActive: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  isSpeaking?: boolean;
  lastResponse?: string;
}

export function AvatarPanel({ tutor, isActive, voiceEnabled, onToggleVoice, isSpeaking: externalIsSpeaking, lastResponse }: AvatarPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [avatarEmotion, setAvatarEmotion] = useState<"neutral" | "happy" | "thinking" | "explaining">("neutral");
  const [currentText, setCurrentText] = useState("Ready to help you learn!");
  const [internalSpeaking, setInternalSpeaking] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");
  const [avatarStyle, setAvatarStyle] = useState<"professional" | "friendly" | "casual">("professional");
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Use external speaking state if provided, otherwise use internal state
  const isSpeaking = externalIsSpeaking !== undefined ? externalIsSpeaking : internalSpeaking;

  // Ready Player Me avatar URLs with different styles
  const avatarUrls = {
    professional: [
      "https://models.readyplayer.me/64f8c5a0b5c6a4001234567a.glb?morphTargets=ARKit&textureAtlas=1024",
      "https://models.readyplayer.me/64f8c5a0b5c6a4001234567b.glb?morphTargets=ARKit&textureAtlas=1024"
    ],
    friendly: [
      "https://models.readyplayer.me/64f8c5a0b5c6a4001234567c.glb?morphTargets=ARKit&textureAtlas=1024",
      "https://models.readyplayer.me/64f8c5a0b5c6a4001234567d.glb?morphTargets=ARKit&textureAtlas=1024"
    ],
    casual: [
      "https://models.readyplayer.me/64f8c5a0b5c6a4001234567e.glb?morphTargets=ARKit&textureAtlas=1024",
      "https://models.readyplayer.me/64f8c5a0b5c6a4001234567f.glb?morphTargets=ARKit&textureAtlas=1024"
    ]
  };

  // Cool 2D robotic AI tutor characters
  const roboticAvatars = [
    {
      id: "robot_alpha",
      name: "Alpha Bot",
      type: "robotic",
      character: "🤖",
      color: "#00D9FF",
      personality: "analytical",
      description: "Advanced AI tutor specializing in STEM subjects"
    },
    {
      id: "robot_nova", 
      name: "Nova Bot",
      type: "robotic",
      character: "🦾",
      color: "#FF6B35",
      personality: "energetic",
      description: "High-energy tutor for creative and artistic subjects"
    },
    {
      id: "robot_sage",
      name: "Sage Bot", 
      type: "robotic",
      character: "🧠",
      color: "#7B68EE",
      personality: "wise",
      description: "Philosophical AI focused on humanities and social sciences"
    },
    {
      id: "robot_spark",
      name: "Spark Bot",
      type: "robotic",
      character: "⚡",
      color: "#FFD700",
      personality: "dynamic",
      description: "Lightning-fast tutor for quick learning and problem solving"
    },
    {
      id: "robot_zen",
      name: "Zen Bot",
      type: "robotic", 
      character: "🧘‍♂️",
      color: "#32CD32",
      personality: "calm",
      description: "Mindful AI tutor for stress-free learning experiences"
    },
    {
      id: "robot_quantum",
      name: "Quantum Bot",
      type: "robotic",
      character: "🌀",
      color: "#FF1493",
      personality: "mysterious",
      description: "Advanced quantum AI for complex theoretical subjects"
    }
  ];

  // Alternative: Professional talking head videos
  const professionalTalkingHeads = [
    "https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4",
    "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    "https://file-examples.com/storage/fe86c6f60e2d95d4e5a9cd7/2017/10/file_example_MP4_480_1_5MG.mp4"
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(0);

  // 3D Avatar styles and animations
  const avatar3DStyles = [
    { name: "Professional Teacher", color: "#3b82f6", bgPattern: "geometric" },
    { name: "Friendly Mentor", color: "#10b981", bgPattern: "dots" },
    { name: "Academic Professor", color: "#8b5cf6", bgPattern: "waves" },
    { name: "Creative Tutor", color: "#f59e0b", bgPattern: "hexagon" }
  ];

  const [avatar3DRef, setAvatar3DRef] = useState<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number>();

  // Cycle through different avatars
  const cycleAvatar = () => {
    setSelectedAvatar((prev) => (prev + 1) % roboticAvatars.length);
  };

  const [avatarLoaded, setAvatarLoaded] = useState(true); // Robotic avatars load instantly

  // 3D Avatar animation logic
  useEffect(() => {
    if (!avatar3DRef) return;
    
    let time = 0;
    const animate = () => {
      time += 0.016; // 60fps
      
      if (avatar3DRef) {
        // Head rotation for natural movement
        const headRotationY = Math.sin(time * 0.5) * 3;
        const headRotationX = Math.sin(time * 0.3) * 2;
        
        // Breathing animation
        const breathScale = 1 + Math.sin(time * 0.8) * 0.02;
        
        // Eye movement
        const eyeX = Math.sin(time * 0.7) * 10;
        const eyeY = Math.cos(time * 0.5) * 5;
        
        // Speaking mouth animation
        const mouthOpen = isSpeaking ? Math.abs(Math.sin(time * 8)) * 0.5 + 0.3 : 0.1;
        
        // Apply transforms
        avatar3DRef.style.transform = `
          perspective(1000px) 
          rotateY(${headRotationY}deg) 
          rotateX(${headRotationX}deg) 
          scale(${breathScale})
        `;
        
        // Update eyes
        const leftEye = avatar3DRef.querySelector('.left-eye') as HTMLElement;
        const rightEye = avatar3DRef.querySelector('.right-eye') as HTMLElement;
        if (leftEye && rightEye) {
          leftEye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
          rightEye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
        }
        
        // Update mouth
        const mouth = avatar3DRef.querySelector('.mouth') as HTMLElement;
        if (mouth) {
          mouth.style.transform = `scaleY(${mouthOpen})`;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [avatar3DRef, isSpeaking, isActive]);

  // Text-to-Speech functionality
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => {
      setInternalSpeaking(true);
      setAvatarEmotion("explaining");
    };
    
    utterance.onend = () => {
      setInternalSpeaking(false);
      setAvatarEmotion("happy");
    };
    
    utterance.onerror = () => {
      setInternalSpeaking(false);
    };
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setInternalSpeaking(false);
    }
  };

  // Demo speech function
  const handleTestSpeech = () => {
    const demoTexts = [
      "Hello! I'm your AI tutor. How can I help you learn today?",
      "I'm here to make learning interactive and fun!",
      "Ask me anything about your subject, and I'll explain it clearly.",
      "Let's explore the fascinating world of knowledge together!"
    ];
    
    const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
    setCurrentText(randomText);
    speakText(randomText);
  };

  // Avatar interaction handler
  const handleAvatarClick = () => {
    cycleAvatar();
  };

  const getAvatarState = () => {
    if (isSpeaking) return "speaking";
    if (isActive) return "explaining";
    return avatarEmotion;
  };

  const handleUpgrade = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground mb-2">
          AI Tutor Avatar
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Interactive 3D teaching assistant
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Human-like 3D Avatar Display */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-6 border border-blue-200 dark:border-blue-700">
          <div className="text-center">
            {/* Real Human Avatar */}
            <div className="relative">
              <div 
                className="w-52 h-52 mx-auto mb-4 cursor-pointer hover:scale-105 transition-transform duration-300 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl"
                onClick={handleAvatarClick}
                style={{ filter: 'drop-shadow(0 8px 24px rgba(59, 130, 246, 0.4))' }}
              >
                {/* Cool 2D Robotic Avatar Display */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Robotic Character Avatar */}
                  <div
                    className={`relative transition-all duration-500 ${
                      isSpeaking ? 'scale-110' : isActive ? 'scale-105' : 'scale-100'
                    }`}
                    style={{
                      filter: isSpeaking ? 'brightness(1.3) saturate(1.5)' : isActive ? 'brightness(1.1)' : 'brightness(1)'
                    }}
                  >
                    {/* Main Robot Character */}
                    <div 
                      className="text-8xl select-none"
                      style={{
                        textShadow: `0 0 20px ${roboticAvatars[selectedAvatar].color}`,
                        transform: isSpeaking ? 'rotateY(10deg)' : isActive ? 'rotateY(5deg)' : 'rotateY(0deg)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {roboticAvatars[selectedAvatar].character}
                    </div>

                    {/* Energy Ring Effect */}
                    {(isSpeaking || isActive) && (
                      <div 
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          background: `radial-gradient(circle, ${roboticAvatars[selectedAvatar].color}20, transparent 70%)`,
                          animationDuration: isSpeaking ? '1s' : '2s'
                        }}
                      ></div>
                    )}

                    {/* Particle Effects */}
                    {isSpeaking && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full animate-bounce"
                            style={{
                              backgroundColor: roboticAvatars[selectedAvatar].color,
                              left: `${20 + Math.sin(i * 0.8) * 60}%`,
                              top: `${20 + Math.cos(i * 0.8) * 60}%`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '0.8s',
                              opacity: 0.7
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Speaking Status */}
                  {isSpeaking && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="flex items-center space-x-2 rounded-full px-3 py-1"
                        style={{ backgroundColor: `${roboticAvatars[selectedAvatar].color}E6` }}
                      >
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-3 bg-white rounded-full animate-pulse"
                              style={{
                                animationDelay: `${i * 0.15}s`,
                                animationDuration: '0.8s'
                              }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-xs text-white font-medium">Transmitting</span>
                      </div>
                    </div>
                  )}

                  {/* Thinking State */}
                  {isActive && !isSpeaking && (
                    <div className="absolute top-4 right-4">
                      <div 
                        className="flex items-center space-x-1 rounded-full px-2 py-1"
                        style={{ backgroundColor: `${roboticAvatars[selectedAvatar].color}CC` }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs text-white font-medium">Processing</span>
                      </div>
                    </div>
                  )}

                  {/* Bot Status Indicator */}
                  <div className="absolute bottom-1 right-1 text-xs text-gray-300 bg-black/30 rounded px-1">
                    {roboticAvatars[selectedAvatar].personality.toUpperCase()} AI
                  </div>
                </div>
              </div>
              
              {/* Interactive Status indicator */}
              <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${
                isSpeaking ? 'bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50' :
                isActive ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 
                'bg-gray-400 shadow-lg shadow-gray-400/50'
              }`}></div>
              
              {/* Emotion indicator */}
              <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full">
                <span className="text-xs text-white font-medium capitalize">
                  {getAvatarState()}
                </span>
              </div>

              {/* Click to change indicator */}
              <div className="absolute bottom-4 right-4 px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full">
                <Shuffle className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{tutor.name}</p>
              <p className="text-xs text-muted-foreground">
                {isSpeaking ? `Speaking: "${currentText.slice(0, 50)}..."` : isActive ? "Responding..." : "Ready to help"}
              </p>
            </div>
            
            {/* Avatar Controls */}
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleVoice}
                title={voiceEnabled ? "Mute Avatar" : "Unmute Avatar"}
                className={voiceEnabled ? "border-green-300 text-green-600" : "border-gray-300 text-gray-500"}
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSpeech}
                title="Test Avatar Voice"
                disabled={isSpeaking}
                className={isSpeaking ? "animate-pulse" : ""}
              >
                {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cycleAvatar}
                title="Change Avatar"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>

            {/* Emotion Control Panel */}
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center">Avatar Emotions</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={avatarEmotion === "happy" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvatarEmotion("happy")}
                  className="text-xs"
                >
                  <Smile className="w-3 h-3 mr-1" />
                  Happy
                </Button>
                <Button
                  variant={avatarEmotion === "thinking" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvatarEmotion("thinking")}
                  className="text-xs"
                >
                  <Brain className="w-3 h-3 mr-1" />
                  Think
                </Button>
                <Button
                  variant={avatarEmotion === "neutral" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvatarEmotion("neutral")}
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Calm
                </Button>
                <Button
                  variant={avatarEmotion === "explaining" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvatarEmotion("explaining")}
                  className="text-xs"
                >
                  <UserCircle className="w-3 h-3 mr-1" />
                  Teach
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Tutor Information */}
        <div className="space-y-3 mb-6">
          <div>
            <p className="text-sm font-medium text-foreground">Subject</p>
            <Badge variant="secondary" className="mt-1">{tutor.subject}</Badge>
          </div>
          
          {tutor.description && (
            <div>
              <p className="text-sm font-medium text-foreground">About</p>
              <p className="text-xs text-muted-foreground mt-1">{tutor.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-foreground">Features</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="outline" className="text-xs">Text Chat</Badge>
              <Badge variant="outline" className="text-xs">Smart Responses</Badge>
            </div>
          </div>
        </div>

        {/* Upgrade Prompt */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary mr-2" />
                <Sparkles className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Get interactive 3D avatars with voice synthesis, lip-sync, and emotional expressions!
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  <li>• Realistic 3D character models</li>
                  <li>• Voice synthesis & lip-sync</li>
                  <li>• Emotional expressions</li>
                  <li>• Custom avatar styles</li>
                </ul>
              </div>
              <Button 
                size="sm" 
                className="w-full"
                onClick={handleUpgrade}
              >
                <Crown className="mr-2 h-3 w-3" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Robotic Avatar Gallery */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-foreground mb-2">AI Bot Characters</p>
          <div className="grid grid-cols-3 gap-2">
            {roboticAvatars.map((avatar, index) => (
              <div
                key={avatar.id}
                className={`relative w-full h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedAvatar === index 
                    ? 'border-blue-500 scale-105' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedAvatar(index)}
                style={{ 
                  background: `linear-gradient(135deg, ${avatar.color}20, ${avatar.color}40)`
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <div 
                    className="text-2xl"
                    style={{ 
                      textShadow: `0 0 10px ${avatar.color}`,
                      filter: `drop-shadow(0 0 5px ${avatar.color})`
                    }}
                  >
                    {avatar.character}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                  {avatar.name.split(' ')[0]}
                </div>
                {selectedAvatar === index && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: avatar.color }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click to change bot • {roboticAvatars.length} AI personalities available
          </p>
          
          {/* Bot Personality Info */}
          <div className="mt-3 p-2 rounded-lg bg-black/10">
            <p className="text-xs font-medium text-center">
              {roboticAvatars[selectedAvatar].name}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {roboticAvatars[selectedAvatar].description}
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
