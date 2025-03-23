
"use client";

import React, { useState, useEffect } from 'react';
import { Bell, User, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

const Navbar: React.FC = () => {
  const [userName, setUserName] = useState('Nanny User');

  useEffect(() => {
    const userInfoCookie = Cookies.get('userinfo');

    if (userInfoCookie) {
      try {
        const decodedUserInfo = decodeURIComponent(userInfoCookie);
        const userInfo = JSON.parse(decodedUserInfo);
        setUserName(userInfo.name || 'Nanny User'); // Use a default value if name is not available
      } catch (error) {
        console.error("Error parsing userinfo cookie:", error);
      }
    }
  }, []);
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/40"
    >
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-muted/80 transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
