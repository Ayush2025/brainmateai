import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Bot, 
  MessageCircle, 
  BarChart3, 
  Share2, 
  GraduationCap,
  Check,
  ArrowRight,
  Play,
  FileText,
  Users,
  Clock,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { TutorialOverlay } from "@/components/tutorial/tutorialOverlay";
import { useTutorial } from "@/hooks/useTutorial";

const features = [
  {
    icon: Bot,
    title: "AI Tutor Creation",
    description: "Upload PDFs, documents, or videos and instantly create intelligent tutors trained on your content.",
    benefits: ["Multiple file format support", "Instant AI training", "Content-aware responses"],
    gradient: "from-primary/5 to-primary/10",
    iconBg: "bg-primary/10",
    iconColor: "text-primary"
  },
  {
    icon: Users,
    title: "3D Animated Avatars",
    description: "Lifelike avatars with lip-sync, emotions, and customizable appearances for immersive learning.",
    benefits: ["Real-time lip synchronization", "Emotional expressions", "Customizable appearance"],
    gradient: "from-secondary/5 to-secondary/10",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary"
  },
  {
    icon: MessageCircle,
    title: "Interactive Learning",
    description: "Students engage through natural conversations with voice input and detailed explanations.",
    benefits: ["Voice interaction", "Adaptive explanations", "Multiple learning modes"],
    gradient: "from-accent/5 to-accent/10",
    iconBg: "bg-accent/10",
    iconColor: "text-accent"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track student engagement, popular questions, and learning progress with detailed insights.",
    benefits: ["Engagement metrics", "Learning progress tracking", "Usage analytics"],
    gradient: "from-success/5 to-success/10",
    iconBg: "bg-success/10",
    iconColor: "text-success"
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share tutors via links with customizable access controls and no signup requirements for students.",
    benefits: ["Public/private access", "Password protection", "No student signup needed"],
    gradient: "from-warning/5 to-warning/10",
    iconBg: "bg-warning/10",
    iconColor: "text-warning"
  },
  {
    icon: GraduationCap,
    title: "Teaching Modes",
    description: "Multiple teaching approaches including lectures, flashcards, quizzes, and interactive examples.",
    benefits: ["Lecture mode", "Auto-generated flashcards", "Quiz generation"],
    gradient: "from-destructive/5 to-destructive/10",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive"
  }
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/forever",
    description: "Perfect for getting started",
    features: [
      "1 AI Tutor",
      "Basic chat interface",
      "3 content files per tutor",
      "Community support"
    ],
    unavailable: [
      "Notes downloads",
      "YouTube & Google recommendations",
      "Advanced analytics",
      "Voice interaction",
      "Robotic AI avatars",
      "Priority support"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/month",
    description: "Best for individual educators",
    features: [
      "5 AI Tutors",
      "Advanced chat interface",
      "10 content files per tutor",
      "Notes downloads",
      "YouTube & Google recommendations",
      "Advanced analytics",
      "Voice interaction",
      "Email support",
      "Robotic AI avatars"
    ],
    unavailable: [
      "Priority support"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: "Premium",
    price: "₹599",
    period: "/month",
    description: "Perfect for institutions",
    features: [
      "Unlimited AI Tutors",
      "Advanced chat interface",
      "Unlimited content files",
      "Notes downloads",
      "YouTube & Google recommendations",
      "Advanced analytics",
      "Voice interaction",
      "Premium robotic AI avatars",
      "Priority support",
      "Custom branding"
    ],
    unavailable: [],
    buttonText: "Contact Sales",
    buttonVariant: "secondary" as const,
    popular: false
  }
];

export default function Landing() {
  const [showVideo, setShowVideo] = useState(false);
  const tutorial = useTutorial('landing');

  const handleStartTrial = () => {
    window.location.href = "/api/login";
  };

  const handleWatchDemo = () => {
    setShowVideo(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onTutorialOpen={tutorial.openTutorial} />
      
      <TutorialOverlay
        isOpen={tutorial.isOpen}
        onClose={tutorial.closeTutorial}
        steps={tutorial.steps}
        onComplete={tutorial.completeTutorial}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12 sm:py-20">
        <div className="absolute inset-0 bg-grid-pattern"></div>
        
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl"
            animate={{ 
              x: [0, -40, 0],
              y: [0, 30, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/3 w-24 h-24 bg-accent/10 rounded-full blur-xl"
            animate={{ 
              x: [0, 20, 0],
              y: [0, -15, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-3xl sm:text-5xl md:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Create
              </motion.span>
              <motion.span 
                className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mx-2 sm:mx-4"
                initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                AI Tutors
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                from Your Content
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              Transform your teaching materials into intelligent, interactive AI tutors with 3D avatars, 
              voice synthesis, and personalized learning experiences.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-lg w-full sm:w-auto relative overflow-hidden group"
                  onClick={handleStartTrial}
                  data-tutorial="get-started-btn"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Free Trial
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                  onClick={handleWatchDemo}
                >
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Product Demo Card */}
            <motion.div 
              className="relative max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <motion.div
                whileHover={{ y: -5, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 1.6 }}
                      >
                        <motion.div 
                          className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"
                          whileHover={{ 
                            scale: 1.1, 
                            rotate: 5,
                            backgroundColor: "rgba(var(--primary), 0.2)" 
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          >
                            <FileText className="text-primary h-8 w-8" />
                          </motion.div>
                        </motion.div>
                        <h3 className="font-semibold text-foreground mb-2">Upload Content</h3>
                        <p className="text-sm text-muted-foreground">PDFs, documents, or videos</p>
                      </motion.div>
                      
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.8 }}
                      >
                        <motion.div 
                          className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4"
                          whileHover={{ 
                            scale: 1.1, 
                            rotate: -5,
                            backgroundColor: "rgba(var(--secondary), 0.2)" 
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <Brain className="text-secondary h-8 w-8" />
                          </motion.div>
                        </motion.div>
                        <h3 className="font-semibold text-foreground mb-2">AI Processing</h3>
                        <p className="text-sm text-muted-foreground">Intelligent content analysis</p>
                      </motion.div>
                      
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 2.0 }}
                      >
                        <motion.div 
                          className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4"
                          whileHover={{ 
                            scale: 1.1, 
                            rotate: 5,
                            backgroundColor: "rgba(var(--accent), 0.2)" 
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          >
                            <GraduationCap className="text-accent h-8 w-8" />
                          </motion.div>
                        </motion.div>
                        <h3 className="font-semibold text-foreground mb-2">Interactive Tutor</h3>
                        <p className="text-sm text-muted-foreground">Ready to teach students</p>
                      </motion.div>
                    </div>
                    <motion.div 
                      className="mt-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.2 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="relative overflow-hidden group"
                          onClick={handleWatchDemo}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          <Play className="mr-2 h-5 w-5" />
                          See How It Works
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-2xl sm:text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Everything you need to create engaging, intelligent tutoring experiences
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card 
                    className={`bg-gradient-to-br ${feature.gradient} shadow-lg transition-all duration-300 border-0 h-full relative overflow-hidden group`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                    <CardHeader className="relative z-10">
                      <motion.div 
                        className={`w-16 h-16 ${feature.iconBg} rounded-xl flex items-center justify-center mb-6`}
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: 5,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)" 
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          animate={{ 
                            rotate: [0, 2, -2, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut"
                          }}
                        >
                          <Icon className={`${feature.iconColor} text-2xl`} />
                        </motion.div>
                      </motion.div>
                      <CardTitle className="text-xl font-semibold text-foreground mb-4">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mb-4">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <ul className="text-sm text-muted-foreground space-y-2">
                        {feature.benefits.map((benefit, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-center"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: (index * 0.1) + (i * 0.1) }}
                            viewport={{ once: true }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.2 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check className="text-success mr-2 h-4 w-4" />
                            </motion.div>
                            {benefit}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-2xl sm:text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Choose the plan that fits your teaching needs
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card 
                  className={`relative shadow-lg border-0 h-full transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-b from-primary/5 to-secondary/5 ring-2 ring-primary/20' 
                      : 'bg-background hover:shadow-xl'
                  }`}
                >
                  {plan.popular && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0, rotate: -10 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 shadow-lg">
                        Most Popular
                      </Badge>
                    </motion.div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.4 }}
                      viewport={{ once: true }}
                    >
                      <CardTitle className="text-2xl font-bold text-foreground mb-2">
                        {plan.name}
                      </CardTitle>
                    </motion.div>
                    <motion.div 
                      className="text-4xl font-bold text-foreground mb-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                      viewport={{ once: true }}
                    >
                      {plan.price}
                      <span className="text-lg text-muted-foreground">{plan.period}</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.6 }}
                      viewport={{ once: true }}
                    >
                      <CardDescription className="text-muted-foreground">
                        {plan.description}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>
                
                  <CardContent className="space-y-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.2 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Check className="text-success mr-3 h-4 w-4" />
                          <span className="text-foreground">{feature}</span>
                        </motion.li>
                      ))}
                      {plan.unavailable.map((feature, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.2 + (plan.features.length + i) * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className="w-4 h-4 mr-3"></div>
                          <span className="text-muted-foreground line-through">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.8 }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant={plan.buttonVariant} 
                          className="w-full py-6 text-lg font-semibold relative overflow-hidden"
                          onClick={handleStartTrial}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          {plan.buttonText}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose BrainMate AI?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your educational content into intelligent, interactive learning experiences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bot className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Instant AI Tutors</h3>
              <p className="text-muted-foreground">Upload your content and get an intelligent tutor in minutes</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-secondary h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">3D Avatars</h3>
              <p className="text-muted-foreground">Lifelike avatars with emotions and voice interaction</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-accent h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Analytics</h3>
              <p className="text-muted-foreground">Track engagement and learning progress in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Sales Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-secondary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Need a Custom Solution?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Contact our sales team for enterprise plans, bulk licensing, and custom integrations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Sales & Enterprise Inquiries</p>
              <a 
                href="mailto:brainmateai0@gmail.com" 
                className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                brainmateai0@gmail.com
              </a>
            </div>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-6 py-3"
              onClick={() => window.location.href = 'mailto:brainmateai0@gmail.com?subject=Enterprise%20Inquiry'}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educators already using BrainMate AI to create engaging learning experiences.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6 hover:scale-105 transition-all duration-200"
            onClick={handleStartTrial}
          >
            Start Your Free Trial Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Brain className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold text-foreground">BrainMate AI</span>
              </div>
              <p className="text-muted-foreground">
                Empowering educators with AI-powered tutoring solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="mailto:brainmateai0@gmail.com" className="hover:text-primary transition-colors">Support</a></li>
                <li><a href="mailto:brainmateai0@gmail.com" className="hover:text-primary transition-colors">Sales</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 BrainMate AI. All rights reserved. | Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>

      {/* Floating Tutorial Button */}
      {!tutorial.hasSeenTutorial && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={tutorial.openTutorial}
            className="rounded-full w-16 h-16 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-2xl animate-pulse"
            size="icon"
            title="Take a guided tour"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
