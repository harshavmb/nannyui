import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils/test-utils';
import CreateStaticTokenDialog from './CreateStaticTokenDialog';
import * as staticTokenService from '@/services/staticTokenService';

vi.mock('@/services/staticTokenService', () => ({
  createStaticToken: vi.fn(),
  EXPIRY_OPTIONS: [
    { label: 'No expiration', value: 0 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
  ],
}));

describe('CreateStaticTokenDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onTokenCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog with form fields', () => {
    renderWithProviders(<CreateStaticTokenDialog {...defaultProps} />);

    expect(screen.getByText('Create Static API Token')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByText('Create Token')).toBeInTheDocument();
  });

  it('should show error when name is empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateStaticTokenDialog {...defaultProps} />);

    await user.click(screen.getByTestId('create-token-submit'));

    expect(screen.getByText('Token name is required')).toBeInTheDocument();
    expect(staticTokenService.createStaticToken).not.toHaveBeenCalled();
  });

  it('should show error when name exceeds 120 chars', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateStaticTokenDialog {...defaultProps} />);

    const nameInput = screen.getByTestId('token-name-input');
    // maxLength on the input prevents typing >120, so we fire change directly
    await user.clear(nameInput);
    // Simulate pasting a long value that bypasses maxLength
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(nameInput, 'a'.repeat(121));
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    await user.click(screen.getByTestId('create-token-submit'));

    expect(screen.getByText('Token name must be 120 characters or less')).toBeInTheDocument();
  });

  it('should create token and display it on success', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      token: 'nsk_test123456789',
      token_info: {
        id: 'tok_1',
        name: 'my-token',
        token_prefix: 'nsk_test12',
        expires_at: null,
        revoked: false,
        revoked_at: null,
        last_used_at: null,
        created: '2026-04-22T10:00:00Z',
      },
    };
    vi.mocked(staticTokenService.createStaticToken).mockResolvedValue(mockResponse);

    renderWithProviders(<CreateStaticTokenDialog {...defaultProps} />);

    await user.type(screen.getByTestId('token-name-input'), 'my-token');
    await user.click(screen.getByTestId('create-token-submit'));

    await waitFor(() => {
      expect(screen.getByText(/Token created successfully/)).toBeInTheDocument();
    });

    expect(defaultProps.onTokenCreated).toHaveBeenCalled();
  });

  it('should show error message on API failure', async () => {
    const user = userEvent.setup();
    vi.mocked(staticTokenService.createStaticToken).mockRejectedValue({
      data: { error: 'name required' },
    });

    renderWithProviders(<CreateStaticTokenDialog {...defaultProps} />);

    await user.type(screen.getByTestId('token-name-input'), 'test');
    await user.click(screen.getByTestId('create-token-submit'));

    await waitFor(() => {
      expect(screen.getByText('name required')).toBeInTheDocument();
    });
  });

  it('should not render when closed', () => {
    renderWithProviders(
      <CreateStaticTokenDialog {...defaultProps} open={false} />
    );

    expect(screen.queryByText('Create Static API Token')).not.toBeInTheDocument();
  });
});
