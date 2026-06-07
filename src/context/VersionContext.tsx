'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppVersion = 'mobile' | 'web' | null;

interface VersionContextType {
  version: AppVersion;
  setVersion: (v: 'mobile' | 'web') => void;
}

const VersionContext = createContext<VersionContextType>({ version: null, setVersion: () => {} });

export function VersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<AppVersion>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app-version') as AppVersion;
    setVersionState(saved === 'mobile' || saved === 'web' ? saved : null);
    setLoaded(true);
  }, []);

  function setVersion(v: 'mobile' | 'web') {
    localStorage.setItem('app-version', v);
    setVersionState(v);
  }

  if (!loaded) return null;

  return (
    <VersionContext.Provider value={{ version, setVersion }}>
      {children}
    </VersionContext.Provider>
  );
}

export const useVersion = () => useContext(VersionContext);
