import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudUpload, FileText, Link } from "lucide-react";

const tutorFormSchema = z.object({
  name: z.string().min(1, "Tutor name is required").max(100, "Name too long"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().max(500, "Description too long").optional(),
  isPublic: z.boolean().default(false),
  password: z.string().optional(),
});

type TutorFormData = z.infer<typeof tutorFormSchema>;

interface CreateTutorFormProps {
  onSuccess: () => void;
}

export function CreateTutorForm({ onSuccess }: CreateTutorFormProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileList | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Fetch subscription limits
  const { data: limits } = useQuery<{
    tutorLimits: { canCreate: boolean; currentCount: number; limit: number };
    plans: { free: { tutors: number; contentPerTutor: number }; pro: { tutors: number; contentPerTutor: number }; premium: { tutors: number; contentPerTutor: number } };
  }>({
    queryKey: ["/api/subscription/limits"],
  });

  const form = useForm<TutorFormData>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: {
      name: "",
      subject: "",
      description: "",
      isPublic: false,
      password: "",
    },
  });

  const createTutorMutation = useMutation({
    mutationFn: async (data: TutorFormData) => {
      const response = await apiRequest("POST", "/api/tutors", data);
      return response.json();
    },
    onSuccess: async (tutor) => {
      // Upload content if provided
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append("file", file);
          
          try {
            await apiRequest("POST", `/api/tutors/${tutor.id}/content`, formData);
          } catch (error) {
            console.error("Error uploading file:", error);
            toast({
              title: "Warning",
              description: `Failed to upload ${file.name}. You can upload it later.`,
              variant: "destructive",
            });
          }
        }
      }
      
      if (youtubeUrl) {
        try {
          await apiRequest("POST", `/api/tutors/${tutor.id}/content`, {
            youtubeUrl,
          });
        } catch (error) {
          console.error("Error processing YouTube URL:", error);
          toast({
            title: "Warning",
            description: "Failed to process YouTube URL. You can add it later.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: "AI tutor created successfully!",
      });
      onSuccess();
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
        description: "Failed to create tutor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TutorFormData) => {
    // Check if user has reached tutor limit
    if (limits && !limits.tutorLimits.canCreate) {
      toast({
        title: "Tutor Limit Reached",
        description: `You can only create ${limits.tutorLimits.limit} tutors on your current plan. Upgrade to create more tutors.`,
        variant: "destructive",
      });
      return;
    }
    
    createTutorMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tutor Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Advanced Calculus Tutor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of what this tutor will teach..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This description will be shown to students
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Public Access</FormLabel>
                  <FormDescription>
                    Allow anyone to access this tutor
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {!form.watch("isPublic") && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Set a password for private access"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for no password protection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Content Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Content</CardTitle>
            <p className="text-sm text-muted-foreground">Upload files or add a YouTube video to train your tutor</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium">Upload Files</label>
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <CloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOCX, PPTX, TXT files supported
                  </p>
                </div>
                {files && files.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-300 mt-1 space-y-1">
                      {Array.from(files).slice(0, 3).map((file, index) => (
                        <div key={index}>• {file.name}</div>
                      ))}
                      {files.length > 3 && (
                        <div>... and {files.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* YouTube URL */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Link className="w-4 h-4 text-red-600" />
                <label className="text-sm font-medium">YouTube Video (Optional)</label>
              </div>
              <Input
                placeholder="Paste YouTube URL here..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full"
              />
              {youtubeUrl && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ Video transcript will be extracted for training
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {limits && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Subscription Limits</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Tutors: {limits.tutorLimits.currentCount} / {limits.tutorLimits.limit === -1 ? 'Unlimited' : limits.tutorLimits.limit}</div>
              <div>Content per tutor: {limits.plans.free.contentPerTutor} files (Free Plan)</div>
              {!limits.tutorLimits.canCreate && (
                <div className="text-destructive font-medium mt-2">
                  Tutor limit reached. Upgrade your plan to create more tutors.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={createTutorMutation.isPending || (limits && !limits.tutorLimits.canCreate)}
          >
            {createTutorMutation.isPending ? "Creating..." : 
             (limits && !limits.tutorLimits.canCreate) ? "Upgrade Plan to Create" : "Create AI Tutor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
