import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, Upload, Link as LinkIcon, BookOpen, Video, FileText } from "lucide-react";
import { motion } from "framer-motion";

const quickTutorSchema = z.object({
  name: z.string().min(1, "Tutor name required").max(50, "Name too long"),
  subject: z.string().min(1, "Subject required"),
  content: z.string().optional(),
  youtubeUrl: z.string().optional(),
});

type QuickTutorData = z.infer<typeof quickTutorSchema>;

interface QuickTutorCreatorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function QuickTutorCreator({ onSuccess, onCancel }: QuickTutorCreatorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<QuickTutorData>({
    resolver: zodResolver(quickTutorSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      youtubeUrl: "",
    },
  });

  const templates = [
    { id: "general", name: "General Knowledge", icon: BookOpen, description: "Multi-subject AI tutor" },
    { id: "math", name: "Mathematics", icon: Zap, description: "Math problem solver" },
    { id: "science", name: "Science", icon: Sparkles, description: "Science concepts explained" },
    { id: "language", name: "Language Learning", icon: Video, description: "Language practice partner" },
    { id: "coding", name: "Programming", icon: FileText, description: "Code mentor & debugger" },
    { id: "custom", name: "Custom Subject", icon: Upload, description: "Your specific content" },
  ];

  const createTutorMutation = useMutation({
    mutationFn: async (data: QuickTutorData) => {
      // Create tutor
      const tutorResponse = await apiRequest("POST", "/api/tutors", {
        name: data.name,
        subject: data.subject,
        description: `AI tutor specializing in ${data.subject}`,
        isPublic: false,
      });
      const tutor = await tutorResponse.json();

      // Add content if provided
      if (data.content) {
        await apiRequest("POST", `/api/tutors/${tutor.id}/content`, {
          content: data.content,
          type: "text",
        });
      }

      if (data.youtubeUrl) {
        await apiRequest("POST", `/api/tutors/${tutor.id}/content`, {
          youtubeUrl: data.youtubeUrl,
        });
      }

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await apiRequest("POST", `/api/tutors/${tutor.id}/content`, formData);
      }

      return tutor;
    },
    onSuccess: () => {
      toast({
        title: "🎉 Tutor Created!",
        description: "Your AI tutor is ready to help students learn.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create tutor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setSelectedTemplate(template.id);
    form.setValue("subject", template.name);
    if (template.id !== "custom") {
      form.setValue("name", `${template.name} Tutor`);
      setCurrentStep(2); // Skip content upload for templates
    } else {
      setCurrentStep(1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!form.getValues("name")) {
        const fileName = selectedFile.name.split('.')[0];
        form.setValue("name", `${fileName} Tutor`);
      }
    }
  };

  const onSubmit = (data: QuickTutorData) => {
    createTutorMutation.mutate(data);
  };

  const steps = [
    "Choose Template",
    "Add Content",
    "Finalize"
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Quick Tutor Creator
        </CardTitle>
        <div className="flex justify-center gap-2 mt-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Template Selection */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-center mb-4">Choose a Template</h3>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <template.icon className="h-8 w-8 text-primary mb-2" />
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Content Upload (only for custom) */}
            {currentStep === 1 && selectedTemplate === "custom" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-center mb-4">Add Your Content</h3>
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Advanced Physics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Upload File</label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.docx"
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-sm text-muted-foreground">
                          {file ? file.name : "Choose PDF, TXT, or DOCX"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="youtubeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="https://youtube.com/watch?v=..." 
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Or Type Content Directly</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste your content here..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setCurrentStep(2)}>
                    Next
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Finalize */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-center mb-4">Finalize Your Tutor</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tutor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My Math Helper" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTemplate !== "custom" && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium">AI-Powered Template</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This tutor comes pre-trained with extensive knowledge in {form.getValues("subject")} and will provide expert guidance to students.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(selectedTemplate === "custom" ? 1 : 0)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTutorMutation.isPending}
                    className="flex-1"
                  >
                    {createTutorMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Tutor
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </Form>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}