import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Navbar } from "./Navbar";
import { UploadPasswordModal } from "./UploadPasswordModal";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Don't show the upload button on home page or upload pages
  const showUploadButton = !location.pathname.match(/^\/(|upload|prompts\/upload)$/);

  const handleUploadClick = () => {
    // If there's already a valid upload token, navigate directly
    const uploadToken = sessionStorage.getItem("uploadToken");
    if (uploadToken) {
      // Navigate to the appropriate upload page based on current path
      window.location.href = location.pathname.startsWith("/prompts") 
        ? "/prompts/upload" 
        : "/upload";
    } else {
      setIsPasswordModalOpen(true);
    }
  };

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
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-10 h-14 w-14 rounded-full shadow-lg"
          onClick={handleUploadClick}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Upload New Snippet</span>
        </Button>
      )}

      {/* Password Modal */}
      <UploadPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        targetPath={location.pathname.startsWith("/prompts") ? "/prompts/upload" : "/upload"}
      />
    </div>
  );
};

export default Layout;
