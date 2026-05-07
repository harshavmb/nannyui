import { getPocketBaseUrl, getAuthToken } from '@/integrations/pocketbase/client';
import { fetchWithTimeout } from '@/utils/fetchUtils';

// --- Types ---

export interface PricingTier {
  name: string;
  max_agents: number;
  daily_token_limit: number;
  monthly_token_limit: number;
  daily_investigation_limit: number;
  monthly_investigation_limit: number;
  price_per_month: number;
  contact_email: string;
}

export interface PricingResponse {
  enabled: boolean;
  tiers?: PricingTier[];
  message?: string;
  credit_bundle_tokens?: number;
  credit_bundle_price?: number;
  currency?: string;
}

export interface UsageData {
  tier: string;
  max_agents: number;
  daily_token_limit: number;
  monthly_token_limit: number;
  daily_investigation_limit: number;
  monthly_investigation_limit: number;
  daily_tokens_used: number;
  monthly_tokens_used: number;
  daily_investigations_used: number;
  monthly_investigations_used: number;
  daily_resets_at: string;
  monthly_resets_at: string;
}

export interface UsageResponse {
  enabled: boolean;
  usage?: UsageData;
  message?: string;
}

export interface SubscriptionInfo {
  has_subscription: boolean;
  status?: string;
  plan_name?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

export interface TierOverride {
  id: string;
  user_id: string;
  tier: string;
  granted_by: string;
  reason: string;
  active: boolean;
  expires_at: string;
  created: string;
  updated: string;
}

export interface InvoiceItem {
  id: string;
  stripe_invoice_id: string;
  invoice_number: string;
  status: string;
  currency: string;
  amount_due: number;
  amount_paid: number;
  period_start: string;
  period_end: string;
  invoice_created: string;
  finalized_at: string;
  paid_at: string;
  description: string;
  hosted_invoice_url: string;
  pdf_download_url: string;
  created: string;
}

export interface InvoicesResponse {
  items: InvoiceItem[];
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

// --- API Helpers ---

const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- Public Pricing API ---

/**
 * Fetch public pricing tiers (no auth required)
 */
export const getPricingTiers = async (): Promise<PricingResponse> => {
  const baseUrl = getPocketBaseUrl();
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/pricing`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pricing: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return { enabled: false, message: 'Failed to load pricing information' };
  }
};

// --- User Usage API ---

/**
 * Fetch authenticated user's current usage and limits
 */
export const getUserUsage = async (): Promise<UsageResponse> => {
  const baseUrl = getPocketBaseUrl();
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/pricing/usage`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch usage: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching usage:', error);
    return { enabled: false, message: 'Failed to load usage data' };
  }
};

// --- Stripe Subscription API ---

/**
 * Get current user's subscription status
 */
export const getSubscription = async (): Promise<SubscriptionInfo> => {
  const baseUrl = getPocketBaseUrl();
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/stripe/subscription`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 503) {
        return { has_subscription: false, cancel_at_period_end: false };
      }
      throw new Error(`Failed to fetch subscription: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return { has_subscription: false, cancel_at_period_end: false };
  }
};

/**
 * Subscribe to Pro plan - returns checkout URL
 */
export const subscribeToPro = async (): Promise<{ checkout_url?: string; error?: string }> => {
  const baseUrl = getPocketBaseUrl();
  const successUrl = `${window.location.origin}/account?subscribed=true`;
  const cancelUrl = `${window.location.origin}/account`;

  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/stripe/subscribe`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 409) {
        return { error: 'You already have an active subscription' };
      }
      if (response.status === 503) {
        return { error: 'Payment integration is not configured on this instance' };
      }
      return { error: data.error || `Subscription failed: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error('Error subscribing:', error);
    return { error: 'Failed to initiate subscription. Please try again.' };
  }
};

/**
 * Cancel subscription (at end of billing period)
 */
export const cancelSubscription = async (reason?: string): Promise<{ message?: string; error?: string }> => {
  const baseUrl = getPocketBaseUrl();
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/stripe/cancel-subscription`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason: reason || '' }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: data.error || `Cancel failed: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return { error: 'Failed to cancel subscription. Please try again.' };
  }
};

/**
 * Reactivate a subscription that was scheduled for cancellation
 */
export const reactivateSubscription = async (): Promise<{ message?: string; error?: string }> => {
  const baseUrl = getPocketBaseUrl();
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/stripe/reactivate-subscription`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: data.error || `Reactivation failed: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return { error: 'Failed to reactivate subscription. Please try again.' };
  }
};

/**
 * Buy additional credit bundles (Pro subscribers only)
 */
export const buyCredits = async (quantity: number): Promise<{ checkout_url?: string; error?: string }> => {
  const baseUrl = getPocketBaseUrl();
  const successUrl = `${window.location.origin}/account?credits=added`;
  const cancelUrl = `${window.location.origin}/account`;

  if (quantity < 1 || quantity > 100) {
    return { error: 'Quantity must be between 1 and 100' };
  }

  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/stripe/buy-credits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        quantity,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 400) {
        return { error: data.error || 'Invalid request. Ensure you have an active Pro subscription.' };
      }
      if (response.status === 503) {
        return { error: 'Payment integration is not configured on this instance' };
      }
      return { error: data.error || `Purchase failed: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error('Error buying credits:', error);
    return { error: 'Failed to initiate credit purchase. Please try again.' };
  }
};

/**
 * Get user's invoices from Stripe
 */
export const getInvoices = async (page: number = 1): Promise<{ invoices?: InvoiceItem[]; totalPages?: number; error?: string }> => {
  const baseUrl = getPocketBaseUrl();
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/stripe/invoices?page=${page}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 503) {
        return { invoices: [], totalPages: 0 };
      }
      const data = await response.json().catch(() => ({}));
      return { error: data.error || `Failed to fetch invoices: ${response.status}` };
    }

    const data: InvoicesResponse = await response.json();
    return { invoices: data.items, totalPages: data.total_pages };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { error: 'Failed to load invoices' };
  }
};

/**
 * Get the PDF download URL for a specific invoice
 */
export const getInvoicePdfUrl = (invoiceId: string): string => {
  const baseUrl = getPocketBaseUrl();
  return `${baseUrl}/api/stripe/invoices/${invoiceId}/pdf`;
};

// --- Utility Functions ---

/**
 * Format a limit value for display
 * -1 = Unlimited, 0 = Blocked, >0 = number
 */
export const formatLimit = (limit: number): string => {
  if (limit === -1) return 'Unlimited';
  if (limit === 0) return 'Blocked';
  return limit.toLocaleString();
};

/**
 * Calculate usage percentage (0-100)
 */
export const getUsagePercentage = (used: number, limit: number): number => {
  if (limit === -1) return 0; // unlimited
  if (limit === 0) return 100; // blocked — always at limit
  return Math.min(100, Math.round((used / limit) * 100));
};

/**
 * Check if user is approaching their limit (>90%)
 */
export const isNearLimit = (used: number, limit: number): boolean => {
  if (limit === -1) return false; // unlimited
  if (limit === 0) return false; // blocked — already at limit, not "near"
  return (used / limit) >= 0.9;
};

/**
 * Check if user has reached their limit
 */
export const isAtLimit = (used: number, limit: number): boolean => {
  if (limit === -1) return false; // unlimited
  if (limit === 0) return true; // blocked — always at limit
  return used >= limit;
};

/**
 * Format token count for display (e.g., 1,000,000 -> 1M)
 */
export const formatTokenCount = (count: number): string => {
  if (count >= 1_000_000) {
    const millions = count / 1_000_000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  if (count >= 1_000) {
    const thousands = count / 1_000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
  }
  return count.toLocaleString();
};
