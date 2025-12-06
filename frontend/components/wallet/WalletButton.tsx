/**
 * Compact WalletButton for Top Navigation
 * Shows wallet connection status with connect/disconnect options
 */
'use client';

import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, Check, ExternalLink, Copy, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWalletState } from '@/contexts/wallet-context';
import { useAuth } from '@/src/store/auth.context';
import { WalletAPI } from '@/lib/wallet-api';
import { useEffect, useState } from 'react';

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { user } = useAuth();
  const router = useRouter();
  const { wallets, refreshWallets, hasStoredWallets } = useWalletState();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    const authenticateWallet = async () => {
      if (!isConnected || !address || !user?.id || isAuthenticating) return;
      
      // Check if this wallet is already saved
      const isWalletSaved = wallets.some(
        w => w.wallet_address.toLowerCase() === address.toLowerCase()
      );
      
      if (isWalletSaved) return; // Already authenticated
      
      // Auto-authenticate the wallet
      setIsAuthenticating(true);
      try {
        toast.info('Authenticating wallet...');
        
        // Step 1: Request nonce
        const nonceData = await WalletAPI.requestNonce(address);
        
        // Step 2: Sign message
        toast.info('Please sign the message in your wallet...');
        const signature = await signMessageAsync({
          message: nonceData.message,
        });
        
        // Step 3: Verify and save
        let walletType = 'walletconnect';
        if (typeof window !== 'undefined') {
          const ethereum = (window as { ethereum?: { isMetaMask?: boolean; isCoinbaseWallet?: boolean } }).ethereum;
          if (ethereum?.isMetaMask) {
            walletType = 'metamask';
          } else if (ethereum?.isCoinbaseWallet) {
            walletType = 'coinbase';
          }
        }
        
        await WalletAPI.verifyAndConnect(
          address,
          signature,
          nonceData.nonce,
          chain?.id || 1,
          walletType,
          'default',
          user.id
        );
        
        toast.success('Wallet authenticated and saved!');
        await refreshWallets();
      } catch (error) {
        console.error('Auto-authentication failed:', error);
        const errorMessage = error instanceof Error ? error.message : '';
        
        // Stop retrying on specific errors
        if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          console.error('Wallet API endpoint not available');
          setIsAuthenticating(false);
          return;
        }
        
        if (!errorMessage.includes('User rejected')) {
          toast.error('Failed to authenticate wallet');
        }
      } finally {
        setIsAuthenticating(false);
      }
    };
    
    // Only run if not already authenticating to prevent loops
    if (!isAuthenticating) {
      authenticateWallet();
    }
  }, [isConnected, address, user?.id, wallets, chain?.id, signMessageAsync, refreshWallets, isAuthenticating]);

  const handleCopyAddress = (addr?: string) => {
    const copyAddr = addr || address;
    if (copyAddr) {
      navigator.clipboard.writeText(copyAddr);
      toast.success('Address copied to clipboard');
    }
  };

  const handleViewProfile = () => {
    router.push('/profile?tab=wallet');
  };

  const getChainName = (chainId?: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum',
      8453: 'Base',
    };
    return chainId ? chains[chainId] || `Chain ${chainId}` : 'Unknown';
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <ConnectButton.Custom>
      {({ account, openConnectModal, mounted }) => {
        // Don't render until mounted (prevents hydration mismatch)
        if (!mounted) {
          return (
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <Wallet className="h-4 w-4" />
            </Button>
          );
        }

        // Not connected - show connect button or stored wallets
        if (!isConnected || !account) {
          // If user has stored wallets but not connected, show dropdown
          if (hasStoredWallets && wallets.length > 0) {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative"
                    title="Saved Wallets"
                  >
                    <Wallet className="h-4 w-4" />
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {wallets.length}
                    </Badge>
                    <span className="sr-only">Saved Wallets</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Saved Wallets</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="px-2 py-2 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      You have {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} saved in your account.
                    </p>
                    
                    {wallets.slice(0, 3).map((wallet) => (
                      <div key={wallet.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-3 w-3" />
                            <code className="text-xs font-mono truncate">
                              {truncateAddress(wallet.wallet_address)}
                            </code>
                            {wallet.is_primary && (
                              <Badge variant="default" className="text-[10px] h-4">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {getChainName(wallet.chain_id)}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleCopyAddress(wallet.wallet_address)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={openConnectModal} className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manage All Wallets
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          
          // No stored wallets - show simple connect button
          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative"
              onClick={openConnectModal}
              title="Connect Wallet"
            >
              <Wallet className="h-4 w-4" />
              <span className="sr-only">Connect Wallet</span>
            </Button>
          );
        }

        // Connected - show dropdown with wallet info
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                title="Wallet Connected"
              >
                <Wallet className="h-4 w-4" />
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-3 w-3 p-0 flex items-center justify-center"
                >
                  <Check className="h-2 w-2" />
                </Badge>
                <span className="sr-only">Wallet Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Wallet Connected</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Wallet Address */}
              <div className="px-2 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Address</span>
                  <Badge variant="secondary" className="text-xs">
                    {getChainName(chain?.id)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                    {truncateAddress(address || '')}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleCopyAddress()}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Actions */}
              <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer">
                <Wallet className="mr-2 h-4 w-4" />
                Manage Wallets
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  const explorerUrl = chain?.id === 1
                    ? `https://etherscan.io/address/${address}`
                    : chain?.id === 137
                    ? `https://polygonscan.com/address/${address}`
                    : chain?.id === 10
                    ? `https://optimistic.etherscan.io/address/${address}`
                    : chain?.id === 42161
                    ? `https://arbiscan.io/address/${address}`
                    : chain?.id === 8453
                    ? `https://basescan.org/address/${address}`
                    : `#`;
                  
                  if (explorerUrl !== '#') {
                    window.open(explorerUrl, '_blank');
                  }
                }}
                className="cursor-pointer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  disconnect();
                  toast.success('Wallet disconnected');
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }}
    </ConnectButton.Custom>
  );
}
