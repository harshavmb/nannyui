
import React, { useState, useEffect, useRef } from 'react';
import withAuth from '@/utils/withAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  createDiagnostic, 
  continueDiagnostic, 
  getDiagnosticSummary, 
  deleteDiagnostic,
  DiagnosticRequest,
  DiagnosticContinueRequest,
  DiagnosticSummary
} from '@/services/diagnosticApi';
import { createUpdateAgent, getAgents, AgentInfo } from '@/services/agentApi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Terminal, Trash2, Plus, Send, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{role: string; content: string; timestamp?: string}>>([]);
  const [diagnosticSummary, setDiagnosticSummary] = useState<DiagnosticSummary | null>(null);
  const { toast } = useToast();
  const conversationEndRef = useRef<HTMLDivElement>(null);
  
  const agentForm = useForm<AgentInfo>({
    defaultValues: {
      hostname: '',
      os_version: '',
      kernel_version: '',
      ip_address: '',
    }
  });
  
  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);
  
  // Scroll to bottom of conversation when it updates
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  
  const fetchAgents = async () => {
    setLoading(true);
    const fetchedAgents = await getAgents();
    
    if (fetchedAgents) {
      setAgents(fetchedAgents);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to fetch agents',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };
  
  const handleAgentSubmit = async (data: AgentInfo) => {
    setLoading(true);
    const result = await createUpdateAgent(data);
    
    if (result) {
      toast({
        title: 'Success',
        description: 'Agent created successfully',
      });
      agentForm.reset();
      fetchAgents();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create agent',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };
  
  const startDiagnostic = async () => {
    if (!selectedAgent || !userPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please select an agent and enter a diagnostic prompt',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    const payload: DiagnosticRequest = {
      prompt: userPrompt,
      agentId: selectedAgent,
    };
    
    const result = await createDiagnostic(payload);
    
    if (result) {
      setDiagnosticId(result.id);
      setConversation([
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: result.response }
      ]);
      setUserPrompt('');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to start diagnostic',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };
  
  const continueDiagnosticChat = async () => {
    if (!diagnosticId || !userPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Cannot continue conversation without an active diagnostic session',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    const payload: DiagnosticContinueRequest = {
      userInput: userPrompt,
    };
    
    const result = await continueDiagnostic(diagnosticId, payload);
    
    if (result) {
      setConversation([
        ...conversation,
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: result.response }
      ]);
      setUserPrompt('');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to continue diagnostic',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };
  
  const fetchDiagnosticSummary = async () => {
    if (!diagnosticId) {
      toast({
        title: 'Error',
        description: 'No active diagnostic session',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    const summary = await getDiagnosticSummary(diagnosticId);
    
    if (summary) {
      setDiagnosticSummary(summary);
      setActiveTab('summary');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to fetch diagnostic summary',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };
  
  const handleDeleteDiagnostic = async (id: string) => {
    setLoading(true);
    
    const success = await deleteDiagnostic(id);
    
    if (success) {
      toast({
        title: 'Success',
        description: 'Diagnostic deleted successfully',
      });
      
      if (id === diagnosticId) {
        setDiagnosticId(null);
        setConversation([]);
        setDiagnosticSummary(null);
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete diagnostic',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };
  
  const handlePromptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (diagnosticId) {
        continueDiagnosticChat();
      } else {
        startDiagnostic();
      }
    }
  };

  return (
    <div className="container pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnostics</h1>
          <p className="text-muted-foreground mt-2">
            Troubleshoot your Linux agents and get diagnostic help
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="terminal" disabled={!selectedAgent}>Terminal</TabsTrigger>
          <TabsTrigger value="summary" disabled={!diagnosticSummary}>Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Linux Agents</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Register Linux Agent</DialogTitle>
                  <DialogDescription>
                    Enter details about your Linux agent to register it for diagnostics.
                  </DialogDescription>
                </DialogHeader>
                <Form {...agentForm}>
                  <form onSubmit={agentForm.handleSubmit(handleAgentSubmit)} className="space-y-4">
                    <FormField
                      control={agentForm.control}
                      name="hostname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hostname</FormLabel>
                          <FormControl>
                            <Input placeholder="server-01" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={agentForm.control}
                      name="os_version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OS Version</FormLabel>
                          <FormControl>
                            <Input placeholder="Ubuntu 22.04 LTS" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={agentForm.control}
                      name="kernel_version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kernel Version</FormLabel>
                          <FormControl>
                            <Input placeholder="5.15.0-79-generic" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={agentForm.control}
                      name="ip_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IP Address</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.100" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register Agent'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hostname</TableHead>
                    <TableHead>OS Version</TableHead>
                    <TableHead>Kernel</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No agents registered. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agents.map((agent) => (
                      <TableRow key={agent.id} className={selectedAgent === agent.id ? 'bg-muted' : ''}>
                        <TableCell>{agent.hostname}</TableCell>
                        <TableCell>{agent.os_version}</TableCell>
                        <TableCell>{agent.kernel_version}</TableCell>
                        <TableCell>{agent.ip_address}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            agent.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {agent.status || 'unknown'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAgent(agent.id || null);
                              setActiveTab('terminal');
                            }}
                          >
                            <Terminal className="h-4 w-4 mr-1" />
                            Diagnose
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminal">
          <Card className="border-2 bg-black text-green-400">
            <CardHeader className="bg-gray-900 border-b border-gray-800 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Terminal className="h-5 w-5 mr-2" />
                  <CardTitle className="text-lg font-mono">
                    {agents.find(a => a.id === selectedAgent)?.hostname || 'Terminal'} - Diagnostic Session
                  </CardTitle>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDiagnosticSummary}
                    disabled={!diagnosticId || loading}
                    className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-400"
                  >
                    Get Summary
                  </Button>
                  {diagnosticId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDiagnostic(diagnosticId)}
                      disabled={loading}
                      className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="font-mono p-5 min-h-[500px] max-h-[500px] overflow-y-auto bg-black">
                {conversation.length === 0 ? (
                  <div className="text-gray-500 h-full flex flex-col items-center justify-center">
                    <Terminal className="h-12 w-12 mb-4" />
                    <p>Start a new diagnostic session by entering a prompt below.</p>
                    <p className="text-sm mt-2">Describe the issue you're experiencing with your Linux system.</p>
                  </div>
                ) : (
                  conversation.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-4 ${msg.role === 'user' ? 'text-yellow-300' : 'text-green-400'}`}
                    >
                      <div className="flex">
                        <span className="font-bold mr-2">
                          {msg.role === 'user' ? '$ User:' : '> System:'}
                        </span>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={conversationEndRef} />
              </div>
              <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex">
                  <span className="text-yellow-300 font-bold mr-2 font-mono pt-2">$</span>
                  <div className="flex-1">
                    <Textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      onKeyDown={handlePromptKeyDown}
                      placeholder={diagnosticId 
                        ? "Enter command output or additional information..." 
                        : "Describe your Linux issue..."}
                      className="bg-transparent border-gray-700 text-green-400 font-mono resize-none min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        onClick={diagnosticId ? continueDiagnosticChat : startDiagnostic}
                        disabled={!userPrompt.trim() || loading}
                        className="bg-green-700 hover:bg-green-800"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {diagnosticId ? "Send Response" : "Start Diagnostic"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          {diagnosticSummary && (
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Diagnostic Summary</CardTitle>
                    <CardDescription>
                      Diagnostic ID: {diagnosticSummary.id}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDiagnostic(diagnosticSummary.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Initial Problem</h3>
                  <div className="bg-muted p-4 rounded-md">
                    {diagnosticSummary.prompt}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Final Diagnosis</h3>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {diagnosticSummary.summary}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Conversation History</h3>
                  <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                    {diagnosticSummary.messages.map((msg, idx) => (
                      <div key={idx} className="p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">
                            {msg.role === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          {msg.timestamp && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(Diagnostics);
