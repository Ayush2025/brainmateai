import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModernChatInterface } from "@/components/chat/modernChatInterface";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Lock } from "lucide-react";
import type { Tutor, ChatSession, ChatMessage } from "@shared/schema";

interface TutorWithContent extends Tutor {
  content: any[];
  requiresPassword?: boolean;
}

export default function ChatPage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [verifiedTutor, setVerifiedTutor] = useState<TutorWithContent | null>(null);



  // Fetch tutor details
  const { data: tutor, isLoading: tutorLoading, error: tutorError } = useQuery<TutorWithContent>({
    queryKey: ["/api/tutors", tutorId],
    enabled: !!tutorId,
    retry: false,
  });

  // Create chat session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (tutorId: number) => {
      console.log("Creating session for tutor:", tutorId);
      const response = await apiRequest("POST", "/api/chat/sessions", {
        tutorId: tutorId,
        studentId: null, // Anonymous for now
      });
      return response.json();
    },
    onSuccess: (session: ChatSession) => {
      console.log("Session created successfully:", session);
      setSessionToken(session.sessionToken);
    },
    onError: (error) => {
      console.error("Session creation error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to start chat session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify password mutation
  const verifyPasswordMutation = useMutation({
    mutationFn: async ({ tutorId, password }: { tutorId: string, password: string }) => {
      const response = await apiRequest("POST", `/api/tutors/${tutorId}/verify-password`, {
        password,
      });
      return response.json();
    },
    onSuccess: (tutorData: TutorWithContent) => {
      setVerifiedTutor(tutorData);
      setShowPasswordDialog(false);
      setPassword("");
      // Create session after successful verification
      const numericTutorId = parseInt(tutorId!);
      if (!isNaN(numericTutorId)) {
        createSessionMutation.mutate(numericTutorId);
      }
    },
    onError: (error) => {
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect",
        variant: "destructive",
      });
    },
  });

  // Check if tutor requires password verification
  useEffect(() => {
    if (tutor && tutorId && !sessionToken && !createSessionMutation.isPending) {
      console.log("Processing tutor:", tutor);
      if (tutor.requiresPassword) {
        setShowPasswordDialog(true);
      } else {
        setVerifiedTutor(tutor);
        const numericTutorId = parseInt(tutorId);
        if (!isNaN(numericTutorId)) {
          console.log("Creating session for tutor ID:", numericTutorId);
          createSessionMutation.mutate(numericTutorId);
        } else {
          toast({
            title: "Invalid Tutor",
            description: "Invalid tutor ID provided",
            variant: "destructive",
          });
        }
      }
    }
  }, [tutor, tutorId, sessionToken, createSessionMutation.isPending]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() && tutorId) {
      verifyPasswordMutation.mutate({ tutorId, password });
    }
  };

  if (tutorLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-12 h-12 rounded-full mx-auto" />
          <Skeleton className="w-48 h-4" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
    );
  }

  if (tutorError || !tutor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2 items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">Tutor Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              The tutor you're looking for doesn't exist or is no longer available.
            </p>
            <Button 
              className="w-full mt-4" 
              onClick={() => window.location.href = "/"}
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verifiedTutor || !sessionToken) {
    return (
      <>
        {/* Loading state while creating session */}
        {!showPasswordDialog && (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">Initializing chat session...</p>
            </div>
          </div>
        )}

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Protected Tutor
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This tutor is password protected. Please enter the password to continue.
              </p>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={verifyPasswordMutation.isPending}
                />
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = "/"}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!password.trim() || verifyPasswordMutation.isPending}
                  >
                    {verifyPasswordMutation.isPending ? "Verifying..." : "Continue"}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Show loading while session is being created
  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Starting chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <ModernChatInterface 
      tutor={verifiedTutor} 
      sessionToken={sessionToken}
    />
  );
}
