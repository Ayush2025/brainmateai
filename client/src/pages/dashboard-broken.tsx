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
  Crown
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

  // Redirect to home if not authenticated
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
  const { data: tutors = [], isLoading: tutorsLoading } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors"],
    retry: false,
  });

  // Fetch creator stats
  const { data: stats, isLoading: statsLoading } = useQuery<CreatorStats>({
    queryKey: ["/api/analytics/creator-stats"],
    retry: false,
  });

  // Delete tutor mutation
  const deleteTutorMutation = useMutation({
    mutationFn: async (tutorId: number) => {
      await apiRequest("DELETE", `/api/tutors/${tutorId}`);
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
        description: "Failed to delete tutor",
        variant: "destructive",
      });
    },
  });

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
          <div className="flex flex-wrap gap-2 mb-8">
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
            
            <Link href="/subscription" className="ml-auto">
              <Button className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </Link>
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
                                {statsLoading ? "..." : stats?.totalTutors || 0}
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
                                {statsLoading ? "..." : stats?.totalSessions || 0}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                              <Users className="text-success h-6 w-6" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Messages</p>
                              <p className="text-2xl font-bold text-foreground">
                                {statsLoading ? "..." : stats?.totalMessages || 0}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                              <MessageCircle className="text-accent h-6 w-6" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Avg. Session Time</p>
                              <p className="text-2xl font-bold text-foreground">
                                {statsLoading ? "..." : formatDuration(stats?.avgSessionDuration || 0)}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                              <Clock className="text-warning h-6 w-6" />
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
                            ) : tutors && tutors.length > 0 ? (
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
                      <Dialog open={createTutorOpen} onOpenChange={setCreateTutorOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Tutor
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Create AI Tutor</DialogTitle>
                          </DialogHeader>
                          <CreateTutorForm onSuccess={handleTutorCreated} />
                        </DialogContent>
                      </Dialog>
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
                    ) : tutors.length === 0 ? (
                      <Card className="p-12 text-center">
                        <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No tutors yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first AI tutor to get started
                        </p>
                        <Button onClick={() => setCreateTutorOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Tutor
                        </Button>
                      </Card>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tutors.map((tutor) => (
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            onDelete={(id) => deleteTutorMutation.mutate(id)}
                            isDeleting={deleteTutorMutation.isPending}
                          />
                        ))}
                      </div>
                    )}
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

                <TabsContent value="content" className="space-y-6">
                  <main className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Upload Content</h2>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground">
                          Select a tutor to upload content, or create a new tutor first.
                        </p>
                      </CardContent>
                    </Card>
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
                            <Button variant="outline" size="sm">
                              Upgrade Plan
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </main>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
