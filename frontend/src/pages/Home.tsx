import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Code, MessageSquare, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadPasswordModal } from "@/components/UploadPasswordModal";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/templates?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleUploadClick = () => {
    const uploadToken = sessionStorage.getItem("uploadToken");
    if (uploadToken) {
      window.location.href = "/upload";
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="bg-primary/10 rounded-full p-6 w-24 h-24 flex items-center justify-center">
            <Code className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Code <span className="text-primary">Cache</span>
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern cache of code snippets for developers. Find solutions, share your code, and collaborate with the community.
        </p>
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <Input 
            placeholder="Search for snippets..." 
            className="flex-1" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </section>

      {/* Features */}
      <section>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-card hover:bg-primary border rounded-xl p-8 text-center transition-all duration-300 hover:shadow-lg">
            <div className="bg-primary/10 group-hover:bg-white/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-colors">
              <Code className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 group-hover:text-white transition-colors">Browse Snippets</h3>
            <p className="text-muted-foreground mb-6 group-hover:text-white/70 transition-colors">Explore a vast cache of code snippets across multiple languages and frameworks.</p>
            <Link to="/templates" className="block">
              <Button variant="outline" className="w-full group-hover:border-white group-hover:text-white transition-colors">
                Browse Library
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="group bg-card hover:bg-primary border rounded-xl p-8 text-center transition-all duration-300 hover:shadow-lg">
            <div className="bg-primary/10 group-hover:bg-white/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-colors">
              <MessageSquare className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 group-hover:text-white transition-colors">AI Assistant</h3>
            <p className="text-muted-foreground mb-6 group-hover:text-white/70 transition-colors">Chat with our AI to find the perfect code snippets for your project needs.</p>
            <Link to="/chat" className="block">
              <Button variant="outline" className="w-full group-hover:border-white group-hover:text-white transition-colors">
                Start Chatting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="group bg-card hover:bg-primary border rounded-xl p-8 text-center transition-all duration-300 hover:shadow-lg">
            <div className="bg-primary/10 group-hover:bg-white/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-colors">
              <Upload className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 group-hover:text-white transition-colors">Share Your Code</h3>
            <p className="text-muted-foreground mb-6 group-hover:text-white/70 transition-colors">Contribute to the community by uploading your own code snippets.</p>
            <Button onClick={handleUploadClick}>Upload Now</Button>
          </div>
        </div>
      </section>

      {/* Add UploadPasswordModal */}
      <UploadPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        targetPath="/upload"
      />
    </div>
  );
};

export default Home;
