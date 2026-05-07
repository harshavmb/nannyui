import React, { useState, useEffect } from 'react';
import { Crown, CreditCard, AlertTriangle, CheckCircle, RefreshCw, ExternalLink, Zap, Shield } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import { BuyCreditsDialog } from '@/components/BuyCreditsDialog';
import {
  getUserUsage,
  getSubscription,
  getPricingTiers,
  getInvoices,
  cancelSubscription,
  reactivateSubscription,
  subscribeToPro,
  formatLimit,
  formatTokenCount,
  getUsagePercentage,
  isNearLimit,
  isAtLimit,
  type UsageData,
  type SubscriptionInfo,
  type PricingResponse,
  type InvoiceItem,
} from '@/services/pricingService';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionSectionProps {
  userTier?: string;
}

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

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ userTier }) => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [pricingData, setPricingData] = useState<PricingResponse | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const [usageRes, subRes, pricingRes] = await Promise.all([
      getUserUsage(),
      getSubscription(),
      getPricingTiers(),
    ]);

    if (usageRes.enabled && usageRes.usage) {
      setUsage(usageRes.usage);
    }
    setSubscription(subRes);
    setPricingData(pricingRes);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Handle success redirects from Stripe
    if (searchParams.get('subscribed') === 'true') {
      toast({
        title: 'Subscription Active',
        description: 'Welcome to Pro! Your subscription is now active.',
      });
      loadData();
    }
    if (searchParams.get('credits') === 'added') {
      toast({
        title: 'Credits Added',
        description: 'Your additional token credits have been applied.',
      });
      loadData();
    }
  }, [searchParams]);

  const handleLoadInvoices = async () => {
    if (showInvoices && invoices.length > 0) {
      setShowInvoices(false);
      return;
    }
    setShowInvoices(true);
    const result = await getInvoices();
    if (result.invoices) {
      setInvoices(result.invoices);
    } else if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleSubscribe = async () => {
    setActionLoading('subscribe');
    const result = await subscribeToPro();
    setActionLoading(null);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if (result.checkout_url) {
      window.location.href = result.checkout_url;
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain Pro access until the end of your current billing period.')) {
      return;
    }
    setActionLoading('cancel');
    const result = await cancelSubscription();
    setActionLoading(null);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Subscription Cancelled', description: 'Your subscription will end at the current billing period.' });
      loadData();
    }
  };

  const handleReactivate = async () => {
    setActionLoading('reactivate');
    const result = await reactivateSubscription();
    setActionLoading(null);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Subscription Reactivated', description: 'Your subscription will continue as normal.' });
      loadData();
    }
  };

  if (loading) {
    return (
      <GlassMorphicCard className="mt-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </GlassMorphicCard>
    );
  }

  // Pricing not enabled (self-hosted) - don't show anything
  if (!pricingData?.enabled) {
    return null;
  }

  const effectiveTier = usage?.tier || userTier || 'free';
  const isPro = effectiveTier === 'pro';
  const hasActiveSubscription = subscription?.has_subscription && subscription.status === 'active';
  const isCancelPending = subscription?.cancel_at_period_end;

  // Determine if tier is admin-sponsored (user has pro tier but no active Stripe subscription)
  const isAdminSponsored = isPro && !hasActiveSubscription;

  // Check if near token limit (for buy credits prompt)
  const monthlyNearLimit = usage && usage.monthly_token_limit > 0 && isNearLimit(usage.monthly_tokens_used, usage.monthly_token_limit);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tier Badge & Subscription Status */}
        <GlassMorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Crown className={`h-5 w-5 ${isPro ? 'text-primary' : 'text-muted-foreground'}`} />
            Subscription & Tier
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
            isPro
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-muted text-muted-foreground border border-border'
          }`}>
            {effectiveTier}
          </span>
        </div>

        {/* Admin-sponsored tier notice */}
        {isAdminSponsored && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Admin-Sponsored Tier</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Your Pro tier has been granted by an administrator. This is independent of any payment subscription.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active subscription details */}
        {hasActiveSubscription && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{subscription.plan_name || 'Pro'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1">
                {isCancelPending ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-yellow-600 font-medium">Cancelling</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600 font-medium">Active</span>
                  </>
                )}
              </span>
            </div>
            {subscription.current_period_end && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {isCancelPending ? 'Access until' : 'Next billing date'}
                </span>
                <span className="font-medium">
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Subscription actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
          {!hasActiveSubscription && !isAdminSponsored && (
            <button
              onClick={handleSubscribe}
              disabled={actionLoading === 'subscribe'}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {actionLoading === 'subscribe' ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              Upgrade to Pro
            </button>
          )}
          {hasActiveSubscription && !isCancelPending && (
            <button
              onClick={handleCancel}
              disabled={actionLoading === 'cancel'}
              className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          )}
          {hasActiveSubscription && isCancelPending && (
            <button
              onClick={handleReactivate}
              disabled={actionLoading === 'reactivate'}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {actionLoading === 'reactivate' ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Reactivate Subscription
            </button>
          )}
          {hasActiveSubscription && (
            <button
              onClick={handleLoadInvoices}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {showInvoices ? 'Hide Invoices' : 'View Invoices'}
            </button>
          )}
        </div>
      </GlassMorphicCard>

        {/* Right: Token & Usage Consumption */}
        {usage && (
          <GlassMorphicCard>
            <h3 className="font-medium mb-4">Token & Usage Consumption</h3>

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

            {/* Agent limit info */}
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
                      You've used over 90% of your monthly tokens. Purchase additional credits to continue without interruption.
                    </p>
                    <button
                      onClick={() => setShowBuyCredits(true)}
                      className="mt-2 text-xs font-medium text-yellow-800 dark:text-yellow-300 underline hover:no-underline"
                    >
                      Buy Credits ({pricingData.currency === 'eur' ? '€' : '$'}{pricingData.credit_bundle_price} per {formatTokenCount(pricingData.credit_bundle_tokens)} tokens)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Free tier upgrade prompt */}
            {!isPro && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Unlock more with Pro
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Get unlimited agents, {formatTokenCount(10000000)} monthly tokens, unlimited investigations, and more.
                    </p>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="mt-2 text-xs font-medium text-primary underline hover:no-underline"
                    >
                      View Pro plan details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pro Buy Credits button */}
            {isPro && hasActiveSubscription && pricingData?.credit_bundle_tokens && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <button
                  onClick={() => setShowBuyCredits(true)}
                  className="w-full py-2 px-4 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Buy Additional Credits
                </button>
              </div>
            )}
          </GlassMorphicCard>
        )}
      </div>

      {/* Invoices Section - Full Width */}
      {showInvoices && (
        <GlassMorphicCard className="mt-6">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Invoices
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Payments processed by Stripe. View and download invoices from your Stripe billing portal.
          </p>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices found.</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{invoice.invoice_number || 'Invoice'}</p>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(invoice.invoice_created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' · '}
                      {(invoice.currency || 'eur').toUpperCase()} {(invoice.amount_paid / 100).toFixed(2)}
                    </p>
                    {invoice.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{invoice.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {invoice.hosted_invoice_url && (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-muted rounded-md transition-colors"
                        title="View & download on Stripe"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View on Stripe
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassMorphicCard>
      )}

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
