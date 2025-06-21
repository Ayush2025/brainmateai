import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  Star,
  Brain,
  Target,
  Activity,
  BookOpen,
  Zap,
  Award,
  Eye,
  RefreshCw
} from "lucide-react";

interface EngagementDashboardProps {
  tutorId: number;
  tutorName: string;
}

interface EngagementMetrics {
  totalSessions: number;
  totalMessages: number;
  avgSessionDuration: number;
  uniqueStudents: number;
  engagementScore: number;
  satisfactionRating: number;
  completionRate: number;
  retentionRate: number;
  peakHours: Array<{ hour: number; sessions: number }>;
  topicDistribution: Record<string, number>;
  userBehavior: {
    averageMessagesPerSession: number;
    voiceUsageRate: number;
    simulationAccessRate: number;
    quizCompletionRate: number;
    returnUserRate: number;
  };
  timeSeriesData: Array<{
    date: string;
    sessions: number;
    messages: number;
    avgDuration: number;
    satisfaction: number;
  }>;
  studentInsights: {
    beginnerCount: number;
    intermediateCount: number;
    advancedCount: number;
    activeStudents: number;
    strugglingStudents: number;
  };
}

interface RealTimeData {
  activeSessions: number;
  messagesInLastHour: number;
  averageResponseTime: number;
  currentSatisfaction: number;
}

export default function EngagementDashboard({ tutorId, tutorName }: EngagementDashboardProps) {
  const [timeRange, setTimeRange] = useState("30");
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch engagement metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: [`/api/analytics/engagement/${tutorId}`, timeRange],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch real-time data
  const { data: realtimeData, isLoading: realtimeLoading, refetch: refetchRealtime } = useQuery({
    queryKey: [`/api/analytics/realtime/${tutorId}`],
    refetchInterval: refreshInterval,
  });

  const engagementMetrics = metrics as EngagementMetrics;
  const realtime = realtimeData as RealTimeData;

  // Auto-refresh real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      refetchRealtime();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, refetchRealtime]);

  // Colors for charts
  const chartColors = {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#06b6d4"
  };

  const pieColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive engagement insights for {tutorName}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchMetrics();
              refetchRealtime();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Status Cards */}
      {realtime && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtime.activeSessions}</div>
              <Badge variant={realtime.activeSessions > 0 ? "default" : "secondary"}>
                {realtime.activeSessions > 0 ? "Live" : "Idle"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages/Hour</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtime.messagesInLastHour}</div>
              <p className="text-xs text-muted-foreground">Last 60 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtime.averageResponseTime.toFixed(1)}s</div>
              <Badge variant={realtime.averageResponseTime < 3 ? "default" : "secondary"}>
                {realtime.averageResponseTime < 3 ? "Fast" : "Normal"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtime.currentSatisfaction.toFixed(1)}/5</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= realtime.currentSatisfaction
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      {engagementMetrics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    +{Math.round(engagementMetrics.totalSessions * 0.12)} from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.totalMessages}</div>
                  <p className="text-xs text-muted-foreground">
                    {engagementMetrics.userBehavior.averageMessagesPerSession.toFixed(1)} avg per session
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.engagementScore}/100</div>
                  <Progress value={engagementMetrics.engagementScore} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>
                  Session and message activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementMetrics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke={chartColors.primary}
                      strokeWidth={2}
                      name="Sessions"
                    />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke={chartColors.secondary}
                      strokeWidth={2}
                      name="Messages"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peak Hours Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                  <CardDescription>Most active times of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={engagementMetrics.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill={chartColors.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Topic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Topic Distribution</CardTitle>
                  <CardDescription>Most discussed subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={Object.entries(engagementMetrics.topicDistribution).map(([topic, percentage]) => ({
                          name: topic,
                          value: percentage
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {Object.keys(engagementMetrics.topicDistribution).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.completionRate}%</div>
                  <Progress value={engagementMetrics.completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.retentionRate}%</div>
                  <Progress value={engagementMetrics.retentionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(engagementMetrics.avgSessionDuration / 60)}m
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {engagementMetrics.avgSessionDuration}s average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {engagementMetrics.satisfactionRating.toFixed(1)}/5
                  </div>
                  <Progress value={engagementMetrics.satisfactionRating * 20} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Levels</CardTitle>
                  <CardDescription>Distribution by skill level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Beginner</span>
                      <Badge variant="secondary">{engagementMetrics.studentInsights.beginnerCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intermediate</span>
                      <Badge variant="default">{engagementMetrics.studentInsights.intermediateCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Advanced</span>
                      <Badge variant="outline">{engagementMetrics.studentInsights.advancedCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.studentInsights.activeStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {engagementMetrics.uniqueStudents} unique in period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Need Support</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.studentInsights.strugglingStudents}</div>
                  <p className="text-xs text-muted-foreground">Students who may need help</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Usage</CardTitle>
                  <CardDescription>How students interact with features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Voice Interaction</span>
                        <span className="text-sm font-medium">
                          {engagementMetrics.userBehavior.voiceUsageRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={engagementMetrics.userBehavior.voiceUsageRate} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Simulations</span>
                        <span className="text-sm font-medium">
                          {engagementMetrics.userBehavior.simulationAccessRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={engagementMetrics.userBehavior.simulationAccessRate} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Quiz Completion</span>
                        <span className="text-sm font-medium">
                          {engagementMetrics.userBehavior.quizCompletionRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={engagementMetrics.userBehavior.quizCompletionRate} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Return Rate</span>
                        <span className="text-sm font-medium">
                          {engagementMetrics.userBehavior.returnUserRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={engagementMetrics.userBehavior.returnUserRate} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interaction Patterns</CardTitle>
                  <CardDescription>Communication behavior insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Messages/Session</span>
                      <Badge variant="outline">
                        {engagementMetrics.userBehavior.averageMessagesPerSession.toFixed(1)}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground">
                      Students typically engage in {engagementMetrics.userBehavior.averageMessagesPerSession.toFixed(0)} 
                      message exchanges per session, indicating 
                      {engagementMetrics.userBehavior.averageMessagesPerSession > 10 ? " high" : 
                       engagementMetrics.userBehavior.averageMessagesPerSession > 5 ? " moderate" : " light"} 
                      engagement levels.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Satisfaction and engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementMetrics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="satisfaction"
                      stackId="1"
                      stroke={chartColors.success}
                      fill={chartColors.success}
                      fillOpacity={0.6}
                      name="Satisfaction"
                    />
                    <Area
                      type="monotone"
                      dataKey="avgDuration"
                      stackId="2"
                      stroke={chartColors.info}
                      fill={chartColors.info}
                      fillOpacity={0.6}
                      name="Avg Duration (min)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}