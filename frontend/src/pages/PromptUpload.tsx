import { useState, useEffect } from "react";
import { CheckCircle, Upload as UploadIcon, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const PromptUpload = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prompt_text: "",
    model: "",
    category: "",
    example_response: "",
    tags: "",
    publisher: ""
  });

  // Check for upload token
  useEffect(() => {
    const uploadToken = sessionStorage.getItem("uploadToken");
    if (!uploadToken) {
      window.location.href = "/prompts";
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert tags string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const uploadToken = sessionStorage.getItem("uploadToken");
      if (!uploadToken) {
        throw new Error("Upload token not found");
      }

      const response = await fetch('http://localhost:4872/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'uploadToken': uploadToken
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload prompt');
      }

      const data = await response.json();
      
      toast({
        title: "Prompt uploaded successfully",
        description: "Your prompt has been added to the library",
      });
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error uploading prompt",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      prompt_text: "",
      model: "",
      category: "",
      example_response: "",
      tags: "",
      publisher: ""
    });
    setSubmitted(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          Add to Prompt Cache
        </h1>
        <p className="text-muted-foreground">
          Share your effective prompts with the community
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-12 space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">Prompt Cached Successfully!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for contributing to the Prompt Cache. Your prompt will help others achieve better results.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={handleReset}>Add Another</Button>
            <Button variant="outline" onClick={() => window.location.href = "/prompts"}>
              Browse Prompts
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="E.g., Code Refactoring Assistant"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">Author</Label>
              <Input
                id="publisher"
                name="publisher"
                placeholder="Your name"
                value={formData.publisher}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => handleSelectChange("model", value)}
                required
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="claude-2">Claude 2</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code-generation">Code Generation</SelectItem>
                  <SelectItem value="code-review">Code Review</SelectItem>
                  <SelectItem value="debugging">Debugging</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="optimization">Optimization</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what this prompt is good for and how to use it effectively..."
              value={formData.description}
              onChange={handleChange}
              className="font-mono min-h-[150px] whitespace-pre-wrap"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt_text">Prompt Template</Label>
            <Textarea
              id="prompt_text"
              name="prompt_text"
              placeholder="Enter your prompt template. Use {placeholders} for variables if applicable..."
              value={formData.prompt_text}
              onChange={handleChange}
              className="font-mono min-h-[200px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="example_response">Example Response</Label>
            <Textarea
              id="example_response"
              name="example_response"
              placeholder="Provide an example of a good response from this prompt..."
              value={formData.example_response}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="E.g., python, refactoring, clean-code"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Caching...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Cache Prompt
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PromptUpload; 