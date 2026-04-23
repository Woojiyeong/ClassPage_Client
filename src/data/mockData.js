import { toISO, startOfDay } from '../utils/date.js'

const today = startOfDay(new Date())
const addDays = (n) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** @type {import('./types.js').User[]} */
export const users = [
  { id: 'u-teacher-1', name: '김선생', role: 'teacher' },
  { id: 'u-student-1', name: '이준호', role: 'student', studentNo: '20301', canPostJobs: true },
  { id: 'u-student-2', name: '박소연', role: 'student', studentNo: '20302' },
  { id: 'u-student-3', name: '최민재', role: 'student', studentNo: '20303' },
  { id: 'u-student-4', name: '정하늘', role: 'student', studentNo: '20304' },
]

/** @type {import('./types.js').Schedule[]} */
export const schedules = [
  {
    id: 's-1',
    title: '중간고사',
    date: addDays(3),
    description: '1, 2교시 국어/영어. 소지품 주의.',
    important: true,
    createdBy: 'u-teacher-1',
  },
  {
    id: 's-2',
    title: '학부모 상담 주간',
    date: addDays(7),
    description: '상담 시간 신청 필수',
    important: false,
    createdBy: 'u-teacher-1',
  },
  {
    id: 's-3',
    title: '진로 특강',
    date: addDays(1),
    description: 'AI 분야 현직자 특강',
    important: true,
    createdBy: 'u-teacher-1',
  },
  {
    id: 's-4',
    title: '체육대회',
    date: addDays(14),
    description: '반티 착용',
    important: false,
    createdBy: 'u-teacher-1',
  },
  {
    id: 's-5',
    title: '동아리 모집 마감',
    date: addDays(-2),
    description: '',
    important: false,
    createdBy: 'u-teacher-1',
  },
]

/** @type {import('./types.js').JobPost[]} */
export const jobPosts = [
  {
    id: 'j-1',
    title: '○○IT 프론트엔드 인턴 지원',
    authorId: 'u-student-1',
    authorName: '이준호',
    company: '○○IT',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    content: '서류 통과, 1차 면접 예정. 포트폴리오 피드백 부탁드립니다.',
    visibility: 'teacher-only',
  },
  {
    id: 'j-2',
    title: '△△스튜디오 UX 디자이너 합격',
    authorId: 'u-student-2',
    authorName: '박소연',
    company: '△△스튜디오',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    content: '최종 합격하였습니다. 추천서 감사드려요.',
    visibility: 'teacher-only',
  },
  {
    id: 'j-3',
    title: '□□랩 백엔드 서류 제출',
    authorId: 'u-student-3',
    authorName: '최민재',
    company: '□□랩',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    content: '자소서 초안 첨부. 검토 부탁드립니다.',
    visibility: 'teacher-only',
  },
]

/** @type {import('./types.js').MealMenu[]} */
export const meals = (() => {
  const base = [
    {
      breakfast: { dishes: ['백미밥', '북엇국', '계란말이', '배추김치'], kcal: 480 },
      lunch: { dishes: ['잡곡밥', '소고기미역국', '닭가슴살샐러드', '배추김치', '요거트'], kcal: 720 },
      dinner: { dishes: ['현미밥', '된장국', '제육볶음', '무생채', '사과'], kcal: 650 },
    },
    {
      breakfast: { dishes: ['토스트', '야채수프', '삶은계란', '오렌지주스'], kcal: 460 },
      lunch: { dishes: ['백미밥', '된장찌개', '제육볶음', '시금치나물', '깍두기'], kcal: 780 },
      dinner: { dishes: ['잡곡밥', '콩나물국', '고등어구이', '깻잎무침', '포도'], kcal: 700 },
    },
    {
      breakfast: { dishes: ['누룽지', '달걀찜', '김구이', '단무지'], kcal: 420 },
      lunch: { dishes: ['카레라이스', '감자크로켓', '단무지', '옥수수샐러드', '우유'], kcal: 820 },
      dinner: { dishes: ['잡곡밥', '어묵국', '돈까스', '양배추샐러드', '방울토마토'], kcal: 760 },
    },
    {
      breakfast: { dishes: ['흑미밥', '미역국', '스팸구이', '깍두기'], kcal: 510 },
      lunch: { dishes: ['현미밥', '김치찌개', '고등어구이', '콩나물무침', '방울토마토'], kcal: 760 },
      dinner: { dishes: ['백미밥', '순두부찌개', '불고기', '깻잎장아찌', '키위'], kcal: 720 },
    },
    {
      breakfast: { dishes: ['식빵', '옥수수스프', '계란프라이', '사과주스'], kcal: 470 },
      lunch: { dishes: ['볶음밥', '계란국', '탕수육', '오이무침', '오렌지'], kcal: 830 },
      dinner: { dishes: ['비빔밥', '시래기된장국', '두부조림', '취나물', '요거트'], kcal: 690 },
    },
  ]
  return base.map((m, i) => ({ date: addDays(i), ...m }))
})()

/** @type {import('./types.js').Portfolio[]} */
export const portfolios = [
  {
    id: 'p-1',
    ownerId: 'u-student-1',
    ownerName: '이준호',
    title: '프론트엔드 개발자 준호',
    resume: {
      name: '이준호_이력서.pdf',
      size: 184_320,
      dataUrl: '',
      uploadedAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    portfolio: {
      name: '이준호_포트폴리오.pdf',
      size: 1_248_903,
      dataUrl: '',
      uploadedAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    updatedAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'p-2',
    ownerId: 'u-student-2',
    ownerName: '박소연',
    title: 'UX 디자이너 소연',
    resume: {
      name: '박소연_이력서.pdf',
      size: 210_004,
      dataUrl: '',
      uploadedAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    updatedAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'p-3',
    ownerId: 'u-student-3',
    ownerName: '최민재',
    title: '백엔드 개발자 민재',
    updatedAt: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
]

/** @type {import('./types.js').Rule[]} */
export const rules = [
  { id: 'r-1', order: 1, text: '수업 시작 전 자리에 앉아 교재를 준비한다.' },
  { id: 'r-2', order: 2, text: '서로를 존중하며 험담하지 않는다.' },
  { id: 'r-3', order: 3, text: '급식실 이동 시 조용히 줄 서서 이동한다.' },
  { id: 'r-4', order: 4, text: '청소 당번은 당일 종례 후 10분 이내 청소를 시작한다.' },
  { id: 'r-5', order: 5, text: '휴대폰은 수업 중 보관함에 제출한다.' },
  { id: 'r-6', order: 6, text: '지각 3회 시 패널티 1회가 부여된다.' },
  { id: 'r-7', order: 7, text: '교실 내에서는 실내화를 착용한다.' },
]

/** @type {import('./types.js').Penalty[]} */
export const penalties = [
  {
    id: 'pn-1',
    studentId: 'u-student-3',
    studentName: '최민재',
    reason: '지각 3회',
    date: addDays(-1),
    status: 'open',
  },
  {
    id: 'pn-2',
    studentId: 'u-student-4',
    studentName: '정하늘',
    reason: '수업 중 휴대폰 사용',
    date: addDays(-3),
    status: 'open',
  },
  {
    id: 'pn-3',
    studentId: 'u-student-2',
    studentName: '박소연',
    reason: '청소 불이행',
    date: addDays(-2),
    status: 'resolved',
  },
]

/** @type {import('./types.js').Notice[]} */
export const notices = [
  {
    id: 'n-1',
    title: '급식 메뉴 변경 안내',
    body: '다음 주 월요일 급식이 변경되었습니다. 알레르기 유의하세요.',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 6).toISOString(),
    authorName: '김선생',
  },
  {
    id: 'n-2',
    title: '진로 특강 신청 마감',
    body: '이번 주 금요일까지 신청서를 제출해주세요.',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 30).toISOString(),
    authorName: '김선생',
  },
]
