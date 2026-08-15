export type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "text"; text: string }
  | { type: "todo"; text: string; checked?: boolean }
  | { type: "bullet"; text: string }
  | { type: "number"; text: string; index: number }
  | { type: "quote"; text: string }
  | { type: "callout"; emoji: string; text: string }
  | { type: "toggle"; text: string; children: string[] }
  | { type: "divider" }
  | { type: "image"; src: string; caption?: string }

export type NotionPage = {
  id: string
  icon: string
  title: string
  /** 상위 페이지 id (트리 구조용) */
  parentId?: string
  cover?: string
  meta?: string
  blocks: Block[]
}

export const pages: NotionPage[] = [
  {
    id: "getting-started",
    icon: "👋",
    title: "시작하기",
    cover: "/images/cover-gradient.png",
    meta: "3월 12일 · 홍길동",
    blocks: [
      { type: "callout", emoji: "💡", text: "이 페이지는 노션 워크스페이스의 룩앤필을 재현한 데모입니다. 왼쪽 사이드바에서 페이지를 자유롭게 이동해 보세요." },
      { type: "h1", text: "환영합니다 👋" },
      { type: "text", text: "노션은 메모, 문서, 위키, 프로젝트를 하나의 연결된 워크스페이스에서 관리할 수 있는 도구입니다. 아래에서 기본 사용법을 확인해 보세요." },
      { type: "divider" },
      { type: "h2", text: "기본 사용법" },
      { type: "todo", text: "'/' 를 입력해 블록 메뉴 열어보기", checked: true },
      { type: "todo", text: "제목, 텍스트, 체크박스 블록 추가하기", checked: true },
      { type: "todo", text: "페이지 안에 하위 페이지 만들기", checked: false },
      { type: "todo", text: "팀원 초대하고 함께 편집하기", checked: false },
      { type: "h2", text: "블록으로 만드는 문서" },
      { type: "text", text: "노션의 모든 것은 블록입니다. 텍스트 한 줄, 이미지, 표, 심지어 페이지까지 모두 블록으로 구성되어 자유롭게 이동하고 재배치할 수 있습니다." },
      { type: "bullet", text: "드래그 앤 드롭으로 순서 변경" },
      { type: "bullet", text: "블록을 페이지로 전환" },
      { type: "bullet", text: "슬래시 명령으로 빠르게 삽입" },
      { type: "toggle", text: "자주 쓰는 단축키 보기", children: ["Cmd/Ctrl + N — 새 페이지", "Cmd/Ctrl + P — 빠른 검색", "Cmd/Ctrl + Shift + L — 다크 모드"] },
      { type: "quote", text: "정보를 한곳에 모으면 생각도 한곳에 모입니다." },
    ],
  },
  {
    id: "product-roadmap",
    icon: "🗺️",
    title: "제품 로드맵",
    meta: "3월 10일 · 기획팀",
    blocks: [
      { type: "h1", text: "2026 제품 로드맵" },
      { type: "text", text: "분기별 핵심 목표와 진행 상황을 정리합니다. 각 항목을 클릭하면 상세 페이지로 이동합니다." },
      { type: "callout", emoji: "🎯", text: "올해의 테마: '더 빠르고, 더 연결된 워크스페이스'" },
      { type: "h2", text: "1분기 — 기반 다지기" },
      { type: "todo", text: "새 에디터 성능 개선", checked: true },
      { type: "todo", text: "실시간 협업 안정화", checked: true },
      { type: "todo", text: "모바일 오프라인 모드", checked: false },
      { type: "h2", text: "2분기 — 확장" },
      { type: "todo", text: "AI 요약 및 작성 도우미", checked: false },
      { type: "todo", text: "API v2 공개", checked: false },
      { type: "number", text: "사용자 피드백 100건 수집", index: 1 },
      { type: "number", text: "베타 그룹 온보딩", index: 2 },
      { type: "number", text: "정식 출시", index: 3 },
    ],
  },
  {
    id: "meeting-notes",
    icon: "📝",
    title: "회의록",
    meta: "3월 8일 · 홍길동",
    blocks: [
      { type: "h1", text: "주간 팀 싱크" },
      { type: "text", text: "매주 월요일 오전 10시 · 참석: 홍길동, 김철수, 이영희" },
      { type: "divider" },
      { type: "h3", text: "지난주 회고" },
      { type: "bullet", text: "온보딩 플로우 개선 배포 완료" },
      { type: "bullet", text: "가입 전환율 12% 상승" },
      { type: "h3", text: "이번 주 할 일" },
      { type: "todo", text: "디자인 시스템 문서 업데이트", checked: false },
      { type: "todo", text: "고객 인터뷰 3건 진행", checked: false },
      { type: "todo", text: "다음 스프린트 백로그 정리", checked: true },
      { type: "quote", text: "결정 사항: 다음 릴리스는 3월 마지막 주로 확정." },
    ],
  },
  {
    id: "reading-list",
    icon: "📚",
    title: "독서 목록",
    meta: "3월 5일 · 홍길동",
    blocks: [
      { type: "h1", text: "2026 읽고 싶은 책" },
      { type: "todo", text: "함께 자라기 — 김창준", checked: true },
      { type: "todo", text: "디자인 오브 에브리데이 씽스", checked: false },
      { type: "todo", text: "클린 아키텍처", checked: false },
      { type: "callout", emoji: "📖", text: "다 읽은 책은 체크하고, 한 줄 감상을 하위 페이지로 남겨보세요." },
    ],
  },
  {
    id: "personal-home",
    icon: "🏠",
    title: "개인 홈",
    meta: "오늘 · 홍길동",
    blocks: [
      { type: "h1", text: "좋은 아침이에요, 홍길동님" },
      { type: "text", text: "오늘 집중할 일과 최근 문서를 한눈에 확인하세요." },
      { type: "h2", text: "오늘의 할 일" },
      { type: "todo", text: "로드맵 2분기 초안 작성", checked: false },
      { type: "todo", text: "회의록 공유", checked: true },
      { type: "h2", text: "최근 방문한 페이지" },
      { type: "bullet", text: "제품 로드맵" },
      { type: "bullet", text: "주간 팀 싱크" },
      { type: "bullet", text: "독서 목록" },
    ],
  },
]

export type SidebarItem = {
  id: string
  icon: string
  title: string
  children?: SidebarItem[]
}

export const privateTree: SidebarItem[] = [
  {
    id: "getting-started",
    icon: "👋",
    title: "시작하기",
    children: [
      { id: "reading-list", icon: "📚", title: "독서 목록" },
    ],
  },
  {
    id: "product-roadmap",
    icon: "🗺️",
    title: "제품 로드맵",
    children: [
      { id: "meeting-notes", icon: "📝", title: "회의록" },
    ],
  },
]

export const favorites: SidebarItem[] = [
  { id: "personal-home", icon: "🏠", title: "개인 홈" },
]
