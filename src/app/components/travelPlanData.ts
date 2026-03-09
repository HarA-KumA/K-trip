export interface PlanTemplate {
  id: string;
  title: string;
  shortIntro: string;
  keywords: string[];
  bookingFocus: string;
  itinerary: { day: number; label: string; desc: string }[];
}

export const TRAVEL_PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'plan-a-3days',
    title: '3 Days: Seoul Beauty Sprint (서울 뷰티 압축 코스)',
    shortIntro: '네일 → 헤어 → 페이셜까지, 예약대행으로 3일 압축 완성',
    keywords: ['네일', '헤어', '스킨케어', '홍대/명동/청담'],
    bookingFocus: 'Day 2(Nail/Hair), Day 3(Facial)',
    itinerary: [
      { day: 1, label: 'Day 1', desc: 'Arrival & Check-in (Myeongdong/Hongdae/Gangnam), Dinner & Night Walk, Condition Check.' },
      { day: 2, label: 'Day 2', desc: 'AM Hongdae Nail Art (e.g., Hey Objet/Unistella), Lunch (Yeonnam), PM Cheongdam Hair Styling (Jennyhouse), Dinner (Hongdae Tour).' },
      { day: 3, label: 'Day 3', desc: 'AM Myeongdong Facial (Line Esthe), Lunch, PM Shopping & Airport Departure.' }
    ]
  },
  {
    id: 'plan-b-5days',
    title: '5 Days: Seoul Beauty Full Course (서울 뷰티 풀코스)',
    shortIntro: '네일/피부/왁싱/메이크업까지 풀세트. 관광은 동선에 맞춰 끼워넣기',
    keywords: ['네일', '헤어', '페이셜', '왁싱', '메이크업', '관광 밸런스'],
    bookingFocus: 'Distributed bookings on Day 2/3/4/5.',
    itinerary: [
      { day: 1, label: 'Day 1', desc: 'Arrival, Check-in, Neighborhood Walk.' },
      { day: 2, label: 'Day 2', desc: 'AM Hongdae Nail, Lunch, PM Cafe Tour/Shopping, Evening Hongdae Nightlife.' },
      { day: 3, label: 'Day 3', desc: 'AM Myeongdong Facial, Lunch (Gwanghwamun), PM Palace Tour (Gyeongbokgung), Evening Han River/Namsan.' },
      { day: 4, label: 'Day 4', desc: 'AM Waxing (Gangnam), Lunch, PM Garosu-gil Shopping, Dinner & Rest.' },
      { day: 5, label: 'Day 5', desc: 'AM Makeup/Hair Styling (Jennyhouse or Jungsaemmool), Lunch, PM Photo Spot (Seongsu) & Airport Departure.' }
    ]
  }
];
