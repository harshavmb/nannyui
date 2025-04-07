
import { getAccessToken } from '@/utils/authUtils';
import { fetchApi } from '@/utils/config';
import { safeFetch } from '@/utils/errorHandling';

// Types for agent API interaction
export interface AgentInfo {
  id?: string;
  hostname: string;
  os_version: string;
  kernel_version: string;
  ip_address: string;
  status?: string;
  type?: string;
  version?: string;
  location?: string;
  created_at?: string;
}

// Create or update an agent
export const createUpdateAgent = async (agentInfo: AgentInfo): Promise<AgentInfo | null> => {
  const token = getAccessToken();
  
  const { data, error } = await safeFetch<AgentInfo>(
    fetchApi('api/agent-info', {
      method: 'POST',
      body: JSON.stringify(agentInfo),
    }, token)
  );
  
  if (error) {
    console.error('Error creating/updating agent:', error);
    return null;
  }
  
  return data;
};

// Get list of agents
export const getAgents = async (): Promise<AgentInfo[] | null> => {
  const token = getAccessToken();
  
  const { data, error } = await safeFetch<AgentInfo[]>(
    fetchApi('api/agents', {
      method: 'GET',
    }, token)
  );
  
  if (error) {
    console.error('Error fetching agents:', error);
    return null;
  }
  
  return data;
};
