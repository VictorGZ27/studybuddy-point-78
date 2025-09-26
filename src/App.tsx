import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Biblioteca from "./pages/Biblioteca";
import Videoaulas from "./pages/Videoaulas";
import Exercicios from "./pages/Exercicios";
import Chat from "./pages/Chat";
import Perfil from "./pages/Perfil";
import Ranking from "./pages/Ranking";
import Planos from "./pages/Planos";
import ResumoDetalhes from "./pages/ResumoDetalhes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/videoaulas" element={<Videoaulas />} />
              <Route path="/exercicios" element={<Exercicios />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/resumo/:id" element={<ResumoDetalhes />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
