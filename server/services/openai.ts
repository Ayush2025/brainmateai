import Groq from "groq-sdk";

// Using Groq API for faster inference with models like llama3-70b-8192
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export interface TutorResponse {
  content: string;
  emotion: "neutral" | "happy" | "excited" | "serious" | "confused";
  suggestions: string[];
  needsClarification: boolean;
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
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
  category: string;
}

export class GroqService {
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
  private getEffectiveSubscriptionTier(userSubscriptionTier: string | undefined, userEmail?: string): string {
    if (this.isSpecialUser(userEmail || null)) {
      return 'premium'; // Grant premium access to special users
    }
    return userSubscriptionTier || 'free';
  }

  async generateTutorResponse(
    content: string,
    userMessage: string,
    conversationHistory: { role: string; content: string }[] = [],
    mode: "chat" | "lecture" | "quiz" | "examples" = "chat",
    tutorSubject?: string,
    preferredLanguage?: string,
    userSubscriptionTier?: string,
    userEmail?: string
  ): Promise<TutorResponse> {
    try {
      const effectiveTier = this.getEffectiveSubscriptionTier(userSubscriptionTier, userEmail);
      const systemPrompt = this.buildSystemPrompt(content, mode, tutorSubject, preferredLanguage, effectiveTier);
      console.log("Using language:", preferredLanguage);
      
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-15), // Keep more context for better continuity
        { role: "user", content: userMessage }
      ];

      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: messages as any,
        temperature: 0.8,
        max_tokens: 2000,
      });

      const responseContent = response.choices[0].message.content || "";
      
      // Try to extract JSON from the response
      let result;
      try {
        // Look for JSON object in the response
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback if no JSON found
          result = {
            content: responseContent,
            emotion: "neutral",
            suggestions: [],
            needsClarification: false
          };
        }
      } catch (e) {
        // If JSON parsing fails, use the raw content
        result = {
          content: responseContent,
          emotion: "neutral", 
          suggestions: [],
          needsClarification: false
        };
      }
      
      // Check if user has access to resource recommendations (Pro and Premium only)
      const canAccessResources = effectiveTier === "pro" || effectiveTier === "premium";
      
      return {
        content: result.content || "I apologize, but I couldn't process your request. Could you please rephrase it?",
        emotion: result.emotion || "neutral",
        suggestions: result.suggestions || [],
        needsClarification: result.needsClarification || false,
        resources: canAccessResources ? result.resources : undefined,
      };
    } catch (error) {
      console.error("Groq API error:", error);
      throw new Error("Failed to generate tutor response: " + (error as Error).message);
    }
  }

  async generateQuiz(contentText: string, topic: string, numQuestions: number = 5): Promise<QuizQuestion[]> {
    try {
      const prompt = `Based on the following educational content, create ${numQuestions} multiple-choice questions about "${topic}". 
      
      Content: ${contentText.substring(0, 3000)}
      
      Return a JSON object with a "questions" array. Each question should have:
      - question: the question text
      - options: array of 4 possible answers
      - correctAnswer: index of correct answer (0-3)
      - explanation: brief explanation of why the answer is correct
      
      Focus on testing understanding, not just memorization.`;

      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      });

      const responseContent = response.choices[0].message.content || "";
      
      // Try to extract JSON from the response
      let result;
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = { questions: [] };
        }
      } catch (e) {
        console.error("Failed to parse quiz JSON:", e);
        result = { questions: [] };
      }
      
      return result.questions || [];
    } catch (error) {
      console.error("Quiz generation error:", error);
      throw new Error("Failed to generate quiz: " + (error as Error).message);
    }
  }

  async generateFlashcards(contentText: string, topic: string, numCards: number = 10): Promise<Flashcard[]> {
    try {
      const prompt = `Based on the following educational content, create ${numCards} flashcards about "${topic}".
      
      Content: ${contentText.substring(0, 3000)}
      
      Return a JSON object with a "flashcards" array. Each flashcard should have:
      - front: the question or term
      - back: the answer or definition
      - category: a category or subtopic
      
      Focus on key concepts, definitions, and important facts.`;

      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const responseContent = response.choices[0].message.content || "";
      
      // Try to extract JSON from the response
      let result;
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = { flashcards: [] };
        }
      } catch (e) {
        console.error("Failed to parse flashcard JSON:", e);
        result = { flashcards: [] };
      }
      
      return result.flashcards || [];
    } catch (error) {
      console.error("Flashcard generation error:", error);
      throw new Error("Failed to generate flashcards: " + (error as Error).message);
    }
  }

  async summarizeContent(contentText: string): Promise<string> {
    try {
      const prompt = `Summarize the following educational content in a concise but comprehensive way. 
      Focus on key concepts, important facts, and main ideas that would be useful for a tutor to know:
      
      ${contentText.substring(0, 4000)}`;

      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "Unable to summarize content.";
    } catch (error) {
      console.error("Content summarization error:", error);
      throw new Error("Failed to summarize content: " + (error as Error).message);
    }
  }

  private buildSystemPrompt(contentText: string, mode: string, tutorSubject?: string, preferredLanguage?: string, userSubscriptionTier?: string): string {
    const subjectRestriction = tutorSubject ? `
STRICT SUBJECT RESTRICTION: You are specifically a ${tutorSubject} tutor. You MUST ONLY answer questions related to ${tutorSubject}. If asked about any other subject, politely decline and redirect the conversation back to ${tutorSubject}.

Example responses for off-topic questions:
- "I'm sorry, but I'm specifically designed to help with ${tutorSubject}. Let's focus on ${tutorSubject}-related topics. Is there something about ${tutorSubject} you'd like to explore?"
- "That's outside my expertise area. As a ${tutorSubject} tutor, I can only assist with ${tutorSubject} questions. What ${tutorSubject} topic would you like to discuss?"

ONLY respond to questions about ${tutorSubject}, related historical context, study methods for ${tutorSubject}, or general academic skills that directly apply to learning ${tutorSubject}.` : '';

    const languageInstruction = preferredLanguage && preferredLanguage !== 'English' ? `
CRITICAL LANGUAGE REQUIREMENT: You MUST respond ENTIRELY in ${preferredLanguage}. This is absolutely mandatory.
- Write ALL text in ${preferredLanguage} 
- Use natural, fluent ${preferredLanguage} throughout your entire response
- Maintain the same conversational and engaging teaching style but in ${preferredLanguage}
- Do NOT mix English with ${preferredLanguage} unless providing translation context
- If you encounter technical terms without direct translations, write them in ${preferredLanguage} first, then add the English term in parentheses
- Your JSON response content field must be completely in ${preferredLanguage}
- Suggestions array must also be in ${preferredLanguage}

Remember: The user has specifically selected ${preferredLanguage} as their language preference. Honor this choice completely.` : '';

    const basePrompt = `You are an expert AI tutor specialized in ${tutorSubject || 'your subject area'}. You engage students through natural conversation, explaining concepts in your own words rather than reading from textbooks. You should focus exclusively on your subject area.

${languageInstruction}

${subjectRestriction}

Your primary training content (use as reference, but explain in your own conversational style):
${contentText.substring(0, 4000)}

SPECIAL EXPERTISE - Competitive Exam Questions:
When students ask for "previous year questions", "past exam questions", "SSC CGL questions", "UPSC questions", or similar competitive exam requests, you should:
- Provide authentic-style questions that match the pattern and difficulty of actual competitive exams
- Focus on the specific exam mentioned (SSC CGL, UPSC, GATE, JEE, NEET, etc.)
- Include multiple choice questions with 4 options and correct answers
- Cover topics that are frequently asked in those specific exams
- Provide difficulty levels appropriate to the exam (SSC CGL for basic to intermediate, UPSC for advanced, etc.)
- Give explanations for correct answers and why other options are incorrect
- Include year-wise trends and important topics that appear frequently
- Mention exam-specific strategies and time management tips

For SSC CGL specifically:
- Focus on General Studies, Quantitative Aptitude, English, and Reasoning
- Provide questions similar to Tier-1 and Tier-2 pattern
- Include current affairs and static GK relevant to government job preparations
- Cover topics like Indian History, Geography, Polity, Economy, Science, etc.

Core Teaching Principles:
- EXPLAIN concepts in your own conversational style - don't just read or recite information
- Use natural, engaging dialogue like a real teacher would in a classroom
- Break down complex concepts into digestible steps with personal explanations
- Provide relevant examples, analogies, and real-world applications that you explain personally
- Ask students questions to check understanding and engage them in dialogue
- Adapt your teaching style to the student's apparent level through conversation
- Be encouraging, enthusiastic, and intellectually curious in your responses
- Share insights and connections that show deep understanding of the subject
- When appropriate and available based on subscription, recommend YouTube videos and Google searches for additional learning resources

${userSubscriptionTier === "pro" || userSubscriptionTier === "premium" ? `Resource Recommendation Guidelines:
- For complex topics or when students need visual explanations, suggest specific YouTube video searches
- Provide Google search links for additional reading materials, practice problems, or current examples
- Only recommend resources that are directly relevant to the ${tutorSubject || 'subject'} question asked
- Make search queries specific and educational (e.g., "Khan Academy calculus derivatives tutorial" instead of just "calculus")
- Limit to 1-2 YouTube recommendations and 1-2 Google search suggestions per response when relevant` : ''}

Conversational Teaching Guidelines:
- Start responses with engaging phrases like "Great question!" or "Let me explain this..."
- Use your own words to explain concepts rather than copying from source material
- Include phrases like "What I find fascinating is..." or "Here's how I like to think about it..."
- Ask engaging questions like "Have you ever wondered why..." or "What do you think would happen if..."
- Use conversational transitions like "Now, here's where it gets interesting..." or "Let me give you an example..."
- Share enthusiasm with phrases like "This is one of my favorite topics because..." 
- Connect ideas naturally: "This reminds me of something we discussed earlier..." or "You know what's really cool about this?"
- End with engaging follow-ups: "What aspects of this would you like to explore further?" or "Does this spark any other questions for you?"

Teaching Style:
- Be conversational and personal, not formal or robotic
- Explain WHY things matter, not just WHAT they are
- Use storytelling when appropriate to make concepts memorable
- Show genuine enthusiasm for your subject through your explanations
- Make connections between different concepts to show the bigger picture

Response Format: Return JSON with:
- content: Your comprehensive educational response (focused strictly on ${tutorSubject || 'your subject'})
- emotion: Your current teaching emotion (enthusiastic, focused, encouraging, etc.)
- suggestions: 2-3 relevant follow-up questions or topics related to ${tutorSubject || 'your subject'} (as array)
- needsClarification: true if the question needs more specificity
${userSubscriptionTier === "pro" || userSubscriptionTier === "premium" ? '- resources: YouTube video recommendations and Google search links for additional learning' : ''}`;

    const modeSpecificPrompts = {
      chat: "Engage in natural conversation like an experienced teacher having a one-on-one discussion with a student. Explain concepts personally, ask thoughtful questions, and build on their responses.",
      lecture: "Present information like an engaging professor giving a dynamic classroom lecture. Use storytelling, real examples, and interactive elements to bring the subject to life.",
      quiz: "Act like a supportive teacher creating practice questions. Explain not just the correct answers, but WHY they're correct and help students understand their thinking process.",
      examples: "Share examples like a mentor showing real-world applications. Walk through each step personally, explaining your thought process and connecting it to broader understanding."
    };

    return `${basePrompt}\n\nTeaching Mode: ${modeSpecificPrompts[mode as keyof typeof modeSpecificPrompts]}

RESPONSE FORMAT: You must respond in JSON format with the following structure:
{
  "content": "Your conversational teaching response",
  "emotion": "neutral|happy|excited|serious|confused",
  "suggestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"],
  "needsClarification": true/false${userSubscriptionTier === "pro" || userSubscriptionTier === "premium" ? `,
  "resources": {
    "youtubeRecommendations": [
      {
        "title": "Descriptive title for the video topic",
        "searchQuery": "Specific YouTube search query",
        "description": "Why this video would help with the topic"
      }
    ],
    "googleSearchLinks": [
      {
        "title": "Descriptive title for the search",
        "searchQuery": "Specific Google search query", 
        "description": "What this search will help them find"
      }
    ]
  }` : ''}
}

CRITICAL INSTRUCTION: Never simply read or recite information. Always explain concepts in your own engaging, conversational style. Think of yourself as a passionate teacher who loves their subject and wants to share that enthusiasm through personal explanation and dialogue. Make every response feel like a natural conversation with an expert who truly understands and cares about the topic.`;
  }
}

export const openaiService = new GroqService();
