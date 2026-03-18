import {
  getLocaleDisplayLabel,
  INTERPRETER_SUPPORTED_LOCALES,
} from "@/lib/translator/catalog.ts";
import type { ConciergeLocale, InterpreterSession } from "@/lib/translator/types.ts";
import { useTranslation } from "react-i18next";

interface LanguageSelectorRowProps {
  customerLocale: ConciergeLocale;
  staffLocale: ConciergeLocale;
  session: InterpreterSession | null;
  onCustomerLocaleChange: (locale: ConciergeLocale) => void;
  onStaffLocaleChange: (locale: ConciergeLocale) => void;
}

export function LanguageSelectorRow(props: LanguageSelectorRowProps) {
  const { t } = useTranslation('common');
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
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">{t('interpreter_ui.customer_speaks')}</div>
          <div className="mt-2 text-lg font-black text-slate-950">{getLocaleDisplayLabel(customerLocale)}</div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">{t('interpreter_ui.staff_speaks')}</div>
          <div className="mt-2 text-lg font-black text-slate-950">{getLocaleDisplayLabel(staffLocale)}</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          {t('interpreter_ui.customer_language')}
          <select
            className="min-h-[56px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900"
            value={customerLocale}
            onChange={(event) => onCustomerLocaleChange(event.target.value as ConciergeLocale)}
          >
            {INTERPRETER_SUPPORTED_LOCALES.map((locale) => (
              <option key={`customer-${locale}`} value={locale}>
                {getLocaleDisplayLabel(locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-bold text-slate-700">
          {t('interpreter_ui.staff_language')}
          <select
            className="min-h-[56px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900"
            value={staffLocale}
            onChange={(event) => onStaffLocaleChange(event.target.value as ConciergeLocale)}
          >
            {INTERPRETER_SUPPORTED_LOCALES.map((locale) => (
              <option key={`staff-${locale}`} value={locale}>
                {getLocaleDisplayLabel(locale)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
          {t('interpreter_ui.session')}
        </span>
        <code className="rounded-full bg-slate-950 px-3 py-1 font-mono text-[11px] text-white">
          {session?.ephemeralToken.slice(0, 12) ?? "creating"}
        </code>
        <span>{t('interpreter_ui.expires')} {session?.expiresAt ? new Date(session.expiresAt).toLocaleTimeString() : "--"}</span>
      </div>
    </div>
  );
}
