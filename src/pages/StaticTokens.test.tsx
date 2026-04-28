import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import StaticTokens from './StaticTokens';
import * as staticTokenService from '@/services/staticTokenService';

vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('@/utils/withAuth', () => ({
  default: (Component: any) => Component,
}));

vi.mock('@/components/TransitionWrapper', () => ({
  default: ({ children }: any) => <div data-testid="transition-wrapper">{children}</div>,
}));

vi.mock('@/services/staticTokenService', () => ({
  listStaticTokens: vi.fn(),
  formatTokenExpiry: vi.fn((v: string | null) => v ? 'Jan 1, 2027' : 'Never'),
  formatLastUsed: vi.fn((v: string | null) => v ? '2h ago' : 'Never'),
}));

vi.mock('@/components/CreateStaticTokenDialog', () => ({
  default: ({ open, onOpenChange }: any) =>
    open ? <div data-testid="create-dialog">Create Dialog <button onClick={() => onOpenChange(false)}>Close</button></div> : null,
}));

vi.mock('@/components/RevokeStaticTokenDialog', () => ({
  default: ({ open, onOpenChange, tokenName }: any) =>
    open ? <div data-testid="revoke-dialog">Revoke {tokenName} <button onClick={() => onOpenChange(false)}>Close</button></div> : null,
}));

const mockTokens: staticTokenService.StaticTokenInfo[] = [
  {
    id: 'tok_1',
    name: 'ci-token',
    token_prefix: 'nsk_abc123',
    expires_at: '2027-01-01T00:00:00Z',
    revoked: false,
    revoked_at: null,
    last_used_at: '2026-04-20T12:00:00Z',
    created: '2026-04-01T10:00:00Z',
  },
  {
    id: 'tok_2',
    name: 'old-token',
    token_prefix: 'nsk_xyz789',
    expires_at: null,
    revoked: true,
    revoked_at: '2026-04-15T00:00:00Z',
    last_used_at: null,
    created: '2026-03-01T10:00:00Z',
  },
];

describe('StaticTokens page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with tokens', async () => {
    vi.mocked(staticTokenService.listStaticTokens).mockResolvedValue(mockTokens);

    render(
      <BrowserRouter>
        <StaticTokens />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Static API Tokens')).toBeInTheDocument();
    });

    expect(screen.getByText('ci-token')).toBeInTheDocument();
    expect(screen.getByText('old-token')).toBeInTheDocument();
  });

  it('should show empty state when no tokens exist', async () => {
    vi.mocked(staticTokenService.listStaticTokens).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <StaticTokens />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No active tokens')).toBeInTheDocument();
    });
  });

  it('should open create dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(staticTokenService.listStaticTokens).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <StaticTokens />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('create-token-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('create-token-button'));

    expect(screen.getByTestId('create-dialog')).toBeInTheDocument();
  });

  it('should open revoke dialog for a token', async () => {
    const user = userEvent.setup();
    vi.mocked(staticTokenService.listStaticTokens).mockResolvedValue(mockTokens);

    render(
      <BrowserRouter>
        <StaticTokens />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('revoke-token-tok_1')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('revoke-token-tok_1'));

    expect(screen.getByTestId('revoke-dialog')).toBeInTheDocument();
  });

  it('should show error banner on fetch failure', async () => {
    vi.mocked(staticTokenService.listStaticTokens).mockRejectedValue(
      new Error('Network error')
    );

    render(
      <BrowserRouter>
        <StaticTokens />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should separate active and revoked tokens', async () => {
    vi.mocked(staticTokenService.listStaticTokens).mockResolvedValue(mockTokens);

    render(
      <BrowserRouter>
        <StaticTokens />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Active Tokens')).toBeInTheDocument();
      expect(screen.getByText('Revoked Tokens')).toBeInTheDocument();
    });
  });
});
