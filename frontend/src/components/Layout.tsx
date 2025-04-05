
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Code, Home, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/templates", label: "Templates", icon: Code },
    { path: "/chat", label: "AI Chat", icon: MessageSquare },
  ];

  // Don't show the upload button on home page or upload page
  const showUploadButton = location.pathname !== "/" && location.pathname !== "/upload";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          {/* Centered navigation */}
          <div className="flex justify-center items-center space-x-12">
            <Link to="/" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            
            <Link to="/templates" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <Code className="h-5 w-5" />
              <span>Templates</span>
            </Link>
            
            {/* Center logo */}
            <Link to="/" className="flex items-center">
              <div className="rounded-full bg-gradient-to-br from-primary to-primary/70 p-2 flex items-center justify-center shadow-md">
                <Code className="h-6 w-6 text-black" />
              </div>
            </Link>
            
            <Link to="/chat" className="flex items-center space-x-1 hover:text-primary transition-colors">
              <MessageSquare className="h-5 w-5" />
              <span>AI Chat</span>
            </Link>
            
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-card border-t py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Code Cache - A Modern Code Snippet Library</p>
        </div>
      </footer>
      
      {/* Floating Upload Button */}
      {showUploadButton && (
        <Link to="/upload" className="fixed bottom-6 right-6 z-10">
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Upload New Snippet</span>
          </Button>
        </Link>
      )}
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-10">
        <div className="grid grid-cols-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-3 px-2 hover:text-primary transition-colors",
                location.pathname === item.path && "text-primary font-medium"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;
