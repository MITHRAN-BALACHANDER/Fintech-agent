/**
 * Wallet Context
 * Shared state for wallet connections across the application
 */
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletAPI, type WalletConnection } from '@/lib/wallet-api';
import { useAuth } from '@/src/store/auth.context';

interface WalletContextType {
  wallets: WalletConnection[];
  loading: boolean;
  refreshWallets: () => Promise<void>;
  primaryWallet: WalletConnection | null;
  hasStoredWallets: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletStateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isConnected, address } = useAccount();
  const [wallets, setWallets] = useState<WalletConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasStoredWallets, setHasStoredWallets] = useState(false);

  const refreshWallets = useCallback(async () => {
    if (!user?.id) {
      setWallets([]);
      setHasStoredWallets(false);
      return;
    }

    try {
      setLoading(true);
      const data = await WalletAPI.listWallets('default', user.id);
      setWallets(data);
      setHasStoredWallets(data.length > 0);
      
      // Store wallet addresses in localStorage for quick check
      if (data.length > 0) {
        const addresses = data.map(w => w.wallet_address.toLowerCase());
        localStorage.setItem('stored_wallet_addresses', JSON.stringify(addresses));
      } else {
        localStorage.removeItem('stored_wallet_addresses');
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
      setWallets([]);
      setHasStoredWallets(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load wallets when user logs in or changes
  useEffect(() => {
    refreshWallets();
  }, [refreshWallets]);

  // Refresh when wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      // Small delay to ensure wallet is fully connected
      const timer = setTimeout(() => {
        refreshWallets();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, refreshWallets]);

  const primaryWallet = wallets.find(w => w.is_primary) || wallets[0] || null;

  return (
    <WalletContext.Provider value={{ wallets, loading, refreshWallets, primaryWallet, hasStoredWallets }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletState() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletState must be used within a WalletStateProvider');
  }
  return context;
}
