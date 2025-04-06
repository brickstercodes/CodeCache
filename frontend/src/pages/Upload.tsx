import { useState, useEffect } from "react";
import { CheckCircle, Upload as UploadIcon, Code2 } from "lucide-react";
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
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

const Upload = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
    code_snippet: "",
    tags: "",
    publisher: ""
  });
  const [showPreview, setShowPreview] = useState(false);

  // Check for upload token
  useEffect(() => {
    const uploadToken = sessionStorage.getItem("uploadToken");
    if (!uploadToken) {
      window.location.href = "/templates";
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, language: value }));
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

      const response = await fetch('http://localhost:4872/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'uploadToken': uploadToken
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          code_snippet: formData.code_snippet,
          language: formData.language,
          publisher: formData.publisher,
          tags: tagsArray
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload snippet');
      }

      const data = await response.json();
      
      toast({
        title: "Snippet uploaded successfully",
        description: "Your code snippet has been added to the library",
      });
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error uploading snippet",
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
      language: "",
      code_snippet: "",
      tags: "",
      publisher: ""
    });
    setSubmitted(false);
    setShowPreview(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Code2 className="h-8 w-8 text-primary" />
          Add to the Cache
        </h1>
        <p className="text-muted-foreground">
          Contribute to the library by uploading your own code snippets
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-12 space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">Snippet Cached Successfully!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for contributing to Code Cache. Your snippet will be reviewed and made available soon.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={handleReset}>Upload Another</Button>
            <Button variant="outline" onClick={() => window.location.href = "/templates"}>
              Browse Templates
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
                placeholder="E.g., React useState Hook Example"
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
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="php">PHP</SelectItem>
                  <SelectItem value="ruby">Ruby</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
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
              placeholder="Provide a brief description of your code snippet..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="code_snippet">Code</Label>
              {formData.code_snippet && formData.language && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Edit Code" : "Preview Code"}
                </Button>
              )}
            </div>
            
            {showPreview && formData.code_snippet && formData.language ? (
              <div className="h-60 overflow-auto">
                <SyntaxHighlighter 
                  language={formData.language.toLowerCase()}
                  style={oneDark}
                  customStyle={{ borderRadius: '0.5rem' }}
                >
                  {formData.code_snippet}
                </SyntaxHighlighter>
              </div>
            ) : (
              <Textarea
                id="code_snippet"
                name="code_snippet"
                placeholder="Paste your code here..."
                className="font-mono h-60"
                value={formData.code_snippet}
                onChange={handleChange}
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="E.g., react, hooks, state-management"
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
                  Cache Snippet
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Upload;
