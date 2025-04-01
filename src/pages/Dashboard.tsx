"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Key, Users, Clock, ArrowUpRight, Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import Cookies from 'js-cookie';
import withAuth from '@/utils/withAuth';
import { fetchApi, getBackendURL } from '@/utils/config';
import { setAccessToken } from '@/utils/authUtils';
import { safeFetch } from '@/utils/errorHandling';
import { placeholderStats, placeholderActivities } from '@/mocks/placeholderData';

const Dashboard = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("There was an issue connecting to the API. Some data may not be current.");
  const [stats, setStats] = useState(placeholderStats);
  const [activities, setActivities] = useState(placeholderActivities);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('Attempting to fetch GitHub profile data');
        // Add credentials explicitly to ensure cookies are sent
        const response = await fetch(`${getBackendURL()}/github/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('GitHub profile response status:', response.status);
        
        if (!response.ok) {
          console.error(`GitHub profile HTTP error! status: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('GitHub profile data received:', Object.keys(data));

        // Check for only refresh_token content response
        if (data.refresh_token && !data.access_token && !data.user) {
          console.log('Only refresh token received, not updating other data');
          // We do nothing as refresh_token is still valid
          return;
        }
        
        // Set access_token in localStorage
        if (data.access_token) {
          console.log('Setting access token in localStorage');
          setAccessToken(data.access_token);

          // Set userinfo cookie
          if (data.user) {
            console.log('Setting user info in cookie');
            const encodedUserInfo = encodeURIComponent(JSON.stringify(data.user));
            Cookies.set('userinfo', encodedUserInfo, {
              expires: 7,
              path: '/',
              sameSite: 'Lax',
              secure: window.location.protocol === 'https:',
            });
          }

          // Fetch dashboard stats
          console.log('Fetching dashboard stats');
          const statsResult = await safeFetch(
            fetchApi('api/dashboard/stats', { method: 'GET' }, data.access_token),
            placeholderStats
          );
          
          if (statsResult.data) {
            setStats(statsResult.data);
          }

          // Fetch recent activities 
          console.log('Fetching dashboard activities');
          const activitiesResult = await safeFetch(
            fetchApi('api/dashboard/activities', { method: 'GET' }, data.access_token),
            placeholderActivities
          );
          
          if (activitiesResult.data) {
            setActivities(activitiesResult.data);
          }
        } else {
          console.warn('No access token received from GitHub profile endpoint');
          setErrorMessage("Authentication incomplete. Please try logging in again.");
          setHasError(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage("Error connecting to authentication service. Using placeholder data.");
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    // Check if refresh_token and access_token are already present
    const refreshToken = Cookies.get('refresh_token');
    const accessToken = localStorage.getItem('access_token');
    
    console.log('Refresh token exists:', !!refreshToken);
    console.log('Access token exists:', !!accessToken);
    
    // Always call fetchData to ensure we have the latest tokens
    // This is crucial for cross-domain scenarios
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto p-6">
          <div className="container pb-8">
            {hasError && (
              <ErrorBanner 
                message={errorMessage}
                onDismiss={() => setHasError(false)}
              />
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
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
                            {stat.icon === 'Server' && <Server className="h-5 w-5 text-primary" />}
                            {stat.icon === 'Key' && <Key className="h-5 w-5 text-primary" />}
                            {stat.icon === 'Users' && <Users className="h-5 w-5 text-primary" />}
                            {stat.icon === 'Clock' && <Clock className="h-5 w-5 text-primary" />}
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
                        {activities.map((activity, i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {activity.icon === 'Server' && <Server className="h-4 w-4 text-primary" />}
                              {activity.icon === 'Key' && <Key className="h-4 w-4 text-primary" />}
                              {activity.icon === 'Activity' && <Activity className="h-4 w-4 text-primary" />}
                              {activity.icon === 'Users' && <Users className="h-4 w-4 text-primary" />}
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
              </>
            )}
          </div>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default withAuth(Dashboard);
