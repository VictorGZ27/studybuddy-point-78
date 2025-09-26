import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background pt-16">
      <div className="text-center">
        <div className="text-8xl font-bold text-gradient mb-4">404</div>
        <h1 className="mb-4 text-4xl font-bold text-foreground">Oops! Página não encontrada</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg" className="hero-gradient text-white">
            <a href="/">Voltar ao início</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/biblioteca">Ver biblioteca</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
