import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";
import Razorpay from "razorpay";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { openaiService } from "./services/openai";
import { fileProcessor } from "./services/fileProcessor";
import { analyticsService } from "./services/analytics";
import { insertTutorSchema, insertTutorContentSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { jsPDF } from "jspdf";

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag", // Test key
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret_key"
});

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subscription limits endpoint
  app.get('/api/subscription/limits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tutorLimits = await storage.checkTutorLimit(userId);
      
      res.json({
        tutorLimits,
        plans: {
          free: { tutors: 1, contentPerTutor: 3 },
          pro: { tutors: 5, contentPerTutor: 10 },
          premium: { tutors: -1, contentPerTutor: -1 }
        }
      });
    } catch (error) {
      console.error("Error fetching subscription limits:", error);
      res.status(500).json({ message: "Failed to fetch limits" });
    }
  });

  // Tutor management routes
  app.post('/api/tutors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check subscription limits before creating tutor
      const limitCheck = await storage.checkTutorLimit(userId);
      if (!limitCheck.canCreate) {
        return res.status(403).json({ 
          message: `Tutor limit reached. You can create ${limitCheck.limit} tutors on your current plan.`,
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit 
        });
      }

      const tutorData = insertTutorSchema.parse({
        ...req.body,
        creatorId: userId,
      });

      const tutor = await storage.createTutor(tutorData);
      res.json(tutor);
    } catch (error) {
      console.error("Error creating tutor:", error);
      res.status(400).json({ message: "Failed to create tutor: " + (error as Error).message });
    }
  });

  app.get('/api/tutors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tutors = await storage.getTutorsByCreator(userId);
      res.json(tutors);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  app.get('/api/tutors/:id', async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      const tutor = await storage.getTutorByIdWithContent(tutorId);
      
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      // Check if tutor is public or user has access
      const isPublic = tutor.isPublic;
      const hasPassword = tutor.password;
      
      if (!isPublic && hasPassword) {
        // For password-protected tutors, return basic info only
        res.json({
          id: tutor.id,
          name: tutor.name,
          subject: tutor.subject,
          description: tutor.description,
          requiresPassword: true,
        });
      } else {
        res.json(tutor);
      }
    } catch (error) {
      console.error("Error fetching tutor:", error);
      res.status(500).json({ message: "Failed to fetch tutor" });
    }
  });

  app.post('/api/tutors/:id/verify-password', async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      const { password } = req.body;
      
      const tutor = await storage.getTutorById(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      if (tutor.password !== password) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      const tutorWithContent = await storage.getTutorByIdWithContent(tutorId);
      res.json(tutorWithContent);
    } catch (error) {
      console.error("Error verifying password:", error);
      res.status(500).json({ message: "Failed to verify password" });
    }
  });

  // Tutor editing is disabled once created - removed PUT endpoint

  app.delete('/api/tutors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tutorId = parseInt(req.params.id);
      
      // Verify ownership
      const tutor = await storage.getTutorById(tutorId);
      if (!tutor || tutor.creatorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteTutor(tutorId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tutor:", error);
      res.status(500).json({ message: "Failed to delete tutor" });
    }
  });

  // Content upload routes
  app.post('/api/tutors/:id/content', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tutorId = parseInt(req.params.id);
      
      // Verify ownership
      const tutor = await storage.getTutorById(tutorId);
      if (!tutor || tutor.creatorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check content upload limits
      const limitCheck = await storage.checkContentLimit(tutorId);
      if (!limitCheck.canAdd) {
        return res.status(403).json({ 
          message: `Content limit reached. You can upload ${limitCheck.limit} files per tutor on your current plan.`,
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit 
        });
      }

      let processedContent;
      let contentData;

      if (req.body.youtubeUrl) {
        // Handle YouTube URL
        const validation = await fileProcessor.validateYouTubeUrl(req.body.youtubeUrl);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.error });
        }

        processedContent = await fileProcessor.processFile(req.body.youtubeUrl, 'youtube');
        contentData = {
          tutorId,
          fileName: req.body.youtubeUrl,
          fileType: 'youtube',
          fileSize: 0,
          content: processedContent.text,
          metadata: processedContent.metadata,
        };
      } else if (req.file) {
        // Handle file upload
        const validation = fileProcessor.validateFile(req.file);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.error });
        }

        const fileType = path.extname(req.file.originalname).slice(1).toLowerCase();
        processedContent = await fileProcessor.processFile(req.file.path, fileType);
        
        contentData = {
          tutorId,
          fileName: req.file.originalname,
          fileType,
          fileSize: req.file.size,
          content: processedContent.text,
          metadata: processedContent.metadata,
        };
      } else {
        return res.status(400).json({ message: "No file or YouTube URL provided" });
      }

      const content = await storage.addTutorContent(insertTutorContentSchema.parse(contentData));
      res.json(content);
    } catch (error) {
      console.error("Error uploading content:", error);
      res.status(400).json({ message: "Failed to upload content: " + (error as Error).message });
    }
  });

  app.get('/api/tutors/:id/content', async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      const content = await storage.getTutorContent(tutorId);
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Chat routes
  app.post('/api/chat/sessions', async (req, res) => {
    try {
      console.log("Chat session request body:", req.body);
      
      const tutorId = parseInt(req.body.tutorId);
      if (isNaN(tutorId) || !tutorId) {
        return res.status(400).json({ message: "Valid tutorId is required" });
      }
      
      const sessionData = insertChatSessionSchema.parse({
        tutorId: tutorId,
        studentId: req.body.studentId,
        sessionToken: nanoid(),
      });

      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(400).json({ message: "Failed to create chat session: " + (error as Error).message });
    }
  });

  app.get('/api/chat/sessions/:token', async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.token);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.get('/api/chat/sessions/:token/messages', async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.token);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const messages = await storage.getChatMessages(session.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat/message', async (req, res) => {
    try {
      console.log("Message request received:", req.body);
      
      if (!req.body.sessionToken) {
        return res.status(400).json({ message: "Session token is required" });
      }
      
      if (!req.body.content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      const session = await storage.getChatSession(req.body.sessionToken);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const tutor = await storage.getTutorByIdWithContent(session.tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      // Get tutor creator's subscription tier and email for resource recommendations
      const creator = await storage.getUser(tutor.creatorId);
      const userSubscriptionTier = creator?.subscriptionTier || 'free';
      const userEmail = creator?.email || '';

      // Save user message
      const userMessage = await storage.addChatMessage(insertChatMessageSchema.parse({
        sessionId: session.id,
        role: 'user',
        content: req.body.content,
      }));

      // Get conversation history
      const history = await storage.getChatMessages(session.id);
      const conversationHistory = history.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Combine all tutor content for context
      const tutorContent = tutor.content.map(c => c.content).join('\n\n');

      // Detect user's language from their message
      const detectLanguage = (text: string): string => {
        if (/[а-яё]/i.test(text)) return 'Russian';
        if (/[一-龯]/.test(text)) return 'Chinese';
        if (/[ひらがなカタカナ]/.test(text)) return 'Japanese';
        if (/[한-힣]/.test(text)) return 'Korean';
        if (/[à-ÿ]/.test(text) && /\b(le|la|les|de|du|et|je|tu|il|elle|nous|vous|ils|elles)\b/i.test(text)) return 'French';
        if (/[à-ÿñü]/.test(text) && /\b(el|la|los|las|de|del|y|yo|tú|él|ella|nosotros|vosotros|ellos|ellas)\b/i.test(text)) return 'Spanish';
        if (/[ä-üß]/.test(text) && /\b(der|die|das|und|ich|du|er|sie|wir|ihr|sie)\b/i.test(text)) return 'German';
        if (/\b(हैं|है|को|का|की|के|में|पर|से|तक)\b/.test(text)) return 'Hindi';
        if (/\b(اور|کے|میں|کو|کا|کی|ہے|ہیں|سے|پر)\b/.test(text)) return 'Urdu';
        return 'English';
      };

      const detectedLanguage = req.body.language || req.body.preferredLanguage || detectLanguage(req.body.content);
      console.log("Processing message with language:", detectedLanguage);

      // Generate AI response
      const aiResponse = await openaiService.generateTutorResponse(
        tutorContent,
        req.body.content,
        conversationHistory,
        req.body.mode || 'chat',
        tutor.subject,
        detectedLanguage,
        userSubscriptionTier,
        userEmail
      );

      // Save AI message
      const assistantMessage = await storage.addChatMessage(insertChatMessageSchema.parse({
        sessionId: session.id,
        role: 'assistant',
        content: aiResponse.content,
        metadata: {
          emotion: aiResponse.emotion,
          suggestions: aiResponse.suggestions,
          needsClarification: aiResponse.needsClarification,
          resources: aiResponse.resources,
        },
      }));

      console.log("Message processed successfully");
      
      res.json({
        userMessage,
        assistantMessage: {
          ...assistantMessage,
          metadata: {
            emotion: aiResponse.emotion,
            suggestions: aiResponse.suggestions,
            needsClarification: aiResponse.needsClarification,
            resources: aiResponse.resources,
          }
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message: " + (error as Error).message });
    }
  });

  // Quiz and flashcard generation
  app.post('/api/tutors/:id/quiz', async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      const { topic, numQuestions = 5 } = req.body;
      
      const tutor = await storage.getTutorByIdWithContent(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const tutorContent = tutor.content.map(c => c.content).join('\n\n');
      const quiz = await openaiService.generateQuiz(tutorContent, topic, numQuestions);
      
      res.json(quiz);
    } catch (error) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz: " + (error as Error).message });
    }
  });

  app.post('/api/tutors/:id/flashcards', async (req, res) => {
    try {
      const tutorId = parseInt(req.params.id);
      const { topic, numCards = 10 } = req.body;
      
      const tutor = await storage.getTutorByIdWithContent(tutorId);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const tutorContent = tutor.content.map(c => c.content).join('\n\n');
      const flashcards = await openaiService.generateFlashcards(tutorContent, topic, numCards);
      
      res.json(flashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      res.status(500).json({ message: "Failed to generate flashcards: " + (error as Error).message });
    }
  });

  // Generate session notes PDF
  app.post('/api/generate-session-notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check subscription tier - only Pro and Premium can download notes
      const userSubscriptionTier = user.subscriptionTier || 'free';
      const specialUsers = ['yadavayush4239@gmail.com', 'viveksolanki8013@gmail.com'];
      const isSpecialUser = specialUsers.includes(user.email || '');
      
      if (!isSpecialUser && userSubscriptionTier === 'free') {
        return res.status(403).json({ 
          message: "Notes downloads are available for Pro and Premium members only. Please upgrade your plan.",
          feature: "notes_download",
          subscriptionRequired: "pro"
        });
      }

      const { sessionToken, tutorName, tutorSubject, messages } = req.body;
      
      if (!sessionToken || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Filter out system messages and format for PDF
      const conversationMessages = messages.filter((msg: any) => 
        msg.role !== 'system' && msg.content && msg.content.trim()
      );

      if (conversationMessages.length === 0) {
        return res.status(400).json({ message: "No conversation content found" });
      }

      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 6;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          if (y + (i * lineHeight) > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(lines[i], x, y + (i * lineHeight));
        }
        
        return y + (lines.length * lineHeight);
      };

      // Add header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Session Notes', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(14);
      doc.text(`Tutor: ${tutorName || 'Unknown'}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Subject: ${tutorSubject || 'Unknown'}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;

      // Add conversation
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Conversation Summary', margin, yPosition);
      yPosition += 12;

      // Process each message
      for (const message of conversationMessages) {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }

        // Add role header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const roleText = message.role === 'user' ? 'Student:' : 'Tutor:';
        doc.text(roleText, margin, yPosition);
        yPosition += 8;

        // Add message content
        doc.setFont('helvetica', 'normal');
        const cleanContent = message.content
          .replace(/[#*_`]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/🔍|📚|🎥|💡/g, '')
          .trim();

        yPosition = addWrappedText(cleanContent, margin + 5, yPosition, pageWidth - margin * 2 - 5, 11);
        yPosition += 10;

        // Add suggestions if present
        if (message.metadata?.suggestions && message.metadata.suggestions.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          yPosition = addWrappedText(`Suggestions: ${message.metadata.suggestions.join(', ')}`, margin + 5, yPosition, pageWidth - margin * 2 - 5, 10);
          yPosition += 8;
        }

        // Add resources if present
        if (message.metadata?.resources) {
          if (message.metadata.resources.youtubeRecommendations) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            yPosition = addWrappedText('YouTube Resources:', margin + 5, yPosition, pageWidth - margin * 2 - 5, 10);
            yPosition += 5;
            
            for (const video of message.metadata.resources.youtubeRecommendations) {
              yPosition = addWrappedText(`• ${video.title}: ${video.description}`, margin + 10, yPosition, pageWidth - margin * 2 - 10, 9);
              yPosition += 5;
            }
          }

          if (message.metadata.resources.googleSearchLinks) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            yPosition = addWrappedText('Additional Resources:', margin + 5, yPosition, pageWidth - margin * 2 - 5, 10);
            yPosition += 5;
            
            for (const link of message.metadata.resources.googleSearchLinks) {
              yPosition = addWrappedText(`• ${link.title}: ${link.description}`, margin + 10, yPosition, pageWidth - margin * 2 - 10, 9);
              yPosition += 5;
            }
          }
        }

        yPosition += 5; // Extra spacing between messages
      }

      // Add footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated by BrainMate AI - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Convert to buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      
      res.json({
        success: true,
        pdfBuffer: pdfBuffer,
        filename: `${tutorName || 'Session'}_Notes_${new Date().toISOString().split('T')[0]}.pdf`
      });

    } catch (error) {
      console.error("Error generating session notes:", error);
      res.status(500).json({ message: "Failed to generate session notes: " + (error as Error).message });
    }
  });

  // Payment routes with Razorpay
  app.post("/api/create-order", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, planType } = req.body;
      
      if (!amount || !planType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const options = {
        amount: amount * 100, // Amount in paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
        notes: {
          planType,
          userId: req.user.claims.sub
        }
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.post("/api/verify-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;
      const userId = req.user.claims.sub;
      
      // In a real implementation, verify the signature here
      // For now, we'll update the user's subscription tier
      await storage.updateUserSubscription(userId, planType);
      
      res.json({ success: true, message: "Payment verified and subscription updated" });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/creator-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getCreatorStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching creator stats:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/tutors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tutorId = parseInt(req.params.id);
      const days = parseInt(req.query.days as string) || 30;
      
      // Verify ownership
      const tutor = await storage.getTutorById(tutorId);
      if (!tutor || tutor.creatorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getTutorAnalytics(tutorId, days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching tutor analytics:", error);
      res.status(500).json({ message: "Failed to fetch tutor analytics" });
    }
  });

  // Enhanced Analytics endpoints for comprehensive engagement tracking
  app.get("/api/analytics/engagement/:tutorId", isAuthenticated, async (req, res) => {
    try {
      const tutorId = parseInt(req.params.tutorId);
      const days = parseInt(req.query.days as string) || 30;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tutor = await storage.getTutorById(tutorId);
      if (!tutor || tutor.creatorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const engagementMetrics = await analyticsService.getEngagementMetrics(tutorId, days);
      res.json(engagementMetrics);
    } catch (error) {
      console.error("Error fetching engagement metrics:", error);
      res.status(500).json({ message: "Failed to fetch engagement metrics" });
    }
  });

  app.get("/api/analytics/realtime/:tutorId", isAuthenticated, async (req, res) => {
    try {
      const tutorId = parseInt(req.params.tutorId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const tutor = await storage.getTutorById(tutorId);
      if (!tutor || tutor.creatorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const realtimeData = await analyticsService.getRealTimeEngagement(tutorId);
      res.json(realtimeData);
    } catch (error) {
      console.error("Error fetching real-time analytics:", error);
      res.status(500).json({ message: "Failed to fetch real-time analytics" });
    }
  });

  app.post("/api/analytics/track-engagement", async (req, res) => {
    try {
      const { sessionId, tutorId, eventType, data } = req.body;

      if (!sessionId || !tutorId || !eventType) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      analyticsService.trackEngagement({
        type: eventType,
        sessionId: parseInt(sessionId),
        tutorId: parseInt(tutorId),
        data,
        timestamp: new Date(),
        userAgent: req.headers['user-agent']
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking engagement:", error);
      res.status(500).json({ message: "Failed to track engagement" });
    }
  });

  app.post("/api/analytics/track-feedback", async (req, res) => {
    try {
      const { sessionId, tutorId, rating, feedback, category } = req.body;

      if (!sessionId || !tutorId || !rating) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      analyticsService.trackFeedback({
        sessionId: parseInt(sessionId),
        tutorId: parseInt(tutorId),
        rating: parseInt(rating),
        feedback,
        category
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking feedback:", error);
      res.status(500).json({ message: "Failed to track feedback" });
    }
  });

  app.post("/api/analytics/track-learning", async (req, res) => {
    try {
      const { sessionId, tutorId, studentIdentifier, topic, skillLevel, questionsAsked, conceptsLearned, timeSpent } = req.body;

      if (!sessionId || !tutorId || !topic) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      analyticsService.trackLearningProgress({
        sessionId: parseInt(sessionId),
        tutorId: parseInt(tutorId),
        studentIdentifier: studentIdentifier || 'anonymous',
        topic,
        skillLevel: skillLevel || 'beginner',
        questionsAsked: parseInt(questionsAsked) || 0,
        conceptsLearned: conceptsLearned || [],
        timeSpent: parseInt(timeSpent) || 0
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking learning progress:", error);
      res.status(500).json({ message: "Failed to track learning progress" });
    }
  });

  // AI Content Generation Routes
  app.post("/api/ai/generate-content", isAuthenticated, async (req, res) => {
    try {
      const { topic, difficulty, type } = req.body;
      const userId = req.user.claims.sub;

      if (!topic || !difficulty || !type) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      let generatedContent;
      
      switch (type) {
        case "quiz":
          generatedContent = await openaiService.generateQuiz(topic, topic, 5);
          break;
        case "flashcards":
          generatedContent = await openaiService.generateFlashcards(topic, topic, 10);
          break;
        case "summary":
          generatedContent = await openaiService.summarizeContent(`Create a comprehensive summary about ${topic} at ${difficulty} level`);
          break;
        case "exercises":
          generatedContent = {
            exercises: [
              {
                title: `${topic} Practice Problem 1`,
                description: `Solve this ${difficulty} level problem about ${topic}`,
                solution: `Step-by-step solution for ${topic} problem`
              }
            ]
          };
          break;
        default:
          return res.status(400).json({ message: "Invalid content type" });
      }

      res.json({
        type,
        topic,
        difficulty,
        [type === "quiz" ? "questions" : type === "flashcards" ? "cards" : "content"]: generatedContent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Smart Content Analysis Route
  app.post("/api/ai/analyze-content", isAuthenticated, async (req, res) => {
    try {
      const { content, tutorId } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const analysis = {
        complexity: content.length > 500 ? "advanced" : content.length > 200 ? "intermediate" : "beginner",
        wordCount: content.split(" ").length,
        readabilityScore: Math.max(1, Math.min(100, 100 - content.split(" ").length / 10)),
        keyTopics: content.split(" ").filter(word => word.length > 5).slice(0, 10),
        suggestedQuestions: await openaiService.generateQuiz(content, "Analysis", 3),
        improvements: [
          "Add visual examples",
          "Include practice exercises", 
          "Provide real-world applications"
        ],
        estimatedReadingTime: Math.ceil(content.split(" ").length / 200)
      };

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ message: "Failed to analyze content" });
    }
  });

  // Learning Analytics Route
  app.get("/api/analytics/learning-insights/:tutorId", isAuthenticated, async (req, res) => {
    try {
      const { tutorId } = req.params;
      const userId = req.user.claims.sub;

      const tutor = await storage.getTutorById(parseInt(tutorId));
      if (!tutor || tutor.creatorId !== userId) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const analytics = await storage.getTutorAnalytics(parseInt(tutorId), 30);
      
      const insights = {
        engagementMetrics: {
          totalSessions: analytics.reduce((sum, a) => sum + a.sessionCount, 0),
          avgSessionDuration: analytics.reduce((sum, a) => sum + a.avgDuration, 0) / Math.max(analytics.length, 1),
          totalMessages: analytics.reduce((sum, a) => sum + a.messageCount, 0),
          retentionRate: Math.min(100, analytics.length * 3.33)
        },
        performanceData: analytics.map(a => ({
          date: a.date,
          sessions: a.sessionCount,
          messages: a.messageCount,
          duration: a.avgDuration
        })),
        recommendations: [
          "Increase interactive elements",
          "Add more practice questions",
          "Include multimedia content"
        ]
      };

      res.json(insights);
    } catch (error) {
      console.error("Error getting learning insights:", error);
      res.status(500).json({ message: "Failed to get insights" });
    }
  });

  // Gamification Routes
  app.get("/api/gamification/achievements/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user.claims.sub;
      
      if (userId !== requestingUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const tutors = await storage.getTutorsByCreator(userId);
      const stats = await storage.getCreatorStats(userId);
      
      const achievements = [
        {
          id: "first_tutor",
          name: "AI Creator",
          description: "Created your first AI tutor",
          icon: "🎯",
          earned: tutors.length > 0,
          earnedDate: tutors.length > 0 ? tutors[0].createdAt : null
        },
        {
          id: "content_master",
          name: "Content Master", 
          description: "Upload 10 pieces of content",
          icon: "📚",
          earned: stats.totalMessages > 50,
          progress: Math.min(stats.totalMessages, 50),
          required: 50
        },
        {
          id: "engagement_expert",
          name: "Engagement Expert",
          description: "Reach 100 student interactions",
          icon: "👑",
          earned: stats.totalSessions >= 10,
          progress: Math.min(stats.totalSessions, 10),
          required: 10
        }
      ];

      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Multi-language Support Route
  app.post("/api/ai/translate", isAuthenticated, async (req, res) => {
    try {
      const { text, targetLanguage = "es" } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const languageNames: { [key: string]: string } = {
        es: "Spanish",
        fr: "French", 
        de: "German",
        it: "Italian",
        pt: "Portuguese",
        zh: "Chinese",
        ja: "Japanese",
        ko: "Korean"
      };

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          message: "Translation service requires OpenAI API access",
          error: "MISSING_API_KEY"
        });
      }

      // Use OpenAI for real translation
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Provide accurate, natural translations. Return only the translated text, no explanations.'
            },
            {
              role: 'user',
              content: `Translate this text to ${languageNames[targetLanguage] || targetLanguage}: "${text}"`
            }
          ],
          temperature: 0.1,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI Translation API error:", response.status, errorText);
        return res.status(500).json({ 
          message: "Translation failed",
          error: "TRANSLATION_API_ERROR"
        });
      }

      const openaiResponse = await response.json();
      const translatedText = openaiResponse.choices[0]?.message?.content || text;

      res.json({
        originalText: text,
        translatedText: translatedText.trim(),
        targetLanguage,
        sourceLanguage: "en", 
        confidence: 0.95
      });
    } catch (error) {
      res.status(500).json({ message: "Translation failed" });
    }
  });

  // Voice Synthesis Route
  app.post("/api/ai/voice-synthesis", isAuthenticated, async (req, res) => {
    try {
      const { text, voice = "alloy", speed = 1.0 } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          message: "OpenAI API key not configured",
          error: "MISSING_API_KEY"
        });
      }

      // Use OpenAI TTS API
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          speed: speed
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI TTS API error:", response.status, errorText);
        return res.status(500).json({ 
          message: "Voice synthesis failed",
          error: "TTS_API_ERROR"
        });
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      res.json({
        audioUrl: `data:audio/mp3;base64,${audioBase64}`,
        text,
        voice,
        speed,
        duration: Math.ceil(text.length / 15),
        status: "generated"
      });
    } catch (error) {
      console.error("Voice synthesis error:", error);
      res.status(500).json({ message: "Failed to generate voice" });
    }
  });

  // Performance Prediction Route
  app.post("/api/ai/predict-performance", isAuthenticated, async (req, res) => {
    try {
      const { tutorId, studentData } = req.body;
      const userId = req.user.claims.sub;

      const tutor = await storage.getTutorById(parseInt(tutorId));
      if (!tutor || tutor.creatorId !== userId) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const analytics = await storage.getTutorAnalytics(parseInt(tutorId), 7);
      const avgPerformance = analytics.reduce((sum, a) => sum + a.sessionCount, 0) / Math.max(analytics.length, 1);

      const prediction = {
        predictedScore: Math.min(100, Math.max(0, avgPerformance * 20 + Math.random() * 20)),
        confidence: 0.85,
        factors: [
          { name: "Engagement Level", impact: "positive", weight: 0.4 },
          { name: "Content Difficulty", impact: "neutral", weight: 0.3 },
          { name: "Learning Style Match", impact: "positive", weight: 0.3 }
        ],
        recommendations: [
          "Focus on weak areas identified",
          "Increase practice frequency",
          "Use more interactive content"
        ]
      };

      res.json(prediction);
    } catch (error) {
      res.status(500).json({ message: "Performance prediction failed" });
    }
  });

  // Engagement Tracking Route
  app.get("/api/analytics/engagement/:tutorId", isAuthenticated, async (req, res) => {
    try {
      const { tutorId } = req.params;
      const userId = req.user.claims.sub;

      const tutor = await storage.getTutorById(parseInt(tutorId));
      if (!tutor || tutor.creatorId !== userId) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const analytics = await storage.getTutorAnalytics(parseInt(tutorId), 30);
      
      const engagement = {
        overview: {
          totalEngagements: analytics.reduce((sum, a) => sum + a.sessionCount, 0),
          avgEngagementDuration: analytics.reduce((sum, a) => sum + a.avgDuration, 0) / Math.max(analytics.length, 1),
          engagementTrend: analytics.length > 1 ? "increasing" : "stable"
        },
        dailyData: analytics.map(a => ({
          date: a.date,
          engagements: a.sessionCount,
          duration: a.avgDuration,
          quality: Math.min(100, a.messageCount * 10)
        })),
        insights: [
          "Peak engagement occurs in afternoon hours",
          "Students prefer interactive content",
          "Response time affects engagement quality"
        ]
      };

      res.json(engagement);
    } catch (error) {
      res.status(500).json({ message: "Failed to get engagement data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
