import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Bot, 
  Users, 
  MessageCircle, 
  Clock, 
  Plus,
  Settings,
  BarChart3,
  Upload,
  LogOut,
  Moon,
  Sun,
  Home,
  Crown,
  HelpCircle,
  Sparkles,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { useTheme } from "@/components/ui/theme-provider";
import { TutorCard } from "@/components/tutor/tutorCard";
import { TutorialOverlay } from "@/components/tutorial/tutorialOverlay";
import { useTutorial } from "@/hooks/useTutorial";
import { CreateTutorForm } from "@/components/tutor/createTutorForm";
import { QuickTutorCreator } from "@/components/tutor/quickTutorCreator";
import { AdvancedFeatures } from "@/components/advancedFeatures";
import { InstantContentGenerator } from "@/components/tutor/instantContentGenerator";
import { AdvancedContentGenerator } from "@/components/tutor/advancedContentGenerator";
import { RealTimeFeatures } from "@/components/realTimeFeatures";
import { LiveDemo } from "@/components/liveDemo";
import { ARManager } from "@/components/ar/ARManager";
import EngagementDashboard from "@/components/analytics/engagementDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Tutor } from "@shared/schema";

interface CreatorStats {
  totalTutors: number;
  totalSessions: number;
  totalMessages: number;
  avgSessionDuration: number;
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [createTutorOpen, setCreateTutorOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [showARManager, setShowARManager] = useState(false);
  const [creationMode, setCreationMode] = useState<'quick' | 'advanced'>('quick');
  const tutorial = useTutorial('dashboard');

  const { data: tutors = [], isLoading: tutorsLoading, error: tutorsError } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<CreatorStats>({
    queryKey: ["/api/analytics/creator-stats"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle authentication errors from queries
  useEffect(() => {
    if (tutorsError && isUnauthorizedError(tutorsError as Error)) {
      toast({
        title: "Session Expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
    }
  }, [tutorsError, toast]);

  // Redirect to home if not authenticated after loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const deleteTutorMutation = useMutation({
    mutationFn: async (tutorId: number) => {
      await apiRequest("DELETE", `/api/tutors/${tutorId}`);
    },
    onSuccess: () => {
      toast({
        title: "Tutor deleted",
        description: "Your AI tutor has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/creator-stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete tutor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTutorCreated = () => {
    setCreateTutorOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/creator-stats"] });
    toast({
      title: "Tutor created",
      description: "Your AI tutor has been created successfully.",
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <TutorialOverlay
        isOpen={tutorial.isOpen}
        onClose={tutorial.closeTutorial}
        steps={tutorial.steps}
        onComplete={tutorial.completeTutorial}
      />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">BrainMate AI</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back, {(user as any)?.firstName || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={tutorial.openTutorial} 
                className="rounded-full"
                title="Take a tour"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center space-x-3 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {((user as any)?.firstName || 'U')[0]}{((user as any)?.lastName || 'S')[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {(user as any)?.firstName || 'User'}
                </span>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <Tabs defaultValue="overview" className="w-full">
          {/* Tab Navigation */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="overflow-x-auto scrollbar-hide pb-2">
              <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 shadow-md inline-flex min-w-max gap-1">
                <TabsTrigger
                  value="overview"
                  className="px-3 py-2 rounded-full data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium text-xs whitespace-nowrap flex items-center gap-1"
                >
                  <Home className="h-3 w-3" />
                  <span className="hidden xs:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tutors"
                  className="px-3 py-2 rounded-full data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium text-xs whitespace-nowrap flex items-center gap-1"
                >
                  <Bot className="h-3 w-3" />
                  Tutors
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="px-3 py-2 rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium text-xs whitespace-nowrap flex items-center gap-1"
                  data-tutorial="create-tutor-btn"
                >
                  <Plus className="h-3 w-3" />
                  Create
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="px-3 py-2 rounded-full data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium text-xs whitespace-nowrap flex items-center gap-1"
                  data-tutorial="analytics-section"
                >
                  <BarChart3 className="h-3 w-3" />
                  <span className="hidden xs:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="px-3 py-2 rounded-full data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium text-xs whitespace-nowrap flex items-center gap-1"
                >
                  <Brain className="h-3 w-3" />
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="px-3 py-2 rounded-full data-[state=active]:bg-slate-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium text-xs whitespace-nowrap flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  <span className="hidden xs:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                onClick={() => {
                  setShowARManager(true);
                  toast({
                    title: "Interactive Simulations",
                    description: "Access PhET educational simulations",
                  });
                }}
                className="px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg font-medium transition-all duration-200 text-xs sm:text-sm"
              >
                <Zap className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Simulations
              </Button>
              <Link href="/subscription">
                <Button 
                  className="px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg font-medium transition-all duration-200 text-xs sm:text-sm"
                  data-tutorial="upgrade-btn"
                >
                  <Crown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <main className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Tutors</p>
                        <p className="text-2xl font-bold text-foreground">
                          {statsLoading ? "..." : (stats as CreatorStats)?.totalTutors || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Bot className="text-primary h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                        <p className="text-2xl font-bold text-foreground">
                          {statsLoading ? "..." : (stats as CreatorStats)?.totalSessions || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Users className="text-green-500 h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Messages</p>
                        <p className="text-2xl font-bold text-foreground">
                          {statsLoading ? "..." : (stats as CreatorStats)?.totalMessages || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <MessageCircle className="text-blue-500 h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Duration</p>
                        <p className="text-2xl font-bold text-foreground">
                          {statsLoading ? "..." : `${Math.round(((stats as CreatorStats)?.avgSessionDuration || 0) / 60)}m`}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Clock className="text-purple-500 h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Recent Activity</span>
                    {((user as any)?.subscriptionTier === "pro" || (user as any)?.subscriptionTier === "premium") && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">PRO</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Latest interactions with your tutors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {((user as any)?.subscriptionTier === "pro" || (user as any)?.subscriptionTier === "premium") ? (
                      tutorsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : (tutors as Tutor[]) && (tutors as Tutor[]).length > 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Activity will appear here as students interact with your tutors</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Create your first tutor to see activity here</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recent Activity Locked</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Upgrade to Pro or Premium to track student interactions and engagement metrics
                          </p>
                          <Link href="/subscription">
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                              <Crown className="mr-2 h-3 w-3" />
                              Upgrade Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </main>
          </TabsContent>

          <TabsContent value="tutors" className="space-y-6">
            <main className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">My Tutors</h2>
                <div className="flex gap-2">
                  <Button onClick={() => setQuickCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Quick Create
                  </Button>
                  <Button variant="outline" onClick={() => setCreateTutorOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Advanced
                  </Button>
                </div>
              </div>
              
              {tutorsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded mb-4"></div>
                        <div className="h-3 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (tutors as Tutor[]) && (tutors as Tutor[]).length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-tutorial="tutor-cards">
                  {(tutors as Tutor[]).map((tutor) => (
                    <TutorCard
                      key={tutor.id}
                      tutor={tutor}
                      onDelete={deleteTutorMutation.mutate}
                      isDeleting={deleteTutorMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No tutors yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first AI tutor to get started</p>
                    <Button onClick={() => setQuickCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Tutor
                    </Button>
                  </CardContent>
                </Card>
              )}
            </main>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <main className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Create AI Tutor</h2>
                  <p className="text-muted-foreground">Choose your preferred creation method</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setQuickCreateOpen(true)}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Quick Creator</h3>
                      <p className="text-muted-foreground mb-4">Create a tutor in under 2 minutes with our streamlined flow</p>
                      <Badge variant="secondary">Recommended</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setCreateTutorOpen(true)}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Settings className="h-8 w-8 text-secondary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Advanced Creator</h3>
                      <p className="text-muted-foreground mb-4">Full customization with detailed settings and configurations</p>
                      <Badge variant="outline">Pro</Badge>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-12">
                  <AdvancedFeatures onFeatureSelect={(feature) => {
                    toast({
                      title: "Feature Coming Soon",
                      description: `${feature} will be available in the next update!`,
                    });
                  }} />
                </div>
              </div>
            </main>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <main className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Analytics</h2>
              
              {/* Recent Activity Section */}
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Recent Activity</span>
                      {((user as any)?.subscriptionTier === "pro" || (user as any)?.subscriptionTier === "premium") && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">PRO</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Latest interactions with your tutors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {((user as any)?.subscriptionTier === "pro" || (user as any)?.subscriptionTier === "premium") ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Activity will appear here as students interact with your tutors</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recent Activity Locked</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Upgrade to Pro or Premium to track student interactions and engagement metrics
                          </p>
                          <Link href="/subscription">
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                              <Crown className="mr-2 h-3 w-3" />
                              Upgrade Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics Section */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Detailed Analytics</span>
                      {(user as any)?.subscriptionTier === "premium" && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">PREMIUM</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Analytics data will appear as students interact with your tutors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(user as any)?.subscriptionTier === "premium" ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Detailed analytics coming soon</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Detailed Analytics Locked</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Upgrade to Premium to access comprehensive analytics, engagement insights, and learning progress tracking
                          </p>
                          <Link href="/subscription">
                            <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                              <Crown className="mr-2 h-3 w-3" />
                              Upgrade to Premium
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <main className="p-6">
              {((user as any)?.subscriptionTier === "pro" || (user as any)?.subscriptionTier === "premium") ? (
                tutors && tutors.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
                      <p className="text-muted-foreground">Comprehensive insights into your tutor performance and student engagement</p>
                    </div>
                    
                    {/* Analytics for each tutor */}
                    {tutors.map((tutor: Tutor) => (
                      <div key={tutor.id} className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{tutor.name}</h3>
                            <p className="text-muted-foreground">{tutor.subject}</p>
                          </div>
                        </div>
                        <EngagementDashboard tutorId={tutor.id} tutorName={tutor.name} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No analytics data yet</h3>
                      <p className="text-muted-foreground mb-6">Create a tutor to start tracking engagement metrics</p>
                      <Button onClick={() => setQuickCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Tutor
                      </Button>
                    </CardContent>
                  </Card>
                )
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
                    <BarChart3 className="w-16 h-16 mx-auto mb-6 opacity-50 text-gray-400" />
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Advanced Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                      Unlock comprehensive engagement tracking, real-time metrics, and detailed student insights with Pro or Premium subscription
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                        <h4 className="font-medium mb-2">📊 Real-time Analytics</h4>
                        <p className="text-gray-600 dark:text-gray-400">Live session tracking and engagement metrics</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                        <h4 className="font-medium mb-2">👥 Student Insights</h4>
                        <p className="text-gray-600 dark:text-gray-400">Detailed learning progress and behavior analysis</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                        <h4 className="font-medium mb-2">📈 Performance Trends</h4>
                        <p className="text-gray-600 dark:text-gray-400">Historical data and improvement tracking</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                        <h4 className="font-medium mb-2">🎯 Engagement Scoring</h4>
                        <p className="text-gray-600 dark:text-gray-400">Advanced metrics and satisfaction ratings</p>
                      </div>
                    </div>
                    <Link href="/subscription">
                      <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro/Premium
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </main>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <main className="p-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Advanced Features & Tools</h2>
                  <p className="text-muted-foreground">Discover powerful AI capabilities to enhance your tutoring experience</p>
                </div>

                <Tabs defaultValue="live-demo" className="w-full">
                  <div className="overflow-x-auto scrollbar-hide mb-6">
                    <TabsList className="inline-flex min-w-max bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                      <TabsTrigger 
                        value="live-demo" 
                        className="px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        🚀 Live Demo
                      </TabsTrigger>
                      <TabsTrigger 
                        value="ar-tutoring" 
                        className="px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        📱 AR Tutoring
                      </TabsTrigger>
                      <TabsTrigger 
                        value="content-generator" 
                        className="px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Content Generator
                      </TabsTrigger>
                      <TabsTrigger 
                        value="advanced-features" 
                        className="px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Advanced Features
                      </TabsTrigger>
                      <TabsTrigger 
                        value="real-time-ai" 
                        className="px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Live AI Tools
                      </TabsTrigger>
                      <TabsTrigger 
                        value="quick-actions" 
                        className="px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        Quick Actions
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="live-demo" className="space-y-6">
                    <LiveDemo />
                  </TabsContent>

                  <TabsContent value="ar-tutoring" className="space-y-6">
                    <ARManager 
                      tutorId={tutors && tutors.length > 0 ? tutors[0]?.id : undefined}
                      tutorName={tutors && tutors.length > 0 ? tutors[0]?.name : "Sample Tutor"}
                      subject={tutors && tutors.length > 0 ? tutors[0]?.subject : "General"}
                      onClose={() => {}}
                    />
                  </TabsContent>

                  <TabsContent value="content-generator" className="space-y-6">
                    <AdvancedContentGenerator 
                      onContentGenerated={(content) => {
                        toast({
                          title: "Content Generated",
                          description: "Your AI-generated content is ready!",
                        });
                      }} 
                    />
                  </TabsContent>

                  <TabsContent value="advanced-features" className="space-y-6">
                    <AdvancedFeatures onFeatureSelect={(feature) => {
                      toast({
                        title: "Feature Preview",
                        description: `${feature} will be available soon!`,
                      });
                    }} />
                  </TabsContent>

                  <TabsContent value="real-time-ai" className="space-y-6">
                    <RealTimeFeatures 
                      tutorId={tutors && tutors.length > 0 ? tutors[0].id : undefined}
                      userId={user?.id}
                    />
                  </TabsContent>

                  <TabsContent value="quick-actions" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setQuickCreateOpen(true)}>
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-8 w-8 text-green-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Quick Tutor Creator</h3>
                          <p className="text-muted-foreground text-sm">Create an AI tutor in under 2 minutes</p>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setCreateTutorOpen(true)}>
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="h-8 w-8 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Advanced Creator</h3>
                          <p className="text-muted-foreground text-sm">Full customization with detailed settings</p>
                        </CardContent>
                      </Card>

                      <Link href="/subscription">
                        <Card className="cursor-pointer hover:shadow-lg transition-all">
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Crown className="h-8 w-8 text-yellow-500" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Upgrade Plan</h3>
                            <p className="text-muted-foreground text-sm">Unlock premium features and capabilities</p>
                          </CardContent>
                        </Card>
                      </Link>

                      <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={tutorial.openTutorial}>
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HelpCircle className="h-8 w-8 text-purple-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Take Tutorial</h3>
                          <p className="text-muted-foreground text-sm">Learn how to use all features</p>
                        </CardContent>
                      </Card>

                      <Link href="/contact">
                        <Card className="cursor-pointer hover:shadow-lg transition-all">
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <MessageCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
                            <p className="text-muted-foreground text-sm">Get help from our team</p>
                          </CardContent>
                        </Card>
                      </Link>

                      <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => {
                        toast({
                          title: "Export Coming Soon",
                          description: "Bulk export features will be available in the next update!",
                        });
                      }}>
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="h-8 w-8 text-indigo-500" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Bulk Export</h3>
                          <p className="text-muted-foreground text-sm">Export all your tutors and data</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <main className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <p className="text-sm text-muted-foreground">{(user as any)?.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-foreground">Subscription</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{(user as any)?.subscriptionTier?.toUpperCase() || "FREE"}</Badge>
                      <Link href="/subscription">
                        <Button variant="outline" size="sm">
                          Upgrade Plan
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </main>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Tutorial Button */}
      {!tutorial.hasSeenTutorial && (
        <Button
          onClick={tutorial.openTutorial}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-2xl z-40 animate-pulse"
          size="icon"
          title="Take a guided tour"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Quick Tutor Creator Dialog */}
      <Dialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <QuickTutorCreator 
            onSuccess={() => {
              setQuickCreateOpen(false);
              handleTutorCreated();
            }}
            onCancel={() => setQuickCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Advanced Tutor Creator Dialog */}
      <Dialog open={createTutorOpen} onOpenChange={setCreateTutorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced AI Tutor Creator</DialogTitle>
          </DialogHeader>
          <CreateTutorForm onSuccess={handleTutorCreated} />
        </DialogContent>
      </Dialog>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={tutorial.isOpen}
        onClose={tutorial.closeTutorial}
        steps={tutorial.steps}
        onComplete={tutorial.completeTutorial}
      />

      {/* AR Manager Modal */}
      {showARManager && (
        <ARManager
          onClose={() => setShowARManager(false)}
        />
      )}
    </div>
  );
}