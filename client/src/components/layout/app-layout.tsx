
import { Suspense, ReactNode } from "react";
import Header from "../shared/header";
import { MobileNav } from "../ui/mobile-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader } from "../ui/loader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 pb-16 md:pb-6">
        <Suspense fallback={<Loader size={32} text="Loading..." />}>
          {children}
        </Suspense>
      </main>
      {isMobile && <MobileNav />}
    </div>
  );
}
