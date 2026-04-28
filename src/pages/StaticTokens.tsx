import React, { useState, useEffect, useCallback } from 'react';
import { Key, Plus, Trash2, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import CreateStaticTokenDialog from '@/components/CreateStaticTokenDialog';
import RevokeStaticTokenDialog from '@/components/RevokeStaticTokenDialog';
import withAuth from '@/utils/withAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  listStaticTokens,
  formatTokenExpiry,
  formatLastUsed,
  type StaticTokenInfo,
} from '@/services/staticTokenService';

const StaticTokens = () => {
  const [tokens, setTokens] = useState<StaticTokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      const result = await listStaticTokens();
      setTokens(result);
      setHasError(false);
    } catch (err: unknown) {
      const e = err as Record<string, unknown> | undefined;
      const message = (e?.data as Record<string, unknown>)?.error as string || (e?.message as string) || 'Failed to load tokens';
      setErrorMessage(message);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const activeTokens = tokens.filter((t) => !t.revoked);
  const revokedTokens = tokens.filter((t) => t.revoked);

  const getExpiryStatus = (token: StaticTokenInfo) => {
    if (token.revoked) return 'revoked';
    if (!token.expires_at) return 'active';
    return new Date(token.expires_at) < new Date() ? 'expired' : 'active';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Navbar />

          <TransitionWrapper className="flex-1 p-6">
            <div className="container pb-8">
              {hasError && (
                <ErrorBanner
                  message={errorMessage}
                  onDismiss={() => setHasError(false)}
                />
              )}

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Static API Tokens</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage long-lived API tokens for agent deployment automation. <br></br>Same token could be shared among multiple agents.
                  </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} data-testid="create-token-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Token
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Active Tokens */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <GlassMorphicCard className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Key className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Active Tokens</h2>
                        <Badge variant="secondary" className="ml-auto">
                          {activeTokens.length}
                        </Badge>
                      </div>

                      {activeTokens.length === 0 ? (
                        <div className="text-center py-12">
                          <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No active tokens</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Create a token to get started with API access.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeTokens.map((token) => {
                            const status = getExpiryStatus(token);
                            return (
                              <div
                                key={token.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                data-testid={`token-row-${token.id}`}
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Key className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{token.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                      {token.token_prefix}…
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6 flex-shrink-0">
                                  <div className="text-right hidden sm:block">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Expires: {formatTokenExpiry(token.expires_at)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Last used: {formatLastUsed(token.last_used_at)}
                                    </p>
                                  </div>

                                  <Badge variant={status === 'expired' ? 'destructive' : 'default'}>
                                    {status}
                                  </Badge>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setRevokeTarget({ id: token.id, name: token.name })}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    data-testid={`revoke-token-${token.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </GlassMorphicCard>
                  </motion.div>

                  {/* Revoked Tokens */}
                  {revokedTokens.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <GlassMorphicCard>
                        <div className="flex items-center gap-2 mb-4">
                          <Key className="h-5 w-5 text-muted-foreground" />
                          <h2 className="text-lg font-semibold text-muted-foreground">Revoked Tokens</h2>
                          <Badge variant="outline" className="ml-auto">
                            {revokedTokens.length}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          {revokedTokens.map((token) => (
                            <div
                              key={token.id}
                              className="flex items-center justify-between p-4 border rounded-lg opacity-60"
                              data-testid={`token-row-${token.id}`}
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                  <Key className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate line-through">{token.name}</p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {token.token_prefix}…
                                  </p>
                                </div>
                              </div>

                              <Badge variant="destructive">revoked</Badge>
                            </div>
                          ))}
                        </div>
                      </GlassMorphicCard>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </TransitionWrapper>
        </div>
      </div>
      <Footer />

      <CreateStaticTokenDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onTokenCreated={fetchTokens}
      />

      {revokeTarget && (
        <RevokeStaticTokenDialog
          open={!!revokeTarget}
          onOpenChange={(isOpen) => !isOpen && setRevokeTarget(null)}
          tokenId={revokeTarget.id}
          tokenName={revokeTarget.name}
          onTokenRevoked={fetchTokens}
        />
      )}
    </div>
  );
};

export default withAuth(StaticTokens);
