import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { UploadPasswordModal } from "@/components/UploadPasswordModal";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4872';

interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
  model: string;
  category: string;
  example_response: string;
  tags: string[];
  publisher: string;
  ai_bio: string;
  updated_at: string;
}

const Prompts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);

  const fetchPrompts = async (query: string = "") => {
    try {
      const response = await fetch(`${API_URL}/prompts/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(response.status === 401 ? "Authentication required" : "Failed to fetch prompts");
      }

      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error fetching prompts",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddPrompt = () => {
    const uploadToken = sessionStorage.getItem("uploadToken");
    if (uploadToken) {
      navigate("/prompts/upload");
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const togglePromptExpansion = (promptId: string) => {
    setExpandedPromptId(expandedPromptId === promptId ? null : promptId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            Prompt Cache
          </h1>
          <p className="text-muted-foreground">
            Browse and search through effective AI prompts
          </p>
        </div>
        <Button onClick={handleAddPrompt}>
          <Plus className="h-4 w-4 mr-2" />
          Add Prompt
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search prompts by title, description, or content..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading prompts...</p>
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No prompts found</p>
          <Button onClick={handleAddPrompt} variant="outline">Add the first prompt</Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-semibold mb-2">{prompt.title}</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => togglePromptExpansion(prompt.id)}
                    >
                      {expandedPromptId === prompt.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{prompt.model}</Badge>
                    <Badge variant="outline">{prompt.category}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{prompt.description}</p>

              {expandedPromptId === prompt.id && (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Prompt Template:</h3>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                      {prompt.prompt_text}
                    </div>
                  </div>

                  {prompt.example_response && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Example Response:</h3>
                      <div className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
                        {prompt.example_response}
                      </div>
                    </div>
                  )}

                  {prompt.ai_bio && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">AI Description:</h3>
                      <p className="text-muted-foreground">{prompt.ai_bio}</p>
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.tags && prompt.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Published by {prompt.publisher}</span>
                <span>
                  {new Date(prompt.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        targetPath="/prompts/upload"
      />
    </div>
  );
};

export default Prompts; 