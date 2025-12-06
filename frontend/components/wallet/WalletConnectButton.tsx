/**
 * WalletConnectButton Component
 * UI component for connecting crypto wallets with SIWE authentication
 */
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWalletAuth } from '@/hooks/use-wallet-auth';
import { Loader2, Wallet, CheckCircle2 } from 'lucide-react';

interface WalletConnectButtonProps {
  tenantId: string;
  userId: string;
  onConnected?: () => void;
}

export function WalletConnectButton({
  tenantId,
  userId,
  onConnected,
}: WalletConnectButtonProps) {
  const { isConnected, address } = useAccount();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const {
    isConnecting,
    isVerifying,
    connectedWallet,
    connectAndVerify,
    disconnect,
  } = useWalletAuth(tenantId, userId);

  // Show auth dialog when wallet connects but not yet verified
  useEffect(() => {
    if (isConnected && !connectedWallet) {
      setTimeout(() => setShowAuthDialog(true), 0);
    }
  }, [isConnected, connectedWallet]);

  // Call onConnected callback when wallet is verified
  useEffect(() => {
    if (connectedWallet && onConnected) {
      onConnected();
      setTimeout(() => setShowAuthDialog(false), 0);
    }
  }, [connectedWallet, onConnected]);

  const handleAuthenticate = async () => {
    await connectAndVerify();
  };

  return (
    <>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button onClick={openConnectModal} variant="default">
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="destructive">
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <div className="flex gap-2">
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          {chain.iconUrl && (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 16, height: 16 }}
                              />
                            </>
                          )}
                        </div>
                      )}
                      {chain.name}
                    </Button>

                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {connectedWallet ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Wallet className="h-4 w-4" />
                      )}
                      {account.displayName}
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authenticate Your Wallet</DialogTitle>
            <DialogDescription>
              Sign a message to prove you own this wallet. This connects your wallet
              to your FinSIght account securely.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Wallet Address</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {address}
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ No gas fees required</p>
              <p>✓ Your private keys stay secure in your wallet</p>
              <p>✓ We only store your public address</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAuthenticate}
                disabled={isConnecting || isVerifying}
                className="flex-1"
              >
                {isConnecting || isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isVerifying ? 'Verifying...' : 'Sign Message...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Authenticate
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  disconnect();
                  setShowAuthDialog(false);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
