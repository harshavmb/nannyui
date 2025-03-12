
import React from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Info, Calendar, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';

const Tokens = () => {
  const [showTokens, setShowTokens] = React.useState(false);
  
  const tokens = [
    { 
      name: 'Production API Key', 
      token: 'sk_prod_xxxxxxxxxxxxxxxxxxx', 
      type: 'Production',
      created: 'Apr 15, 2023',
      lastUsed: '2 hours ago'
    },
    { 
      name: 'Development API Key', 
      token: 'sk_dev_xxxxxxxxxxxxxxxxxxx', 
      type: 'Development',
      created: 'Apr 18, 2023',
      lastUsed: '5 mins ago'
    },
    { 
      name: 'Testing API Key', 
      token: 'sk_test_xxxxxxxxxxxxxxxxxxx', 
      type: 'Testing',
      created: 'May 2, 2023',
      lastUsed: '1 day ago'
    },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto p-6">
          <div className="container pb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Auth Tokens</h1>
                <p className="text-muted-foreground mt-2">
                  Manage API authentication tokens for your applications.
                </p>
              </div>
              
              <button className="flex items-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Create Token
              </button>
            </div>
            
            <GlassMorphicCard className="mb-8">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium">Token Security</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your API tokens have full access to your account. Keep them secure and never share them in public repositories or client-side code.
                  </p>
                </div>
              </div>
            </GlassMorphicCard>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your API Tokens</h2>
              <button 
                onClick={() => setShowTokens(!showTokens)}
                className="flex items-center py-1 px-3 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
              >
                {showTokens ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                    Hide tokens
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Show tokens
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              {tokens.map((token, i) => (
                <motion.div
                  key={token.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                >
                  <GlassMorphicCard>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{token.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {token.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                        <div className="flex items-center space-x-1">
                          <div className="px-3 py-1 bg-muted/50 rounded-md text-sm font-mono">
                            {showTokens ? token.token : '••••••••••••••••••••••••••'}
                          </div>
                          <button className="p-1.5 rounded-md hover:bg-muted/80 transition-colors">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center mr-3">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{token.created}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Last used: {token.lastUsed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/40 flex justify-end">
                      <button className="py-1 px-3 text-sm border border-destructive/30 text-destructive rounded-md hover:bg-destructive/5 transition-colors flex items-center">
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Revoke
                      </button>
                    </div>
                  </GlassMorphicCard>
                </motion.div>
              ))}
            </div>
          </div>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Tokens;
