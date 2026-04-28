import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils/test-utils';
import RevokeStaticTokenDialog from './RevokeStaticTokenDialog';
import * as staticTokenService from '@/services/staticTokenService';

vi.mock('@/services/staticTokenService', () => ({
  revokeStaticToken: vi.fn(),
}));

describe('RevokeStaticTokenDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    tokenId: 'tok_123',
    tokenName: 'ci-token',
    onTokenRevoked: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog with token name', () => {
    renderWithProviders(<RevokeStaticTokenDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Revoke Token' })).toBeInTheDocument();
    expect(screen.getByText(/ci-token/)).toBeInTheDocument();
  });

  it('should call revokeStaticToken on confirm', async () => {
    const user = userEvent.setup();
    vi.mocked(staticTokenService.revokeStaticToken).mockResolvedValue({
      success: true,
      message: 'token revoked',
    });

    renderWithProviders(<RevokeStaticTokenDialog {...defaultProps} />);

    await user.click(screen.getByTestId('confirm-revoke-button'));

    await waitFor(() => {
      expect(staticTokenService.revokeStaticToken).toHaveBeenCalledWith('tok_123');
      expect(defaultProps.onTokenRevoked).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show error on failure', async () => {
    const user = userEvent.setup();
    vi.mocked(staticTokenService.revokeStaticToken).mockRejectedValue({
      data: { error: 'not your token' },
    });

    renderWithProviders(<RevokeStaticTokenDialog {...defaultProps} />);

    await user.click(screen.getByTestId('confirm-revoke-button'));

    await waitFor(() => {
      expect(screen.getByText('not your token')).toBeInTheDocument();
    });
  });

  it('should not render when closed', () => {
    renderWithProviders(
      <RevokeStaticTokenDialog {...defaultProps} open={false} />
    );

    expect(screen.queryByText('Revoke Token')).not.toBeInTheDocument();
  });
});
