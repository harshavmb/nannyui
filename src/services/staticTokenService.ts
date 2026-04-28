import { pb } from '@/lib/pocketbase';

export interface StaticTokenInfo {
  id: string;
  name: string;
  token_prefix: string;
  expires_at: string | null;
  revoked: boolean;
  revoked_at: string | null;
  last_used_at: string | null;
  created: string;
}

export interface CreateStaticTokenResponse {
  token: string;
  token_info: StaticTokenInfo;
}

export interface ListStaticTokensResponse {
  tokens: StaticTokenInfo[];
}

export interface RevokeStaticTokenResponse {
  success: boolean;
  message: string;
}

const VALID_EXPIRY_DAYS = [0, 30, 60, 90, 180, 365] as const;
export type ExpiryDays = typeof VALID_EXPIRY_DAYS[number];

export const isValidExpiryDays = (days: number): days is ExpiryDays => {
  return VALID_EXPIRY_DAYS.includes(days as ExpiryDays);
};

export const EXPIRY_OPTIONS: { label: string; value: ExpiryDays }[] = [
  { label: 'No expiration', value: 0 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
  { label: '180 days', value: 180 },
  { label: '365 days', value: 365 },
];

/**
 * Create a new static API token
 */
export const createStaticToken = async (
  name: string,
  expiresInDays: ExpiryDays = 0
): Promise<CreateStaticTokenResponse> => {
  const response = await pb.send('/api/agent', {
    method: 'POST',
    body: {
      action: 'create-static-token',
      name,
      expires_in_days: expiresInDays,
    },
  });
  return response as CreateStaticTokenResponse;
};

/**
 * List all static tokens for the authenticated user
 */
export const listStaticTokens = async (): Promise<StaticTokenInfo[]> => {
  const response = await pb.send('/api/agent', {
    method: 'POST',
    body: {
      action: 'list-static-tokens',
    },
  });
  return (response as ListStaticTokensResponse).tokens ?? [];
};

/**
 * Revoke a static token by ID
 */
export const revokeStaticToken = async (tokenId: string): Promise<RevokeStaticTokenResponse> => {
  const response = await pb.send('/api/agent', {
    method: 'POST',
    body: {
      action: 'revoke-static-token',
      token_id: tokenId,
    },
  });
  return response as RevokeStaticTokenResponse;
};

/**
 * Format token expiry for display
 */
export const formatTokenExpiry = (expiresAt: string | null): string => {
  if (!expiresAt) return 'Never';
  const date = new Date(expiresAt);
  const now = new Date();
  if (date < now) return 'Expired';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format last used time for display
 */
export const formatLastUsed = (lastUsedAt: string | null): string => {
  if (!lastUsedAt) return 'Never';
  const date = new Date(lastUsedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
