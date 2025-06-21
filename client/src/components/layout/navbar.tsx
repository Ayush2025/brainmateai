import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Menu, Moon, Sun, HelpCircle, Home, BarChart3, Settings, Users, MessageSquare, Plus } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";

interface NavbarProps {
  onTutorialOpen?: () => void;
}

export function Navbar({ onTutorialOpen }: NavbarProps = {}) {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const typedUser = user as any;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isDashboard = location === "/" && isAuthenticated;

  const dashboardNavItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Plus, label: "Create Tutor", href: "/create" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Brain className="text-white text-base sm:text-lg" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-foreground">BrainMate AI</span>
              </div>
            </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
            {onTutorialOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onTutorialOpen}
                className="hover:bg-muted"
                title="Take a tour"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-muted"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!isLoading && !isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleLogin}
                  className="hidden md:block"
                >
                  Sign In
                </Button>
                <Button onClick={handleLogin} size="sm" className="text-sm sm:text-base px-3 sm:px-4">
                  Get Started
                </Button>
              </>
            )}
            
            {isAuthenticated && typedUser && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xs sm:text-sm text-muted-foreground hidden md:block">
                  {typedUser?.firstName} {typedUser?.lastName}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="hidden md:block text-sm"
                >
                  Sign Out
                </Button>
              </div>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    BrainMate AI
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-6 mt-6">
                  {/* User Info */}
                  {isAuthenticated && typedUser && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-sm font-medium">{typedUser?.firstName} {typedUser?.lastName}</div>
                      <div className="text-xs text-muted-foreground">{typedUser?.email}</div>
                    </div>
                  )}

                  {/* Dashboard Navigation */}
                  {isDashboard && isAuthenticated && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Dashboard</h4>
                        <div className="space-y-1">
                          {dashboardNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location === item.href;
                            return (
                              <Link key={item.href} href={item.href}>
                                <Button
                                  variant={isActive ? "secondary" : "ghost"}
                                  className="w-full justify-start"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <Icon className="h-4 w-4 mr-3" />
                                  {item.label}
                                </Button>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Landing Page Navigation */}
                  {!isDashboard && (
                    <>
                      <div className="space-y-2">
                        <a
                          href="#features"
                          className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Features
                        </a>
                        <a
                          href="#pricing"
                          className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Pricing
                        </a>
                        <a
                          href="/contact"
                          className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Contact
                        </a>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Theme Toggle & Tutorial */}
                  <div className="space-y-2">
                    {onTutorialOpen && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onTutorialOpen();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <HelpCircle className="h-4 w-4 mr-3" />
                        Take a Tour
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      onClick={toggleTheme}
                      className="w-full justify-start"
                    >
                      {theme === "light" ? (
                        <>
                          <Moon className="h-4 w-4 mr-3" />
                          Dark Mode
                        </>
                      ) : (
                        <>
                          <Sun className="h-4 w-4 mr-3" />
                          Light Mode
                        </>
                      )}
                    </Button>
                  </div>

                  <Separator />
                  
                  {/* Authentication */}
                  {!isLoading && !isAuthenticated && (
                    <div className="space-y-2">
                      <Button onClick={handleLogin} className="w-full">
                        Sign In
                      </Button>
                      <Button onClick={handleLogin} variant="outline" className="w-full">
                        Get Started
                      </Button>
                    </div>
                  )}
                  
                  {isAuthenticated && (
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                      Sign Out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation for Dashboard */}
      {isDashboard && isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-40 md:hidden">
          <div className="grid grid-cols-4 gap-1 p-2">
            {dashboardNavItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col h-auto py-2 px-1 text-xs"
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
