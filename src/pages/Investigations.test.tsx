import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/test-utils';
import Investigations from './Investigations';
import * as investigationService from '@/services/investigationService';

// Mock dependencies
vi.mock('@/services/investigationService', () => ({
  getInvestigationsPaginated: vi.fn(),
  getApplicationGroupIcon: vi.fn(() => null),
  formatInvestigationDateTime: vi.fn((time: string) => {
    if (!time) return 'N/A';
    return new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }),
  formatDuration: vi.fn((start: string | null, end: string | null) => {
    if (!start || !end) return 'N/A';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    return `${diffSecs}s`;
  }),
  truncateText: vi.fn((text: string, maxLength: number = 500) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }),
  getPriorityColor: vi.fn(() => 'text-red-600'),
  getStatusColor: vi.fn(() => 'bg-blue-100'),
}));

vi.mock('@/utils/withAuth', () => ({
  default: (Component: any) => Component,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return renderWithProviders(component);
};

describe('Investigations Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getInvestigationsPaginated with correct parameters on mount', async () => {
    const mockData = {
      investigations: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      },
      filters: {
        status: 'all',
        agent_id: 'all',
      },
    };

    (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(investigationService.getInvestigationsPaginated).toHaveBeenCalled();
    });
  });

  it('should display investigations when data is fetched', async () => {
    const mockData = {
      investigations: [
        {
          id: 'inv-1',
          user_prompt: 'Test Issue',
          episode_id: 'episode-1',
          agent_id: 'agent-1',
          agent: { hostname: 'agent-host' },
          priority: 'high' as const,
          status: 'completed' as const,
          created_at: new Date().toISOString(),
          initiated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          inference_count: 5,
          metadata: {},
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
    };

    (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(screen.getByText('Test Issue')).toBeInTheDocument();
      
      const idLabel = screen.getByText('ID:');
      expect(idLabel.parentElement).toHaveTextContent('inv-1');
      
      const episodeLabel = screen.getByText('Episode:');
      expect(episodeLabel.parentElement).toHaveTextContent('episode-1');
      
      const agentLabel = screen.getByText('Agent:');
      expect(agentLabel.parentElement).toHaveTextContent('agent-host');
    });
  });

  it('should display empty state when no investigations exist', async () => {
    const mockData = {
      investigations: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      },
      filters: {
        status: 'all',
        agent_id: 'all',
      },
    };

    (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(screen.getByText(/No investigations found/i)).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
    const mockData = {
      investigations: [],
      pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false },
    };
    (investigationService.getInvestigationsPaginated as any).mockResolvedValue(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by prompt, agent name, or agent ID...')).toBeInTheDocument();
    });
  });

  it('should render show all toggle defaulting to completed only', async () => {
    const mockData = {
      investigations: [],
      pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false },
    };
    (investigationService.getInvestigationsPaginated as any).mockResolvedValue(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(screen.getByLabelText(/show all statuses/i)).toBeInTheDocument();
    });

    // Default call should filter by completed
    expect(investigationService.getInvestigationsPaginated).toHaveBeenCalledWith(1, 10, 'completed', undefined);
  });

  it('should debounce search and call service with query', async () => {
    const mockData = {
      investigations: [],
      pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false },
    };
    (investigationService.getInvestigationsPaginated as any).mockResolvedValue(mockData);

    vi.useFakeTimers({ shouldAdvanceTime: true });

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by prompt, agent name, or agent ID...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search by prompt, agent name, or agent ID...'), { target: { value: 'pve2' } });

    // Advance past debounce timer
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(investigationService.getInvestigationsPaginated).toHaveBeenCalledWith(1, 10, 'completed', 'pve2');
    });

    vi.useRealTimers();
  });

  it('should truncate long prompts to 500 characters', async () => {
    const longPrompt = 'A'.repeat(600);
    const mockData = {
      investigations: [
        {
          id: 'inv-1',
          user_prompt: longPrompt,
          episode_id: 'episode-1',
          agent_id: 'agent-1',
          agent: { hostname: 'agent-host' },
          priority: 'high' as const,
          status: 'completed' as const,
          created_at: new Date().toISOString(),
          initiated_at: new Date().toISOString(),
          investigated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {},
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, total_pages: 1, has_next: false, has_prev: false },
    };

    (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(investigationService.truncateText).toHaveBeenCalledWith(longPrompt, 500);
    });
  });

  it('should show initiated_at, completed_at and duration', async () => {
    const initiatedAt = '2024-01-15T10:00:00Z';
    const completedAt = '2024-01-15T10:05:30Z';
    const mockData = {
      investigations: [
        {
          id: 'inv-1',
          user_prompt: 'Test Issue',
          episode_id: 'episode-1',
          agent_id: 'agent-1',
          agent: { hostname: 'agent-host' },
          priority: 'high' as const,
          status: 'completed' as const,
          created_at: new Date().toISOString(),
          initiated_at: initiatedAt,
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
          metadata: {},
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, total_pages: 1, has_next: false, has_prev: false },
    };

    (investigationService.getInvestigationsPaginated as any).mockResolvedValueOnce(mockData);

    renderWithRouter(<Investigations />);

    await waitFor(() => {
      expect(screen.getByText(/Initiated:/)).toBeInTheDocument();
      expect(screen.getByText(/Completed:/)).toBeInTheDocument();
      expect(screen.getByText(/Duration:/)).toBeInTheDocument();
    });
  });
});
