import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { createStaticToken, EXPIRY_OPTIONS, type ExpiryDays } from '@/services/staticTokenService';
import { useToast } from '@/hooks/use-toast';

export interface CreateStaticTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTokenCreated: () => void;
}

const CreateStaticTokenDialog: React.FC<CreateStaticTokenDialogProps> = ({
  open,
  onOpenChange,
  onTokenCreated,
}) => {
  const [name, setName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<ExpiryDays>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setExpiresInDays(0);
    setLoading(false);
    setError(null);
    setCreatedToken(null);
    setShowToken(false);
    setCopied(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Token name is required');
      return;
    }

    if (name.length > 120) {
      setError('Token name must be 120 characters or less');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createStaticToken(name.trim(), expiresInDays);
      setCreatedToken(response.token);
      onTokenCreated();
      toast({
        title: 'Token created',
        description: 'Copy the token now — it won\'t be shown again.',
      });
    } catch (err: unknown) {
      const e = err as Record<string, unknown> | undefined;
      const message = (e?.data as Record<string, unknown>)?.error as string || (e?.message as string) || 'Failed to create token';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard. Please select and copy the token manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Static API Token</DialogTitle>
          <DialogDescription>
            Static tokens are long-lived API keys. The token value is shown only once.
          </DialogDescription>
        </DialogHeader>

        {createdToken ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Token created successfully. Copy it now — it won't be shown again.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Token</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    readOnly
                    value={showToken ? createdToken : '•'.repeat(40)}
                    className="font-mono text-sm pr-10"
                    data-testid="created-token-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopy} data-testid="copy-token-button">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600">Copied to clipboard!</p>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="token-name">Name</Label>
              <Input
                id="token-name"
                placeholder="e.g. test, staging, prod"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                data-testid="token-name-input"
              />
              <p className="text-xs text-muted-foreground">A human-readable label for this token.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-expiry">Expiration</Label>
              <Select
                value={String(expiresInDays)}
                onValueChange={(v) => {
                  const nextValue = Number(v);
                  const matchedOption = EXPIRY_OPTIONS.find((opt) => opt.value === nextValue);
                  if (matchedOption) {
                    setError(null);
                    setExpiresInDays(matchedOption.value);
                  }
                }}
              >
                <SelectTrigger id="token-expiry" data-testid="token-expiry-select">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading} data-testid="create-token-submit">
                {loading ? 'Creating…' : 'Create Token'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateStaticTokenDialog;
