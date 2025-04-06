import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchTemplates = async (query: string = "") => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4872/search', {
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

  // Initial load
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchTemplates(query);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Code Templates</h1>
        <Link to="/upload">
          <Button>Add Template</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search templates by title, description, or AI description..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1"
        />
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
    </div>
  );
};

export default Templates;
