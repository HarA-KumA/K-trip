export interface PlanTemplate {
  id: string;
  title: string;
  tabLabel: string;
  shortIntro: string;
  keywords: string[];
  itinerary: { day: number; label: string; desc: string }[];
}

const KO: PlanTemplate[] = [
  {
    id: 'plan-a-3days',
    title: '3일: 서울 뷰티 압축 코스',
    tabLabel: '3일차 코스',
    shortIntro: '네일 → 헤어 → 페이셜까지, 예약대행으로 3일 압축 완성',
    keywords: ['네일', '헤어', '스킨케어', '홍대/명동/청담'],
    itinerary: [
      { day: 1, label: 'Day 1', desc: '입국 및 체크인 (명동/홍대/강남), 저녁 식사 및 야간 산책, 컨디션 체크' },
      { day: 2, label: 'Day 2', desc: '오전 홍대 네일아트 (ex: 헤이오브제/유니스텔라), 점심(연남동), 오후 청담 헤어 스타일링 (제니하우스), 저녁 (홍대 투어)' },
      { day: 3, label: 'Day 3', desc: '오전 명동 페이셜 관리 (라인에스테), 점심, 오후 쇼핑 및 공항 출국' }
    ]
  },
  {
    id: 'plan-b-5days',
    title: '5일: 서울 뷰티 풀코스',
    tabLabel: '5일차 코스',
    shortIntro: '네일/피부/왁싱/메이크업까지 풀세트. 관광은 동선에 맞춰 끼워넣기',
    keywords: ['네일', '헤어', '페이셜', '왁싱', '메이크업', '관광 밸런스'],
    itinerary: [
      { day: 1, label: 'Day 1', desc: '입국, 체크인, 숙소 주변 산책' },
      { day: 2, label: 'Day 2', desc: '오전 홍대 네일, 점심, 오후 카페 튜어/쇼핑, 저녁 홍대 나이트라이프' },
      { day: 3, label: 'Day 3', desc: '오전 명동 페이셜, 점심(광화문), 오후 궁궐 투어(경복궁), 야간 한강/남산' },
      { day: 4, label: 'Day 4', desc: '오전 왁싱(강남), 점심, 오후 가로수길 쇼핑, 저녁 및 휴식' },
      { day: 5, label: 'Day 5', desc: '오전 메이크업/헤어 (제니하우스 등), 점심, 오후 포토존 방문(성수) 및 공항 출국' }
    ]
  }
];

const EN: PlanTemplate[] = [
  {
    id: 'plan-a-3days',
    title: '3 Days: Seoul Beauty Sprint',
    tabLabel: '3-Day Course',
    shortIntro: 'Nail → Hair → Facial, tightly packed in 3 days with booking help.',
    keywords: ['Nail', 'Hair', 'Skincare', 'Hongdae/Myeongdong'],
    itinerary: [
      { day: 1, label: 'Day 1', desc: 'Arrival & Check-in (Myeongdong/Hongdae/Gangnam), Dinner & Night Walk' },
      { day: 2, label: 'Day 2', desc: 'AM Hongdae Nail Art, Lunch (Yeonnam), PM Cheongdam Hair Styling, Dinner' },
      { day: 3, label: 'Day 3', desc: 'AM Myeongdong Facial, Lunch, PM Shopping & Airport Departure' }
    ]
  },
  {
    id: 'plan-b-5days',
    title: '5 Days: Seoul Beauty Full Course',
    tabLabel: '5-Day Course',
    shortIntro: 'Nail/Skincare/Waxing/Makeup full set. Sightseeing fits perfectly along the route.',
    keywords: ['Nail', 'Hair', 'Facial', 'Waxing', 'Makeup', 'Sightseeing'],
    itinerary: [
      { day: 1, label: 'Day 1', desc: 'Arrival, Check-in, Neighborhood Walk' },
      { day: 2, label: 'Day 2', desc: 'AM Hongdae Nail, Lunch, PM Cafe Tour/Shopping, Evening Hongdae Nightlife' },
      { day: 3, label: 'Day 3', desc: 'AM Myeongdong Facial, Lunch (Gwanghwamun), PM Palace Tour (Gyeongbokgung), Evening Han River/Namsan' },
      { day: 4, label: 'Day 4', desc: 'AM Waxing (Gangnam), Lunch, PM Garosu-gil Shopping, Dinner & Rest' },
      { day: 5, label: 'Day 5', desc: 'AM Makeup/Hair Styling, Lunch, PM Photo Spot (Seongsu) & Airport Departure' }
    ]
  }
];

const TH: PlanTemplate[] = [
  {
    id: 'plan-a-3days',
    title: 'ทริป 3 วัน: คอร์สความงามโซลเร่งรัด',
    tabLabel: 'คอร์ส 3 วัน',
    shortIntro: 'ทำเล็บ → ทำผม → ดูแลผิวหน้า ภายใน 3 วัน พร้อมบริการจอง',
    keywords: ['ทำเล็บ', 'ทำผม', 'ดูแลผิวหน้า', 'ฮงแด/เมียงดง'],
    itinerary: [
      { day: 1, label: 'Day 1', desc: 'เดินทางถึง & เช็คอิน (เมียงดง/ฮงแด/กังนัม), ทานมื้อค่ำ & เดินเล่นกลางคืน' },
      { day: 2, label: 'Day 2', desc: 'เช้า ทำเล็บที่ฮงแด, เที่ยง ทานอาหาร (ยอนนัม), บ่าย ทำผมที่ชองดัม, ค่ำ เที่ยวฮงแด' },
      { day: 3, label: 'Day 3', desc: 'เช้า นวดหน้าเมียงดง, เที่ยง ทานอาหาร, บ่าย ช้อปปิ้ง & เดินทางกลับ' }
    ]
  },
  {
    id: 'plan-b-5days',
    title: 'ทริป 5 วัน: คอร์สความงามโซลแบบจัดเต็ม',
    tabLabel: 'คอร์ส 5 วัน',
    shortIntro: 'ครบเซ็ต ทำเล็บ/ผิวหน้า/แว็กซ์/แต่งหน้า รวมถึงการเที่ยวชมสถานที่ต่างๆ',
    keywords: ['ทำเล็บ', 'ทำผม', 'สกินแคร์', 'แว็กซ์', 'แต่งหน้า', 'ท่องเที่ยว'],
    itinerary: [
      { day: 1, label: 'Day 1', desc: 'เดินทางถึง, เช็คอิน, เดินเล่นรอบที่พัก' },
      { day: 2, label: 'Day 2', desc: 'เช้า ทำเล็บฮงแด, เที่ยง ทานอาหาร, บ่าย คาเฟ่/ช้อปปิ้ง, ค่ำ ฮงแดไลฟ์' },
      { day: 3, label: 'Day 3', desc: 'เช้า นวดหน้าเมียงดง, เที่ยง (กวางฮวามุน), บ่าย เที่ยวพระราชวัง(เคียงบก), ค่ำ แม่น้ำฮัน/นัมซาน' },
      { day: 4, label: 'Day 4', desc: 'เช้า แว็กซ์(กังนัม), เที่ยง ทานอาหาร, บ่าย ช้อปปิ้งคาโรซูกิล, ค่ำ พักผ่อน' },
      { day: 5, label: 'Day 5', desc: 'เช้า แต่งหน้า/ทำผม, เที่ยง ทานอาหาร, บ่าย ถ่ายรูป(ซองซู) & เดินทางกลับ' }
    ]
  }
];

export const getTravelPlanTemplatesByLanguage = (lang: string = 'ko') => {
  if (lang.startsWith('ko')) return KO;
  if (lang.startsWith('th')) return TH;
  return EN;
};
