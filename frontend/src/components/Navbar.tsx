import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { Home, Code2, MessageSquareText, MessagesSquare } from "lucide-react";

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center space-x-6">
        <Link
          to="/"
          className={cn(
            "transition-colors hover:text-foreground/80",
            isActive("/") ? "text-foreground" : "text-foreground/60"
          )}
        >
          <span className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </span>
        </Link>

        <Link
          to="/templates"
          className={cn(
            "transition-colors hover:text-foreground/80",
            isActive("/templates") ? "text-foreground" : "text-foreground/60"
          )}
        >
          <span className="flex items-center space-x-2">
            <Code2 className="h-5 w-5" />
            <span>Templates</span>
          </span>
        </Link>

        <Link
          to="/prompts"
          className={cn(
            "transition-colors hover:text-foreground/80",
            isActive("/prompts") ? "text-foreground" : "text-foreground/60"
          )}
        >
          <span className="flex items-center space-x-2">
            <MessagesSquare className="h-5 w-5" />
            <span>Prompt Cache</span>
          </span>
        </Link>

        <Link
          to="/chat"
          className={cn(
            "transition-colors hover:text-foreground/80",
            isActive("/chat") ? "text-foreground" : "text-foreground/60"
          )}
        >
          <span className="flex items-center space-x-2">
            <MessageSquareText className="h-5 w-5" />
            <span>AI Chat</span>
          </span>
        </Link>

        <div className="ml-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
} 