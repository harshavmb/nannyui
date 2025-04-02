import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import withAuth from '@/utils/withAuth';
import { 
  Server, 
  Plus, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  MoreVertical,
  ArrowUpDown,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import { fetchApi } from '@/utils/config';
import { safeFetch } from '@/utils/errorHandling';
import { placeholderAgents } from '@/mocks/placeholderData';

const Agents = () => {
  const [agents, setAgents] = useState(placeholderAgents);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch data from the API
    const fetchAgents = async () => {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token');

      if (accessToken) {
        try {
          const result = await safeFetch(
            fetchApi('api/agents', { method: 'GET' }, accessToken),
            placeholderAgents
          );

          if (result.data) {
            setAgents(result.data);
            setHasError(false);
          } else {
            setHasError(true);
          }
        } catch (error) {
          console.error('Error fetching agents:', error);
          setHasError(true);
        } finally {
          setLoading(false);
        }
      } else {
        console.error('Access token not found in localStorage');
        setLoading(false);
        setHasError(true);
      }
    };

    fetchAgents();
  }, []);

  // Filter agents based on search term
  const filteredAgents = searchTerm 
    ? agents.filter(agent => 
        agent.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : agents;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto p-6">
          <div className="container pb-8">
            {hasError && (
              <ErrorBanner 
                message="There was an issue loading your agents. Some data may not be current."
                onDismiss={() => setHasError(false)}
              />
            )}
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
                <p className="text-muted-foreground mt-2">
                  Manage and monitor your Linux agent deployments.
                </p>
              </div>
              
              <button className="flex items-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex items-center py-2 px-3 border border-border rounded-md hover:bg-muted/50 transition-colors">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="text-sm">Filter</span>
                </button>
                <button className="flex items-center py-2 px-3 border border-border rounded-md hover:bg-muted/50 transition-colors">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <span className="text-sm">Sort</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                <div>Agent</div>
                <div>Status</div>
                <div>Version</div>
                <div>Location</div>
              </div>
              
              {filteredAgents.map((agent, i) => (
                <motion.div
                  key={agent.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <GlassMorphicCard className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Server className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{agent.hostname}</h3>
                          <p className="text-xs text-muted-foreground">{agent.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`flex items-center ${agent.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                          {agent.status === 'online' ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          <span className="capitalize">{agent.status}</span>
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {agent.created_at}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="px-2 py-1 bg-muted/50 rounded text-xs">
                          {agent.version}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-primary/30 mr-2"></div>
                          <span>{agent.ip_address}</span>
                        </div>
                        
                        <button className="p-1.5 rounded-md hover:bg-muted/80 transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center">
                        <div className="w-full bg-muted/30 h-1.5 rounded-full">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${70 + Math.random() * 30}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">CPU</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-full bg-muted/30 h-1.5 rounded-full">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${40 + Math.random() * 50}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">MEM</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-full bg-muted/30 h-1.5 rounded-full">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${10 + Math.random() * 40}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">DISK</span>
                      </div>
                      
                      <div className="flex justify-end">
                        <button className="py-1 px-3 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors flex items-center">
                          <Activity className="h-3 w-3 mr-1" />
                          View Details
                        </button>
                      </div>
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

export default withAuth(Agents);
