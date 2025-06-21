import { apiRequest } from "./queryClient";

export interface EngagementEvent {
  sessionId: number;
  tutorId: number;
  eventType: 'session_start' | 'message_sent' | 'voice_used' | 'quiz_taken' | 'simulation_opened' | 'session_end';
  data?: Record<string, any>;
}

export interface UserFeedback {
  sessionId: number;
  tutorId: number;
  rating: number;
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

class AnalyticsTracker {
  private sessionStartTime: Date | null = null;
  private messageCount = 0;
  private conceptsLearned: string[] = [];
  private questionsAsked = 0;

  // Track session start
  trackSessionStart(sessionId: number, tutorId: number) {
    this.sessionStartTime = new Date();
    this.messageCount = 0;
    this.conceptsLearned = [];
    this.questionsAsked = 0;

    this.trackEngagement({
      sessionId,
      tutorId,
      eventType: 'session_start',
      data: {
        timestamp: this.sessionStartTime.toISOString(),
        userAgent: navigator.userAgent
      }
    });
  }

  // Track message sent
  trackMessageSent(sessionId: number, tutorId: number, message: string, isQuestion: boolean = false) {
    this.messageCount++;
    if (isQuestion) {
      this.questionsAsked++;
    }

    // Extract potential concepts from message
    this.extractConcepts(message);

    this.trackEngagement({
      sessionId,
      tutorId,
      eventType: 'message_sent',
      data: {
        messageLength: message.length,
        isQuestion,
        messageCount: this.messageCount,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track voice interaction
  trackVoiceUsed(sessionId: number, tutorId: number, duration?: number) {
    this.trackEngagement({
      sessionId,
      tutorId,
      eventType: 'voice_used',
      data: {
        duration,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track quiz interaction
  trackQuizTaken(sessionId: number, tutorId: number, quizData: any) {
    this.trackEngagement({
      sessionId,
      tutorId,
      eventType: 'quiz_taken',
      data: {
        ...quizData,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track simulation access
  trackSimulationOpened(sessionId: number, tutorId: number, simulationType: string) {
    this.trackEngagement({
      sessionId,
      tutorId,
      eventType: 'simulation_opened',
      data: {
        simulationType,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track session end
  trackSessionEnd(sessionId: number, tutorId: number) {
    const sessionDuration = this.sessionStartTime 
      ? Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 1000)
      : 0;

    this.trackEngagement({
      sessionId,
      tutorId,
      eventType: 'session_end',
      data: {
        duration: sessionDuration,
        messageCount: this.messageCount,
        questionsAsked: this.questionsAsked,
        conceptsLearned: this.conceptsLearned,
        timestamp: new Date().toISOString()
      }
    });

    // Track learning progress
    if (this.sessionStartTime && this.messageCount > 0) {
      this.trackLearning({
        sessionId,
        tutorId,
        studentIdentifier: this.generateStudentIdentifier(),
        topic: this.inferTopicFromConcepts(),
        skillLevel: this.inferSkillLevel(),
        questionsAsked: this.questionsAsked,
        conceptsLearned: this.conceptsLearned,
        timeSpent: sessionDuration
      });
    }
  }

  // Track user feedback
  trackFeedback(feedback: UserFeedback) {
    apiRequest("POST", "/api/analytics/track-feedback", feedback).catch(error => {
      console.warn("Failed to track feedback:", error);
    });
  }

  // Private method to track engagement events
  private trackEngagement(event: EngagementEvent) {
    apiRequest("POST", "/api/analytics/track-engagement", event).catch(error => {
      console.warn("Failed to track engagement:", error);
    });
  }

  // Private method to track learning progress
  private trackLearning(progress: LearningProgress) {
    apiRequest("POST", "/api/analytics/track-learning", progress).catch(error => {
      console.warn("Failed to track learning progress:", error);
    });
  }

  // Extract concepts from messages using simple keyword matching
  private extractConcepts(message: string) {
    const lowerMessage = message.toLowerCase();
    const conceptKeywords = [
      'algorithm', 'function', 'variable', 'loop', 'condition', 'array', 'object',
      'class', 'method', 'inheritance', 'polymorphism', 'recursion', 'data structure',
      'database', 'sql', 'javascript', 'python', 'react', 'node', 'api', 'http',
      'css', 'html', 'frontend', 'backend', 'server', 'client', 'framework',
      'library', 'component', 'state', 'props', 'hook', 'async', 'promise',
      'math', 'calculus', 'algebra', 'geometry', 'physics', 'chemistry', 'biology',
      'history', 'geography', 'literature', 'science', 'technology', 'engineering'
    ];

    conceptKeywords.forEach(concept => {
      if (lowerMessage.includes(concept) && !this.conceptsLearned.includes(concept)) {
        this.conceptsLearned.push(concept);
      }
    });
  }

  // Generate anonymous student identifier
  private generateStudentIdentifier(): string {
    return `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Infer topic from learned concepts
  private inferTopicFromConcepts(): string {
    if (this.conceptsLearned.length === 0) return 'general';
    
    const programmingConcepts = ['algorithm', 'function', 'variable', 'loop', 'javascript', 'python', 'react'];
    const mathConcepts = ['math', 'calculus', 'algebra', 'geometry'];
    const scienceConcepts = ['physics', 'chemistry', 'biology', 'science'];
    
    const programmingCount = this.conceptsLearned.filter(c => programmingConcepts.includes(c)).length;
    const mathCount = this.conceptsLearned.filter(c => mathConcepts.includes(c)).length;
    const scienceCount = this.conceptsLearned.filter(c => scienceConcepts.includes(c)).length;
    
    if (programmingCount > mathCount && programmingCount > scienceCount) return 'programming';
    if (mathCount > scienceCount) return 'mathematics';
    if (scienceCount > 0) return 'science';
    
    return 'general';
  }

  // Infer skill level based on interaction patterns
  private inferSkillLevel(): 'beginner' | 'intermediate' | 'advanced' {
    const avgMessageLength = this.messageCount > 0 ? 
      this.conceptsLearned.length / this.messageCount : 0;
    
    if (this.questionsAsked > this.messageCount * 0.7) return 'beginner';
    if (avgMessageLength > 0.3 && this.conceptsLearned.length > 5) return 'advanced';
    return 'intermediate';
  }

  // Get current session stats
  getSessionStats() {
    const sessionDuration = this.sessionStartTime 
      ? Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 1000)
      : 0;

    return {
      duration: sessionDuration,
      messageCount: this.messageCount,
      questionsAsked: this.questionsAsked,
      conceptsLearned: this.conceptsLearned.length,
      inferredTopic: this.inferTopicFromConcepts(),
      inferredSkillLevel: this.inferSkillLevel()
    };
  }
}

// Export singleton instance
export const analyticsTracker = new AnalyticsTracker();