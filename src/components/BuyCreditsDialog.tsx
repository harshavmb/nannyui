import React, { useState } from 'react';
import { CreditCard, Minus, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buyCredits, formatTokenCount, getCurrencySymbol } from '@/services/pricingService';
import { useToast } from '@/hooks/use-toast';

interface BuyCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundleTokens: number;
  bundlePrice: number;
  currency: string;
}

export const BuyCreditsDialog: React.FC<BuyCreditsDialogProps> = ({
  open,
  onOpenChange,
  bundleTokens,
  bundlePrice,
  currency,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const currencySymbol = getCurrencySymbol(currency);
  const totalPrice = quantity * bundlePrice;
  const totalTokens = quantity * bundleTokens;

  const handleBuy = async () => {
    setLoading(true);
    const result = await buyCredits(quantity);
    setLoading(false);

    if (result.error) {
      toast({
        title: 'Purchase Error',
        description: result.error,
        variant: 'destructive',
      });
    } else if (result.checkout_url) {
      window.location.href = result.checkout_url;
    }
  };

  const incrementQuantity = () => {
    if (quantity < 100) setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Buy Additional Credits
          </DialogTitle>
          <DialogDescription>
            Purchase additional token credits for the current billing period.
            Credits do not roll over to the next month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Credit Bundle</p>
              <p className="text-sm text-muted-foreground">
                {formatTokenCount(bundleTokens)} tokens per bundle
              </p>
            </div>
            <p className="font-bold text-lg">{currencySymbol}{bundlePrice}</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="text-center min-w-[80px]">
              <p className="text-3xl font-bold">{quantity}</p>
              <p className="text-xs text-muted-foreground">
                {quantity === 1 ? 'bundle' : 'bundles'}
              </p>
            </div>
            <button
              onClick={incrementQuantity}
              disabled={quantity >= 100}
              className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tokens</span>
              <span className="font-medium">{formatTokenCount(totalTokens)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{currencySymbol}{totalPrice}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Purchase
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
