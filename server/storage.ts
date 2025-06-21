import {
  users,
  tutors,
  tutorContent,
  chatSessions,
  chatMessages,
  tutorAnalytics,
  type User,
  type UpsertUser,
  type Tutor,
  type InsertTutor,
  type TutorContent,
  type InsertTutorContent,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type TutorAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tutor operations
  createTutor(tutor: InsertTutor): Promise<Tutor>;
  getTutorsByCreator(creatorId: string): Promise<Tutor[]>;
  getTutorById(id: number): Promise<Tutor | undefined>;
  getTutorByIdWithContent(id: number): Promise<(Tutor & { content: TutorContent[] }) | undefined>;
  updateTutor(id: number, updates: Partial<InsertTutor>): Promise<Tutor>;
  deleteTutor(id: number): Promise<void>;
  
  // Content operations
  addTutorContent(content: InsertTutorContent): Promise<TutorContent>;
  getTutorContent(tutorId: number): Promise<TutorContent[]>;
  deleteTutorContent(id: number): Promise<void>;
  
  // Chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(sessionToken: string): Promise<ChatSession | undefined>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  updateSessionActivity(sessionId: number): Promise<void>;
  
  // Analytics operations
  getTutorAnalytics(tutorId: number, days: number): Promise<TutorAnalytics[]>;
  getCreatorStats(creatorId: string): Promise<{
    totalTutors: number;
    totalSessions: number;
    totalMessages: number;
    avgSessionDuration: number;
  }>;
  
  // Subscription operations
  updateUserSubscription(userId: string, subscriptionTier: string): Promise<User>;
  
  // Subscription limit checks
  checkTutorLimit(creatorId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }>;
  checkContentLimit(tutorId: number): Promise<{ canAdd: boolean; currentCount: number; limit: number }>;
}

export class DatabaseStorage implements IStorage {
  // Special users with free premium access
  private isSpecialUser(email: string | null): boolean {
    if (!email) return false;
    const specialEmails = [
      'yadavayush4239@gmail.com',
      'viveksolanki8013@gmail.com'
    ];
    return specialEmails.includes(email.toLowerCase());
  }

  // Get effective subscription tier (overrides for special users)
  private getEffectiveSubscriptionTier(user: User): string {
    if (this.isSpecialUser(user.email)) {
      return 'premium'; // Grant premium access to special users
    }
    return user.subscriptionTier || 'free';
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user && this.isSpecialUser(user.email)) {
      // Override subscription tier for special users
      return { ...user, subscriptionTier: 'premium' };
    }
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }



  // Tutor operations
  async createTutor(tutor: InsertTutor): Promise<Tutor> {
    const [newTutor] = await db.insert(tutors).values(tutor).returning();
    return newTutor;
  }

  async getTutorsByCreator(creatorId: string): Promise<Tutor[]> {
    return await db
      .select()
      .from(tutors)
      .where(eq(tutors.creatorId, creatorId))
      .orderBy(desc(tutors.updatedAt));
  }

  async getTutorById(id: number): Promise<Tutor | undefined> {
    const [tutor] = await db.select().from(tutors).where(eq(tutors.id, id));
    return tutor;
  }

  async getTutorByIdWithContent(id: number): Promise<(Tutor & { content: TutorContent[] }) | undefined> {
    const tutor = await this.getTutorById(id);
    if (!tutor) return undefined;
    
    const content = await this.getTutorContent(id);
    return { ...tutor, content };
  }

  async updateTutor(id: number, updates: Partial<InsertTutor>): Promise<Tutor> {
    const [updatedTutor] = await db
      .update(tutors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tutors.id, id))
      .returning();
    return updatedTutor;
  }

  async deleteTutor(id: number): Promise<void> {
    // Delete related data first to avoid foreign key constraints
    await db.delete(tutorContent).where(eq(tutorContent.tutorId, id));
    
    // Get session IDs first, then delete messages
    const sessionIds = await db.select({ id: chatSessions.id }).from(chatSessions).where(eq(chatSessions.tutorId, id));
    for (const session of sessionIds) {
      await db.delete(chatMessages).where(eq(chatMessages.sessionId, session.id));
    }
    
    await db.delete(chatSessions).where(eq(chatSessions.tutorId, id));
    await db.delete(tutorAnalytics).where(eq(tutorAnalytics.tutorId, id));
    
    // Finally delete the tutor
    await db.delete(tutors).where(eq(tutors.id, id));
  }

  // Content operations
  async addTutorContent(content: InsertTutorContent): Promise<TutorContent> {
    const [newContent] = await db.insert(tutorContent).values(content).returning();
    return newContent;
  }

  async getTutorContent(tutorId: number): Promise<TutorContent[]> {
    return await db
      .select()
      .from(tutorContent)
      .where(eq(tutorContent.tutorId, tutorId));
  }

  async deleteTutorContent(id: number): Promise<void> {
    await db.delete(tutorContent).where(eq(tutorContent.id, id));
  }

  // Chat operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async getChatSession(sessionToken: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionToken, sessionToken));
    return session;
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    
    // Update session activity and message count
    await db
      .update(chatSessions)
      .set({
        lastActiveAt: new Date(),
        messageCount: sql`message_count + 1`,
      })
      .where(eq(chatSessions.id, message.sessionId));
    
    return newMessage;
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  async updateSessionActivity(sessionId: number): Promise<void> {
    await db
      .update(chatSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(chatSessions.id, sessionId));
  }

  // Analytics operations
  async getTutorAnalytics(tutorId: number, days: number): Promise<TutorAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(tutorAnalytics)
      .where(
        and(
          eq(tutorAnalytics.tutorId, tutorId),
          sql`date >= ${startDate}`
        )
      )
      .orderBy(tutorAnalytics.date);
  }

  async getCreatorStats(creatorId: string): Promise<{
    totalTutors: number;
    totalSessions: number;
    totalMessages: number;
    avgSessionDuration: number;
  }> {
    // Get total tutors
    const [tutorCount] = await db
      .select({ count: count() })
      .from(tutors)
      .where(eq(tutors.creatorId, creatorId));

    // Get session and message stats
    const stats = await db
      .select({
        totalSessions: count(chatSessions.id),
        totalMessages: sql<number>`COALESCE(SUM(${chatSessions.messageCount}), 0)`,
        avgDuration: avg(chatSessions.duration),
      })
      .from(tutors)
      .leftJoin(chatSessions, eq(chatSessions.tutorId, tutors.id))
      .where(eq(tutors.creatorId, creatorId));

    const [sessionStats] = stats;

    return {
      totalTutors: tutorCount.count,
      totalSessions: sessionStats.totalSessions,
      totalMessages: Number(sessionStats.totalMessages),
      avgSessionDuration: Number(sessionStats.avgDuration) || 0,
    };
  }

  async updateUserSubscription(userId: string, subscriptionTier: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        subscriptionTier,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async checkTutorLimit(creatorId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
    const user = await this.getUser(creatorId);
    if (!user) throw new Error("User not found");

    const [result] = await db
      .select({ count: count() })
      .from(tutors)
      .where(eq(tutors.creatorId, creatorId));

    const currentCount = result.count;
    let limit: number;

    // Use effective subscription tier (includes special user override)
    const effectiveTier = this.getEffectiveSubscriptionTier(user);
    
    switch (effectiveTier) {
      case "free":
        limit = 1;
        break;
      case "pro":
        limit = 5;
        break;
      case "premium":
        limit = -1; // unlimited
        break;
      default:
        limit = 1;
    }

    return {
      canCreate: limit === -1 || currentCount < limit,
      currentCount,
      limit
    };
  }

  async checkContentLimit(tutorId: number): Promise<{ canAdd: boolean; currentCount: number; limit: number }> {
    const tutor = await this.getTutorById(tutorId);
    if (!tutor) throw new Error("Tutor not found");

    const user = await this.getUser(tutor.creatorId);
    if (!user) throw new Error("User not found");

    const [result] = await db
      .select({ count: count() })
      .from(tutorContent)
      .where(eq(tutorContent.tutorId, tutorId));

    const currentCount = result.count;
    let limit: number;

    // Use effective subscription tier (includes special user override)
    const effectiveTier = this.getEffectiveSubscriptionTier(user);

    switch (effectiveTier) {
      case "free":
        limit = 3;
        break;
      case "pro":
        limit = 10;
        break;
      case "premium":
        limit = -1; // unlimited
        break;
      default:
        limit = 3;
    }

    return {
      canAdd: limit === -1 || currentCount < limit,
      currentCount,
      limit
    };
  }
}

export const storage = new DatabaseStorage();
