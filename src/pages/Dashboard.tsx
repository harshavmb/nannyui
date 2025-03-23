"use client";

import React, {useState, useEffect} from 'react';
import { motion } from 'framer-motion';
import { Server, Key, Users, Clock, ArrowUpRight, Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const stats = [
    { title: 'Total Agents', value: '24', icon: Server, change: '+12%' },
    { title: 'Active Tokens', value: '18', icon: Key, change: '+5%' },
    { title: 'Total Users', value: '7', icon: Users, change: '+0%' },
    { title: 'Uptime', value: '99.9%', icon: Clock, change: '+0.2%' },
  ];

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
         const response = await fetch('http://localhost:8080/github/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'http://localhost:8081',},
            credentials: 'include',
         });
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
         const data = await response.json();

         // Set the userinfo state
         const encodedUserInfo = encodeURIComponent(JSON.stringify(data));
         Cookies.set('userinfo', encodedUserInfo, {
          expires: 7, // Expires in 7 days
          path: '/',
          HttpOnly: false,
          SameSite: 'None',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const userInfoCookie = Cookies.get('userinfo');
    if (!userInfoCookie) {
      fetchData()
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto p-6">
          <div className="container pb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back! Here's an overview of your API services.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <GlassMorphicCard className="h-full">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="mt-4 inline-flex items-center text-xs font-medium text-muted-foreground">
                      <span className={`mr-1 text-green-500`}>{stat.change}</span>
                      <span>from last month</span>
                    </div>
                  </GlassMorphicCard>
                </motion.div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <GlassMorphicCard className="h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium">API Usage</h3>
                    <div className="flex space-x-1 text-sm">
                      <button className="px-2 py-1 rounded bg-primary/10 text-primary">Daily</button>
                      <button className="px-2 py-1 rounded hover:bg-muted/50">Weekly</button>
                      <button className="px-2 py-1 rounded hover:bg-muted/50">Monthly</button>
                    </div>
                  </div>
                  
                  <div className="relative h-64 mt-4">
                    <div className="absolute inset-0 flex items-end justify-between px-2">
                      {[...Array(14)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-4 bg-primary/80 rounded-t"
                          style={{ 
                            height: `${20 + Math.random() * 70}%`,
                            opacity: 0.7 + Math.random() * 0.3
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-border/50" />
                  </div>
                </GlassMorphicCard>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <GlassMorphicCard className="h-full">
                  <h3 className="font-medium mb-6">Recent Activities</h3>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'New agent connected', time: '2 mins ago', icon: Server },
                      { title: 'API key generated', time: '1 hour ago', icon: Key },
                      { title: 'System update completed', time: '3 hours ago', icon: Activity },
                      { title: 'New user registered', time: '1 day ago', icon: Users },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <activity.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-4 text-sm text-primary hover:text-primary/80 flex items-center">
                    View all activities <ArrowUpRight className="ml-1 h-3 w-3" />
                  </button>
                </GlassMorphicCard>
              </motion.div>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Dashboard;
