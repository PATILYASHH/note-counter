import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bug, CheckCircle2, Lightbulb, Mail, MessageSquare, Send, Star } from 'lucide-react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mjgjnjgn';

type Category = 'feedback' | 'bug' | 'feature' | 'contact';

const CATEGORY_LIST: Array<{
  id: Category;
  label: string;
  icon: LucideIcon;
  hint: string;
  subjectPrefix: string;
}> = [
  {
    id: 'feedback',
    label: 'Feedback',
    icon: Star,
    hint: 'General thoughts, praise, or anything that doesn\'t fit the other categories.',
    subjectPrefix: '[Feedback]',
  },
  {
    id: 'bug',
    label: 'Bug report',
    icon: Bug,
    hint: 'Something is broken or behaves unexpectedly. Include steps to reproduce if you can.',
    subjectPrefix: '[Bug]',
  },
  {
    id: 'feature',
    label: 'Feature request',
    icon: Lightbulb,
    hint: 'A new calculator, currency, or improvement you\'d like to see.',
    subjectPrefix: '[Feature]',
  },
  {
    id: 'contact',
    label: 'Other / contact',
    icon: MessageSquare,
    hint: 'Questions, partnership inquiries, or anything else.',
    subjectPrefix: '[Contact]',
  },
];

interface FeedbackFormProps {
  /** Pre-select a category when the form is opened */
  initialCategory?: Category;
  /** Compact / surface style — used in the menu modal */
  compact?: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ initialCategory = 'feedback', compact = false }) => {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeCategory = CATEGORY_LIST.find((c) => c.id === category) ?? CATEGORY_LIST[0];

  const reset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setStatus('idle');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus('error');
      setErrorMsg('Please write a message before sending.');
      return;
    }

    setStatus('sending');
    setErrorMsg(null);

    try {
      const finalSubject = subject.trim()
        ? `${activeCategory.subjectPrefix} ${subject.trim()}`
        : `${activeCategory.subjectPrefix} (no subject)`;

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          category,
          categoryLabel: activeCategory.label,
          name: name.trim() || 'Anonymous',
          email: email.trim(),
          subject: finalSubject,
          message: trimmedMessage,
          // Helpful but innocuous metadata for triage
          appVersion: '12.0.0',
          page: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          submittedAt: new Date().toISOString(),
          _subject: finalSubject,
        }),
      });

      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          if (data?.errors?.[0]?.message) detail = data.errors[0].message;
          else if (data?.error) detail = data.error;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Could not send. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={`rounded-xl2 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center ${compact ? '' : 'shadow-card'}`}>
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500 flex items-center justify-center mb-3 shadow-sm">
          <CheckCircle2 size={28} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-emerald-900 mb-1">Thanks — message received!</h3>
        <p className="text-sm text-emerald-800/90 mb-4 max-w-md mx-auto">
          Your {activeCategory.label.toLowerCase()} was delivered. If you left an email I'll get back to you when I can.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
        >
          Send another
        </button>
      </div>
    );
  }

  const Icon = activeCategory.icon;

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl2 border border-ink-200 bg-white ${compact ? 'p-4' : 'p-5 sm:p-6 shadow-card'}`}
    >
      {/* Category picker */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-ink-700 uppercase tracking-wider mb-2">
          What kind of message?
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {CATEGORY_LIST.map((c) => {
            const CIcon = c.icon;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-ink-700 border-ink-200 hover:border-brand-300 hover:text-brand-700'
                }`}
              >
                <CIcon size={16} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-ink-500 mt-1.5 leading-snug flex items-start gap-1">
          <Icon size={12} className="mt-0.5 flex-shrink-0 text-brand-600" />
          {activeCategory.hint}
        </p>
      </div>

      {/* Name + email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Name (optional)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            className="w-full mt-1 px-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            Email {category === 'bug' || category === 'feature' ? '(recommended)' : '(optional)'}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            maxLength={120}
            className="w-full mt-1 px-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
          />
        </label>
      </div>

      {/* Subject */}
      <label className="block mb-3">
        <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Subject (optional)</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={
            category === 'bug'
              ? 'Short summary of the bug'
              : category === 'feature'
              ? 'Short title for the feature'
              : 'What is this about?'
          }
          maxLength={120}
          className="w-full mt-1 px-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
        />
      </label>

      {/* Message */}
      <label className="block mb-3">
        <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
          Message <span className="text-rose-500">*</span>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={compact ? 4 : 6}
          maxLength={5000}
          required
          placeholder={
            category === 'bug'
              ? 'What happened?\nSteps to reproduce:\n1.\n2.\n3.\n\nBrowser / OS:'
              : category === 'feature'
              ? 'What problem does this feature solve? How would you use it?'
              : 'Tell me what\'s on your mind…'
          }
          className="w-full mt-1 px-3 py-2.5 rounded-lg border border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm font-mono leading-relaxed resize-y"
        />
        <div className="text-[11px] text-ink-500 mt-1 text-right tabular-nums">
          {message.length} / 5000
        </div>
      </label>

      {/* Honeypot for bots — hidden from users */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        onChange={() => {/* honeypot */}}
      />

      {status === 'error' && errorMsg && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p className="text-[11px] text-ink-500 leading-snug">
          Submissions are sent via Formspree. Your message and any contact info you provide go to the developer's inbox — nothing is stored on this site.
        </p>
        <button
          type="submit"
          disabled={status === 'sending' || !message.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
        >
          {status === 'sending' ? (
            <>
              <Mail size={16} className="animate-pulse" />
              Sending…
            </>
          ) : (
            <>
              <Send size={16} />
              Send message
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
