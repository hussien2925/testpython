import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../storage/storage';
import { Address } from '../types';

interface AddressesContextValue {
  addresses: Address[];
  loaded: boolean;
  addAddress: (input: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Address>;
  updateAddress: (id: string, patch: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  getAddressByName: (name: string) => Address | undefined;
}

const AddressesContext = createContext<AddressesContextValue | null>(null);

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AddressesProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log('[AddressesProvider] Loading addresses...');
        const stored = await readJSON<Address[]>('addresses', []);
        console.log('[AddressesProvider] Loaded:', stored);
        setAddresses(stored);
        setLoaded(true);
      } catch (err) {
        console.error('[AddressesProvider] Error:', err);
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Address[]) => {
    setAddresses(next);
    await writeJSON('addresses', next);
  }, []);

  const addAddress = useCallback(
    async (input: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const address: Address = {
        id: genId(),
        ...input,
        createdAt: now,
        updatedAt: now,
      };
      await persist([...addresses, address]);
      return address;
    },
    [addresses, persist]
  );

  const updateAddress = useCallback(
    async (id: string, patch: Partial<Address>) => {
      const next = addresses.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
      );
      await persist(next);
    },
    [addresses, persist]
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      await persist(addresses.filter((a) => a.id !== id));
    },
    [addresses, persist]
  );

  const getAddressByName = useCallback(
    (name: string) => {
      return addresses.find((a) => a.name.toLowerCase() === name.toLowerCase());
    },
    [addresses]
  );

  return (
    <AddressesContext.Provider
      value={{ addresses, loaded, addAddress, updateAddress, deleteAddress, getAddressByName }}
    >
      {children}
    </AddressesContext.Provider>
  );
}

export function useAddresses(): AddressesContextValue {
  const ctx = useContext(AddressesContext);
  if (!ctx) throw new Error('useAddresses must be used within AddressesProvider');
  return ctx;
}
