import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext({ isOpen: true, toggle: () => {} });

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, className = "" }) {
  return (
    <aside className={`flex flex-col w-64 bg-white border-r border-gray-200 ${className}`}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ children }) {
  return <div className="p-4 font-bold">{children}</div>;
}

export function SidebarContent({ children }) {
  return <div className="flex-1 overflow-y-auto">{children}</div>;
}

export function SidebarGroup({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function SidebarGroupLabel({ children }) {
  return <div className="px-4 text-sm text-muted-foreground">{children}</div>;
}

export function SidebarGroupContent({ children }) {
  return <div className="space-y-1">{children}</div>;
}

export function SidebarMenu({ children }) {
  return <nav className="space-y-1">{children}</nav>;
}

export function SidebarMenuItem({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children, onClick, className = "", asChild }) {
  // asChild means you pass a child like <Link> and want button styles applied
  if (asChild) {
    return <div className={`w-full text-left px-4 py-2 hover:bg-accent cursor-pointer ${className}`}>{children}</div>;
  }
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 hover:bg-accent ${className}`}
    >
      {children}
    </button>
  );
}

export function SidebarTrigger() {
  const { toggle } = useContext(SidebarContext);
  return (
    <button onClick={toggle} className="p-2 hover:bg-accent">
      Toggle
    </button>
  );
}
