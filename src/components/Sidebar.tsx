
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronsLeft, 
  ChevronsRight, 
  Home, 
  User, 
  Key, 
  Server, 
  BookOpen,
  Mail,
  Github,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  active: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, label, collapsed, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center py-3 px-4 rounded-lg transition-all duration-200",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <span className="ml-3 whitespace-nowrap overflow-hidden transition-all duration-200">
          {label}
        </span>
      )}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const links = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/account', icon: User, label: 'Account' },
    { to: '/tokens', icon: Key, label: 'Auth Tokens' },
    { to: '/agents', icon: Server, label: 'Agents' },
    { to: '/documentation', icon: BookOpen, label: 'Documentation' },
    { to: '/contact', icon: Mail, label: 'Contact' },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Server className="h-6 w-6 text-sidebar-primary" />
            <span className="font-bold text-sidebar-foreground">NANNYAI</span>
          </div>
        )}
        {collapsed && <Server className="h-6 w-6 text-sidebar-primary mx-auto" />}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto no-scrollbar">
        <nav className="px-2 space-y-1">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              collapsed={collapsed}
              active={location.pathname === link.to}
            />
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <a 
          href="https://github.com/harshavmb/nannyapi" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={cn(
            "flex items-center py-3 px-4 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground transition-all duration-200"
          )}
        >
          <Github className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">GitHub Repos</span>}
        </a>
        
        <button 
          className={cn(
            "flex items-center py-3 px-4 rounded-lg w-full text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground transition-all duration-200"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
