import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryProvider } from "@/providers/query-provider";

interface AppProvidersProps {
  children: ReactNode;
}
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
