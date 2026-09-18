import React, { useState } from "react";
import { Download, Smartphone, Laptop, Check, X, ShieldCheck, Share, PlusSquare } from "lucide-react";
import { usePWAInstall } from "../utils/usePWAInstall";

interface PWAInstallBannerProps {
  onOpenGuide?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenGuide }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (isDismissed || isInstalled) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setIsDismissed(true), 3000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-4 sm:p-5 text-white shadow-md">
      {/* Decorative maritime background glow */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
            <Download className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-white">
                Install ANCHOR AI as Desktop / Mobile PWA
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Offline Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Add to your screen for instant zero-latency access during ocean voyages, engine room rounds, or blackout emergencies without browser frames.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{installSuccess ? "Installed!" : isIOS ? "How to Add on iOS" : "Add to Home Screen"}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Instructions Dialog */}
      {showIOSInstructions && (
        <div className="mt-3 pt-3 border-t border-slate-700/80 text-xs text-slate-300 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-amber-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>How to Install on iPhone / iPad (Safari):</span>
            </span>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="text-slate-400 hover:text-white text-[11px] underline cursor-pointer"
            >
              Hide
            </button>
          </div>
          <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-200">
            <li className="flex items-center gap-1">
              <span>1. Tap the</span>
              <Share className="w-3.5 h-3.5 text-blue-400 inline" />
              <span><strong>Share</strong> button at the bottom of Safari.</span>
            </li>
            <li className="flex items-center gap-1">
              <span>2. Scroll down and tap</span>
              <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span><strong>Add to Home Screen</strong>.</span>
            </li>
            <li>3. Tap <strong>Add</strong> in the top-right corner. ANCHOR AI is now installed offline!</li>
          </ol>
        </div>
      )}
    </div>
  );
};
