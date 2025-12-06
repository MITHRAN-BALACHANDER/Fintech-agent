/**
 * Wallet Management Component
 * UI for viewing and managing connected wallets
 */
'use client';

import { useState } from 'react';
import { WalletAPI } from '@/lib/wallet-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/src/store/auth.context';
import { useWalletState } from '@/contexts/wallet-context';
import {
  Wallet,
  Star,
  Trash2,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface WalletManagerProps {
  tenantId?: string;
  userId?: string;
}

export function WalletManager({ tenantId: propTenantId, userId: propUserId }: WalletManagerProps = {}) {
  const { user } = useAuth();
  const { wallets: contextWallets, loading: contextLoading, refreshWallets } = useWalletState();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

  // Use context wallets and loading state
  const wallets = contextWallets;
  const loading = contextLoading;

  // Use props if provided, otherwise use auth context
  const tenantId = propTenantId || 'default';
  const userId = propUserId || user?.id || '';

  const loadWallets = refreshWallets;

  const handleSetPrimary = async (walletId: string) => {
    try {
      setActionLoading(walletId);
      await WalletAPI.setPrimaryWallet(walletId, tenantId, userId);
      toast.success('Primary wallet updated');
      await loadWallets();
    } catch (error) {
      toast.error('Failed to set primary wallet');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (walletId: string) => {
    try {
      setActionLoading(walletId);
      await WalletAPI.disconnectWallet(walletId, tenantId, userId);
      toast.success('Wallet disconnected');
      await loadWallets();
      setWalletToDelete(null);
    } catch (error) {
      toast.error('Failed to disconnect wallet');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const getChainName = (chainId: number): string => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum',
      8453: 'Base',
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const getExplorerUrl = (address: string, chainId: number): string => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/address/',
      137: 'https://polygonscan.com/address/',
      10: 'https://optimistic.etherscan.io/address/',
      42161: 'https://arbiscan.io/address/',
      8453: 'https://basescan.org/address/',
    };
    return (explorers[chainId] || 'https://etherscan.io/address/') + address;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Wallets</CardTitle>
          <CardDescription>Loading your wallet connections...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (wallets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Wallets</CardTitle>
          <CardDescription>
            No wallets connected yet. Connect your wallet to track your crypto portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Use the Connect Wallet button to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Connected Wallets</CardTitle>
              <CardDescription>
                Manage your crypto wallet connections. Your private keys are always secure in your wallet.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadWallets}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-500">Wallets Saved to Account</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your {wallets.length} connected wallet{wallets.length !== 1 ? 's are' : ' is'} automatically saved. 
                  You can view them anytime, even when not connected to your wallet provider.
                </p>
              </div>
            </div>

            {wallets.map((wallet, index) => (
              <div key={wallet.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{wallet.label}</span>
                      {wallet.is_primary && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                      <Badge variant="outline">{wallet.wallet_type}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <code className="bg-muted px-2 py-1 rounded font-mono">
                        {wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyAddress(wallet.wallet_address)}
                        className="h-6 w-6"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <a
                        href={getExplorerUrl(wallet.wallet_address, wallet.chain_id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{getChainName(wallet.chain_id)}</span>
                      {wallet.verified_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!wallet.is_primary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetPrimary(wallet.id)}
                        disabled={actionLoading === wallet.id}
                      >
                        {actionLoading === wallet.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-1" />
                            Set Primary
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setWalletToDelete(wallet.id)}
                      disabled={actionLoading === wallet.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!walletToDelete}
        onOpenChange={(open) => !open && setWalletToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the wallet connection from your account. You can always
              reconnect it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => walletToDelete && handleDisconnect(walletToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
