import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL;

interface UploadPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPath: string;
}

export function UploadPasswordModal({
  isOpen,
  onClose,
  targetPath,
}: UploadPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting to verify password with API:', API_URL);
      const response = await fetch(`${API_URL}/verify-upload-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      console.log('Server response:', response.status, data);

      if (response.ok && data.success && data.token) {
        // Store the token in sessionStorage
        sessionStorage.setItem("uploadToken", data.token);
        toast({
          title: "Access granted",
          description: "You can now upload content",
        });
        setPassword(""); // Clear password field
        onClose();
        navigate(targetPath);
      } else {
        throw new Error(data.error || "Invalid password");
      }
    } catch (error) {
      console.error('Password verification error:', error);
      // Only clear token if there's an authentication error
      if (error instanceof Error && error.message.includes("Invalid password")) {
        sessionStorage.removeItem("uploadToken");
      }
      toast({
        title: "Authentication Failed",
        description: error instanceof Error 
          ? error.message 
          : "Could not verify password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Upload Authentication
          </DialogTitle>
          <DialogDescription>
            Please enter the upload password to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !password.trim()}>
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 