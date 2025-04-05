import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useEffect, useState } from "react";

interface Snippet {
  id: string;
  title: string;
  description: string;
  code_snippet: string;
  language: string;
  publisher: string;
  tags: string[];
  updated_at: string;
  ai_bio?: string;
}

const SnippetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`http://localhost:4872/templates/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch snippet');
        }
        const data = await response.json();
        setSnippet(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch snippet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);
  
  const copyToClipboard = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code_snippet);
      toast({
        title: "Copied to clipboard",
        description: "The code snippet has been copied to your clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading snippet...</p>
      </div>
    );
  }
  
  if (error || !snippet) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Snippet Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error || "The snippet you're looking for doesn't exist or has been removed."}
        </p>
        <Link to="/templates">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex-1">{snippet.title}</h1>
        <span className={`language-${snippet.language.toLowerCase()} language-badge`}>
          {snippet.language}
        </span>
      </div>
      
      <p className="text-muted-foreground">{snippet.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {snippet.tags.map((tag) => (
          <span
            key={tag}
            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="relative">
        <SyntaxHighlighter 
          language={snippet.language.toLowerCase()}
          style={oneDark}
          customStyle={{ borderRadius: '0.5rem', padding: '1rem' }}
        >
          {snippet.code_snippet}
        </SyntaxHighlighter>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2"
          onClick={copyToClipboard}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      
      {snippet.ai_bio && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h3 className="font-medium mb-2">AI Description</h3>
          <p className="text-sm">{snippet.ai_bio}</p>
        </div>
      )}
      
      <div className="border-t pt-4 flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Published by <span className="font-medium">{snippet.publisher}</span>
        </div>
        <div>
          Last updated: {new Date(snippet.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;
