import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Zap, Crown, CreditCard } from 'lucide-react';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { BuyCreditsDialog } from '@/components/BuyCreditsDialog';
import {
  getUserUsage,
  getPricingTiers,
  formatLimit,
  formatTokenCount,
  getUsagePercentage,
  isNearLimit,
  isAtLimit,
  type UsageData,
  type PricingResponse,
} from '@/services/pricingService';
import { isAuthenticated } from '@/integrations/pocketbase/client';

const UsageBar: React.FC<{ label: string; used: number; limit: number; resetAt?: string }> = ({
  label,
  used,
  limit,
  resetAt,
}) => {
  if (limit === -1) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{formatTokenCount(used)} used (Unlimited)</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: '5%' }} />
        </div>
      </div>
    );
  }

  const percentage = getUsagePercentage(used, limit);
  const nearLimit = isNearLimit(used, limit);
  const atLimit = isAtLimit(used, limit);
  const barColor = atLimit ? 'bg-red-500' : nearLimit ? 'bg-yellow-500' : 'bg-primary';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${atLimit ? 'text-red-500' : nearLimit ? 'text-yellow-600' : ''}`}>
          {formatTokenCount(used)} / {formatTokenCount(limit)} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
      {resetAt && (
        <p className="text-xs text-muted-foreground">
          Resets: {new Date(resetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
};

export const UsageConsumption: React.FC = () => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [pricingData, setPricingData] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) return;

    const loadData = async () => {
      const [usageRes, pricingRes] = await Promise.all([
        getUserUsage(),
        getPricingTiers(),
      ]);

      if (usageRes.enabled && usageRes.usage) {
        setUsage(usageRes.usage);
      }
      setPricingData(pricingRes);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <GlassMorphicCard>
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </GlassMorphicCard>
    );
  }

  // Pricing not enabled (self-hosted) - don't show
  if (!pricingData?.enabled || !usage) {
    return null;
  }

  const isPro = usage.tier === 'pro';
  const monthlyNearLimit = usage.monthly_token_limit > 0 && isNearLimit(usage.monthly_tokens_used, usage.monthly_token_limit);

  return (
    <>
      <GlassMorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Usage & Limits</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
            isPro
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-muted text-muted-foreground border border-border'
          }`}>
            {usage.tier}
          </span>
        </div>

        <div className="space-y-4">
          <UsageBar
            label="Daily Tokens"
            used={usage.daily_tokens_used}
            limit={usage.daily_token_limit}
            resetAt={usage.daily_resets_at}
          />
          <UsageBar
            label="Monthly Tokens"
            used={usage.monthly_tokens_used}
            limit={usage.monthly_token_limit}
            resetAt={usage.monthly_resets_at}
          />
          <UsageBar
            label="Daily Investigations"
            used={usage.daily_investigations_used}
            limit={usage.daily_investigation_limit}
            resetAt={usage.daily_resets_at}
          />
          <UsageBar
            label="Monthly Investigations"
            used={usage.monthly_investigations_used}
            limit={usage.monthly_investigation_limit}
            resetAt={usage.monthly_resets_at}
          />
        </div>

        {/* Agent limit */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Agent Limit</span>
            <span className="font-medium">{formatLimit(usage.max_agents)}</span>
          </div>
        </div>

        {/* Near limit warning for Pro users */}
        {isPro && monthlyNearLimit && pricingData?.credit_bundle_tokens && pricingData?.credit_bundle_price && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Approaching token limit
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                  You've used over 90% of your monthly tokens.
                </p>
                <button
                  onClick={() => setShowBuyCredits(true)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-yellow-800 dark:text-yellow-300 underline hover:no-underline"
                >
                  <CreditCard className="h-3 w-3" />
                  Buy Credits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Free tier - upgrade prompt */}
        {!isPro && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Crown className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Unlock more with Pro</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unlimited agents, {formatTokenCount(10000000)} monthly tokens, and more.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary underline hover:no-underline"
                >
                  <Zap className="h-3 w-3" />
                  View Pro plan
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassMorphicCard>

      {/* Buy Credits Dialog */}
      {pricingData?.credit_bundle_tokens && pricingData?.credit_bundle_price && (
        <BuyCreditsDialog
          open={showBuyCredits}
          onOpenChange={setShowBuyCredits}
          bundleTokens={pricingData.credit_bundle_tokens}
          bundlePrice={pricingData.credit_bundle_price}
          currency={pricingData.currency || 'eur'}
        />
      )}
    </>
  );
};
