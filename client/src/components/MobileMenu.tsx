import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { MessageSquare, LayoutDashboard, Settings, Users, FileBarChart, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  // Close the menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".mobile-menu-content") && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Close the menu when navigating
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location]);

  if (!isOpen) return null;

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/conversations", label: "Conversations", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/team", label: "Team", icon: Users },
    { href: "/reports", label: "Reports", icon: FileBarChart },
  ];

  return (
    <div className="lg:hidden fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/75"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="mobile-menu-content flex h-full flex-col overflow-y-scroll bg-slate-900 py-6 shadow-xl">
              <div className="px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-medium">Genkit Hub</h2>
                  </div>
                  <button 
                    onClick={onClose}
                    className="rounded-md text-slate-400 hover:text-white"
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="relative mt-6 flex-1 px-4 sm:px-6">
                <nav className="flex flex-col">
                  {navItems.map((item) => {
                    const isActive = location === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className={cn(
                          "flex items-center px-2 py-3 text-base font-medium rounded-md",
                          isActive 
                            ? "text-white bg-slate-800" 
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
