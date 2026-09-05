# How many drinks

솔라시티 비어페스티벌 부스 웹앱. 질문 3개 → 오늘 한 잔.

실행: `npm run dev` → http://localhost:8080/

설정 파일은 Finder에서 숨겨 둠. 보이게: Command + Shift + .

---

## 폴더 구조

```
SolaCity-Beer/
│
├── src/
│   ├── intro/                      첫 화면
│   │   ├── intro-screen.tsx        How many drinks / スタート
│   │   ├── load-screen.tsx         스타트 직후 로딩
│   │   └── squiggly-text.tsx
│   │
│   ├── questions/                  질문 3장
│   │   ├── questions.ts            문구, 선택지, 어떤 영상인지
│   │   ├── question-screen.tsx
│   │   └── option-reel.tsx         세로 릴스
│   │
│   ├── beers/                      실제 맥주 7잔
│   │   ├── beers.ts                이름, 문장, 병 사진 경로
│   │   ├── bottle.tsx
│   │   └── beer-poster.tsx
│   │
│   ├── recommend/                  추천
│   │   ├── lexicon.ts              논문 단어
│   │   └── compare.ts              고른 답 → 순위
│   │
│   ├── result/                     오늘 한 잔
│   │   ├── result-screen.tsx
│   │   ├── booth-map.tsx           부스 지도
│   │   └── card-sheet.tsx          카드 3장
│   │
│   ├── shared/                     여러 화면이 같이 씀
│   │   ├── styles.css              색, 글자
│   │   ├── stage.tsx
│   │   └── ui/button.tsx
│   │
│   └── routes/                     주소 (프레임워크가 여기 봄)
│       ├── index.tsx               /
│       ├── q.$step.tsx             /q/1 /q/2 /q/3
│       └── r.tsx                   /r
│
├── public/
│   ├── videos/                     질문 영상
│   │   ├── q1/                     はじまり
│   │   │   ├── aroma_fruity        フルーティーな
│   │   │   ├── aroma_hoppy         ホップの
│   │   │   ├── aroma_fresh         爽やかな
│   │   │   ├── aroma_malty         モルトの
│   │   │   └── aroma_floral        華やかな
│   │   ├── q2/                     さかり
│   │   │   ├── taste_sweet         ほのかな甘み
│   │   │   └── taste_bitter        ほろ苦い
│   │   └── q3/                     なごり
│   │       ├── body_smooth         なめらかな
│   │       ├── body_soft           柔らかな
│   │       ├── body_gentle         優しい
│   │       ├── body_thin           爽やかな
│   │       └── body_full           まろやかな
│   │
│   └── images/
│       └── beers/                  병 PNG 7장
│
└── docs/
    └── HANDOFF.md                  디자인·동선 메모
```

각 영상은 `.mp4` + 아이폰용 `.hevc.mp4` + 첫 장면 `.jpg`가 한 세트입니다.

## 어디를 고치나

| 하고 싶은 일 | 파일 |
|---|---|
| 질문 문구·선택지 | `src/questions/questions.ts` |
| 맥주 이름·설명 | `src/beers/beers.ts` |
| 질문 영상 교체 | `public/videos/q1` (또는 q2, q3) |
| 병 사진 | `public/images/beers/` |
| 추천이 이상함 | `src/recommend/compare.ts` |
| 화면 레이아웃 | `src/intro` / `questions` / `result` |
| 색, 글씨 | `src/shared/styles.css` |
