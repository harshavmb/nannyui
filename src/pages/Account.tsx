
import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Github, Calendar, Edit } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';

const Account = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto p-6">
          <div className="container pb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Account</h1>
              <p className="text-muted-foreground mt-2">
                Manage your profile and account settings.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <GlassMorphicCard className="text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  
                  <h2 className="mt-4 text-xl font-semibold">User Name</h2>
                  <p className="text-muted-foreground">Administrator</p>
                  
                  <div className="mt-6 py-4 border-t border-b border-border/40">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <Github className="h-4 w-4" />
                      <span>github-username</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </GlassMorphicCard>
                
                <GlassMorphicCard className="mt-6">
                  <h3 className="font-medium mb-4">Account Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm">user@example.com</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm">Joined April 2023</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm">Admin access</span>
                    </div>
                  </div>
                </GlassMorphicCard>
              </div>
              
              <div className="lg:col-span-2">
                <GlassMorphicCard>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-medium">Profile Details</h3>
                    <button className="p-2 rounded-full hover:bg-muted/80 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="User Name"
                        className="w-full px-3 py-2 rounded-md border border-border bg-background/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue="user@example.com"
                        className="w-full px-3 py-2 rounded-md border border-border bg-background/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        GitHub Username
                      </label>
                      <input
                        type="text"
                        defaultValue="github-username"
                        className="w-full px-3 py-2 rounded-md border border-border bg-background/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Role
                      </label>
                      <select className="w-full px-3 py-2 rounded-md border border-border bg-background/50">
                        <option>Administrator</option>
                        <option>Developer</option>
                        <option>Viewer</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-right">
                    <button className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </GlassMorphicCard>
                
                <GlassMorphicCard className="mt-6">
                  <h3 className="font-medium mb-6">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">Password</h4>
                          <p className="text-sm text-muted-foreground">
                            Update your password
                          </p>
                        </div>
                        <button className="py-1 px-3 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors">
                          Change
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-border/40 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security
                          </p>
                        </div>
                        <button className="py-1 px-3 text-sm border border-primary rounded-md text-primary hover:bg-primary/10 transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-border/40 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">Sessions</h4>
                          <p className="text-sm text-muted-foreground">
                            Manage your active sessions
                          </p>
                        </div>
                        <button className="py-1 px-3 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors">
                          View All
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassMorphicCard>
              </div>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Account;
