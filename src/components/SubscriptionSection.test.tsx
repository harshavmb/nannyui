import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SubscriptionSection } from './SubscriptionSection';
import * as pricingService from '@/services/pricingService';

// Mock dependencies
vi.mock('@/services/pricingService', () => ({
  getUserUsage: vi.fn(),
  getSubscription: vi.fn(),
  getPricingTiers: vi.fn(),
  getInvoices: vi.fn(),
  getInvoicePdfUrl: vi.fn(),
  cancelSubscription: vi.fn(),
  reactivateSubscription: vi.fn(),
  subscribeToPro: vi.fn(),
  formatLimit: vi.fn((v: number) => v === -1 ? 'Unlimited' : v === 0 ? 'Blocked' : v.toLocaleString()),
  formatTokenCount: vi.fn((v: number) => v.toLocaleString()),
  getCurrencySymbol: vi.fn((c: string) => c === 'eur' ? '€' : c === 'usd' ? '$' : c.toUpperCase() + ' '),
  getUsagePercentage: vi.fn((used: number, limit: number) => limit === -1 ? 0 : limit === 0 ? 100 : Math.min(100, (used / limit) * 100)),
  isNearLimit: vi.fn(() => false),
  isAtLimit: vi.fn(() => false),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockGetUserUsage = pricingService.getUserUsage as ReturnType<typeof vi.fn>;
const mockGetSubscription = pricingService.getSubscription as ReturnType<typeof vi.fn>;
const mockGetPricingTiers = pricingService.getPricingTiers as ReturnType<typeof vi.fn>;
const mockGetInvoices = pricingService.getInvoices as ReturnType<typeof vi.fn>;

const defaultUsageResponse = {
  enabled: true,
  usage: {
    tier: 'pro',
    max_agents: 10,
    daily_token_limit: 500000,
    monthly_token_limit: 5000000,
    daily_investigation_limit: 50,
    monthly_investigation_limit: 500,
    daily_tokens_used: 100000,
    monthly_tokens_used: 1000000,
    daily_investigations_used: 10,
    monthly_investigations_used: 100,
    daily_resets_at: '2026-05-08T00:00:00Z',
    monthly_resets_at: '2026-06-01T00:00:00Z',
  },
};

const defaultSubscription = {
  has_subscription: true,
  status: 'active',
  plan_name: 'Pro',
  current_period_end: '2026-06-01T00:00:00Z',
  cancel_at_period_end: false,
  stripe_configured: true,
};

const defaultPricing = {
  enabled: true,
  tiers: [
    { name: 'Free', max_agents: 2, daily_token_limit: 50000, monthly_token_limit: 500000, daily_investigation_limit: 10, monthly_investigation_limit: 100, price_per_month: 0, contact_email: '' },
    { name: 'Pro', max_agents: 10, daily_token_limit: 500000, monthly_token_limit: 5000000, daily_investigation_limit: 50, monthly_investigation_limit: 500, price_per_month: 10, contact_email: '' },
  ],
  credit_bundle_tokens: 100000,
  credit_bundle_price: 5,
  currency: 'eur',
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <SubscriptionSection />
    </BrowserRouter>
  );
};

describe('SubscriptionSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserUsage.mockResolvedValue(defaultUsageResponse);
    mockGetSubscription.mockResolvedValue(defaultSubscription);
    mockGetPricingTiers.mockResolvedValue(defaultPricing);
    mockGetInvoices.mockResolvedValue({ invoices: [], totalPages: 0 });
  });

  it('should render subscription info after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
  });

  it('should show View Invoices button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
    });
  });

  describe('Invoices', () => {
    const mockInvoices = [
      {
        id: 'jve0x3zngv7w0w5',
        stripe_invoice_id: 'in_1TS1a4A9He9BWuShvXiFlEEj',
        invoice_number: 'OE81SMRL-0015',
        status: 'paid',
        currency: 'eur',
        amount_due: 1000,
        amount_paid: 1000,
        period_start: '2026-04-30 20:53:08.000Z',
        period_end: '2026-04-30 20:53:08.000Z',
        invoice_created: '2026-04-30 20:53:08.000Z',
        finalized_at: '2026-04-30 20:53:08.000Z',
        paid_at: '2026-04-30 20:53:09.000Z',
        description: '1 × nannyapi Pro (at €10.00 / month)',
        hosted_invoice_url: 'https://invoice.stripe.com/i/test',
        pdf_download_url: '/api/stripe/invoices/jve0x3zngv7w0w5/pdf',
        created: '2026-05-07 06:49:32.558Z',
      },
    ];

    it('should load and display invoices when View Invoices is clicked', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        expect(mockGetInvoices).toHaveBeenCalled();
        expect(screen.getByText('OE81SMRL-0015')).toBeInTheDocument();
      });
    });

    it('should show invoice status badge', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        expect(screen.getByText('paid')).toBeInTheDocument();
      });
    });

    it('should display invoice amount in correct format', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        expect(screen.getByText(/EUR 10\.00/)).toBeInTheDocument();
      });
    });

    it('should display invoice description', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        expect(screen.getByText('1 × nannyapi Pro (at €10.00 / month)')).toBeInTheDocument();
      });
    });

    it('should show "View on Stripe" link pointing to hosted_invoice_url', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        const link = screen.getByTitle('View & download on Stripe');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://invoice.stripe.com/i/test');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should show "View on Stripe" text (not a PDF download button)', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        expect(screen.getByText('View on Stripe')).toBeInTheDocument();
        // No PDF download button should exist
        expect(screen.queryByTitle('Download PDF')).not.toBeInTheDocument();
      });
    });

    it('should show Stripe payment processor note', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        expect(screen.getByText(/Payments processed by Stripe/)).toBeInTheDocument();
      });
    });

    it('should show "No invoices found" when invoice list is empty', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: [], totalPages: 0 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        expect(screen.getByText('No invoices found.')).toBeInTheDocument();
      });
    });

    it('should toggle invoices section visibility', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      // Open
      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));
      await waitFor(() => {
        expect(screen.getByText('OE81SMRL-0015')).toBeInTheDocument();
      });

      // Close
      fireEvent.click(screen.getByRole('button', { name: /hide invoices/i }));
      await waitFor(() => {
        expect(screen.queryByText('OE81SMRL-0015')).not.toBeInTheDocument();
      });
    });

    it('should display formatted date from invoice_created', async () => {
      mockGetInvoices.mockResolvedValue({ invoices: mockInvoices, totalPages: 1 });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view invoices/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /view invoices/i }));

      await waitFor(() => {
        // Date should be formatted as "Apr 30, 2026" or similar
        expect(screen.getByText(/Apr 30, 2026/)).toBeInTheDocument();
      });
    });
  });
});
