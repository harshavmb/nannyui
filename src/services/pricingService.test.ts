import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPricingTiers,
  getUserUsage,
  getSubscription,
  subscribeToPro,
  cancelSubscription,
  reactivateSubscription,
  buyCredits,
  getInvoices,
  getInvoicePdfUrl,
  formatLimit,
  getUsagePercentage,
  isNearLimit,
  isAtLimit,
  formatTokenCount,
} from './pricingService';

// Mock dependencies
vi.mock('@/integrations/pocketbase/client', () => ({
  getPocketBaseUrl: () => 'http://localhost:8090',
  getAuthToken: () => 'test-token-123',
}));

const mockFetch = vi.fn();
vi.mock('@/utils/fetchUtils', () => ({
  fetchWithTimeout: (...args: unknown[]) => mockFetch(...args),
}));

// Mock window.location
const mockLocation = { origin: 'http://localhost:3000', href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('pricingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  describe('getPricingTiers', () => {
    it('should fetch pricing tiers successfully', async () => {
      const mockResponse = {
        enabled: true,
        tiers: [
          {
            name: 'free',
            max_agents: 2,
            daily_token_limit: 200000,
            monthly_token_limit: 1000000,
            daily_investigation_limit: 5,
            monthly_investigation_limit: 25,
            price_per_month: 0,
            contact_email: 'support@nannyai.dev',
          },
          {
            name: 'pro',
            max_agents: -1,
            daily_token_limit: -1,
            monthly_token_limit: 10000000,
            daily_investigation_limit: -1,
            monthly_investigation_limit: -1,
            price_per_month: 10,
            contact_email: 'support@nannyai.dev',
          },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getPricingTiers();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8090/api/pricing', {
        method: 'GET',
      });
      expect(result.enabled).toBe(true);
      expect(result.tiers).toHaveLength(2);
      expect(result.tiers![0].name).toBe('free');
      expect(result.tiers![1].name).toBe('pro');
    });

    it('should return disabled pricing on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await getPricingTiers();

      expect(result.enabled).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should return disabled pricing on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getPricingTiers();

      expect(result.enabled).toBe(false);
    });
  });

  describe('getUserUsage', () => {
    it('should fetch user usage with auth header', async () => {
      const mockResponse = {
        enabled: true,
        usage: {
          tier: 'pro',
          max_agents: -1,
          daily_token_limit: -1,
          monthly_token_limit: 10000000,
          daily_investigation_limit: -1,
          monthly_investigation_limit: -1,
          daily_tokens_used: 42000,
          monthly_tokens_used: 850000,
          daily_investigations_used: 2,
          monthly_investigations_used: 12,
          daily_resets_at: '2026-05-01T00:00:00+02:00',
          monthly_resets_at: '2026-06-01T00:00:00+02:00',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getUserUsage();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8090/api/pricing/usage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-123',
        },
      });
      expect(result.enabled).toBe(true);
      expect(result.usage?.tier).toBe('pro');
      expect(result.usage?.monthly_tokens_used).toBe(850000);
    });

    it('should return disabled on error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });

      const result = await getUserUsage();

      expect(result.enabled).toBe(false);
    });
  });

  describe('getSubscription', () => {
    it('should fetch subscription status', async () => {
      const mockResponse = {
        has_subscription: true,
        status: 'active',
        plan_name: 'Pro',
        current_period_end: '2025-02-01T00:00:00Z',
        cancel_at_period_end: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSubscription();

      expect(result.has_subscription).toBe(true);
      expect(result.status).toBe('active');
      expect(result.cancel_at_period_end).toBe(false);
    });

    it('should handle 503 (Stripe not configured)', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 503 });

      const result = await getSubscription();

      expect(result.has_subscription).toBe(false);
      expect(result.cancel_at_period_end).toBe(false);
    });

    it('should return no subscription on error', async () => {
      mockFetch.mockRejectedValue(new Error('Connection failed'));

      const result = await getSubscription();

      expect(result.has_subscription).toBe(false);
    });
  });

  describe('subscribeToPro', () => {
    it('should return checkout URL on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ checkout_url: 'https://checkout.stripe.com/test' }),
      });

      const result = await subscribeToPro();

      expect(result.checkout_url).toBe('https://checkout.stripe.com/test');
      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8090/api/stripe/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token-123',
        },
        body: JSON.stringify({
          success_url: 'http://localhost:3000/account?subscribed=true',
          cancel_url: 'http://localhost:3000/account',
        }),
      });
    });

    it('should return error on 409 (already subscribed)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'already subscribed' }),
      });

      const result = await subscribeToPro();

      expect(result.error).toBe('You already have an active subscription');
      expect(result.checkout_url).toBeUndefined();
    });

    it('should return error on 503 (Stripe not configured)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      });

      const result = await subscribeToPro();

      expect(result.error).toBe('Payment integration is not configured on this instance');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'subscription will be cancelled at the end of the current billing period' }),
      });

      const result = await cancelSubscription('too expensive');

      expect(result.message).toContain('cancelled');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8090/api/stripe/cancel-subscription',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'too expensive' }),
        })
      );
    });

    it('should return error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'no active subscription' }),
      });

      const result = await cancelSubscription();

      expect(result.error).toBe('no active subscription');
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'subscription reactivated; billing will continue as normal' }),
      });

      const result = await reactivateSubscription();

      expect(result.message).toContain('reactivated');
    });

    it('should return error on failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await reactivateSubscription();

      expect(result.error).toBeDefined();
    });
  });

  describe('buyCredits', () => {
    it('should return checkout URL on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ checkout_url: 'https://checkout.stripe.com/credits' }),
      });

      const result = await buyCredits(3);

      expect(result.checkout_url).toBe('https://checkout.stripe.com/credits');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8090/api/stripe/buy-credits',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            quantity: 3,
            success_url: 'http://localhost:3000/account?credits=added',
            cancel_url: 'http://localhost:3000/account',
          }),
        })
      );
    });

    it('should reject invalid quantity (< 1)', async () => {
      const result = await buyCredits(0);

      expect(result.error).toBe('Quantity must be between 1 and 100');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject invalid quantity (> 100)', async () => {
      const result = await buyCredits(101);

      expect(result.error).toBe('Quantity must be between 1 and 100');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return error when no Pro subscription (400)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'no active Pro subscription' }),
      });

      const result = await buyCredits(1);

      expect(result.error).toBe('no active Pro subscription');
    });

    it('should handle 503 (Stripe not configured)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      });

      const result = await buyCredits(1);

      expect(result.error).toBe('Payment integration is not configured on this instance');
    });
  });

  describe('getInvoices', () => {
    it('should fetch invoices successfully', async () => {
      const mockItems = [
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: mockItems,
          page: 1,
          per_page: 10,
          total_items: 1,
          total_pages: 1,
        }),
      });

      const result = await getInvoices();

      expect(result.invoices).toHaveLength(1);
      expect(result.invoices![0].invoice_number).toBe('OE81SMRL-0015');
      expect(result.invoices![0].pdf_download_url).toBe('/api/stripe/invoices/jve0x3zngv7w0w5/pdf');
      expect(result.totalPages).toBe(1);
      expect(result.error).toBeUndefined();
    });

    it('should pass page parameter', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          items: [],
          page: 2,
          per_page: 10,
          total_items: 0,
          total_pages: 1,
        }),
      });

      await getInvoices(2);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8090/api/stripe/invoices?page=2',
        expect.any(Object)
      );
    });

    it('should return empty array on 503', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 503 });

      const result = await getInvoices();

      expect(result.invoices).toEqual([]);
      expect(result.totalPages).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should return error on non-503 failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const result = await getInvoices();

      expect(result.error).toBe('Unauthorized');
      expect(result.invoices).toBeUndefined();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getInvoices();

      expect(result.error).toBe('Failed to load invoices');
      expect(result.invoices).toBeUndefined();
    });
  });

  describe('getInvoicePdfUrl', () => {
    it('should construct correct PDF URL', () => {
      const url = getInvoicePdfUrl('jve0x3zngv7w0w5');
      expect(url).toBe('http://localhost:8090/api/stripe/invoices/jve0x3zngv7w0w5/pdf');
    });
  });

  describe('utility functions', () => {
    describe('formatLimit', () => {
      it('should return Unlimited for -1', () => {
        expect(formatLimit(-1)).toBe('Unlimited');
      });

      it('should return Blocked for 0', () => {
        expect(formatLimit(0)).toBe('Blocked');
      });

      it('should format positive numbers', () => {
        expect(formatLimit(1000000)).toBe('1,000,000');
        expect(formatLimit(5)).toBe('5');
      });
    });

    describe('getUsagePercentage', () => {
      it('should calculate percentage correctly', () => {
        expect(getUsagePercentage(500, 1000)).toBe(50);
        expect(getUsagePercentage(900, 1000)).toBe(90);
        expect(getUsagePercentage(0, 1000)).toBe(0);
      });

      it('should cap at 100%', () => {
        expect(getUsagePercentage(1500, 1000)).toBe(100);
      });

      it('should return 0 for unlimited (-1)', () => {
        expect(getUsagePercentage(5000, -1)).toBe(0);
      });

      it('should return 0 for blocked (0)', () => {
        expect(getUsagePercentage(0, 0)).toBe(0);
      });
    });

    describe('isNearLimit', () => {
      it('should return true at 90%+', () => {
        expect(isNearLimit(900, 1000)).toBe(true);
        expect(isNearLimit(950, 1000)).toBe(true);
        expect(isNearLimit(1000, 1000)).toBe(true);
      });

      it('should return false below 90%', () => {
        expect(isNearLimit(899, 1000)).toBe(false);
        expect(isNearLimit(500, 1000)).toBe(false);
      });

      it('should return false for unlimited', () => {
        expect(isNearLimit(9999999, -1)).toBe(false);
      });
    });

    describe('isAtLimit', () => {
      it('should return true at or above limit', () => {
        expect(isAtLimit(1000, 1000)).toBe(true);
        expect(isAtLimit(1001, 1000)).toBe(true);
      });

      it('should return false below limit', () => {
        expect(isAtLimit(999, 1000)).toBe(false);
      });

      it('should return false for unlimited', () => {
        expect(isAtLimit(9999999, -1)).toBe(false);
      });
    });

    describe('formatTokenCount', () => {
      it('should format millions', () => {
        expect(formatTokenCount(1000000)).toBe('1M');
        expect(formatTokenCount(10000000)).toBe('10M');
        expect(formatTokenCount(1500000)).toBe('1.5M');
      });

      it('should format thousands', () => {
        expect(formatTokenCount(1000)).toBe('1K');
        expect(formatTokenCount(200000)).toBe('200K');
        expect(formatTokenCount(42500)).toBe('42.5K');
      });

      it('should format small numbers with locale string', () => {
        expect(formatTokenCount(500)).toBe('500');
        expect(formatTokenCount(0)).toBe('0');
      });
    });
  });
});
