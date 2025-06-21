import { db } from "../db";
import { tutorAnalytics, chatSessions, chatMessages, tutors, users } from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql, count, avg, sum } from "drizzle-orm";

export interface EngagementMetrics {
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

export interface EngagementEvent {
  type: 'session_start' | 'message_sent' | 'voice_used' | 'quiz_taken' | 'simulation_opened' | 'session_end';
  sessionId: number;
  tutorId: number;
  data?: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  sessionDuration?: number;
}

export interface UserFeedback {
  sessionId: number;
  tutorId: number;
  rating: number; // 1-5 stars
  feedback?: string;
  category?: 'helpful' | 'accurate' | 'engaging' | 'unclear' | 'slow';
}

export interface LearningProgress {
  sessionId: number;
  tutorId: number;
  studentIdentifier: string;
  topic: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  questionsAsked: number;
  conceptsLearned: string[];
  timeSpent: number;
}

export class AnalyticsService {
  private engagementEvents: EngagementEvent[] = [];
  private userFeedbacks: UserFeedback[] = [];
  private learningProgressData: LearningProgress[] = [];

  // Track engagement events in memory and batch process
  trackEngagement(event: EngagementEvent) {
    this.engagementEvents.push({
      ...event,
      timestamp: new Date()
    });

    // Batch process every 10 events or every 5 minutes
    if (this.engagementEvents.length >= 10) {
      this.processEngagementBatch();
    }
  }

  // Track user feedback
  trackFeedback(feedback: UserFeedback) {
    this.userFeedbacks.push(feedback);
    this.processFeedbackBatch();
  }

  // Track learning progress
  trackLearningProgress(progress: LearningProgress) {
    this.learningProgressData.push(progress);
    this.processLearningBatch();
  }

  // Process engagement events and update analytics
  private async processEngagementBatch() {
    if (this.engagementEvents.length === 0) return;

    for (const event of this.engagementEvents) {
      await this.updateTutorAnalytics(event);
    }

    this.engagementEvents = [];
  }

  // Process feedback and update satisfaction metrics
  private async processFeedbackBatch() {
    if (this.userFeedbacks.length === 0) return;

    for (const feedback of this.userFeedbacks) {
      await this.updateSatisfactionMetrics(feedback);
    }

    this.userFeedbacks = [];
  }

  // Process learning progress data
  private async processLearningBatch() {
    if (this.learningProgressData.length === 0) return;

    for (const progress of this.learningProgressData) {
      await this.updateLearningMetrics(progress);
    }

    this.learningProgressData = [];
  }

  // Update tutor analytics with engagement data
  private async updateTutorAnalytics(event: EngagementEvent) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(tutorAnalytics)
      .where(
        and(
          eq(tutorAnalytics.tutorId, event.tutorId),
          eq(tutorAnalytics.date, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      const currentData = existing[0];
      const popularQuestions = (currentData.popularQuestions as any) || [];
      
      await db
        .update(tutorAnalytics)
        .set({
          totalSessions: event.type === 'session_start' ? 
            (currentData.totalSessions || 0) + 1 : currentData.totalSessions,
          totalMessages: event.type === 'message_sent' ? 
            (currentData.totalMessages || 0) + 1 : currentData.totalMessages,
          popularQuestions: this.updatePopularQuestions(popularQuestions, event)
        })
        .where(eq(tutorAnalytics.id, currentData.id));
    } else {
      // Create new record
      await db.insert(tutorAnalytics).values({
        tutorId: event.tutorId,
        date: today,
        totalSessions: event.type === 'session_start' ? 1 : 0,
        totalMessages: event.type === 'message_sent' ? 1 : 0,
        popularQuestions: event.data?.question ? [event.data.question] : []
      });
    }
  }

  // Update satisfaction metrics from feedback
  private async updateSatisfactionMetrics(feedback: UserFeedback) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(tutorAnalytics)
      .where(
        and(
          eq(tutorAnalytics.tutorId, feedback.tutorId),
          eq(tutorAnalytics.date, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Calculate new satisfaction rating (simple average for now)
      const currentRating = parseFloat(existing[0].avgSessionDuration || "0");
      const newRating = feedback.rating;
      const avgRating = currentRating > 0 ? (currentRating + newRating) / 2 : newRating;

      await db
        .update(tutorAnalytics)
        .set({
          avgSessionDuration: avgRating.toString() // Using this field temporarily for satisfaction
        })
        .where(eq(tutorAnalytics.id, existing[0].id));
    }
  }

  // Update learning progress metrics
  private async updateLearningMetrics(progress: LearningProgress) {
    // Store learning progress in the popularQuestions field as structured data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(tutorAnalytics)
      .where(
        and(
          eq(tutorAnalytics.tutorId, progress.tutorId),
          eq(tutorAnalytics.date, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const currentData = existing[0];
      const learningData = (currentData.popularQuestions as any)?.learningProgress || [];
      
      learningData.push({
        topic: progress.topic,
        skillLevel: progress.skillLevel,
        questionsAsked: progress.questionsAsked,
        conceptsLearned: progress.conceptsLearned,
        timeSpent: progress.timeSpent,
        timestamp: new Date()
      });

      await db
        .update(tutorAnalytics)
        .set({
          popularQuestions: {
            ...(currentData.popularQuestions as any),
            learningProgress: learningData
          }
        })
        .where(eq(tutorAnalytics.id, currentData.id));
    }
  }

  // Generate comprehensive engagement metrics
  async getEngagementMetrics(tutorId: number, days: number = 30): Promise<EngagementMetrics> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get basic analytics
    const analytics = await db
      .select()
      .from(tutorAnalytics)
      .where(
        and(
          eq(tutorAnalytics.tutorId, tutorId),
          gte(tutorAnalytics.date, startDate),
          lte(tutorAnalytics.date, endDate)
        )
      )
      .orderBy(desc(tutorAnalytics.date));

    // Get session data for detailed analysis
    const sessions = await db
      .select({
        id: chatSessions.id,
        createdAt: chatSessions.startedAt,
        messageCount: chatSessions.messageCount,
        duration: chatSessions.duration
      })
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.tutorId, tutorId),
          gte(chatSessions.startedAt, startDate)
        )
      );

    // Calculate engagement metrics
    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0);
    const avgSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
      : 0;

    // Calculate peak hours
    const peakHours = this.calculatePeakHours(sessions);

    // Calculate engagement score based on multiple factors
    const engagementScore = this.calculateEngagementScore(sessions, analytics);

    // Calculate satisfaction rating from analytics data
    const satisfactionRating = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + parseFloat(a.avgSessionDuration || "0"), 0) / analytics.length
      : 0;

    // Generate time series data
    const timeSeriesData = await this.generateTimeSeriesData(tutorId, startDate, endDate);

    // Calculate student insights
    const studentInsights = this.calculateStudentInsights(analytics);

    // Calculate user behavior metrics
    const userBehavior = this.calculateUserBehavior(sessions, analytics);

    return {
      totalSessions,
      totalMessages,
      avgSessionDuration,
      uniqueStudents: this.calculateUniqueStudents(sessions),
      engagementScore,
      satisfactionRating,
      completionRate: this.calculateCompletionRate(sessions),
      retentionRate: this.calculateRetentionRate(sessions),
      peakHours,
      topicDistribution: this.calculateTopicDistribution(analytics),
      userBehavior,
      timeSeriesData,
      studentInsights
    };
  }

  // Calculate peak hours from session data
  private calculatePeakHours(sessions: any[]): Array<{ hour: number; sessions: number }> {
    const hourCounts: Record<number, number> = {};

    sessions.forEach(session => {
      const hour = new Date(session.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, sessions]) => ({ hour: parseInt(hour), sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6); // Top 6 peak hours
  }

  // Calculate engagement score based on multiple factors
  private calculateEngagementScore(sessions: any[], analytics: any[]): number {
    if (sessions.length === 0) return 0;

    const avgMessagesPerSession = sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0) / sessions.length;
    const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
    
    // Normalize metrics to 0-100 scale
    const messageScore = Math.min(avgMessagesPerSession * 5, 100); // 20 messages = 100 score
    const durationScore = Math.min(avgDuration / 60 * 2, 100); // 50 minutes = 100 score
    
    return Math.round((messageScore + durationScore) / 2);
  }

  // Calculate unique students (simplified - using session count as proxy)
  private calculateUniqueStudents(sessions: any[]): number {
    // Since we don't have student IDs, estimate based on session patterns
    return Math.max(1, Math.ceil(sessions.length * 0.7)); // Assume 70% unique students
  }

  // Calculate completion rate
  private calculateCompletionRate(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const completedSessions = sessions.filter(s => (s.duration || 0) > 300); // 5+ minutes
    return Math.round((completedSessions.length / sessions.length) * 100);
  }

  // Calculate retention rate
  private calculateRetentionRate(sessions: any[]): number {
    if (sessions.length < 2) return 0;
    
    // Simplified retention calculation
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });
    
    return Math.round((recentSessions.length / sessions.length) * 100);
  }

  // Calculate topic distribution from analytics
  private calculateTopicDistribution(analytics: any[]): Record<string, number> {
    const topics: Record<string, number> = {};
    
    analytics.forEach(analytic => {
      const learningData = (analytic.popularQuestions as any)?.learningProgress || [];
      learningData.forEach((progress: any) => {
        topics[progress.topic] = (topics[progress.topic] || 0) + 1;
      });
    });

    const total = Object.values(topics).reduce((sum, count) => sum + count, 0);
    if (total === 0) return { "General": 100 };

    const distribution: Record<string, number> = {};
    Object.entries(topics).forEach(([topic, count]) => {
      distribution[topic] = Math.round((count / total) * 100);
    });

    return distribution;
  }

  // Calculate user behavior metrics
  private calculateUserBehavior(sessions: any[], analytics: any[]): EngagementMetrics['userBehavior'] {
    const avgMessagesPerSession = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0) / sessions.length
      : 0;

    return {
      averageMessagesPerSession: Math.round(avgMessagesPerSession * 10) / 10,
      voiceUsageRate: Math.random() * 30 + 20, // Placeholder - would track from events
      simulationAccessRate: Math.random() * 25 + 15, // Placeholder - would track from events
      quizCompletionRate: Math.random() * 40 + 40, // Placeholder - would track from events
      returnUserRate: this.calculateRetentionRate(sessions)
    };
  }

  // Calculate student insights
  private calculateStudentInsights(analytics: any[]): EngagementMetrics['studentInsights'] {
    const skillLevels = { beginner: 0, intermediate: 0, advanced: 0 };
    
    analytics.forEach(analytic => {
      const learningData = (analytic.popularQuestions as any)?.learningProgress || [];
      learningData.forEach((progress: any) => {
        skillLevels[progress.skillLevel as keyof typeof skillLevels]++;
      });
    });

    const total = Object.values(skillLevels).reduce((sum, count) => sum + count, 0);

    return {
      beginnerCount: skillLevels.beginner,
      intermediateCount: skillLevels.intermediate,
      advancedCount: skillLevels.advanced,
      activeStudents: Math.max(1, total),
      strugglingStudents: Math.ceil(skillLevels.beginner * 0.3) // 30% of beginners might be struggling
    };
  }

  // Generate time series data for charts
  private async generateTimeSeriesData(tutorId: number, startDate: Date, endDate: Date): Promise<EngagementMetrics['timeSeriesData']> {
    const analytics = await db
      .select()
      .from(tutorAnalytics)
      .where(
        and(
          eq(tutorAnalytics.tutorId, tutorId),
          gte(tutorAnalytics.date, startDate),
          lte(tutorAnalytics.date, endDate)
        )
      )
      .orderBy(asc(tutorAnalytics.date));

    return analytics.map(analytic => ({
      date: analytic.date.toISOString().split('T')[0],
      sessions: analytic.totalSessions || 0,
      messages: analytic.totalMessages || 0,
      avgDuration: parseFloat(analytic.avgSessionDuration || "0"),
      satisfaction: Math.random() * 2 + 3.5 // Placeholder satisfaction rating
    }));
  }

  // Update popular questions with new data
  private updatePopularQuestions(current: any[], event: EngagementEvent): any[] {
    if (!event.data?.question) return current;

    const question = event.data.question;
    const existing = current.find(q => q.text === question);

    if (existing) {
      existing.count++;
    } else {
      current.push({ text: question, count: 1 });
    }

    return current.sort((a, b) => b.count - a.count).slice(0, 10); // Keep top 10
  }

  // Get real-time engagement data
  async getRealTimeEngagement(tutorId: number): Promise<{
    activeSessions: number;
    messagesInLastHour: number;
    averageResponseTime: number;
    currentSatisfaction: number;
  }> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentSessions = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.tutorId, tutorId),
          gte(chatSessions.startedAt, oneHourAgo)
        )
      );

    const messagesInLastHour = recentSessions.reduce((sum, s) => sum + (s.messageCount || 0), 0);

    return {
      activeSessions: recentSessions.length,
      messagesInLastHour,
      averageResponseTime: 2.3, // Placeholder - would calculate from message timestamps
      currentSatisfaction: 4.2 // Placeholder - would calculate from recent feedback
    };
  }
}

export const analyticsService = new AnalyticsService();

// Auto-flush events every 5 minutes
setInterval(() => {
  analyticsService['processEngagementBatch']();
}, 5 * 60 * 1000);