'use client';

import { AuthProvider } from '@/contexts/auth-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <FirebaseErrorListener />
    </AuthProvider>
  );
}
