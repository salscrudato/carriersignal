import { AlertTriangle, X } from 'lucide-react';
import { memo } from 'react';
import type { Article } from '../types';
import { getTimeAgo } from '../utils/validation';

interface BriefPanelProps {
  article: Article | null;
  onClose?: () => void;
}

function BriefPanelComponent({
  article,
  onClose,
}: BriefPanelProps) {
  if (!article) {
    return null;
  }

  const publishDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown';
  const timeAgo = article.publishedAt ? getTimeAgo(new Date(article.publishedAt)) : '';

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Premium Header Section */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-white via-white to-white/95 backdrop-blur-md border-b border-[#C7D2E1]/15 shadow-xs">
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5">
          {/* Close button - top right */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] leading-tight line-clamp-3 flex-1 pr-2">{article.title}</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#E8F2FF]/60 transition-all duration-200 flex-shrink-0 hover:shadow-sm border border-[#C7D2E1]/20 hover:border-[#5AA6FF]/30"
                aria-label="Close modal"
              >
                <X size={22} className="text-[#64748B] hover:text-[#0F172A]" />
              </button>
            )}
          </div>

          {/* Metadata - Enhanced styling */}
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#64748B] flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#E8F2FF]/40 text-[#5AA6FF] font-semibold text-xs border border-[#5AA6FF]/20 hover:border-[#5AA6FF]/30 transition-all">
              {article.source}
            </span>
            <span className="text-[#C7D2E1]">•</span>
            <span className="text-[#64748B] font-medium">{publishDate}</span>
            {timeAgo && (
              <>
                <span className="text-[#C7D2E1]">•</span>
                <span className="text-[#64748B] font-medium">{timeAgo}</span>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6">
        <div className="space-y-5">
        {/* Lead Quote with Premium Styling */}
        {article.leadQuote && (
          <div className="bg-gradient-to-br from-[#E8F2FF]/30 to-[#E8F2FF]/15 rounded-2xl border border-[#5AA6FF]/20 p-6 sm:p-7 hover:border-[#5AA6FF]/30 transition-all duration-300 hover:shadow-sm">
            <div className="flex items-start gap-4">
              <svg className="w-7 h-7 text-[#5AA6FF] flex-shrink-0 mt-0.5 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-base sm:text-lg italic text-[#0F172A] leading-relaxed font-medium">{article.leadQuote}</p>
            </div>
          </div>
        )}

        {/* Storm Name Badge */}
        {article.stormName && (
          <div className="liquid-glass-premium rounded-xl px-5 py-3 border border-[#F59E0B]/40 flex items-center gap-2 hover:shadow-md transition-all duration-300 hover:scale-102 w-fit">
            <AlertTriangle size={16} className="text-[#F59E0B]" />
            <p className="text-sm font-semibold text-[#F59E0B]">{article.stormName}</p>
          </div>
        )}


        {/* AI-Generated Summary - Premium Section */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <section className="space-y-4 p-6 sm:p-7 bg-gradient-to-br from-[#E8F2FF]/20 to-[#E8F2FF]/10 rounded-2xl border border-[#5AA6FF]/15 hover:border-[#5AA6FF]/25 transition-all duration-300 hover:shadow-sm" aria-labelledby="summary-heading">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5AA6FF] to-[#8B7CFF] flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 id="summary-heading" className="font-bold text-[#0F172A] text-lg">AI-Generated Summary</h3>
            </div>
            <ul className="space-y-3">
              {article.bullets5.map((bullet, idx) => (
                <li key={idx} className="flex gap-3.5 text-sm text-[#0F172A] leading-relaxed hover:text-[#0F172A] transition-all duration-300 group">
                  <span className="font-bold text-[#5AA6FF] flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">→</span>
                  <span className="flex-1 group-hover:text-[#0F172A]">{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Why It Matters - Professional Insights */}
        {article.whyItMatters && Object.keys(article.whyItMatters).length > 0 && (
          <div className="space-y-4 p-6 sm:p-7 bg-gradient-to-br from-[#E8F2FF]/20 to-[#E8F2FF]/10 rounded-2xl border border-[#5AA6FF]/15 hover:border-[#5AA6FF]/25 transition-all duration-300 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5AA6FF] to-[#8B7CFF] flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#0F172A] text-lg">Why It Matters</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(article.whyItMatters).map(([role, insight]) => (
                <div key={role} className="bg-white/40 rounded-xl p-4 hover:bg-white/60 transition-all duration-300 border border-[#C7D2E1]/15 hover:border-[#5AA6FF]/25">
                  <p className="text-xs font-bold text-[#5AA6FF] uppercase tracking-wider mb-2">{role}</p>
                  <p className="text-sm text-[#0F172A] leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Rationale - Enhanced */}
        {article.confidenceRationale && (
          <div className="p-5 bg-gradient-to-br from-[#F9FBFF] to-[#E8F2FF]/20 rounded-2xl border border-[#C7D2E1]/20 shadow-xs hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-bold text-[#0F172A]">Confidence Rationale</p>
            </div>
            <p className="text-sm text-[#0F172A] leading-relaxed">{article.confidenceRationale}</p>
          </div>
        )}

        {/* Disclosure - Enhanced */}
        {article.disclosure && (
          <div className="p-5 bg-gradient-to-br from-[#FEF3C7]/40 to-[#FEF3C7]/20 rounded-2xl border border-[#F59E0B]/20 shadow-xs hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-[#F59E0B]" />
              <p className="text-sm font-bold text-[#F59E0B]">Disclosure</p>
            </div>
            <p className="text-sm text-[#F59E0B] leading-relaxed">{article.disclosure}</p>
          </div>
        )}

        {/* Tags - Enhanced Styling */}
        {article.tags && (
          <div className="space-y-4 p-5 bg-gradient-to-br from-[#E8F2FF]/20 to-[#E8F2FF]/10 rounded-2xl border border-[#5AA6FF]/15 shadow-xs hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#5AA6FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="font-bold text-[#0F172A] text-base">Tags</h3>
            </div>
            <div className="space-y-3">
              {article.tags.lob && article.tags.lob.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">Lines of Business</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.lob.map(tag => (
                      <span key={tag} className="tag-pill tag-lob hover:shadow-lg hover:scale-110 transition-all duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {article.tags.perils && article.tags.perils.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">Perils</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.perils.map(tag => (
                      <span key={tag} className="tag-pill tag-peril hover:shadow-lg hover:scale-110 transition-all duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {article.tags.regulations && article.tags.regulations.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">Regulations</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.regulations.map(tag => (
                      <span key={tag} className="tag-pill tag-regulation hover:shadow-lg hover:scale-110 transition-all duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        </div>
      </div>
    </div>
  );
}

export const BriefPanel = memo(BriefPanelComponent);

