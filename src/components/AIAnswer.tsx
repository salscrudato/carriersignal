interface AIAnswerProps {
  answer: string;
  isLoading: boolean;
}

export function AIAnswer({ answer, isLoading }: AIAnswerProps) {
  if (!answer && !isLoading) return null;

  return (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border-b border-slate-200/50 py-6 sm:py-8" aria-label="AI-powered insights">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-5 sm:py-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-white to-transparent"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full -ml-16 -mb-16"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">AI-Powered Insight</h2>
                  <p className="text-xs text-blue-100 font-medium">Analyzed from latest industry news</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-6 sm:py-7 relative z-10">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse w-4/5"></div>
                </div>
              ) : (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {answer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

