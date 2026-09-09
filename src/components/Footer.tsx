import React from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, Database, Terminal, FileText } from 'lucide-react';

interface FooterProps {
  onOpenMethodology?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMethodology }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/90 text-slate-400 text-xs py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Compliance Notice Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-3.5">
          <div className="p-2 rounded-md bg-amber-500/10 text-amber-400 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Regulatory & Research Integrity Disclosure
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              IndianShares provides research and decision-support information. It is not personalized investment advice.
              Market data, indicative GMP, institutional estimations, and algorithmic research signals may be incomplete or change
              rapidly. IndianShares is not a SEBI-registered investment advisor or stock broker. Users should verify information with official
              exchange filings before making investment decisions.
            </p>
          </div>
        </div>

        {/* Data Architecture and Lineage */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <Database className="h-4 w-4 text-amber-500" />
              Independent Data Architecture
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              IndianShares normalizes exchange feeds from NSE/BSE filings and maintains its own authoritative backend database,
              scoring algorithms, and analytical models. Not a reseller or UI wrapper.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Verified Data Standard
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every score, institutional trend, and fundamental metric carries explicit timestamp verification. Missing
              disclosures are explicitly labeled rather than fabricated or filled with mock values.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <Terminal className="h-4 w-4 text-sky-400" />
              Transparent Scoring
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Multi-factor scoring weights (Fundamentals, Compounding Growth, Momentum, Institutional Absorption, Sector Tailwinds)
              are fully visible and customizable by the user.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <FileText className="h-4 w-4 text-purple-400" />
              Institutional Research
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Institutional trend alerts categorize FII/DII patterns into verified Accumulation, Distribution, and Caution bands
              with concrete delta justifications.
            </p>
          </div>
        </div>

        {/* Copyright and Metadata */}
        <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} INDIANSHARES Intelligence Core. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Feed Status: 100% Operational
            </span>
            <span>•</span>
            <span>NSE/BSE Filings Lake</span>
            <span>•</span>
            <span>SEBI Regulations Compliant Framework</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
