
import { Link } from "react-router-dom";
import { ArrowRight, Code, MessageSquare, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockSnippets } from "@/data/mockData";

const Home = () => {
  const featuredSnippets = mockSnippets.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Code <span className="text-primary">Cache</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern cache of code snippets for developers. Find solutions, share your code, and collaborate with the community.
        </p>
        <div className="max-w-md mx-auto flex gap-2">
          <Input placeholder="Search for snippets..." className="flex-1" />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Browse Snippets</h3>
            <p className="text-muted-foreground mb-4">Explore a vast cache of code snippets across multiple languages and frameworks.</p>
            <Link to="/templates">
              <Button variant="outline" className="w-full">
                Browse Library
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
            <p className="text-muted-foreground mb-4">Chat with our AI to find the perfect code snippets for your project needs.</p>
            <Link to="/chat">
              <Button variant="outline" className="w-full">
                Start Chatting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share Your Code</h3>
            <p className="text-muted-foreground mb-4">Contribute to the community by uploading your own code snippets.</p>
            <Link to="/upload">
              <Button variant="outline" className="w-full">
                Upload Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Snippets */}
      <section className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Snippets</h2>
          <Link to="/templates" className="text-primary flex items-center hover:underline">
            View all snippets
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {featuredSnippets.map((snippet) => (
            <Link key={snippet.id} to={`/templates/${snippet.id}`} className="snippet-card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium truncate">{snippet.title}</h3>
                <span className={`language-${snippet.language.toLowerCase()} language-badge`}>
                  {snippet.language}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {snippet.description}
              </p>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>By {snippet.publisher}</span>
                <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
