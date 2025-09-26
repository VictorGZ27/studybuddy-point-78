import { Link, useLocation } from "react-router-dom";
import { BookOpen, Play, PenTool, MessageCircle, User, LogOut, Crown, Trophy, CreditCard } from "lucide-react";
import logoStudyPoint from "@/assets/logo-studypoint.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  { name: "Biblioteca", path: "/biblioteca", icon: BookOpen },
  { name: "Videoaulas", path: "/videoaulas", icon: Play },
  { name: "Exercícios", path: "/exercicios", icon: PenTool },
  { name: "Chat", path: "/chat", icon: MessageCircle },
  { name: "Ranking", path: "/ranking", icon: Trophy },
  { name: "Planos", path: "/planos", icon: CreditCard },
  { name: "Perfil", path: "/perfil", icon: User },
];

export function Navbar() {
  const location = useLocation();
  const { user, profile, signOut, isPremium } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-white rounded-xl shadow-card group-hover:shadow-float transition-all duration-300">
              <img src={logoStudyPoint} alt="StudyPoint" className="w-8 h-8" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gradient">StudyPoint</h1>
              <p className="text-sm text-muted-foreground -mt-1">Estudar ficou mais fácil</p>
            </div>
          </Link>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 px-4 py-2 ${
                      isActive ? "hero-gradient text-white shadow-card" : "hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            {profile && (
              <div className="hidden md:flex items-center space-x-3">
                {isPremium ? (
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
                    <Crown className="w-3 h-3 mr-1 fill-current" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    <Crown className="w-3 h-3 mr-1" />
                    {profile.pontos} pts
                  </Badge>
                )}
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.foto_url} alt={profile?.nome} />
                    <AvatarFallback className="hero-gradient text-white">
                      {profile?.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.nome || 'Usuário'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="w-full cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/planos" className="w-full cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isPremium ? 'Meu Plano Premium' : 'Assinar Premium'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="px-4 py-2">
          <div className="flex justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path} className="flex flex-col items-center py-2 px-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs mt-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}