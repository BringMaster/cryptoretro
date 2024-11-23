import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { ReactNode } from 'react';

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#3b82f6',
        },
      }}
      allowedRedirectOrigins={['http://retrotoken.io:3000']}
    >
      {children}
    </BaseClerkProvider>
  );
}
