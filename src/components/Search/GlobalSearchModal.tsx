import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, User, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDaysInShelter, getSixWeekAlertStatus } from '../../utils/calculations';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChild: (childId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectChild,
}) => {
  const { children } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Parent triggers open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? children.filter((c) => {
        if (c.isArchived) return false;
        const q = query.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.nickname?.toLowerCase().includes(q) ||
          c.gdNumber?.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q) ||
          c.shelterName.toLowerCase().includes(q) ||
          c.familyTracing?.fatherName?.toLowerCase().includes(q)
        );
      })
    : children.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 flex items-center px-4">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Child ID (e.g. LEEDO-2026-0001), child name, GD number, area..."
            className="w-full px-3 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {query.trim() ? `Search Results (${results.length})` : 'Recent Active Cases'}
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching children found for "{query}". Check Child ID spelling or try searching by area or police GD.
            </div>
          ) : (
            results.map((child) => {
              const days = getDaysInShelter(child);
              const sixWeek = getSixWeekAlertStatus(child);

              return (
                <div
                  key={child.id}
                  onClick={() => {
                    onSelectChild(child.id);
                    onClose();
                  }}
                  className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={child.photoUrl}
                      alt={child.name}
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{child.id}</span>
                        <span className="text-xs text-slate-500">({child.gender}, {child.estimatedAge}y)</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sixWeek.badgeClass}`}>
                          {sixWeek.label}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {child.name} {child.nickname ? `("${child.nickname}")` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {child.shelterName} ({days} days) &bull; GD: {child.gdNumber || 'None'} &bull; {child.area}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                      {child.caseStatus}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
