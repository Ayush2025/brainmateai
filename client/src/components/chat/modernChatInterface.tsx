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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
  MicOff,
  ArrowLeft,
  MoreVertical,
  Sparkles,
  MessageSquare,
  Zap,
  Home
} from "lucide-react";

import type { Tutor } from "@shared/schema";
import { analyticsTracker } from "@/lib/analyticsTracker";

interface TutorWithContent extends Tutor {
  content: any[];
}

interface ChatInterfaceProps {
  tutor: TutorWithContent;
  sessionToken: string;
}

interface MessageWithMetadata {
  id: number | string;
  sessionId: number;
  role: string;
  content: string;
  timestamp: Date | null;
  isOptimistic?: boolean;
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

export function ModernChatInterface({ tutor, sessionToken }: ChatInterfaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [localMessages, setLocalMessages] = useState<MessageWithMetadata[]>([]);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("brainmate-theme") === "dark";
  });

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("brainmate-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

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
      
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
        
        // Track voice usage analytics
        if (serverMessages.length > 0 && serverMessages[0].sessionId) {
          analyticsTracker.trackVoiceUsed(serverMessages[0].sessionId, tutor.id);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      setSpeechRecognition(recognition);
    }
  }, [selectedLanguage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, isTyping]);

  // Fetch messages from server
  const { data: serverMessages = [], refetch: refetchMessages } = useQuery<MessageWithMetadata[]>({
    queryKey: ["/api/chat/sessions", sessionToken, "messages"],
    refetchInterval: 5000,
    retry: false,
  });

  // Initialize local messages from server and track session start
  useEffect(() => {
    if (serverMessages.length > 0) {
      setLocalMessages(serverMessages);
      
      // Track session start if this is the first time messages are loaded
      if (serverMessages.length > 0 && serverMessages[0].sessionId) {
        analyticsTracker.trackSessionStart(serverMessages[0].sessionId, tutor.id);
      }
    }
  }, [serverMessages, tutor.id]);

  // Track session end when component unmounts
  useEffect(() => {
    return () => {
      if (serverMessages.length > 0 && serverMessages[0].sessionId) {
        analyticsTracker.trackSessionEnd(serverMessages[0].sessionId, tutor.id);
      }
    };
  }, [serverMessages, tutor.id]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, mode }: { content: string; mode: string }) => {
      try {
        setIsTyping(true);
        
        // Add optimistic user message with unique ID
        const optimisticId = `temp-${Date.now()}`;
        const optimisticMessage = {
          id: optimisticId,
          sessionId: 0,
          role: "user",
          content,
          timestamp: new Date(),
          metadata: {},
          isOptimistic: true
        } as MessageWithMetadata;
        
        setLocalMessages(prev => [...prev, optimisticMessage]);
        
        console.log("Sending message:", { sessionToken, content, mode, language: selectedLanguage });
        
        const response = await apiRequest("POST", "/api/chat/message", {
          sessionToken,
          content,
          mode,
          language: selectedLanguage
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Message response:", data);
        
        // Track message sent analytics
        if (data.userMessage && data.userMessage.sessionId) {
          const isQuestion = content.includes('?') || content.toLowerCase().includes('how') || 
                           content.toLowerCase().includes('what') || content.toLowerCase().includes('why') ||
                           content.toLowerCase().includes('when') || content.toLowerCase().includes('where');
          analyticsTracker.trackMessageSent(data.userMessage.sessionId, tutor.id, content, isQuestion);
        }
        
        setMessage("");
        return data;
      } catch (error) {
        console.error("Message sending error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      try {
        console.log("Processing success data:", data);
        
        if (!data || !data.userMessage || !data.assistantMessage) {
          throw new Error("Invalid response structure");
        }
        
        const { userMessage, assistantMessage } = data;
        
        // Replace optimistic message with real messages
        setLocalMessages(prev => {
          // Remove any optimistic messages
          const filtered = prev.filter(m => !m.isOptimistic);
          return [
            ...filtered,
            {
              ...userMessage,
              timestamp: new Date(userMessage.timestamp)
            },
            {
              ...assistantMessage,
              timestamp: new Date(assistantMessage.timestamp)
            }
          ];
        });
        
        // Speak response if voice enabled
        if (voiceEnabled && assistantMessage?.content) {
          speakText(assistantMessage.content);
        }
        
        setIsTyping(false);
      } catch (error) {
        console.error("Success handler error:", error);
        toast({
          title: "Message Processing Failed",
          description: "Response received but could not be processed properly.",
          variant: "destructive",
        });
        setIsTyping(false);
      }
    },
    onError: (error) => {
      console.error("Message mutation error:", error);
      
      // Remove optimistic message
      setLocalMessages(prev => prev.filter(m => !m.isOptimistic));
      
      toast({
        title: "Message Failed",
        description: error.message || "Unable to send message. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  });

  // Generate session notes PDF
  const generateSessionNotes = async () => {
    try {
      setIsGeneratingNotes(true);
      const response = await apiRequest("POST", "/api/generate-session-notes", {
        sessionToken,
        tutorName: tutor.name,
        tutorSubject: tutor.subject,
        messages: localMessages
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          toast({
            title: "Upgrade Required",
            description: "Notes downloads are available for Pro and Premium members only. Upgrade your plan to download session notes.",
            variant: "destructive",
            action: (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/subscription"}
              >
                Upgrade Plan
              </Button>
            ),
          });
          return;
        }
        throw new Error(errorData.message || "Download failed");
      }

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
        description: (error as Error).message || "Unable to generate session notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Speech functions
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    if (speechSynthRef.current) {
      window.speechSynthesis.cancel();
    }
    
    const cleanText = text.replace(/[#*_`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
    if (!cleanText) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    speechSynthRef.current = utterance;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (!speechRecognition) {
      toast({
        title: "Voice Not Supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      speechRecognition.stop();
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

  const handleSendMessage = (mode = "chat") => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({ content: message.trim(), mode });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const languages = [
    "English", "Hindi", "Spanish", "French", "German", 
    "Japanese", "Korean", "Chinese", "Arabic"
  ];

  return (
    <div className="chat-interface flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/10 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = "/"}
              className="lg:hidden hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="relative">
              <Avatar className="h-14 w-14 ring-4 ring-gradient-to-r ring-blue-200 dark:ring-blue-800 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white font-bold text-xl shadow-inner">
                  {(tutor.name || 'AI')[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-r from-green-400 to-emerald-500 border-3 border-white dark:border-slate-900 rounded-full shadow-lg">
                <div className="h-full w-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute -top-1 -left-1 h-4 w-4">
                <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Professor {tutor.name || 'AI Tutor'}
                </h1>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-2 py-1 rounded-full font-medium">
                  PhD
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    AI {tutor.subject || 'Subject'} Specialist
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                    Available 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map((star) => (
                    <div key={star} className="h-3 w-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-sm rotate-45 shadow-sm"></div>
                  ))}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Expert Level • 10+ Years Experience</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (voiceEnabled && isSpeaking) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  if (speechSynthRef.current) {
                    speechSynthRef.current = null;
                  }
                }
                setVoiceEnabled(!voiceEnabled);
              }}
              className={voiceEnabled ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            {isSpeaking && (
              <Button
                variant="ghost" 
                size="icon"
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  if (speechSynthRef.current) {
                    speechSynthRef.current = null;
                  }
                }}
                className="text-red-600 bg-red-50 dark:bg-red-900/20 animate-pulse"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = "/"}
              className="hidden lg:flex"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {localMessages.length === 0 && !isTyping && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Start a conversation with {tutor.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Ask questions, request explanations, or get help with {tutor.subject}
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMessage("Can you give me a lecture on this topic?");
                      setTimeout(() => handleSendMessage("lecture"), 100);
                    }}
                    className="flex flex-col items-center space-y-2 h-auto py-4"
                  >
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Get Lecture</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMessage("Can you create a quiz for me?");
                      setTimeout(() => handleSendMessage("quiz"), 100);
                    }}
                    className="flex flex-col items-center space-y-2 h-auto py-4"
                  >
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Take Quiz</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMessage("Can you explain this concept clearly?");
                      setTimeout(() => handleSendMessage("explain"), 100);
                    }}
                    className="flex flex-col items-center space-y-2 h-auto py-4"
                  >
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm">Get Help</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            {localMessages.map((msg, index) => (
              <div key={msg.id || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {tutor.name}
                      </span>
                    </div>
                  )}
                  
                  <Card className={`p-4 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className={`text-sm leading-relaxed ${
                      msg.role === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {formatMessage(msg.content)}
                    </div>
                    
                    {msg.metadata?.suggestions && msg.metadata.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Separator className="bg-slate-200 dark:bg-slate-600" />
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Suggestions:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.metadata.suggestions.map((suggestion, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="cursor-pointer text-xs hover:bg-blue-100 dark:hover:bg-blue-900/20"
                              onClick={() => {
                                setMessage(suggestion);
                                handleSendMessage();
                              }}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                  
                  <div className={`text-xs text-slate-400 mt-1 ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {tutor.name} is typing...
                    </span>
                  </div>
                  
                  <Card className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Language & Mode Selector */}
          <div className="flex items-center space-x-2 mb-3">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang} className="text-xs">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {localMessages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={generateSessionNotes}
                disabled={isGeneratingNotes}
              >
                <Download className="h-3 w-3 mr-1" />
                {isGeneratingNotes ? "Generating..." : "Export Chat"}
              </Button>
            )}
          </div>

          {/* Input */}
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-[120px] resize-none pr-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                disabled={sendMessageMutation.isPending || isTyping}
              />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVoiceInput}
                className={`absolute right-1 bottom-1 h-8 w-8 ${
                  isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-500'
                }`}
                disabled={sendMessageMutation.isPending || isTyping}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button
              onClick={() => handleSendMessage()}
              disabled={!message.trim() || sendMessageMutation.isPending || isTyping}
              className="h-11 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
            >
              {sendMessageMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}