import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createStaticToken,
  listStaticTokens,
  revokeStaticToken,
  formatTokenExpiry,
  formatLastUsed,
  isValidExpiryDays,
} from './staticTokenService';
import { pb } from '@/lib/pocketbase';

vi.mock('@/lib/pocketbase', () => ({
  pb: {
    send: vi.fn(),
  },
}));

describe('staticTokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createStaticToken', () => {
    it('should call API with correct params', async () => {
      const mockResponse = {
        token: 'nsk_abc123',
        token_info: {
          id: 'tok_1',
          name: 'ci-token',
          token_prefix: 'nsk_abc1',
          expires_at: null,
          revoked: false,
          revoked_at: null,
          last_used_at: null,
          created: '2026-04-22T10:00:00Z',
        },
      };
      (pb.send as any).mockResolvedValue(mockResponse);

      const result = await createStaticToken('ci-token', 90);

      expect(pb.send).toHaveBeenCalledWith('/api/agent', {
        method: 'POST',
        body: {
          action: 'create-static-token',
          name: 'ci-token',
          expires_in_days: 90,
        },
      });
      expect(result.token).toBe('nsk_abc123');
      expect(result.token_info.name).toBe('ci-token');
    });

    it('should use default expiry of 0', async () => {
      (pb.send as any).mockResolvedValue({ token: 'nsk_x', token_info: {} });

      await createStaticToken('my-token');

      expect(pb.send).toHaveBeenCalledWith('/api/agent', {
        method: 'POST',
        body: {
          action: 'create-static-token',
          name: 'my-token',
          expires_in_days: 0,
        },
      });
    });

    it('should propagate errors', async () => {
      (pb.send as any).mockRejectedValue(new Error('auth required'));

      await expect(createStaticToken('t', 30)).rejects.toThrow('auth required');
    });
  });

  describe('listStaticTokens', () => {
    it('should return tokens array', async () => {
      const tokens = [
        { id: 'tok_1', name: 'a', token_prefix: 'nsk_a', expires_at: null, revoked: false, last_used_at: null, created: '' },
      ];
      (pb.send as any).mockResolvedValue({ tokens });

      const result = await listStaticTokens();

      expect(pb.send).toHaveBeenCalledWith('/api/agent', {
        method: 'POST',
        body: { action: 'list-static-tokens' },
      });
      expect(result).toEqual(tokens);
    });

    it('should return empty array when tokens is null', async () => {
      (pb.send as any).mockResolvedValue({ tokens: null });

      const result = await listStaticTokens();

      expect(result).toEqual([]);
    });
  });

  describe('revokeStaticToken', () => {
    it('should call API with token_id', async () => {
      (pb.send as any).mockResolvedValue({ success: true, message: 'token revoked' });

      const result = await revokeStaticToken('tok_123');

      expect(pb.send).toHaveBeenCalledWith('/api/agent', {
        method: 'POST',
        body: { action: 'revoke-static-token', token_id: 'tok_123' },
      });
      expect(result.success).toBe(true);
    });

    it('should propagate errors', async () => {
      (pb.send as any).mockRejectedValue(new Error('not found'));

      await expect(revokeStaticToken('bad')).rejects.toThrow('not found');
    });
  });

  describe('formatTokenExpiry', () => {
    it('should return "Never" for null', () => {
      expect(formatTokenExpiry(null)).toBe('Never');
    });

    it('should return "Expired" for past dates', () => {
      expect(formatTokenExpiry('2020-01-01T00:00:00Z')).toBe('Expired');
    });

    it('should return formatted date for future dates', () => {
      const future = new Date(Date.now() + 86400000 * 30).toISOString();
      const result = formatTokenExpiry(future);
      expect(result).not.toBe('Never');
      expect(result).not.toBe('Expired');
    });
  });

  describe('formatLastUsed', () => {
    it('should return "Never" for null', () => {
      expect(formatLastUsed(null)).toBe('Never');
    });

    it('should return "Just now" for recent timestamps', () => {
      const now = new Date().toISOString();
      expect(formatLastUsed(now)).toBe('Just now');
    });

    it('should return minutes ago for recent timestamps', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(formatLastUsed(fiveMinAgo)).toBe('5m ago');
    });

    it('should return hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(formatLastUsed(threeHoursAgo)).toBe('3h ago');
    });

    it('should return days ago', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatLastUsed(fiveDaysAgo)).toBe('5d ago');
    });
  });

  describe('isValidExpiryDays', () => {
    it('should accept valid values', () => {
      expect(isValidExpiryDays(0)).toBe(true);
      expect(isValidExpiryDays(30)).toBe(true);
      expect(isValidExpiryDays(365)).toBe(true);
    });

    it('should reject invalid values', () => {
      expect(isValidExpiryDays(7)).toBe(false);
      expect(isValidExpiryDays(100)).toBe(false);
      expect(isValidExpiryDays(-1)).toBe(false);
    });
  });
});
