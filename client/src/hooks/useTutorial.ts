import { useState, useEffect } from "react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'scroll';
  highlight?: boolean;
}

interface TutorialConfig {
  [key: string]: TutorialStep[];
}

const tutorialSteps: TutorialConfig = {
  landing: [
    {
      id: "welcome",
      title: "Welcome to BrainMate AI",
      description: "Create intelligent AI tutors from your educational content in minutes.",
      position: "center",
    },
    {
      id: "features",
      title: "Explore Features",
      description: "Discover powerful AI tutoring capabilities including voice interaction and multilingual support.",
      targetElement: "#features",
      position: "top",
      action: "scroll",
    },
    {
      id: "pricing",
      title: "Choose Your Plan",
      description: "Select from our flexible pricing plans designed for educators and institutions.",
      targetElement: "#pricing",
      position: "top",
      action: "scroll",
    },
    {
      id: "get-started",
      title: "Start Your Journey",
      description: "Click here to create your account and build your first AI tutor.",
      targetElement: "[data-tutorial='get-started-btn']",
      position: "bottom",
      action: "click",
      highlight: true,
    },
  ],
  dashboard: [
    {
      id: "dashboard-welcome",
      title: "Your Creator Dashboard",
      description: "This is your control center for managing AI tutors and tracking performance.",
      position: "center",
    },
    {
      id: "create-tutor",
      title: "Create Your First Tutor",
      description: "Click here to start building an AI tutor from your educational content.",
      targetElement: "[data-tutorial='create-tutor-btn']",
      position: "bottom",
      action: "click",
      highlight: true,
    },
    {
      id: "tutor-cards",
      title: "Manage Your Tutors",
      description: "View and manage all your created AI tutors. Track sessions, messages, and performance.",
      targetElement: "[data-tutorial='tutor-cards']",
      position: "top",
      action: "hover",
    },
    {
      id: "analytics",
      title: "Track Performance",
      description: "Monitor your tutors' performance with detailed analytics and insights.",
      targetElement: "[data-tutorial='analytics-section']",
      position: "left",
    },
    {
      id: "upgrade",
      title: "Upgrade Your Plan",
      description: "Access premium features like voice interaction and advanced analytics by upgrading your subscription.",
      targetElement: "[data-tutorial='upgrade-btn']",
      position: "left",
      action: "click",
    },
  ],
  createTutor: [
    {
      id: "tutor-creation",
      title: "Create AI Tutor",
      description: "Let's build your AI tutor step by step. Start by giving it a name and subject.",
      position: "center",
    },
    {
      id: "tutor-name",
      title: "Name Your Tutor",
      description: "Choose a descriptive name for your AI tutor that reflects its teaching purpose.",
      targetElement: "[data-tutorial='tutor-name']",
      position: "bottom",
      action: "click",
    },
    {
      id: "tutor-subject",
      title: "Select Subject",
      description: "Pick the subject area your tutor will specialize in for better AI responses.",
      targetElement: "[data-tutorial='tutor-subject']",
      position: "bottom",
      action: "click",
    },
    {
      id: "content-upload",
      title: "Upload Content",
      description: "Add your educational materials - PDFs, documents, or YouTube videos for the AI to learn from.",
      targetElement: "[data-tutorial='content-upload']",
      position: "top",
      action: "click",
      highlight: true,
    },
    {
      id: "create-submit",
      title: "Launch Your Tutor",
      description: "Review your settings and create your AI tutor. Students can then interact with it immediately.",
      targetElement: "[data-tutorial='create-submit']",
      position: "top",
      action: "click",
      highlight: true,
    },
  ],
  chat: [
    {
      id: "chat-interface",
      title: "AI Tutor Chat",
      description: "This is where students interact with your AI tutor. The interface adapts to provide personalized learning.",
      position: "center",
    },
    {
      id: "avatar-panel",
      title: "AI Avatar",
      description: "Your tutor's avatar provides visual feedback and can speak responses with voice synthesis.",
      targetElement: "[data-tutorial='avatar-panel']",
      position: "right",
    },
    {
      id: "voice-toggle",
      title: "Voice Interaction",
      description: "Enable voice mode for natural conversation with your AI tutor using speech-to-text.",
      targetElement: "[data-tutorial='voice-toggle']",
      position: "left",
      action: "click",
    },
    {
      id: "message-input",
      title: "Ask Questions",
      description: "Students can type questions here and get intelligent, contextual responses from the AI tutor.",
      targetElement: "[data-tutorial='message-input']",
      position: "top",
      action: "click",
      highlight: true,
    },
  ],
};

export function useTutorial(page: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial for this page
    const seenKey = `tutorial_seen_${page}`;
    const seen = localStorage.getItem(seenKey) === "true";
    setHasSeenTutorial(seen);

    // Auto-show tutorial for new users on landing page
    if (!seen && page === "landing") {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // Show after 5 seconds to let page load
      return () => clearTimeout(timer);
    }
  }, [page]);

  const openTutorial = () => {
    setIsOpen(true);
  };

  const closeTutorial = () => {
    setIsOpen(false);
  };

  const completeTutorial = () => {
    const seenKey = `tutorial_seen_${page}`;
    localStorage.setItem(seenKey, "true");
    setHasSeenTutorial(true);
    setIsOpen(false);
  };

  const resetTutorial = () => {
    const seenKey = `tutorial_seen_${page}`;
    localStorage.removeItem(seenKey);
    setHasSeenTutorial(false);
  };

  return {
    isOpen,
    hasSeenTutorial,
    steps: tutorialSteps[page] || [],
    openTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
  };
}