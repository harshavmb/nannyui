
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as errorHandling from '@/utils/errorHandling';
import * as config from '@/utils/config';
import * as authUtils from '@/utils/authUtils';
import { placeholderStats, placeholderActivities } from '@/mocks/placeholderData';

// Mock the modules
vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('@/utils/withAuth', () => ({
  default: (Component) => Component
}));

vi.mock('@/components/TransitionWrapper', () => ({
  default: ({ children }) => <div data-testid="transition-wrapper">{children}</div>
}));

vi.mock('@/utils/errorHandling', () => ({
  safeFetch: vi.fn(),
  showErrorToast: vi.fn(),
  ApiError: class ApiError extends Error {
    type: errorHandling.ErrorType;
    statusCode?: number;
    constructor(message: string, type = errorHandling.ErrorType.UNKNOWN, statusCode?: number) {
      super(message);
      this.name = 'ApiError';
      this.type = type;
      this.statusCode = statusCode;
    }
  },
  ErrorType: {
    NETWORK: 'network',
    AUTH: 'auth',
    SERVER: 'server',
    UNKNOWN: 'unknown'
  }
}));

vi.mock('@/utils/config', () => ({
  fetchApi: vi.fn(),
  getBackendURL: vi.fn()
}));

vi.mock('@/utils/authUtils', () => ({
  setAccessToken: vi.fn(),
  setUsername: vi.fn()
}));

describe('Dashboard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // TODO: Uncomment this test after implementing loading state
  // NOT WORKING
  // it('should display loading state initially', () => {
  //   // Mock fetchApi to return a promise that never resolves to keep component in loading state
  //   vi.mocked(config.fetchApi).mockReturnValue(new Promise(() => {}));
    
  //   render(
  //     <BrowserRouter>
  //       <Dashboard />
  //     </BrowserRouter>
  //   );

  //   expect(screen.getByTestId('transition-wrapper')).toBeInTheDocument();
  //   expect(screen.getByTestId('navbar')).toBeInTheDocument();
  //   expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
  //   // Check if loading spinner is displayed
  //   expect(screen.getByRole('status') || screen.getByTestId('loading-spinner')).toBeInTheDocument();
  // });

  it('should fetch GitHub profile and dashboard data on mount', async () => {
    const mockGitHubResponse = {
      ok: true,
      json: async () => ({ 
        access_token: 'mock-token',
        user: { name: 'Test User' }
      })
    };

    vi.mocked(config.fetchApi).mockResolvedValue(mockGitHubResponse as Response);
    vi.mocked(errorHandling.safeFetch).mockResolvedValueOnce({ 
      data: placeholderStats, 
      error: null 
    }).mockResolvedValueOnce({ 
      data: placeholderActivities, 
      error: null 
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Verify that fetchApi was called with the correct parameters
    await waitFor(() => {
      expect(config.fetchApi).toHaveBeenCalledWith('/github/profile', expect.any(Object));
    });

    // Verify that access token was stored
    await waitFor(() => {
      expect(authUtils.setAccessToken).toHaveBeenCalledWith('mock-token');
    });

    // Verify that username was stored
    await waitFor(() => {
      expect(authUtils.setUsername).toHaveBeenCalledWith('Test User');
    });

    // Verify that dashboard stats were fetched
    await waitFor(() => {
      expect(errorHandling.safeFetch).toHaveBeenCalled();
    });
  });

  it('should show error banner when API call fails', async () => {
    // Mock GitHub API call to fail
    const mockGitHubResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    };

    vi.mocked(config.fetchApi).mockResolvedValue(mockGitHubResponse as Response);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for the error banner to appear
    await waitFor(() => {
      const errorBanner = screen.getByText(/Error connecting to authentication service/i);
      expect(errorBanner).toBeInTheDocument();
    });
  });

  // TODO: Uncomment this test after implementing placeholder data
  // not working
  // it('should use placeholder data when API calls fail', async () => {
  //   // Mock GitHub API to succeed but dashboard API to fail
  //   const mockGitHubResponse = {
  //     ok: true,
  //     json: async () => ({ 
  //       access_token: 'mock-token',
  //       user: { name: 'Test User' }
  //     })
  //   };

  //   vi.mocked(config.fetchApi).mockResolvedValue(mockGitHubResponse as Response);
  //   vi.mocked(errorHandling.safeFetch).mockResolvedValue({ 
  //     data: null, 
  //     error: new errorHandling.ApiError('API error', errorHandling.ErrorType.NETWORK) 
  //   });

  //   render(
  //     <BrowserRouter>
  //       <Dashboard />
  //     </BrowserRouter>
  //   );

  //   // Wait for the dashboard to render with placeholder data
  //   await waitFor(() => {
  //     expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  //   });

  //   // Verify error state is shown
  //   await waitFor(() => {
  //     expect(screen.getByRole('alert')).toBeInTheDocument();
  //   });
  // });
});
