
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { Server, X, Terminal, Clock, Database, Cpu, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentDetailsProps {
  agent: {
    id: string;
    hostname: string;
    status: string;
    version: string;
    location: string;
    created_at: string;
    ip_address: string;
    type: string;
    kernel_version?: string;
    os_version?: string;
    user_id?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AgentDetailsSheet = ({ agent, open, onOpenChange }: AgentDetailsProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle>{agent.hostname}</SheetTitle>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <SheetDescription>
            {agent.type} agent • {agent.status === 'online' ? 
              <span className="text-green-500">Online</span> : 
              <span className="text-red-500">Offline</span>
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="bg-muted/40 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs bg-background px-2 py-1 rounded">{agent.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IP Address</span>
                <span>{agent.ip_address}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Location</span>
                <span>{agent.location}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{agent.version}</span>
              </div>
              {agent.user_id && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="font-mono text-xs truncate max-w-[180px]">{agent.user_id}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              System Information
            </h3>
            <div className="space-y-2">
              {agent.os_version ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">OS Version</span>
                  <span>{agent.os_version}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">OS Version</span>
                  <span className="text-muted-foreground italic">Not available</span>
                </div>
              )}
              
              {agent.kernel_version ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Kernel Version</span>
                  <span>{agent.kernel_version}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Kernel Version</span>
                  <span className="text-muted-foreground italic">Not available</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{agent.created_at}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Last Seen</span>
                <span>{agent.status === 'online' ? 'Just now' : '5h ago'}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <Button variant="outline" className="w-full">
              <Terminal className="h-4 w-4 mr-2" />
              Run Command
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AgentDetailsSheet;
