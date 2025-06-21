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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Lightbulb,
  ArrowRight,
  TrendingUp,
  FileText,
  Video,
  Link as LinkIcon
} from "lucide-react";
import { Link } from "wouter";
import { useTheme } from "@/components/ui/theme-provider";
import { TutorCard } from "@/components/tutor/tutorCard";
import { CreateTutorForm } from "@/components/tutor/createTutorForm";
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
  const [deletingTutorId, setDeletingTutorId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch tutors
  const { data: tutors, isLoading: tutorsLoading, error: tutorsError } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Fetch analytics
  const { data: stats, isLoading: statsLoading } = useQuery<CreatorStats>({
    queryKey: ["/api/analytics/creator-stats"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Delete tutor mutation
  const deleteTutorMutation = useMutation({
    mutationFn: async (tutorId: number) => {
      const response = await apiRequest("DELETE", `/api/tutors/${tutorId}`);
      if (!response.ok) {
        throw new Error("Failed to delete tutor");
      }
    },
    onMutate: (tutorId) => {
      setDeletingTutorId(tutorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/creator-stats"] });
      toast({
        title: "Success",
        description: "Tutor deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to delete tutor",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingTutorId(null);
    },
  });

  const handleDeleteTutor = (tutorId: number) => {
    deleteTutorMutation.mutate(tutorId);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleTutorCreated = () => {
    setCreateTutorOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/creator-stats"] });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">BrainMate AI</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back, {(user as any)?.firstName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center space-x-3 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {(user as any)?.firstName}
                </span>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="w-full">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger
                value="overview"
                className="px-6 py-3 rounded-full data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Home className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="tutors"
                className="px-6 py-3 rounded-full data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Bot className="mr-2 h-4 w-4" />
                My Tutors
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="px-6 py-3 rounded-full data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Tutor
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="px-6 py-3 rounded-full data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="px-6 py-3 rounded-full data-[state=active]:bg-slate-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <div className="ml-auto">
              <Link href="/subscription">
                <Button className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
              <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-4">Welcome to BrainMate AI</h2>
                <p className="text-xl opacity-90 mb-8">Transform your educational content into intelligent AI tutors that engage and educate students 24/7</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    onClick={() => setCreateTutorOpen(true)}
                    className="bg-white text-indigo-600 hover:bg-slate-100 px-8 py-3 rounded-full font-semibold"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Tutor
                  </Button>
                  <Link href="/subscription">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3 rounded-full font-semibold">
                      <Crown className="mr-2 h-5 w-5" />
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">AI Tutors</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {statsLoading ? "..." : stats?.totalTutors || 0}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active tutors</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Bot className="text-white h-7 w-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Student Sessions</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {statsLoading ? "..." : stats?.totalSessions || 0}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">Learning sessions</p>
                    </div>
                    <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="text-white h-7 w-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Messages</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {statsLoading ? "..." : stats?.totalMessages || 0}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total interactions</p>
                    </div>
                    <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <MessageCircle className="text-white h-7 w-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Avg Session</p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                        {statsLoading ? "..." : formatDuration(stats?.avgSessionDuration || 0)}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Duration</p>
                    </div>
                    <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="text-white h-7 w-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started Guide */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <Lightbulb className="mr-3 h-6 w-6 text-yellow-500" />
                    Quick Start Guide
                  </CardTitle>
                  <CardDescription>Follow these steps to create your first AI tutor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Upload Your Content</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Add PDFs, documents, or YouTube videos containing your educational material</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Customize Your Tutor</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Set personality, teaching style, and choose a 3D avatar</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Share with Students</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Get a shareable link for students to access your AI tutor instantly</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setCreateTutorOpen(true)}
                    className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600"
                  >
                    Start Creating Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <BarChart3 className="mr-3 h-6 w-6 text-purple-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest interactions with your tutors</CardDescription>
                </CardHeader>
                <CardContent>
                  {tutorsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                  ) : tutors && (tutors as any[]).length > 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Activity will appear here as students interact with your tutors</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <h4 className="font-semibold mb-2">No activity yet</h4>
                      <p className="text-sm">Create your first tutor to start seeing student interactions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Tutors Tab */}
          <TabsContent value="tutors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My AI Tutors</h2>
                <p className="text-slate-600 dark:text-slate-400">Manage and monitor your AI tutors</p>
              </div>
              <Button onClick={() => setCreateTutorOpen(true)} className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="mr-2 h-4 w-4" />
                Create New Tutor
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : tutorsError ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 mx-auto text-red-500 mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Unable to load tutors</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">Please check your connection and try again</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              ) : tutors && tutors.length > 0 ? (
                tutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    onDelete={() => handleDeleteTutor(tutor.id)}
                    isDeleting={deletingTutorId === tutor.id}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Bot className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-600 mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">No tutors yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Create your first AI tutor by uploading educational content and customizing its personality
                  </p>
                  <Button onClick={() => setCreateTutorOpen(true)} className="bg-indigo-500 hover:bg-indigo-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Tutor
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Create Tutor Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Create AI Tutor</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Transform your educational content into an intelligent AI tutor</p>
              </div>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <CreateTutorForm onSuccess={handleTutorCreated} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analytics Dashboard</h2>
              <p className="text-slate-600 dark:text-slate-400">Track performance and engagement metrics</p>
            </div>

            {tutors && (tutors as any[]).length > 0 ? (
              <div className="space-y-8">
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Engagement</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {statsLoading ? "..." : ((stats?.totalSessions || 0) + (stats?.totalMessages || 0))}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Active Tutors</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {statsLoading ? "..." : stats?.totalTutors || 0}
                          </p>
                        </div>
                        <Bot className="h-8 w-8 text-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">~2s</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Detailed Analytics</CardTitle>
                    <CardDescription>Analytics data will appear as students interact with your tutors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Detailed analytics coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-600 mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">No Analytics Data</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Create your first AI tutor to start collecting analytics and performance metrics
                  </p>
                  <Button onClick={() => setCreateTutorOpen(true)} className="bg-indigo-500 hover:bg-indigo-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Tutor
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Settings</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage your account preferences and subscription</p>
            </div>

            <div className="grid gap-6 max-w-4xl">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                      <Input 
                        value={(user as any)?.firstName || ""} 
                        readOnly 
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                      <Input 
                        value={(user as any)?.lastName || ""} 
                        readOnly 
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <Input 
                      value={(user as any)?.email || ""} 
                      readOnly 
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Manage your BrainMate AI subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Current Plan</p>
                      <Badge variant="secondary" className="mt-1">
                        {(user as any)?.subscriptionTier?.toUpperCase() || "FREE"}
                      </Badge>
                    </div>
                    <Link href="/subscription">
                      <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your dashboard experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Theme</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Choose your preferred color scheme</p>
                    </div>
                    <Button variant="outline" onClick={toggleTheme}>
                      {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                      {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Tutor Modal */}
      <Dialog open={createTutorOpen} onOpenChange={setCreateTutorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New AI Tutor</DialogTitle>
          </DialogHeader>
          <CreateTutorForm onSuccess={handleTutorCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
}