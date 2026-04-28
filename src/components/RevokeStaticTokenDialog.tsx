import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { revokeStaticToken } from '@/services/staticTokenService';
import { useToast } from '@/hooks/use-toast';

export interface RevokeStaticTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId: string;
  tokenName: string;
  onTokenRevoked: () => void;
}

const RevokeStaticTokenDialog: React.FC<RevokeStaticTokenDialogProps> = ({
  open,
  onOpenChange,
  tokenId,
  tokenName,
  onTokenRevoked,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRevoke = async () => {
    setLoading(true);
    setError(null);

    try {
      await revokeStaticToken(tokenId);
      onTokenRevoked();
      onOpenChange(false);
      toast({
        title: 'Token revoked',
        description: `"${tokenName}" has been permanently revoked.`,
      });
    } catch (err: unknown) {
      const e = err as Record<string, unknown> | undefined;
      const message = (e?.data as Record<string, unknown>)?.error as string || (e?.message as string) || 'Failed to revoke token';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revoke Token</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The token will be permanently invalidated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Are you sure you want to revoke "{tokenName}"?
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Any systems using this token will immediately lose access.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={loading}
            data-testid="confirm-revoke-button"
          >
            {loading ? 'Revoking…' : 'Revoke Token'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevokeStaticTokenDialog;
