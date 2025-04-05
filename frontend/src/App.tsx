
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Templates from "@/pages/Templates";
import SnippetDetail from "@/pages/SnippetDetail";
import Chat from "@/pages/Chat";
import Upload from "@/pages/Upload";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Set document title
  document.title = "Code Cache | Modern Code Snippet Library";
  
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/templates/:id" element={<SnippetDetail />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
