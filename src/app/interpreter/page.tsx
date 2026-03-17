'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './interpreter.module.css';
import {
  getLocaleDisplayLabel,
  INTERPRETER_SUPPORTED_LOCALES,
} from '@/lib/translator/catalog.ts';
import type { ConciergeLocale } from '@/lib/translator/types.ts';

const DEFAULT_CUSTOMER_LOCALE: ConciergeLocale = 'en';
const DEFAULT_STAFF_LOCALE: ConciergeLocale = 'ko';

type InterpreterMessage = {
  id: string;
  speaker: 'customer' | 'staff';
  sourceText: string;
  translatedText: string;
  statusLabel: string;
  sourceLang: ConciergeLocale;
  targetLang: ConciergeLocale;
  inputType: 'voice' | 'text' | 'quick-phrase';
};

type QuickPhrase = {
  id: string;
  translations: Record<ConciergeLocale, string>;
};

type InterpreterMessageEntry = {
  speaker: InterpreterMessage['speaker'];
  inputType: InterpreterMessage['inputType'];
  sourceText: string;
  sourceLang: ConciergeLocale;
  targetLang: ConciergeLocale;
  translations?: Record<ConciergeLocale, string>;
};

type InterpreterTranslateResponse =
  | {
      ok: true;
      translatedText: string;
      provider: string;
    }
  | {
      ok: false;
      error: string;
    };

type QuickPhraseGroupId =
  | 'consultation'
  | 'haircut'
  | 'styling'
  | 'during-service'
  | 'finishing';

const CUSTOMER_SAMPLE_COPY: Record<ConciergeLocale, string> = {
  ko: '앞머리를 더 짧게 하고 싶어요.',
  en: 'I want shorter bangs.',
  ja: '前髪をもっと短くしたいです。',
  'zh-CN': '我想把刘海剪得更短一点。',
};

const STAFF_SAMPLE_COPY: Record<ConciergeLocale, string> = {
  ko: '거울로 확인해 주세요.',
  en: 'Please check in the mirror.',
  ja: '鏡でご確認ください。',
  'zh-CN': '请您通过镜子确认一下。',
};

const QUICK_PHRASE_GROUPS: Array<{
  id: QuickPhraseGroupId;
  label: string;
  customerPhrases: QuickPhrase[];
  staffPhrases: QuickPhrase[];
}> = [
  {
    id: 'consultation',
    label: '상담',
    customerPhrases: [
      {
        id: 'sensitive-skin',
        translations: {
          ko: '피부가 예민한 편이에요.',
          en: 'I have sensitive skin.',
          ja: '肌が敏感なほうです。',
          'zh-CN': '我的皮肤比较敏感。',
        },
      },
    ],
    staffPhrases: [
      {
        id: 'consult-bangs',
        translations: {
          ko: '앞머이는 어떻게 해드릴까요?',
          en: 'How would you like your bangs?',
          ja: '前髪はどのようにいたしましょうか。',
          'zh-CN': '刘海想怎么处理呢？',
        },
      },
    ],
  },
  {
    id: 'haircut',
    label: '커트 / 앞머리',
    customerPhrases: [
      {
        id: 'shorter-bangs',
        translations: {
          ko: '앞머리를 더 짧게 하고 싶어요.',
          en: 'I want shorter bangs.',
          ja: '前髪をもっと短くしたいです。',
          'zh-CN': '我想把刘海剪得更短一点。',
        },
      },
      {
        id: 'keep-length',
        translations: {
          ko: '전체 길이는 유지해 주세요.',
          en: 'Please keep the length.',
          ja: '全体の長さはそのままでお願いします。',
          'zh-CN': '请保持整体长度。',
        },
      },
    ],
    staffPhrases: [
      {
        id: 'desired-length',
        translations: {
          ko: '길이는 어느 정도 원하세요?',
          en: 'How much length would you like?',
          ja: '長さはどのくらいをご希望ですか？',
          'zh-CN': '长度想保留到什么程度呢？',
        },
      },
    ],
  },
  {
    id: 'styling',
    label: '스타일링 / 볼륨',
    customerPhrases: [
      {
        id: 'less-volume',
        translations: {
          ko: '옆쪽 볼륨은 덜 들어가면 좋겠어요.',
          en: 'I want less volume on the sides.',
          ja: '横のボリュームは少なめがいいです。',
          'zh-CN': '我希望两侧的蓬松感少一点。',
        },
      },
    ],
    staffPhrases: [
      {
        id: 'reduce-volume',
        translations: {
          ko: '옆쪽 볼륨은 줄여드릴까요?',
          en: 'Would you like less volume on the sides?',
          ja: '横のボリュームは抑えましょうか？',
          'zh-CN': '两侧的蓬松感要帮您减一点吗？',
        },
      },
    ],
  },
  {
    id: 'during-service',
    label: '시술 중',
    customerPhrases: [
      {
        id: 'natural-finish',
        translations: {
          ko: '최대한 자연스럽게 해주세요.',
          en: 'Please make it look natural.',
          ja: 'できるだけ自然にしてください。',
          'zh-CN': '请尽量做得自然一点。',
        },
      },
    ],
    staffPhrases: [
      {
        id: 'wait-moment',
        translations: {
          ko: '잠시만 기다려 주세요.',
          en: 'Please wait a moment.',
          ja: '少々お待ちください。',
          'zh-CN': '请稍等一下。',
        },
      },
      {
        id: 'tell-discomfort',
        translations: {
          ko: '불편하시면 바로 말씀해 주세요.',
          en: 'Please tell me right away if you feel uncomfortable.',
          ja: '不快でしたらすぐに言ってください。',
          'zh-CN': '如果您觉得不舒服，请马上告诉我。',
        },
      },
    ],
  },
  {
    id: 'finishing',
    label: '마무리 확인',
    customerPhrases: [
      {
        id: 'check-result',
        translations: {
          ko: '마무리 상태를 한 번 더 보고 싶어요.',
          en: 'I want to check the final result once more.',
          ja: '仕上がりをもう一度確認したいです。',
          'zh-CN': '我想再确认一下最终效果。',
        },
      },
    ],
    staffPhrases: [
      {
        id: 'check-mirror',
        translations: {
          ko: '거울로 확인해 주세요.',
          en: 'Please check in the mirror.',
          ja: '鏡でご確認ください。',
          'zh-CN': '请您通过镜子确认一下。',
        },
      },
    ],
  },
];

function getTimestampLabel() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildSafeFallbackTranslatedText(entry: InterpreterMessageEntry) {
  if (entry.translations?.[entry.targetLang]) {
    return entry.translations[entry.targetLang];
  }

  return `[${getLocaleDisplayLabel(entry.targetLang)}] ${entry.sourceText}`;
}

function createInterpreterMessage(
  entry: InterpreterMessageEntry,
  translatedText: string,
  statusPrefix = 'Mock',
): InterpreterMessage {
  return {
    id: `${entry.speaker}-${Date.now()}`,
    speaker: entry.speaker,
    sourceText: entry.sourceText,
    translatedText,
    statusLabel: `${statusPrefix} ${getTimestampLabel()}`,
    sourceLang: entry.sourceLang,
    targetLang: entry.targetLang,
    inputType: entry.inputType,
  };
}

export default function InterpreterPage() {
  const router = useRouter();
  const [customerLocale, setCustomerLocale] = useState<ConciergeLocale>(DEFAULT_CUSTOMER_LOCALE);
  const [staffLocale, setStaffLocale] = useState<ConciergeLocale>(DEFAULT_STAFF_LOCALE);
  const [messages, setMessages] = useState<InterpreterMessage[]>([]);
  const [customerInput, setCustomerInput] = useState('');
  const [staffInput, setStaffInput] = useState('');
  const [activeQuickGroup, setActiveQuickGroup] = useState<QuickPhraseGroupId>('consultation');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  };

  const activeQuickPhraseGroup =
    QUICK_PHRASE_GROUPS.find((group) => group.id === activeQuickGroup) ?? QUICK_PHRASE_GROUPS[0];

  const getLocalesForSpeaker = (speaker: InterpreterMessage['speaker']) => {
    return speaker === 'customer'
      ? { sourceLang: customerLocale, targetLang: staffLocale }
      : { sourceLang: staffLocale, targetLang: customerLocale };
  };

  const appendInterpreterMessage = (
    entry: InterpreterMessageEntry,
    translatedText: string,
    statusPrefix = 'Mock',
  ) => {
    setMessages((previous) => [...previous, createInterpreterMessage(entry, translatedText, statusPrefix)]);
  };

  const requestInterpreterTranslation = async (entry: InterpreterMessageEntry) => {
    const response = await fetch('/api/interpreter/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        sourceText: entry.sourceText,
        sourceLang: entry.sourceLang,
        targetLang: entry.targetLang,
      }),
    });

    const data = (await response.json()) as InterpreterTranslateResponse;

    if (!response.ok || !data.ok) {
      throw new Error(data.ok ? 'interpreter_translate_failed' : data.error);
    }

    return data;
  };

  const resolveTranslatedText = async (entry: InterpreterMessageEntry) => {
    const response = await requestInterpreterTranslation(entry);

    if (entry.translations?.[entry.targetLang]) {
      return {
        translatedText: entry.translations[entry.targetLang],
        statusPrefix: response.provider === 'mock' ? 'Mock' : 'Translated',
      };
    }

    return {
      translatedText: response.translatedText,
      statusPrefix: response.provider === 'mock' ? 'Mock' : 'Translated',
    };
  };

  const submitInterpreterMessage = async (params: {
    speaker: InterpreterMessage['speaker'];
    inputType: InterpreterMessage['inputType'];
    sourceText: string;
    translations?: Record<ConciergeLocale, string>;
  }) => {
    const normalizedSourceText = params.sourceText.trim();
    if (!normalizedSourceText || isTranslating) return false;

    const { sourceLang, targetLang } = getLocalesForSpeaker(params.speaker);
    const entry: InterpreterMessageEntry = {
      speaker: params.speaker,
      inputType: params.inputType,
      sourceText: normalizedSourceText,
      sourceLang,
      targetLang,
      translations: params.translations,
    };

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const translation = await resolveTranslatedText(entry);

      appendInterpreterMessage(entry, translation.translatedText, translation.statusPrefix);
      return true;
    } catch (error) {
      appendInterpreterMessage(entry, buildSafeFallbackTranslatedText(entry), 'Fallback');
      setTranslationError(
        error instanceof Error
          ? `번역 연결에 실패해 fallback 문구로 표시했습니다: ${error.message}`
          : '번역 연결에 실패해 fallback 문구로 표시했습니다.',
      );
      return true;
    } finally {
      setIsTranslating(false);
    }
  };

  const appendQuickPhraseMessage = (speaker: InterpreterMessage['speaker'], phrase: QuickPhrase) => {
    const { sourceLang } = getLocalesForSpeaker(speaker);

    void submitInterpreterMessage({
      speaker,
      inputType: 'quick-phrase',
      sourceText: phrase.translations[sourceLang] ?? phrase.translations.ko,
      translations: phrase.translations,
    });
  };

  const appendCustomerMessage = () => {
    void submitInterpreterMessage({
      speaker: 'customer',
      inputType: 'voice',
      sourceText: CUSTOMER_SAMPLE_COPY[customerLocale],
      translations: CUSTOMER_SAMPLE_COPY,
    });
  };

  const appendStaffMessage = () => {
    void submitInterpreterMessage({
      speaker: 'staff',
      inputType: 'voice',
      sourceText: STAFF_SAMPLE_COPY[staffLocale],
      translations: STAFF_SAMPLE_COPY,
    });
  };

  const handleCustomerSend = async () => {
    const submitted = await submitInterpreterMessage({
      speaker: 'customer',
      inputType: 'text',
      sourceText: customerInput,
    });

    if (submitted) {
      setCustomerInput('');
    }
  };

  const handleStaffSend = async () => {
    const submitted = await submitInterpreterMessage({
      speaker: 'staff',
      inputType: 'text',
      sourceText: staffInput,
    });

    if (submitted) {
      setStaffInput('');
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <button className={styles.backBtn} type="button" onClick={handleBack}>
          ← 이전으로
        </button>
      </div>

      <section className={styles.titleSection}>
        <h1 className={styles.title}>실시간 통역 도우미</h1>
        <p className={styles.subtitle}>
          고객과 직원이 서로의 언어로 대화할 수 있도록 도와드립니다
        </p>
      </section>

      <section className={styles.languageSection}>
        <div className={styles.langTopRow}>
          <label className={styles.langCard}>
            <span className={styles.langRole}>고객 언어</span>
            <span className={styles.langCurrent}>
              {getLocaleDisplayLabel(customerLocale)}
              <span className={styles.langSelectorArrow}>▼</span>
            </span>
            <select
              aria-label="고객 언어 선택"
              className={styles.langHiddenSelect}
              value={customerLocale}
              onChange={(event) => setCustomerLocale(event.target.value as ConciergeLocale)}
            >
              {INTERPRETER_SUPPORTED_LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {getLocaleDisplayLabel(locale)}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.langSwapBtn} aria-hidden="true">
            ↔
          </div>

          <label className={styles.langCard}>
            <span className={styles.langRole}>직원 언어</span>
            <span className={styles.langCurrent}>
              {getLocaleDisplayLabel(staffLocale)}
              <span className={styles.langSelectorArrow}>▼</span>
            </span>
            <select
              aria-label="직원 언어 선택"
              className={styles.langHiddenSelect}
              value={staffLocale}
              onChange={(event) => setStaffLocale(event.target.value as ConciergeLocale)}
            >
              {INTERPRETER_SUPPORTED_LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {getLocaleDisplayLabel(locale)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={styles.contextSection}>
        <div className={styles.contextScroll}>
          {QUICK_PHRASE_GROUPS.map((group) => (
            <button
              key={group.id}
              className={`${styles.contextChip} ${
                activeQuickGroup === group.id ? styles.contextActive : ''
              }`}
              type="button"
              onClick={() => setActiveQuickGroup(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.actionSection}>
        <div className={styles.actionCard}>
          <div className={styles.langRole}>
            {getLocaleDisplayLabel(customerLocale)} to {getLocaleDisplayLabel(staffLocale)}
          </div>
          <button
            className={`${styles.speakBtn} ${styles.customerBtn}`}
            type="button"
            onClick={appendCustomerMessage}
            disabled={isTranslating}
          >
            {isTranslating ? '번역 중...' : '고객이 말하기'}
          </button>
          <div className={styles.quickPhraseScroll}>
            {activeQuickPhraseGroup.customerPhrases.map((phrase) => (
              <button
                key={phrase.id}
                className={styles.quickPhraseChip}
                type="button"
                onClick={() => appendQuickPhraseMessage('customer', phrase)}
                disabled={isTranslating}
              >
                {phrase.translations[customerLocale] ?? phrase.translations.ko}
              </button>
            ))}
          </div>
          <label className={styles.langRole} htmlFor="customer-text-input">
            고객 텍스트 입력
          </label>
          <div className={styles.inputRow}>
            <input
              id="customer-text-input"
              className={styles.textInput}
              type="text"
              placeholder="고객 메시지를 직접 입력하세요"
              value={customerInput}
              onChange={(event) => setCustomerInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  void handleCustomerSend();
                }
              }}
            />
            <button
              className={styles.sendBtn}
              type="button"
              onClick={() => void handleCustomerSend()}
              disabled={isTranslating}
            >
              전송
            </button>
          </div>
        </div>

        <div className={styles.actionCard}>
          <div className={styles.langRole}>
            {getLocaleDisplayLabel(staffLocale)} to {getLocaleDisplayLabel(customerLocale)}
          </div>
          <button
            className={`${styles.speakBtn} ${styles.staffBtn}`}
            type="button"
            onClick={appendStaffMessage}
            disabled={isTranslating}
          >
            {isTranslating ? '번역 중...' : '직원이 말하기'}
          </button>
          <div className={styles.quickPhraseScroll}>
            {activeQuickPhraseGroup.staffPhrases.map((phrase) => (
              <button
                key={phrase.id}
                className={styles.quickPhraseChip}
                type="button"
                onClick={() => appendQuickPhraseMessage('staff', phrase)}
                disabled={isTranslating}
              >
                {phrase.translations[staffLocale] ?? phrase.translations.ko}
              </button>
            ))}
          </div>
          <label className={styles.langRole} htmlFor="staff-text-input">
            직원 텍스트 입력
          </label>
          <div className={styles.inputRow}>
            <input
              id="staff-text-input"
              className={styles.textInput}
              type="text"
              placeholder="직원 메시지를 직접 입력하세요"
              value={staffInput}
              onChange={(event) => setStaffInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  void handleStaffSend();
                }
              }}
            />
            <button
              className={styles.sendBtn}
              type="button"
              onClick={() => void handleStaffSend()}
              disabled={isTranslating}
            >
              전송
            </button>
          </div>
        </div>
      </section>

      <div className={styles.placeholderBox}>
        <p className={styles.placeholderText}>음성 통역 기능은 다음 단계에서 연결됩니다</p>
      </div>
      {isTranslating ? (
        <p className={styles.translatingText}>서버에서 번역 문구를 준비하고 있습니다.</p>
      ) : null}
      {translationError ? <p className={styles.errorText}>{translationError}</p> : null}

      <section className={styles.conversationArea}>
        {messages.length === 0 ? (
          <div className={styles.placeholderBox}>
            <p className={styles.placeholderText}>
              아직 대화가 없습니다. 말하기 버튼, quick phrase, 텍스트 입력으로 mock 대화를 추가해보세요.
            </p>
          </div>
        ) : (
          <div className={styles.messageList}>
            {messages.map((message) => (
              <article
                key={message.id}
                className={`${styles.messageItem} ${
                  message.speaker === 'customer' ? styles.messageCustomer : styles.messageStaff
                }`}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.messageRole}>
                    {message.speaker === 'customer' ? '고객' : '직원'}
                  </span>
                  <span className={styles.timestamp}>{message.statusLabel}</span>
                </div>
                <p className={styles.sourceText}>{message.sourceText}</p>
                <div className={styles.translatedRow}>
                  <p className={styles.translatedText}>{message.translatedText}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
