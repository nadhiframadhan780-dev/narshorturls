import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingView } from './components/LandingView.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { ApiDocsView } from './components/ApiDocsView.tsx';
import { AdminPanelView } from './components/AdminPanelView.tsx';
import { ResultModal } from './components/ResultModal.tsx';
import { QrCodeModal } from './components/QrCodeModal.tsx';
import { AnalyticsModal } from './components/AnalyticsModal.tsx';
import { BulkShortenModal } from './components/BulkShortenModal.tsx';
import { PricingModal } from './components/PricingModal.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { LegalModal } from './components/LegalModals.tsx';
import { GatePages } from './components/GatePages.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { LinkItem, User } from './types/index.ts';

const DEMO_USERS: Record<string, User> = {
  user_admin_01: {
    id: 'user_admin_01',
    name: 'Nadhif Ramadhan',
    email: 'admin@narshort.url',
    role: 'ADMIN',
    plan: 'BUSINESS',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  user_demo_02: {
    id: 'user_demo_02',
    name: 'Demo Creator',
    email: 'demo@narshort.url',
    role: 'USER',
    plan: 'PRO',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
};

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'api-docs' | 'admin'>('landing');
  const [currentUserId, setCurrentUserId] = useState<string>('user_admin_01');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [resultData, setResultData] = useState<{ link: LinkItem; shortUrl: string; displayUrl: string } | null>(null);
  const [selectedQrLink, setSelectedQrLink] = useState<LinkItem | null>(null);
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

  // Check URL query parameters for Gate Pages (e.g. ?page=password&code=xxx)
  const urlParams = new URLSearchParams(window.location.search);
  const gatePageParam = urlParams.get('page') as any;
  const gateCodeParam = urlParams.get('code') || '';

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentUser = DEMO_USERS[currentUserId] || DEMO_USERS.user_admin_01;

  // Render Gate page if triggered by redirect protection
  if (['password', 'preview', 'expired', 'blocked', '404', 'inactive'].includes(gatePageParam)) {
    return (
      <GatePages
        pageType={gatePageParam}
        code={gateCodeParam}
        onGoHome={() => {
          window.location.href = '/';
        }}
        onToast={addToast}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#0F172A] selection:bg-[#3730A3]/10 selection:text-[#3730A3]">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onSwitchUser={(id) => {
          setCurrentUserId(id);
          addToast(`Beralih ke profil: ${DEMO_USERS[id]?.name}`, 'info');
        }}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onQuickShorten={() => {
          if (activeView !== 'landing') {
            setActiveView('landing');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'landing' && (
          <LandingView
            onSuccessShorten={(res) => setResultData(res)}
            onOpenPricing={() => setIsPricingOpen(true)}
            onChangeView={setActiveView}
            onToast={addToast}
          />
        )}

        {activeView === 'dashboard' && (
          <Dashboard
            currentUserId={currentUserId}
            onOpenCreate={() => {
              setActiveView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBulk={() => setIsBulkOpen(true)}
            onOpenQr={(link) => setSelectedQrLink(link)}
            onOpenAnalytics={(id) => setSelectedAnalyticsId(id)}
            onToast={addToast}
          />
        )}

        {activeView === 'api-docs' && (
          <ApiDocsView currentUserId={currentUserId} onToast={addToast} />
        )}

        {activeView === 'admin' && <AdminPanelView onToast={addToast} />}
      </main>

      {/* Footer */}
      <Footer
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onChangeView={setActiveView}
      />

      {/* MODALS */}
      {/* 1. Shorten Result Modal */}
      <ResultModal
        isOpen={!!resultData}
        onClose={() => setResultData(null)}
        result={resultData}
        onOpenQr={(link) => setSelectedQrLink(link)}
        onToast={addToast}
      />

      {/* 2. QR Code Modal */}
      {selectedQrLink && (
        <QrCodeModal
          isOpen={!!selectedQrLink}
          onClose={() => setSelectedQrLink(null)}
          url={`${window.location.origin}/r/${selectedQrLink.code}`}
          title={selectedQrLink.title}
          code={selectedQrLink.code}
          onToast={addToast}
        />
      )}

      {/* 3. Deep Analytics Modal */}
      {selectedAnalyticsId && (
        <AnalyticsModal
          isOpen={!!selectedAnalyticsId}
          onClose={() => setSelectedAnalyticsId(null)}
          linkId={selectedAnalyticsId}
          onToast={addToast}
        />
      )}

      {/* 4. Bulk Shorten Modal */}
      <BulkShortenModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={() => {
          // If in dashboard, refresh
        }}
        onToast={addToast}
      />

      {/* 5. Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onToast={addToast}
      />

      {/* 6. Report Abuse Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onToast={addToast}
      />

      {/* 7. Legal Terms / Privacy Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
