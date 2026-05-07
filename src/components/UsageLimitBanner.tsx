import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Crown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getUserUsage,
  formatTokenCount,
  isNearLimit,
  isAtLimit,
  type UsageData,
} from '@/services/pricingService';
import { isAuthenticated } from '@/integrations/pocketbase/client';

interface UsageLimitBannerProps {
  /** Show agent-specific limit warnings */
  showAgentLimit?: boolean;
  /** Current number of agents the user has */
  currentAgentCount?: number;
  /** Pre-fetched usage data (avoids duplicate API call when parent already fetches) */
  usageData?: UsageData | null;
}

export const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({
  showAgentLimit = false,
  currentAgentCount = 0,
  usageData,
}) => {
  const [fetchedUsage, setFetchedUsage] = useState<UsageData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Skip fetch if data is provided via props
    if (usageData !== undefined) return;
    if (!isAuthenticated()) return;

    const loadUsage = async () => {
      const res = await getUserUsage();
      if (res.enabled && res.usage) {
        setFetchedUsage(res.usage);
      }
    };
    loadUsage();
  }, [usageData]);

  const usage = usageData !== undefined ? usageData : fetchedUsage;

  if (dismissed || !usage) return null;

  const isPro = usage.tier === 'pro';

  // Agent limit warning (free tier only)
  const agentLimitReached = showAgentLimit && usage.max_agents > 0 && currentAgentCount >= usage.max_agents;

  // Token warnings
  const dailyTokenBlocked = usage.daily_token_limit === 0;
  const monthlyTokenBlocked = usage.monthly_token_limit === 0;
  const dailyTokenAtLimit =
    dailyTokenBlocked || (usage.daily_token_limit > 0 && isAtLimit(usage.daily_tokens_used, usage.daily_token_limit));
  const monthlyTokenAtLimit =
    monthlyTokenBlocked || (usage.monthly_token_limit > 0 && isAtLimit(usage.monthly_tokens_used, usage.monthly_token_limit));
  const monthlyTokenNearLimit =
    !monthlyTokenBlocked && usage.monthly_token_limit > 0 && isNearLimit(usage.monthly_tokens_used, usage.monthly_token_limit);

  // Free tier: show upgrade prompt when at agent limit
  if (!isPro && agentLimitReached) {
    return (
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Agent limit reached ({usage.max_agents} agents max on Free plan)
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Upgrade to Pro for unlimited agents, more tokens, and unlimited investigations.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-300 hover:underline"
              >
                <Crown className="h-3 w-3" />
                Upgrade to Pro
              </button>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded">
            <X className="h-3.5 w-3.5 text-amber-600" />
          </button>
        </div>
      </div>
    );
  }

  // Daily/Monthly token limit reached
  if (dailyTokenAtLimit || monthlyTokenAtLimit) {
    const limitType = monthlyTokenAtLimit ? 'monthly' : 'daily';
    const used = monthlyTokenAtLimit ? usage.monthly_tokens_used : usage.daily_tokens_used;
    const limit = monthlyTokenAtLimit ? usage.monthly_token_limit : usage.daily_token_limit;
    const resetAt = monthlyTokenAtLimit ? usage.monthly_resets_at : usage.daily_resets_at;

    return (
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {limitType === 'monthly' ? 'Monthly' : 'Daily'} token limit reached
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {formatTokenCount(used)} / {formatTokenCount(limit)} tokens used.
                {resetAt && ` Resets ${new Date(resetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`}
              </p>
              {isPro ? (
                <button
                  onClick={() => navigate('/account')}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-800 dark:text-red-300 hover:underline"
                >
                  <Zap className="h-3 w-3" />
                  Buy additional credits
                </button>
              ) : (
                <button
                  onClick={() => navigate('/pricing')}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-800 dark:text-red-300 hover:underline"
                >
                  <Crown className="h-3 w-3" />
                  Upgrade to Pro for more tokens
                </button>
              )}
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded">
            <X className="h-3.5 w-3.5 text-red-600" />
          </button>
        </div>
      </div>
    );
  }

  // Pro user near monthly limit - prompt to buy credits
  if (isPro && monthlyTokenNearLimit) {
    return (
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Approaching monthly token limit
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                {formatTokenCount(usage.monthly_tokens_used)} / {formatTokenCount(usage.monthly_token_limit)} tokens used ({Math.round((usage.monthly_tokens_used / usage.monthly_token_limit) * 100)}%).
                Consider buying additional credits.
              </p>
              <button
                onClick={() => navigate('/account')}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-yellow-800 dark:text-yellow-300 hover:underline"
              >
                <Zap className="h-3 w-3" />
                Buy additional credits
              </button>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800/30 rounded">
            <X className="h-3.5 w-3.5 text-yellow-600" />
          </button>
        </div>
      </div>
    );
  }

  // Free tier: show general info about limits (less aggressive)
  if (!isPro && showAgentLimit && currentAgentCount > 0 && usage.max_agents > 0) {
    const remaining = usage.max_agents - currentAgentCount;
    if (remaining <= 1 && remaining > 0) {
      return (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {remaining} agent slot remaining on Free plan
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Free plan allows up to {usage.max_agents} agents. Upgrade to Pro for unlimited agents.
                </p>
              </div>
            </div>
            <button onClick={() => setDismissed(true)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded">
              <X className="h-3.5 w-3.5 text-blue-600" />
            </button>
          </div>
        </div>
      );
    }
  }

  return null;
};
