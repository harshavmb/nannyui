
import { getAccessToken } from '@/utils/authUtils';
import { fetchApi } from '@/utils/config';
import { safeFetch } from '@/utils/errorHandling';

// Types for diagnostic API interaction
export interface DiagnosticRequest {
  agent_id: string;
  issue: string;
}

export interface DiagnosticResponse {
  id: string;
  issue: string;
  response: string;
  agent_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  commands?: string[];
  log_files?: string[];
}

export interface DiagnosticContinueRequest {
  command_output: string;
}

export interface DiagnosticSummary {
  id: string;
  issue: string;
  response: string;
  agent_id: string;
  status: string;
  summary: string;
  created_at: string;
  updated_at: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  commands?: string[];
  log_files?: string[];
}

// Create a new diagnostic session
export const createDiagnostic = async (payload: DiagnosticRequest): Promise<DiagnosticResponse | null> => {
  const token = getAccessToken();
  
  const { data, error } = await safeFetch<DiagnosticResponse>(
    fetchApi('api/diagnostic', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token)
  );
  
  if (error) {
    console.error('Error creating diagnostic:', error);
    return null;
  }
  
  return data;
};

// Continue an existing diagnostic conversation
export const continueDiagnostic = async (id: string, payload: DiagnosticContinueRequest): Promise<DiagnosticResponse | null> => {
  const token = getAccessToken();
  
  const { data, error } = await safeFetch<DiagnosticResponse>(
    fetchApi(`api/diagnostic/${id}/continue`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token)
  );
  
  if (error) {
    console.error('Error continuing diagnostic:', error);
    return null;
  }
  
  return data;
};

// Get diagnostic summary
export const getDiagnosticSummary = async (id: string): Promise<DiagnosticSummary | null> => {
  const token = getAccessToken();
  
  const { data, error } = await safeFetch<DiagnosticSummary>(
    fetchApi(`api/diagnostic/${id}`, {
      method: 'GET',
    }, token)
  );
  
  if (error) {
    console.error('Error fetching diagnostic summary:', error);
    return null;
  }
  
  return data;
};

// Delete a diagnostic session
export const deleteDiagnostic = async (id: string): Promise<boolean> => {
  const token = getAccessToken();
  
  const { error } = await safeFetch<any>(
    fetchApi(`api/diagnostic/${id}`, {
      method: 'DELETE',
    }, token)
  );
  
  if (error) {
    console.error('Error deleting diagnostic:', error);
    return false;
  }
  
  return true;
};
