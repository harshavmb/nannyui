
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Server, Crown, Zap, RefreshCw, CreditCard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TransitionWrapper from '@/components/TransitionWrapper';
import { getPricingTiers, subscribeToPro, formatLimit, formatTokenCount, type PricingTier, type PricingResponse } from '@/services/pricingService';
import { isAuthenticated } from '@/integrations/pocketbase/client';
import { useToast } from '@/hooks/use-toast';

const PlanFeature: React.FC<{ name: string; included: boolean }> = ({ name, included }) => (
  <div className="flex items-center mb-3">
    {included ? (
      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
    )}
    <span className={included ? '' : 'text-muted-foreground line-through'}>{name}</span>
  </div>
);

const Pricing = () => {
  const [pricingData, setPricingData] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadPricing = async () => {
      setLoading(true);
      const data = await getPricingTiers();
      setPricingData(data);
      setLoading(false);
    };
    loadPricing();
  }, []);

  const handleSubscribe = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setSubscribing(true);
    const result = await subscribeToPro();
    setSubscribing(false);

    if (result.error) {
      toast({
        title: 'Subscription Error',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.checkout_url) {
      window.location.href = result.checkout_url;
    }
  };

  const getTierFeatures = (tier: PricingTier): { name: string; included: boolean }[] => {
    const isUnlimited = (val: number) => val === -1;
    const isFree = tier.name === 'free';

    return [
      {
        name: isUnlimited(tier.max_agents) ? 'Unlimited agents' : `Up to ${tier.max_agents} agents`,
        included: true,
      },
      {
        name: isUnlimited(tier.daily_token_limit)
          ? 'Unlimited daily tokens'
          : `${formatTokenCount(tier.daily_token_limit)} tokens / day`,
        included: true,
      },
      {
        name: isUnlimited(tier.monthly_token_limit)
          ? 'Unlimited monthly tokens'
          : `${formatTokenCount(tier.monthly_token_limit)} tokens / month`,
        included: true,
      },
      {
        name: isUnlimited(tier.daily_investigation_limit)
          ? 'Unlimited daily investigations'
          : `${tier.daily_investigation_limit} investigations / day`,
        included: true,
      },
      {
        name: isUnlimited(tier.monthly_investigation_limit)
          ? 'Unlimited monthly investigations'
          : `${tier.monthly_investigation_limit} investigations / month`,
        included: true,
      },
      {
        name: 'Buy additional credits',
        included: !isFree,
      },
      {
        name: 'Priority support',
        included: !isFree,
      },
    ];
  };

  const currency = pricingData?.currency || 'eur';
  const currencySymbol = currency === 'eur' ? '€' : currency === 'usd' ? '$' : currency.toUpperCase() + ' ';

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto">
          <div className="container py-8 px-4">
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <motion.h1 
                className="text-4xl font-bold tracking-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Simple, Transparent Pricing
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground mt-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Choose the plan that best fits your needs. Upgrade anytime.
              </motion.p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading pricing plans...</p>
              </div>
            ) : !pricingData?.enabled ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {pricingData?.message || 'Pricing is not enabled on this instance. All features are available.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                  {pricingData.tiers?.map((tier, i) => {
                    const isFree = tier.name === 'free';
                    const isPro = tier.name === 'pro';
                    const features = getTierFeatures(tier);
                    const Icon = isFree ? Server : Crown;

                    return (
                      <motion.div
                        key={tier.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i, duration: 0.4 }}
                        className="flex flex-col"
                      >
                        <Card className={`h-full flex flex-col ${isPro ? 'border-2 border-primary shadow-lg relative' : ''}`}>
                          {isPro && (
                            <div className="bg-primary text-primary-foreground text-xs font-medium text-center py-1 rounded-t-md">
                              RECOMMENDED
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isPro ? 'bg-primary/10' : 'bg-muted'}`}>
                                <Icon className={`h-5 w-5 ${isPro ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <CardTitle className="capitalize text-2xl">{tier.name}</CardTitle>
                            </div>
                            <div className="mt-2 flex items-baseline">
                              <span className="text-4xl font-bold">
                                {tier.price_per_month === 0 ? 'Free' : `${currencySymbol}${tier.price_per_month}`}
                              </span>
                              {tier.price_per_month > 0 && (
                                <span className="text-muted-foreground ml-1">/month</span>
                              )}
                            </div>
                            <CardDescription className="mt-2">
                              {isFree
                                ? 'Get started with essential features for personal use'
                                : 'For professionals who need more power and flexibility'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <div className="pt-2">
                              {features.map((feature, index) => (
                                <PlanFeature 
                                  key={index} 
                                  name={feature.name} 
                                  included={feature.included} 
                                />
                              ))}
                            </div>
                            
                            {/* Reset info */}
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <RefreshCw className="h-3 w-3" />
                                <span>Daily limits reset at midnight, monthly on the 1st</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            {isFree ? (
                              <button
                                onClick={() => navigate(isAuthenticated() ? '/dashboard' : '/login')}
                                className="w-full py-2.5 px-4 rounded-md text-center bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors"
                              >
                                {isAuthenticated() ? 'Current Plan' : 'Get Started Free'}
                              </button>
                            ) : (
                              <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className="w-full py-2.5 px-4 rounded-md text-center bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {subscribing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    Subscribe to Pro
                                    <ArrowRight className="h-4 w-4" />
                                  </>
                                )}
                              </button>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Credit Bundle Section */}
                {pricingData.credit_bundle_tokens && pricingData.credit_bundle_price && (
                  <motion.div
                    className="max-w-4xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <Card className="border border-border/50 bg-muted/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">Need More Tokens?</h3>
                              <p className="text-muted-foreground text-sm">
                                Pro subscribers can purchase additional credit bundles when approaching limits.
                              </p>
                            </div>
                          </div>
                          <div className="text-center md:text-right">
                            <div className="text-2xl font-bold">
                              {currencySymbol}{pricingData.credit_bundle_price}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              per {formatTokenCount(pricingData.credit_bundle_tokens)} tokens
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              One-time purchase, valid for the current month
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Comparison Table */}
                <motion.div
                  className="max-w-4xl mx-auto mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-center mb-8">Plan Comparison</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Feature</th>
                          {pricingData.tiers?.map((tier) => (
                            <th key={tier.name} className="text-center py-3 px-4 font-medium capitalize">
                              {tier.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Agents</td>
                          {pricingData.tiers?.map((tier) => (
                            <td key={tier.name} className="text-center py-3 px-4 font-medium">
                              {formatLimit(tier.max_agents)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Daily Tokens</td>
                          {pricingData.tiers?.map((tier) => (
                            <td key={tier.name} className="text-center py-3 px-4 font-medium">
                              {tier.daily_token_limit === -1 ? 'Unlimited' : formatTokenCount(tier.daily_token_limit)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Monthly Tokens</td>
                          {pricingData.tiers?.map((tier) => (
                            <td key={tier.name} className="text-center py-3 px-4 font-medium">
                              {tier.monthly_token_limit === -1 ? 'Unlimited' : formatTokenCount(tier.monthly_token_limit)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Daily Investigations</td>
                          {pricingData.tiers?.map((tier) => (
                            <td key={tier.name} className="text-center py-3 px-4 font-medium">
                              {formatLimit(tier.daily_investigation_limit)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Monthly Investigations</td>
                          {pricingData.tiers?.map((tier) => (
                            <td key={tier.name} className="text-center py-3 px-4 font-medium">
                              {formatLimit(tier.monthly_investigation_limit)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Buy Credits</td>
                          {pricingData.tiers?.map((tier) => (
                            <td key={tier.name} className="text-center py-3 px-4">
                              {tier.name === 'free' ? (
                                <X className="h-5 w-5 text-muted-foreground mx-auto" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 text-muted-foreground">Price</td>
                          {pricingData.tiers?.map((tier) => (
                            <td key={tier.name} className="text-center py-3 px-4 font-bold">
                              {tier.price_per_month === 0 ? 'Free' : `${currencySymbol}${tier.price_per_month}/mo`}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}
            
            {/* Enterprise CTA */}
            <motion.div
              className="max-w-3xl mx-auto text-center bg-muted/30 p-8 rounded-lg border border-border/50 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
              <p className="text-muted-foreground mb-6">
                For requirements beyond the Pro tier, contact us at{' '}
                <a href="mailto:support@nannyai.dev" className="text-primary hover:underline">
                  support@nannyai.dev
                </a>
              </p>
              <a
                href="mailto:support@nannyai.dev"
                className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-6 rounded-md transition-colors"
              >
                Contact Us
              </a>
            </motion.div>
          </div>
          <Footer />
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Pricing;
