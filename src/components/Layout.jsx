import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Brain, BookOpen, HelpCircle, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";

export default function Layout({ children }) {
  const location = useLocation();

  // Memoized menu items
  const mainTools = useMemo(
    () => [
      { title: "Visualizer", url: createPageUrl("Visualizer"), icon: Brain },
      { title: "Gallery", url: createPageUrl("Gallery"), icon: BookOpen },
    ],
    []
  );

  const learningTools = useMemo(
    () => [
      { title: "Tutorial", url: `${createPageUrl("Visualizer")}?tutorial=true`, icon: HelpCircle },
      { title: "Interactive Demo", url: `${createPageUrl("Visualizer")}?demo=true`, icon: Sparkles },
    ],
    []
  );

  // Helper to check if a menu is active
  const isActive = (url) => location.pathname === url;
  const hasQuery = (key) => new URLSearchParams(location.search).has(key);

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 220 38% 46%;
          --primary-foreground: 210 40% 98%;
          --secondary: 220 14.3% 95.9%;
          --secondary-foreground: 220.9 39.3% 11%;
          --accent: 220 14.3% 95.9%;
          --accent-foreground: 220.9 39.3% 11%;
          --muted: 220 14.3% 95.9%;
          --muted-foreground: 220 8.9% 46.1%;
        }

        .dfa-canvas {
          background:
            radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0),
            radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.05) 2px, transparent 0);
          background-size: 100px 100px;
        }

        .dfa-state {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dfa-state:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .simulation-active {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">DFA Visualizer</h2>
                <p className="text-xs text-slate-500">Interactive Automata Learning</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            {/* Main Tools */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Main Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainTools.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                          isActive(item.url) ? "bg-blue-50 text-blue-700 shadow-sm" : ""
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Learning Tools */}
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Learning Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {learningTools.map((item) => {
                    const key = item.url.split("?")[1]?.split("=")[0];
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 rounded-xl mb-1 ${
                            key && hasQuery(key) ? "bg-amber-50 text-amber-700 shadow-sm" : ""
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* About DFA */}
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                About DFA
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-slate-800 text-sm mb-2">What is a DFA?</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      A Deterministic Finite Automaton is a mathematical model that accepts or rejects
                      strings based on a set of states and transitions.
                    </p>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-xl transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">DFA Visualizer</h1>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
