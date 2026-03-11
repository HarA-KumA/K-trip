'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './interpreter.module.css';

type Message = {
    id: string;
    role: 'customer' | 'staff';
    sourceText: string;
    translatedText: string;
    sourceLang?: string;
    targetLang?: string;
    inputType?: 'voice' | 'text' | 'quick-phrase';
    timestamp: Date;
    isTranslating?: boolean;
    isError?: boolean;
};

export const INTERPRETER_LANGUAGES = [
    { code: 'ko', label: '한국어 (Korean)', ttsCode: 'ko-KR' },
    { code: 'en', label: '영어 (English)', ttsCode: 'en-US' },
    { code: 'ja', label: '일본어 (Japanese)', ttsCode: 'ja-JP' },
    { code: 'zh-CN', label: '중국어 간체 (Chinese Simp.)', ttsCode: 'zh-CN' },
    { code: 'zh-TW', label: '중국어 번체 (Chinese Trad.)', ttsCode: 'zh-TW' },
    { code: 'vi', label: '베트남어 (Vietnamese)', ttsCode: 'vi-VN' },
    { code: 'th', label: '태국어 (Thai)', ttsCode: 'th-TH' },
    { code: 'id', label: '인도네시아어 (Indonesian)', ttsCode: 'id-ID' },
    { code: 'ms', label: '말레이어 (Malay)', ttsCode: 'ms-MY' }
];

const QUICK_PHRASE_CONTEXTS = {
    '일반': {
        customer: [
            { text: 'Can you help me?', translation: '저 좀 도와주시겠어요?' },
            { text: 'Where is the restroom?', translation: '화장실이 어디에 있나요?' },
            { text: 'How much is this?', translation: '이거 얼마인가요?' },
            { text: 'Do you take credit cards?', translation: '신용카드 결제 되나요?' },
            { text: 'Please speak slowly.', translation: '조금 천천히 말씀해 주세요.' }
        ],
        staff: [
            { text: '어떻게 도와드릴까요?', translation: 'How can I help you?' },
            { text: '결제 도와드리겠습니다.', translation: 'I will help you with the checkout.' },
            { text: '영수증 필요하신가요?', translation: 'Do you need a receipt?' },
            { text: '잠시만 기다려 주세요.', translation: 'Please wait a moment.' },
            { text: '다시 한 번 말씀해 주시겠어요?', translation: 'Could you say that again, please?' }
        ]
    },
    '식당/카페': {
        customer: [
            { text: 'Table for two, please.', translation: '두 명 자리 있나요?' },
            { text: 'Do you have an English menu?', translation: '영어 메뉴판 있나요?' },
            { text: 'No cilantro, please.', translation: '고수는 빼주세요.' },
            { text: 'Can I get this to go?', translation: '이거 포장 가능한가요?' },
            { text: 'Check, please.', translation: '계산해 주세요.' }
        ],
        staff: [
            { text: '주문하시겠어요?', translation: 'Are you ready to order?' },
            { text: '드시고 가시나요?', translation: 'For here or to go?' },
            { text: '이 자리에 앉으시면 됩니다.', translation: 'You can sit here.' },
            { text: '맛있게 드세요!', translation: 'Enjoy your meal!' },
            { text: '포장해 드릴까요?', translation: 'Would you like me to pack this up for you?' }
        ]
    },
    '쇼핑': {
        customer: [
            { text: 'Can I try this on?', translation: '이거 입어봐도 되나요?' },
            { text: 'Do you have this in a larger size?', translation: '더 큰 사이즈 있나요?' },
            { text: 'Can I get a tax refund?', translation: '택스리펀 되나요?' },
            { text: 'I am just looking.', translation: '그냥 구경하는 중이에요.' },
            { text: 'Is there a discount?', translation: '할인이 되나요?' }
        ],
        staff: [
            { text: '찾으시는 물건이 있나요?', translation: 'Are you looking for anything in particular?' },
            { text: '세일 중인 상품입니다.', translation: 'This item is on sale.' },
            { text: '피팅룸은 저쪽에 있습니다.', translation: 'The fitting room is over there.' },
            { text: '새 상품으로 준비해 드릴게요.', translation: 'I will get a new one for you.' },
            { text: '환불은 7일 이내에 가능합니다.', translation: 'Refunds are available within 7 days.' }
        ]
    },
    '뷰티': {
        customer: [
            { text: 'I want shorter bangs.', translation: '앞머리를 더 짧게 자르고 싶어요.' },
            { text: 'Please keep the overall length.', translation: '전체적인 기장은 유지해 주세요.' },
            { text: 'I want less volume on the sides.', translation: '옆머리가 너무 뜨지 않게 차분하게 해주세요.' },
            { text: 'I have sensitive skin.', translation: '제가 두피(피부)가 예민한 편이라 신경 써주세요.' },
            { text: 'Please make it look natural.', translation: '최대한 자연스럽게 해주세요.' }
        ],
        staff: [
            { text: '앞머리는 어떻게 해드릴까요?', translation: 'How would you like your bangs styled?' },
            { text: '길이는 어느 정도 자를까요?', translation: 'How much length would you like me to cut off?' },
            { text: '물 온도는 괜찮으신가요?', translation: 'Is the water temperature comfortable for you?' },
            { text: '거울로 한 번 확인해 보시겠어요?', translation: 'Would you like to check it in the mirror?' },
            { text: '불편하시면 언제든 말씀해 주세요.', translation: 'Please let me know anytime if you feel uncomfortable.' }
        ]
    }
};

const speakTranslatedText = (text: string, targetLang: string) => {
    try {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        window.speechSynthesis.cancel(); // Stop any currently playing audio

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find the matching TTS code from our language config
        const targetLangObj = INTERPRETER_LANGUAGES.find(lang => lang.code === targetLang);
        utterance.lang = targetLangObj ? targetLangObj.ttsCode : targetLang;

        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.warn('TTS playback failed silently:', err);
    }
};

export default function InterpreterPage() {
    const router = useRouter();

    const [customerLang, setCustomerLang] = useState('ko'); // 상대방 언어
    const [staffLang, setStaffLang] = useState('en');       // 내 언어
    const [currentContext, setCurrentContext] = useState<keyof typeof QUICK_PHRASE_CONTEXTS>('일반');
    const [messages, setMessages] = useState<Message[]>([]);
    const [customerInput, setCustomerInput] = useState('');
    const [staffInput, setStaffInput] = useState('');

    // Load recent language from local storage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('kello_interpreter_my_lang');
        if (savedLang) {
            setStaffLang(savedLang);
        }
    }, []);

    const updateStaffLang = (lang: string) => {
        setStaffLang(lang);
        localStorage.setItem('kello_interpreter_my_lang', lang);
    };

    const handleSwapLanguages = () => {
        const temp = customerLang;
        setCustomerLang(staffLang);
        setStaffLang(temp);
    };

    const [isRecording, setIsRecording] = useState<'customer' | 'staff' | null>(null);
    const [sttStatus, setSttStatus] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const recordingStartTimeRef = useRef<number>(0);

    const addMessage = async (params: { 
        role: 'customer' | 'staff', 
        sourceText: string, 
        fallbackTranslation?: string,
        inputType: 'voice' | 'text' | 'quick-phrase' 
    }) => {
        const { role, sourceText, fallbackTranslation, inputType } = params;
            
        const sourceLang = role === 'customer' ? customerLang : staffLang;
        const targetLang = role === 'customer' ? staffLang : customerLang;
        const messageId = Date.now().toString();

        const initialMessage: Message = {
            id: messageId,
            role,
            sourceText,
            translatedText: '번역 중...',
            sourceLang,
            targetLang,
            inputType,
            timestamp: new Date(),
            isTranslating: true
        };
        setMessages(prev => [...prev, initialMessage]);

        try {
            // Instant resolution for quick phrases (no need to hit the API)
            if (inputType === 'quick-phrase' && fallbackTranslation) {
                setMessages(prev => prev.map(msg => 
                    msg.id === messageId 
                        ? { ...msg, translatedText: fallbackTranslation, isTranslating: false }
                        : msg
                ));
                speakTranslatedText(fallbackTranslation, targetLang);
                return;
            }

            const res = await fetch('/api/interpreter/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceText, sourceLang, targetLang })
            });
            const data = await res.json();

            if (res.ok && data.ok) {
                setMessages(prev => prev.map(msg => 
                    msg.id === messageId 
                        ? { ...msg, translatedText: data.translatedText, isTranslating: false }
                        : msg
                ));
                // Auto-play TTS for the translated text
                speakTranslatedText(data.translatedText, targetLang);
            } else {
                throw new Error(data.error || '번역 네트워크 오류');
            }
        } catch (err) {
            console.warn('Translation failed:', err);
            const friendlyError = fallbackTranslation || '번역에 실패했습니다. 텍스트 입력을 이용해 보세요.';
            
            setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, translatedText: friendlyError, isTranslating: false, isError: true }
                    : msg
            ));
        }
    };

    const toggleRecording = async (role: 'customer' | 'staff') => {
        if (isRecording === role) {
            // Stop recording
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            return;
        }

        if (isRecording !== null) {
            // Prevent starting a new recording while another is active
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (recordingTimeoutRef.current) {
                    clearTimeout(recordingTimeoutRef.current);
                }

                const recordingDuration = Date.now() - recordingStartTimeRef.current;
                
                // If the recording was too short (less than 1.5s usually means a misclick)
                if (recordingDuration < 1000) {
                    setIsRecording(null);
                    setSttStatus(null);
                    stream.getTracks().forEach(track => track.stop());
                    alert('녹음 시간이 너무 짧습니다. 다시 시도해 주세요.');
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                setSttStatus('음성 분석 중...');
                
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                formData.append('language', role === 'customer' ? customerLang : staffLang);

                try {
                    const res = await fetch('/api/interpreter/transcribe', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    
                    if (res.ok && data.ok) {
                        addMessage({
                            role,
                            sourceText: data.text,
                            inputType: 'voice'
                        });
                    } else {
                        alert('음성 인식 품질이 낮습니다. 텍스트 입력을 권장합니다.');
                    }
                } catch (err) {
                    console.error('STT upload error:', err);
                    alert('음석 인식 서버 통신에 실패했습니다. 텍스트 입력을 이용해주세요.');
                } finally {
                    setIsRecording(null);
                    setSttStatus(null);
                    stream.getTracks().forEach(track => track.stop()); // release mic
                }
            };

            mediaRecorder.start();
            setIsRecording(role);
            recordingStartTimeRef.current = Date.now();
            setSttStatus('녹음 중... (완료 시 버튼 터치)');

            // Safety limit (Stop recording automatically after 15 seconds)
            recordingTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, 15000);
            
        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('마이크 접근 권한이 필요합니다. 모바일 브라우저 설정에서 마이크를 허용해주세요.');
            setIsRecording(null);
        }
    };

    const handleQuickPhrase = (role: 'customer' | 'staff', phrase: { text: string, translation: string }) => {
        addMessage({
            role,
            sourceText: phrase.text,
            fallbackTranslation: phrase.translation,
            inputType: 'quick-phrase'
        });
    };

    const handleCustomerTextSend = () => {
        if (!customerInput.trim()) return;
        addMessage({
            role: 'customer',
            sourceText: customerInput.trim(),
            inputType: 'text'
        });
        setCustomerInput('');
    };

    const handleStaffTextSend = () => {
        if (!staffInput.trim()) return;
        addMessage({
            role: 'staff',
            sourceText: staffInput.trim(),
            inputType: 'text'
        });
        setStaffInput('');
    };

    return (
        <main className={styles.main}>
            {/* Header / Back Button */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    ← 뒤로
                </button>
            </div>

            {/* Title Section */}
            <section className={styles.titleSection}>
                <h1 className={styles.title}>실시간 통역기</h1>
                <p className={styles.subtitle}>
                    한국 어디서든 자유롭게 소통하세요
                </p>
                <div className={styles.onboardingNote}>
                    💡 한 사람씩 번갈아가며 짧게 말씀해 주세요.<br/>
                    음성 인식이 어려울 땐 텍스트를 직접 입력할 수도 있습니다.
                </div>
            </section>

            {/* Language Selectors */}
            <section className={styles.languageSection}>
                <div className={styles.langTopRow}>
                    <div className={styles.langCard}>
                        <span className={styles.langRole}>상대방 언어</span>
                        <div className={styles.langCurrent}>
                            {INTERPRETER_LANGUAGES.find(l => l.code === customerLang)?.label.split(' ')[0]}
                            <span className={styles.langSelectorArrow}>▼</span>
                        </div>
                        <select className={styles.langHiddenSelect} value={customerLang} onChange={(e) => setCustomerLang(e.target.value)}>
                            {INTERPRETER_LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button className={styles.langSwapBtn} onClick={handleSwapLanguages} title="언어 바꾸기">
                        ⇄
                    </button>

                    <div className={styles.langCard}>
                        <span className={styles.langRole}>내 언어</span>
                        <div className={styles.langCurrent}>
                            {INTERPRETER_LANGUAGES.find(l => l.code === staffLang)?.label.split(' ')[0]}
                            <span className={styles.langSelectorArrow}>▼</span>
                        </div>
                        <select className={styles.langHiddenSelect} value={staffLang} onChange={(e) => updateStaffLang(e.target.value)}>
                            {INTERPRETER_LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.quickLangRowCentered}>
                    <div className={styles.quickLangTargetLabel}>빠른 선택 (내 언어)</div>
                    {['en', 'ja', 'zh-CN'].map(code => (
                        <button 
                            key={code}
                            className={`${styles.quickLangChip} ${staffLang === code ? styles.activeQuickLang : ''}`}
                            onClick={() => updateStaffLang(code)}
                        >
                            {INTERPRETER_LANGUAGES.find(l => l.code === code)?.label.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </section>

            {/* Context Selector */}
            <section className={styles.contextSection}>
                <div className={styles.contextScroll}>
                    {Object.keys(QUICK_PHRASE_CONTEXTS).map((ctx) => (
                        <button
                            key={ctx}
                            className={`${styles.contextChip} ${currentContext === ctx ? styles.contextActive : ''}`}
                            onClick={() => setCurrentContext(ctx as keyof typeof QUICK_PHRASE_CONTEXTS)}
                        >
                            {ctx}
                        </button>
                    ))}
                </div>
            </section>

            {/* Action Buttons & Text Input Fallback */}
            <section className={styles.actionSection}>
                <div className={styles.actionCard}>
                    <button 
                        className={`${styles.speakBtn} ${styles.customerBtn} ${isRecording === 'customer' ? styles.recordingActive : ''}`} 
                        onClick={() => toggleRecording('customer')}
                    >
                        {isRecording === 'customer' ? '🛑 중지' : '🎤 상대방이 말하기'}
                    </button>
                    {isRecording === 'customer' && sttStatus && (
                        <div className={styles.sttStatusLabel}>{sttStatus}</div>
                    )}
                    
                    <div className={styles.quickPhraseScroll}>
                        {QUICK_PHRASE_CONTEXTS[currentContext].customer.map((phrase, idx) => (
                            <button 
                                key={idx} 
                                className={styles.quickPhraseChip}
                                onClick={() => handleQuickPhrase('customer', phrase)}
                            >
                                {phrase.text}
                            </button>
                        ))}
                    </div>

                    <div className={styles.inputRow}>
                        <input 
                            type="text" 
                            className={styles.textInput} 
                            placeholder="외국어 직접 입력..." 
                            value={customerInput}
                            onChange={(e) => setCustomerInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCustomerTextSend()}
                        />
                        <button className={styles.sendBtn} onClick={handleCustomerTextSend}>전송</button>
                    </div>
                </div>

                <div className={styles.actionCard}>
                    <button 
                        className={`${styles.speakBtn} ${styles.staffBtn} ${isRecording === 'staff' ? styles.recordingActive : ''}`} 
                        onClick={() => toggleRecording('staff')}
                    >
                        {isRecording === 'staff' ? '🛑 중지' : '🎤 내가 말하기'}
                    </button>
                    {isRecording === 'staff' && sttStatus && (
                        <div className={styles.sttStatusLabel}>{sttStatus}</div>
                    )}
                    
                    <div className={styles.quickPhraseScroll}>
                        {QUICK_PHRASE_CONTEXTS[currentContext].staff.map((phrase, idx) => (
                            <button 
                                key={idx} 
                                className={styles.quickPhraseChip}
                                onClick={() => handleQuickPhrase('staff', phrase)}
                            >
                                {phrase.text}
                            </button>
                        ))}
                    </div>

                    <div className={styles.inputRow}>
                        <input 
                            type="text" 
                            className={styles.textInput} 
                            placeholder="한국어 직접 입력..." 
                            value={staffInput}
                            onChange={(e) => setStaffInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStaffTextSend()}
                        />
                        <button className={styles.sendBtn} onClick={handleStaffTextSend}>전송</button>
                    </div>
                </div>
            </section>

            {/* Conversation Area */}
            <section className={styles.conversationArea}>
                {messages.length === 0 ? (
                    <div className={styles.placeholderBox}>
                        <p className={styles.placeholderText}>
                            상단 버튼을 눌러 대화를 시작해보세요
                        </p>
                    </div>
                ) : (
                    <div className={styles.messageList}>
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`${styles.messageItem} ${msg.role === 'customer' ? styles.messageCustomer : styles.messageStaff}`}
                            >
                                <div className={styles.messageHeader}>
                                    <span className={styles.messageRole}>
                                        {msg.role === 'customer' ? '상대방' : '나'}
                                    </span>
                                    <span className={styles.timestamp}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={styles.sourceText}>{msg.sourceText}</p>
                                <div className={styles.translatedRow}>
                                    <p className={`${styles.translatedText} ${msg.isTranslating ? styles.translatingText : ''} ${msg.isError ? styles.errorText : ''}`}>
                                        {msg.translatedText}
                                    </p>
                                    {!msg.isTranslating && !msg.isError && msg.targetLang && (
                                        <button 
                                            className={styles.replayBtn}
                                            onClick={() => speakTranslatedText(msg.translatedText, msg.targetLang!)}
                                            title="다시 듣기"
                                        >
                                            🔊
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
