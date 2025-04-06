import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadPasswordModal } from "@/components/UploadPasswordModal";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4872';

interface Template {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  publisher: string;
  updated_at: string;
}

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const { toast } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchTemplates = async (query: string = "") => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      toast({
        title: "Error loading templates",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load - use search param if present
  useEffect(() => {
    const searchQuery = searchParams.get("search") || "";
    setSearchQuery(searchQuery);
    fetchTemplates(searchQuery);
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchParams(query ? { search: query } : {});
    fetchTemplates(query);
  };

  const handleAddTemplate = () => {
    const uploadToken = sessionStorage.getItem("uploadToken");
    if (uploadToken) {
      window.location.href = "/upload";
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            Code Templates
          </h1>
          <p className="text-muted-foreground">
            Browse and search through code snippets
          </p>
        </div>
        <Button onClick={handleAddTemplate}>Add Template</Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates by title, description, or AI description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading templates...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Link
                key={template.id}
                to={`/templates/${template.id}`}
                className="block p-6 rounded-lg border bg-card hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-semibold text-lg line-clamp-2">{template.title}</h2>
                  <span className={`language-${template.language.toLowerCase()} language-badge`}>
                    {template.language}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  By {template.publisher} • {new Date(template.updated_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}
        </>
      )}

      <UploadPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        targetPath="/upload"
      />
    </div>
  );
};

export default Templates;
