import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Edit, 
  Trash2, 
  Share2, 
  Eye, 
  Users,
  MessageCircle,
  MoreHorizontal
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Tutor } from "@shared/schema";

interface TutorCardProps {
  tutor: Tutor;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function TutorCard({ tutor, onDelete, isDeleting }: TutorCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleViewChat = () => {
    window.open(`/chat/${tutor.id}`, '_blank');
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/chat/${tutor.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "The tutor link has been copied to your clipboard.",
    });
  };

  // Tutor editing is disabled once created

  const handleDelete = () => {
    onDelete(tutor.id);
    setDeleteDialogOpen(false);
  };

  const getSubjectIcon = (subject: string) => {
    // You could map different subjects to different icons
    return Bot;
  };

  const SubjectIcon = getSubjectIcon(tutor.subject);

  return (
    <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <SubjectIcon className="text-white h-6 w-6" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{tutor.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {tutor.description || `AI tutor for ${tutor.subject}`}
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{tutor.subject}</Badge>
            {tutor.isPublic ? (
              <Badge variant="outline">Public</Badge>
            ) : (
              <Badge variant="destructive">Private</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span>0 students</span>
          </div>
          <div className="flex items-center">
            <MessageCircle className="mr-1 h-4 w-4" />
            <span>0 messages</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1" 
            onClick={handleViewChat}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Chat
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tutor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{tutor.name}"? This action cannot be undone.
              All associated content and chat history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
