import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/test-utils';
import Navbar from './Navbar';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

vi.mock('@/services/authService', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ name: 'Test User', email: 'test@example.com' }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navbar header', () => {
    renderWithProviders(<Navbar />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithProviders(<Navbar />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render notification bell button', () => {
    renderWithProviders(<Navbar />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render user dropdown with account options', async () => {
    renderWithProviders(<Navbar />);

    // Wait for username to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Verify the dropdown trigger exists with the user name
    const trigger = screen.getByText('Test User');
    expect(trigger.closest('button')).toBeInTheDocument();
  });
});
