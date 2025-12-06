/**
 * useWalletAuth Hook
 * React hook for wallet authentication with SIWE flow
 */
'use client';

import { useState, useCallback } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { WalletAPI, type WalletConnection, type WalletJWT } from '@/lib/wallet-api';
import { toast } from 'sonner';

interface UseWalletAuthReturn {
  isConnecting: boolean;
  isVerifying: boolean;
  connectedWallet: WalletConnection | null;
  walletAuth: WalletJWT | null;
  connectAndVerify: () => Promise<void>;
  disconnect: () => void;
  error: Error | null;
}

export function useWalletAuth(
  tenantId: string,
  userId: string
): UseWalletAuthReturn {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect: disconnectWallet } = useDisconnect();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletConnection | null>(null);
  const [walletAuth, setWalletAuth] = useState<WalletJWT | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const connectAndVerify = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Request nonce from backend
      toast.info('Requesting authentication nonce...');
      const nonceData = await WalletAPI.requestNonce(address);

      // Step 2: Sign the message with wallet
      toast.info('Please sign the message in your wallet...');
      const signature = await signMessageAsync({
        message: nonceData.message,
      });

      // Step 3: Verify signature on backend
      setIsVerifying(true);
      toast.info('Verifying signature...');
      
      // Determine wallet type (basic detection)
      let walletType = 'walletconnect';
      if (window.ethereum?.isMetaMask) {
        walletType = 'metamask';
      } else if (window.ethereum?.isCoinbaseWallet) {
        walletType = 'coinbase';
      }

      const result = await WalletAPI.verifyAndConnect(
        address,
        signature,
        nonceData.nonce,
        chainId || 1,
        walletType,
        tenantId,
        userId
      );

      // Store wallet connection and auth token
      setConnectedWallet(result.wallet);
      setWalletAuth(result.auth);

      // Store JWT in localStorage for persistence
      localStorage.setItem('wallet_jwt', result.auth.access_token);
      localStorage.setItem('wallet_address', result.wallet.wallet_address);

      toast.success('Wallet connected successfully!');
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(error.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', error);
    } finally {
      setIsConnecting(false);
      setIsVerifying(false);
    }
  }, [address, isConnected, chainId, signMessageAsync, tenantId, userId]);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setConnectedWallet(null);
    setWalletAuth(null);
    localStorage.removeItem('wallet_jwt');
    localStorage.removeItem('wallet_address');
    toast.info('Wallet disconnected');
  }, [disconnectWallet]);

  return {
    isConnecting,
    isVerifying,
    connectedWallet,
    walletAuth,
    connectAndVerify,
    disconnect,
    error,
  };
}
