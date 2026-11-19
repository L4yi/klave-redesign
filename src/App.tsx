import React from 'react';
import { CartDrawer } from './components/commerce/CartDrawer';
import { LicenseModal } from './components/commerce/LicenseModal';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { Navbar } from './components/layout/Navbar';
import { TrustModal } from './components/modals/TrustModal';
import { NeroDrawer } from './components/nero/NeroDrawer';
import { StickyPlayer } from './components/player/StickyPlayer';
import { AppProvider, useApp } from './context/AppContext';
import { BrowsePage } from './pages/BrowsePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ProducerPage } from './pages/ProducerPage';
import { ProducersPage } from './pages/ProducersPage';
import { ProfilePage } from './pages/ProfilePage';
import { StudioPage } from './pages/StudioPage';

const AppShell: React.FC = () => {
  const { view, toast } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {view === 'discover' && <DiscoverPage />}
        {view === 'browse' && <BrowsePage />}
        {view === 'producers' && <ProducersPage />}
        {view === 'producer' && <ProducerPage />}
        {view === 'studio' && <StudioPage />}
        {view === 'profile' && <ProfilePage />}
      </main>

      <Footer />
      <StickyPlayer />
      <MobileNav />

      <LicenseModal />
      <CartDrawer />
      <NeroDrawer />
      <TrustModal />

      {toast && (
        <div
          role="status"
          className="fixed right-4 bottom-36 z-50 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-xl md:bottom-24"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: toast.tone === 'success' ? 'var(--verified)' : 'var(--border-strong)',
            color: 'var(--text-primary)',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
