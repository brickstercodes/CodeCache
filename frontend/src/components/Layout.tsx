import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Don't show the upload button on home page or upload page
  const showUploadButton = location.pathname !== "/" && location.pathname !== "/upload";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
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
    </div>
  );
};

export default Layout;
