import { getLocaleDisplayLabel } from "@/lib/translator/catalog.ts";
import type { ConciergeLocale, InterpreterSession } from "@/lib/translator/types.ts";

interface LanguageSelectorRowProps {
  customerLocale: ConciergeLocale;
  staffLocale: ConciergeLocale;
  session: InterpreterSession | null;
  onCustomerLocaleChange: (locale: ConciergeLocale) => void;
  onStaffLocaleChange: (locale: ConciergeLocale) => void;
}

export function LanguageSelectorRow(props: LanguageSelectorRowProps) {
  const {
    customerLocale,
    staffLocale,
    session,
    onCustomerLocaleChange,
    onStaffLocaleChange,
  } = props;

  return (
    <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-soft">
      <div className="grid gap-3 rounded-[22px] bg-slate-50 p-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-sky-100 bg-white p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Customer speaks</div>
          <div className="mt-2 text-lg font-black text-slate-950">{getLocaleDisplayLabel(customerLocale)}</div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Staff speaks</div>
          <div className="mt-2 text-lg font-black text-slate-950">{getLocaleDisplayLabel(staffLocale)}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-black uppercase tracking-wider text-slate-500">Customer Language</label>
          <div className="grid grid-cols-2 gap-2">
            {(['ko', 'en', 'ja', 'zh-CN'] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                className={`flex h-12 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${
                  customerLocale === locale
                    ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-sm'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => onCustomerLocaleChange(locale)}
              >
                {getLocaleDisplayLabel(locale)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-black uppercase tracking-wider text-slate-500">Staff Language</label>
          <div className="grid grid-cols-2 gap-2">
            {(['ko', 'en', 'ja', 'zh-CN'] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                className={`flex h-12 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${
                  staffLocale === locale
                    ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => onStaffLocaleChange(locale)}
              >
                {getLocaleDisplayLabel(locale)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
          Session
        </span>
        <code className="rounded-full bg-slate-950 px-3 py-1 font-mono text-[11px] text-white">
          {session?.ephemeralToken.slice(0, 12) ?? "creating"}
        </code>
        <span>expires {session?.expiresAt ? new Date(session.expiresAt).toLocaleTimeString() : "--"}</span>
      </div>
    </div>
  );
}
