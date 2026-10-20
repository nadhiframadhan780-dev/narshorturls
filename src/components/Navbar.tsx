import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Shield,
  ShieldAlert,
  ChevronDown,
  Layers,
  Code,
  CreditCard,
  LayoutDashboard,
  Check,
} from 'lucide-react';
import { Logo } from './Logo.tsx';

interface NavbarProps {
  activeView: 'landing' | 'dashboard' | 'api-docs' | 'admin';
  onChangeView: (view: 'landing' | 'dashboard' | 'api-docs' | 'admin') => void;
  currentUser: { id: string; name: string; role: string; plan: string };
  onSwitchUser: (userId: string) => void;
  onOpenPricing: () => void;
  onOpenReport: () => void;
  onQuickShorten: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onChangeView,
  currentUser,
  onSwitchUser,
  onOpenPricing,
  onOpenReport,
  onQuickShorten,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/85 backdrop-blur-md border-b border-slate-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Logo size="md" onClick={() => onChangeView('landing')} />

        {/* Navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
          <button
            onClick={() => onChangeView('landing')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'landing'
                ? 'bg-[#3730A3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Beranda
          </button>

          <button
            onClick={() => onChangeView('dashboard')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-[#3730A3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onChangeView('api-docs')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'api-docs'
                ? 'bg-[#3730A3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>API & Dev</span>
          </button>

          <button
            onClick={onOpenPricing}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>Harga</span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => onChangeView('admin')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenReport}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors px-2 py-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Laporkan</span>
          </button>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs hover:border-[#3730A3] transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#3730A3] text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-800 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#C9A24B] font-semibold leading-tight">
                  {currentUser.plan}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-800">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser.role} • {currentUser.plan}</div>
                </div>

                <div className="py-1 text-slate-600">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Ganti Profil Demo:
                  </div>
                  <button
                    onClick={() => {
                      onSwitchUser('user_admin_01');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Nadhif (Admin Platform)</span>
                    {currentUser.id === 'user_admin_01' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      onSwitchUser('user_demo_02');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Demo Creator (Pro Plan)</span>
                    {currentUser.id === 'user_demo_02' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={onQuickShorten}
            className="px-4 py-2 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>Pendekkan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
