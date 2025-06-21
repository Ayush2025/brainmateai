import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarPanel } from "./avatarPanel";

import { 
  Send, 
  BookOpen, 
  Brain, 
  Lightbulb,
  Sun,
  Moon,
  Download,
  Volume2,
  VolumeX,
  Mic,
  MicOff
} from "lucide-react";

import type { Tutor } from "@shared/schema";

interface TutorWithContent extends Tutor {
  content: any[];
}

interface ChatInterfaceProps {
  tutor: TutorWithContent;
  sessionToken: string;
}

interface MessageWithMetadata {
  id: number;
  sessionId: number;
  role: string;
  content: string;
  timestamp: Date | null;
  metadata?: {
    emotion?: string;
    suggestions?: string[];
    needsClarification?: boolean;
    resources?: {
      youtubeRecommendations?: Array<{
        title: string;
        searchQuery: string;
        description: string;
      }>;
      googleSearchLinks?: Array<{
        title: string;
        searchQuery: string;
        description: string;
      }>;
    };
  };
}

export function ChatInterface({ tutor, sessionToken }: ChatInterfaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const optimisticMessageRef = useRef<number | null>(null);

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [localMessages, setLocalMessages] = useState<MessageWithMetadata[]>([]);
  const [localTheme, setLocalTheme] = useState(() => {
    return localStorage.getItem("brainmate-theme") || "light";
  });
  
  // Theme management
  useEffect(() => {
    const updateTheme = () => {
      if (localTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("brainmate-theme", localTheme);
    };
    updateTheme();
  }, [localTheme]);

  const toggleTheme = () => {
    setLocalTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === "Hindi" ? "hi-IN" : 
                       selectedLanguage === "Spanish" ? "es-ES" :
                       selectedLanguage === "French" ? "fr-FR" :
                       selectedLanguage === "German" ? "de-DE" :
                       selectedLanguage === "Japanese" ? "ja-JP" :
                       selectedLanguage === "Korean" ? "ko-KR" :
                       selectedLanguage === "Chinese" ? "zh-CN" :
                       selectedLanguage === "Arabic" ? "ar-SA" : "en-US";
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + " " + transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Unable to process voice input. Please try again.",
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    }
  }, [selectedLanguage, toast]);

  // Start/stop voice recognition
  const toggleVoiceInput = () => {
    if (!speechRecognition) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognition.start();
      } catch (error) {
        toast({
          title: "Voice Input Error",
          description: "Unable to start voice input. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, isTyping]);

  // Speech synthesis functions
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    if (speechSynthRef.current) {
      window.speechSynthesis.cancel();
    }
    
    // Clean text for speech (remove markdown, emojis, etc.)
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/🔍|📚|🎥|💡/g, '')
      .trim();
    
    if (!cleanText) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    speechSynthRef.current = utterance;
    
    // Configure voice based on selected language
    const voices = window.speechSynthesis.getVoices();
    const languageCode = selectedLanguage === "Hindi" ? "hi" : 
                        selectedLanguage === "Spanish" ? "es" : "en";
    
    const preferredVoice = voices.find(voice => 
      voice.lang.toLowerCase().includes(languageCode.toLowerCase())
    ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      speechSynthRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      speechSynthRef.current = null;
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      speechSynthRef.current = null;
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Generate session notes PDF
  const generateSessionNotes = async () => {
    try {
      const response = await apiRequest("POST", "/api/generate-session-notes", {
        sessionToken,
        tutorName: tutor.name,
        tutorSubject: tutor.subject,
        messages: localMessages
      });
      const result = await response.json();
      
      // Create a blob from the PDF data
      const blob = new Blob([new Uint8Array(result.pdfBuffer.data)], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tutor.name}_Session_Notes_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Notes Downloaded",
        description: "Your session notes have been saved as a PDF",
      });
    } catch (error) {
      toast({
        title: "Download Failed", 
        description: "Unable to generate session notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch messages from server
  const { data: serverMessages = [], refetch: refetchMessages } = useQuery<MessageWithMetadata[]>({
    queryKey: ["/api/chat/sessions", sessionToken, "messages"],
    refetchInterval: false,
    retry: false,
  });

  // Initialize local messages from server
  useEffect(() => {
    if (serverMessages.length > 0) {
      setLocalMessages(serverMessages);
    }
  }, [serverMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, mode }: { content: string; mode: string }) => {
      setIsTyping(true);
      
      // Create optimistic user message
      const optimisticUserMessage: MessageWithMetadata = {
        id: Date.now(),
        sessionId: 0,
        role: "user",
        content,
        timestamp: new Date(),
        metadata: {}
      };
      
      optimisticMessageRef.current = optimisticUserMessage.id;
      setLocalMessages(prev => [...prev, optimisticUserMessage]);
      
      const response = await apiRequest("POST", "/api/chat/message", {
        sessionToken,
        content,
        mode,
        preferredLanguage: selectedLanguage
      });
      
      setMessage("");
      
      // Remove optimistic message and add real messages
      setLocalMessages(prev => 
        prev.filter(m => m.id !== optimisticMessageRef.current)
      );
      optimisticMessageRef.current = null;
      
      return response.json();
    },
    onSuccess: (data) => {
      const { userMessage, assistantMessage } = data;
      
      // Add real messages
      setLocalMessages(prev => [
        ...prev,
        {
          ...userMessage,
          timestamp: new Date(userMessage.timestamp)
        },
        {
          ...assistantMessage,
          timestamp: new Date(assistantMessage.timestamp)
        }
      ]);
      
      // Speak tutor response if voice is enabled
      if (voiceEnabled) {
        speakText(assistantMessage.content);
      }
      
      // Invalidate and refetch session messages
      queryClient.invalidateQueries({
        queryKey: ["/api/chat/sessions", sessionToken, "messages"]
      });
    },
    onError: (error) => {
      // Remove optimistic message on error
      if (optimisticMessageRef.current) {
        setLocalMessages(prev => 
          prev.filter(m => m.id !== optimisticMessageRef.current)
        );
        optimisticMessageRef.current = null;
      }
      
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    },
    onSettled: () => {
      setIsTyping(false);
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent, mode = "chat") => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate({ content: message.trim(), mode });
  };

  // Auto-resize effect
  useEffect(() => {
    if (localMessages.length > 0 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages, isTyping]);

  // Automatically refetch messages periodically to ensure chat history is current
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
    }, 5000); // Refetch every 5 seconds to keep chat history updated

    return () => clearInterval(interval);
  }, [refetchMessages]);

  const handleSendMessage = (mode = "chat") => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ content: message.trim(), mode });
  };

  const languages = [
    "English", "Hindi", "Spanish", "French", "German", "Italian", 
    "Portuguese", "Russian", "Japanese", "Korean", "Chinese", "Arabic"
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{(tutor.name || 'T')[0]}</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{tutor.name || 'Tutor'}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-300">{tutor.subject || 'Subject'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoice}
              className="w-8 h-8 p-0"
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-8 h-8 p-0"
            >
              {localTheme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceInput}
              className={`w-8 h-8 p-0 ${isListening ? 'bg-red-100 dark:bg-red-900/20' : ''}`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </Button>
            {localMessages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={generateSessionNotes}
                className="w-8 h-8 p-0"
              >
                <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Avatar Panel */}
        <div className="mt-4">
          <AvatarPanel 
            tutor={tutor}
            isActive={localMessages.length > 0}
            voiceEnabled={voiceEnabled}
            onToggleVoice={toggleVoice}
            isSpeaking={isSpeaking}
            lastResponse={localMessages.filter(m => m.role === 'assistant').slice(-1)[0]?.content}
          />
        </div>
        
        {/* Mobile Quick Actions */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendMessage("lecture")}
            disabled={sendMessageMutation.isPending}
            className="flex flex-col items-center space-y-1 h-auto py-2"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Lecture</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendMessage("quiz")}
            disabled={sendMessageMutation.isPending}
            className="flex flex-col items-center space-y-1 h-auto py-2"
          >
            <Brain className="w-4 h-4" />
            <span className="text-xs">Quiz</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendMessage("examples")}
            disabled={sendMessageMutation.isPending}
            className="flex flex-col items-center space-y-1 h-auto py-2"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs">Examples</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Panel */}
        <div className="hidden lg:flex w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 flex-col">
          {/* Tutor Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tutor.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{tutor.subject}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-8 h-8 p-0"
                >
                  {localTheme === "dark" ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-600" />
                  )}
                </Button>
                {localMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateSessionNotes}
                    className="w-8 h-8 p-0"
                  >
                    <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Language Preference
                </label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Voice Responses
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoice}
                  className="w-8 h-8 p-0"
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceInput}
                  className={`w-8 h-8 p-0 ${isListening ? 'bg-red-100 dark:bg-red-900/20' : ''}`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                  ) : (
                    <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Avatar Panel */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <AvatarPanel 
              tutor={tutor}
              isActive={localMessages.length > 0}
              voiceEnabled={voiceEnabled}
              onToggleVoice={toggleVoice}
              isSpeaking={isSpeaking}
              lastResponse={localMessages.filter(m => m.role === 'assistant').slice(-1)[0]?.content}
            />
          </div>

          {/* Quick Actions */}
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSendMessage("lecture")}
              disabled={sendMessageMutation.isPending}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Start Lecture Mode
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSendMessage("quiz")}
              disabled={sendMessageMutation.isPending}
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate Quiz
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSendMessage("examples")}
              disabled={sendMessageMutation.isPending}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Show Examples
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {localMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : msg.role === "system"
                        ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                    
                    {msg.metadata?.suggestions && msg.metadata.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Suggestions:</p>
                        {msg.metadata.suggestions.map((suggestion, idx) => (
                          <Badge key={idx} variant="secondary" className="mr-2 mb-2">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {msg.metadata?.resources && (
                      <div className="mt-3 space-y-2">
                        {msg.metadata.resources.youtubeRecommendations && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">🎥 YouTube Resources:</p>
                            {msg.metadata.resources.youtubeRecommendations.map((video, idx) => (
                              <div key={idx} className="text-sm bg-gray-50 dark:bg-gray-700 rounded p-2 mb-2">
                                <strong>{video.title}</strong>
                                <br />
                                <span className="text-gray-600 dark:text-gray-300">{video.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {msg.metadata.resources.googleSearchLinks && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">🔍 Additional Resources:</p>
                            {msg.metadata.resources.googleSearchLinks.map((link, idx) => (
                              <div key={idx} className="text-sm bg-gray-50 dark:bg-gray-700 rounded p-2 mb-2">
                                <strong>{link.title}</strong>
                                <br />
                                <span className="text-gray-600 dark:text-gray-300">{link.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {msg.timestamp && (
                      <div className="text-xs opacity-70 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex space-x-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about the topic..."
                  className="flex-1 min-h-[80px] resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  disabled={sendMessageMutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleVoiceInput}
                    disabled={sendMessageMutation.isPending}
                    className={`${isListening ? 'bg-red-100 dark:bg-red-900/20 border-red-300' : 'border-blue-300'}`}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-red-600 animate-pulse" />
                    ) : (
                      <Mic className="w-4 h-4 text-blue-600" />
                    )}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  {isSpeaking && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={stopSpeaking}
                      className="text-red-600 border-red-300"
                    >
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}