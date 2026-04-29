import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Heart, MessageSquare, Star, X } from 'lucide-react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mjgjnjgn';
const STATUS_KEY = 'reviewPromptStatus';   // 'submitted' | 'dismissed'  → never show again
const VISIT_COUNT_KEY = 'reviewPromptVisitCount';
const SHOW_AFTER_VISITS = 2;                // show on the 2nd visit or later
const SHOW_AFTER_MS = 20_000;                // and after 20s on that visit

type Phase = 'hidden' | 'asking' | 'thanks';

const ReviewPrompt: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [submitted, setSubmitted] = useState<{ rating: number; feedback: string } | null>(null);
  const [sending, setSending] = useState(false);
  const dismissPingedRef = useRef(false);

  // Decide whether to show the prompt
  useEffect(() => {
    try {
      const status = localStorage.getItem(STATUS_KEY);
      if (status) return; // already shown / submitted / dismissed — never again

      // Increment visit count
      const prev = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) || 0;
      const next = prev + 1;
      localStorage.setItem(VISIT_COUNT_KEY, String(next));

      if (next < SHOW_AFTER_VISITS) return;

      const t = setTimeout(() => setPhase('asking'), SHOW_AFTER_MS);
      return () => clearTimeout(t);
    } catch {
      // localStorage unavailable — don't show
    }
  }, []);

  const sendToFormspree = async (payload: Record<string, unknown>) => {
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // best-effort — don't block UX on network failure
    }
  };

  const handleSubmit = async () => {
    if (rating < 1 || sending) return;
    setSending(true);
    const trimmedFeedback = feedback.trim();
    const subject = `[Review ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}] ${trimmedFeedback ? trimmedFeedback.slice(0, 60) : 'Note Counter rating'}`;

    await sendToFormspree({
      category: 'review',
      categoryLabel: 'Website review',
      rating,
      ratingStars: '★'.repeat(rating) + '☆'.repeat(5 - rating),
      feedback: trimmedFeedback,
      message: `User rated Note Counter ${rating}/5${trimmedFeedback ? `\n\nFeedback:\n${trimmedFeedback}` : ''}`,
      page: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      submittedAt: new Date().toISOString(),
      _subject: subject,
    });

    try {
      localStorage.setItem(STATUS_KEY, 'submitted');
    } catch {
      // ignore
    }

    setSubmitted({ rating, feedback: trimmedFeedback });
    setPhase('thanks');
    setSending(false);
  };

  const dismissAsNotInterested = () => {
    if (dismissPingedRef.current) return;
    dismissPingedRef.current = true;
    try {
      localStorage.setItem(STATUS_KEY, 'dismissed');
    } catch {
      // ignore
    }
    void sendToFormspree({
      category: 'review',
      categoryLabel: 'Website review — declined',
      message: 'User dismissed the review prompt without rating.',
      rating: 0,
      page: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      submittedAt: new Date().toISOString(),
      _subject: '[Review] Not interested in review',
    });
    setPhase('hidden');
  };

  const closeThanks = () => setPhase('hidden');

  if (phase === 'hidden') return null;

  if (phase === 'thanks' && submitted) {
    return (
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-xl2 shadow-card-lg max-w-md w-full overflow-hidden animate-slide-up border border-ink-200/70">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-center text-white relative">
            <button
              onClick={closeThanks}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
              <CheckCircle2 size={30} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Thank you!</h2>
            <p className="text-sm text-white/90">Your review means a lot — it keeps Note Counter free and ad-free.</p>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                Your rating
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={28}
                    className={
                      i < submitted.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-ink-200'
                    }
                  />
                ))}
                <span className="ml-2 text-lg font-bold text-ink-900 tabular-nums">
                  {submitted.rating}/5
                </span>
              </div>
            </div>

            {submitted.feedback && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-1.5 flex items-center gap-1">
                  <MessageSquare size={11} />
                  Your feedback
                </div>
                <blockquote className="border-l-4 border-emerald-400 bg-emerald-50/50 pl-3 py-2 text-sm text-ink-800 italic leading-relaxed whitespace-pre-wrap">
                  {submitted.feedback}
                </blockquote>
              </div>
            )}

            <div className="pt-2 border-t border-ink-200">
              <button
                onClick={closeThanks}
                className="w-full inline-flex items-center justify-center gap-2 bg-ink-900 hover:bg-ink-800 text-white py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                Continue
              </button>
              <p className="text-[11px] text-ink-500 text-center mt-2">
                You won't be asked again. Thanks for the support 🙏
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 'asking' phase
  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl2 shadow-card-lg max-w-md w-full overflow-hidden animate-slide-up border border-ink-200/70">
        <div className="bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500 p-5 text-center text-white relative">
          <button
            onClick={dismissAsNotInterested}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Close — not interested"
            title="Not interested"
          >
            <X size={18} />
          </button>
          <div className="w-12 h-12 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-2.5">
            <Heart size={24} className="text-white" />
          </div>
          <h2 className="text-lg font-bold mb-1">Enjoying Note Counter?</h2>
          <p className="text-sm text-white/90">
            Note Counter is free, ad-free, and built by one person. A quick rating really helps!
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Stars */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-2 text-center">
              How would you rate it?
            </div>
            <div
              className="flex items-center justify-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= displayRating;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onFocus={() => setHoverRating(n)}
                    className="p-1 rounded transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                  >
                    <Star
                      size={36}
                      className={
                        filled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-ink-300 hover:text-amber-300'
                      }
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-center text-xs text-ink-500 mt-1.5 h-4">
              {displayRating === 0
                ? 'Tap a star'
                : displayRating === 1
                ? 'Sorry to hear that — what went wrong?'
                : displayRating === 2
                ? 'What can be better?'
                : displayRating === 3
                ? 'Thanks — anything we should improve?'
                : displayRating === 4
                ? 'Glad it\'s useful!'
                : 'Awesome — thank you!'}
            </div>
          </div>

          {/* Feedback (optional) */}
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-700">
              Anything to share? (optional)
            </span>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder={
                rating > 0 && rating < 4
                  ? "Tell me what went wrong or what's missing…"
                  : 'A quick note — what worked, what didn\'t…'
              }
              className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-y"
            />
            <div className="text-[10px] text-ink-400 mt-1 text-right tabular-nums">
              {feedback.length} / 1000
            </div>
          </label>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={dismissAsNotInterested}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 font-semibold text-sm transition-colors"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating < 1 || sending}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {sending ? 'Sending…' : 'Send review'}
            </button>
          </div>

          <p className="text-[11px] text-ink-500 text-center leading-snug">
            Sent via Formspree to the developer. You'll only see this prompt once.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewPrompt;
