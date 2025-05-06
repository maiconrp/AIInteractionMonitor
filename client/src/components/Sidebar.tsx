import { Link, useLocation } from "wouter";
import { MessageSquare, LayoutDashboard, Settings, Users, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/conversations", label: "Conversations", icon: MessageSquare },
    { href: "/reports", label: "Reports", icon: FileBarChart },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-48 border-r border-slate-800 bg-slate-900">
        <div className="flex items-center h-16 px-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Genkit Hub</span>
          </div>
        </div>
        <div className="flex flex-col flex-grow px-2 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
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
        <div className="px-2 py-2 border-t border-slate-800">
          <div className="flex items-center p-2 rounded-md hover:bg-slate-800 cursor-pointer">
            <img 
              className="h-8 w-8 rounded-full" 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="User profile"
            />
            <div className="ml-3">
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-slate-400">Support Lead</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
