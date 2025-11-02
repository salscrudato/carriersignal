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
      {/* Clean Header Section */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
          {/* Close button - top right */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-lg sm:text-xl font-semibold text-[#0D0D0D] leading-snug line-clamp-2 flex-1 pr-2">{article.title}</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-[#F7F7F8] transition-all duration-200 flex-shrink-0 border border-transparent hover:border-[#E5E7EB]"
                aria-label="Close modal"
              >
                <X size={20} className="text-[#8B8B9A]" />
              </button>
            )}
          </div>

          {/* Metadata - Clean styling */}
          <div className="flex items-center gap-2 text-xs text-[#8B8B9A] flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#E8F5F0] text-[#10A37F] font-medium text-xs border border-[#10A37F]/20">
              {article.source}
            </span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="text-[#8B8B9A] font-medium">{publishDate}</span>
            {timeAgo && (
              <>
                <span className="text-[#D1D5DB]">•</span>
                <span className="text-[#8B8B9A] font-medium">{timeAgo}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="space-y-4">
        {/* Lead Quote - Clean styling */}
        {article.leadQuote && (
          <div className="bg-[#F7F7F8] rounded-lg border border-[#E5E7EB] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#10A37F] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-sm italic text-[#0D0D0D] leading-relaxed">{article.leadQuote}</p>
            </div>
          </div>
        )}

        {/* Storm Name Badge */}
        {article.stormName && (
          <div className="rounded-lg px-4 py-3 border border-[#F59E0B]/30 bg-[#FEF3C7]/20 flex items-center gap-2 w-fit">
            <AlertTriangle size={16} className="text-[#F59E0B]" />
            <p className="text-sm font-medium text-[#F59E0B]">{article.stormName}</p>
          </div>
        )}


        {/* AI-Generated Summary - Clean section */}
        {article.bullets5 && article.bullets5.length > 0 && (
          <section className="space-y-3 p-4 sm:p-5 bg-[#F7F7F8] rounded-lg border border-[#E5E7EB]" aria-labelledby="summary-heading">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#10A37F] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 id="summary-heading" className="font-semibold text-[#0D0D0D] text-sm">Summary</h3>
            </div>
            <ul className="space-y-2">
              {article.bullets5.map((bullet, idx) => (
                <li key={idx} className="flex gap-2.5 text-sm text-[#565869] leading-relaxed">
                  <span className="text-[#10A37F] font-semibold flex-shrink-0 mt-0.5">•</span>
                  <span className="flex-1">{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Why It Matters - Clean insights */}
        {article.whyItMatters && Object.keys(article.whyItMatters).length > 0 && (
          <div className="space-y-3 p-4 sm:p-5 bg-[#F7F7F8] rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#10A37F] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#0D0D0D] text-sm">Why It Matters</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(article.whyItMatters).map(([role, insight]) => (
                <div key={role} className="bg-white rounded-md p-3 border border-[#E5E7EB]">
                  <p className="text-xs font-semibold text-[#10A37F] uppercase tracking-wide mb-1">{role}</p>
                  <p className="text-sm text-[#565869] leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Rationale - Clean */}
        {article.confidenceRationale && (
          <div className="p-4 bg-[#F7F7F8] rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#10A37F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-[#0D0D0D]">Confidence</p>
            </div>
            <p className="text-sm text-[#565869] leading-relaxed">{article.confidenceRationale}</p>
          </div>
        )}

        {/* Disclosure - Clean */}
        {article.disclosure && (
          <div className="p-4 bg-[#FEF3C7]/30 rounded-lg border border-[#F59E0B]/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-[#F59E0B]" />
              <p className="text-sm font-semibold text-[#F59E0B]">Disclosure</p>
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

