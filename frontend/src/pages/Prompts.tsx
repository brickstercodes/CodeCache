import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Lightbulb } from "lucide-react";
import { UploadPasswordModal } from "@/components/UploadPasswordModal";

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
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchPrompts = async (query: string = "") => {
    try {
      const response = await fetch("http://localhost:4872/prompts/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prompts");
      }

      const data = await response.json();
      setPrompts(data);
    } catch (error) {
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
      window.location.href = "/prompts/upload";
    } else {
      setIsPasswordModalOpen(true);
    }
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
          <Link to="/prompts/upload">
            <Button variant="outline">Add the first prompt</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{prompt.title}</h2>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{prompt.model}</Badge>
                    <Badge variant="outline">{prompt.category}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 whitespace-pre-wrap font-mono">{prompt.description}</p>

              <div className="bg-muted p-4 rounded-md mb-4 font-mono text-sm whitespace-pre-wrap">
                {prompt.prompt_text}
              </div>

              {prompt.example_response && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Example Response:</h3>
                  <div className="bg-muted p-4 rounded-md text-sm">
                    {prompt.example_response}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.tags.map((tag, index) => (
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