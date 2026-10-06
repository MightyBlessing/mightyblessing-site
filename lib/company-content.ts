// Shared company facts and the current local-review copy for public information pages.
export const capabilities = [
  {
    id: "planning", title: "기획·연출",
    description: "전하고 싶은 메시지를 프로그램과 무대 연출로 만듭니다.",
    items: "콘셉트 · 프로그램 구성 · 무대·공간 기획 · 화면 콘텐츠 · 큐시트",
    situation: "행사의 목적에 맞는 프로그램과 무대",
    scope: "누구에게 무엇을 전할 행사인지부터 함께 살핍니다. 프로그램의 순서, 무대와 공간의 구성, 화면 콘텐츠를 기획하고 현장에서 실행할 연출안과 큐시트를 준비합니다.",
    deliverables: ["프로그램 구성·큐시트", "무대·공간 방향과 연출 계획", "화면 콘텐츠·행사 제작물"],
    caseSlugs: ["sos-2024", "multitracks-korea-launch-2024"],
    caseRoles: ["행사 기획", "현장 연출", "행사 제작물 디자인"],
  },
  {
    id: "production", title: "프로덕션·현장 운영",
    description: "제작 일정과 협력팀을 조율하고, 리허설과 본 행사를 운영합니다.",
    items: "제작 관리 · 기술 파트너 조율 · 리허설 · 중계·화면 운영 · 관객·스태프 운영",
    situation: "제작 준비부터 관객 입장, 공연 진행까지",
    scope: "연출·PD·VJ가 리허설과 본 행사의 진행, 영상과 자막 송출을 맡습니다. 음향·조명·무대 등 전문 파트너와 준비 일정을 맞추고, 관객 동선과 스태프 배치를 계획합니다.",
    deliverables: ["리허설·본 행사 진행", "VJ·자막·화면 운영", "입장·관객 운영과 파트너 조율"],
    caseSlugs: ["campus-worship-2026", "the-sent-2023"],
    caseRoles: ["현장 연출", "영상·자막 송출", "관객 운영", "입장 운영", "포토존·부스 운영", "공연 진행"],
  },
  {
    id: "digital", title: "행사 웹·디지털 도구",
    description: "행사 신청과 QR 입장을 관리하고, 관객의 메시지와 질문을 화면에 보여줍니다.",
    items: "행사 웹 · 등록·QR 입장 · 관객 메시지·질문 · 맞춤 운영 시스템",
    situation: "행사에 참여하는 또 하나의 방법",
    scope: "포도나무로 참가 신청과 현장 QR 체크인을 운영하고, LIVE TEXT로 관객의 메시지·사진·질문을 행사 화면에 띄웁니다. 행사에 필요한 웹사이트와 운영 시스템도 제작합니다.",
    deliverables: ["신청·등록과 QR 체크인", "QR 참여 안내", "관객 콘텐츠 검토·승인·송출"],
    caseSlugs: ["campus-worship-2026", "welove-reconciliation-2026"],
    caseRoles: [],
  },
];

export const studioRoles = [
  { title: "연출·PD", detail: "프로그램과 진행 순서를 기획하고, 큐시트를 바탕으로 리허설과 본 행사를 진행합니다." },
  { title: "영상·자막", detail: "무대에 필요한 화면 콘텐츠를 제작하고, 현장에서 영상과 자막을 송출합니다." },
  { title: "관객 운영·디지털", detail: "참가 신청과 입장 동선을 준비하고, 직접 만든 도구로 QR 체크인과 관객 참여를 운영합니다." },
];

export const capabilityQuestions = [
  {
    question: "공연·행사 제작은 어떤 범위까지 맡길 수 있나요?",
    answer: "프로그램 기획과 무대 연출, 제작 일정과 파트너 조율, 리허설과 현장 진행을 함께합니다. 행사 전체를 준비하거나 영상·자막 송출, 입장·관객 운영 등 필요한 업무부터 범위를 정할 수 있습니다.",
    href: "/portfolio", linkLabel: "프로젝트별 수행 범위 보기",
  },
  {
    question: "교회 행사나 예배·집회도 함께 준비하나요?",
    answer: "마이티블레싱은 예배와 문화 현장에서 공연·행사를 제작하고 운영해 왔습니다. 예배·집회의 메시지와 진행 흐름을 살피고, 주최 측과 프로그램·무대·현장 운영의 협업 범위를 정합니다.",
    href: "/about", linkLabel: "팀과 일하는 방식 보기",
  },
  {
    question: "행사 등록과 QR 체크인 도구만 이용할 수도 있나요?",
    answer: "포도나무는 온라인 참가 신청과 현장 QR 체크인을 관리하는 플랫폼입니다. 별도로 이용하거나 행사 운영과 함께 도입할 수 있습니다. 관객의 메시지·사진·질문을 화면에 띄우는 기능은 LIVE TEXT에서 제공합니다.",
    href: "/products", linkLabel: "행사 등록과 관객 참여 도구 보기",
  },
  {
    question: "행사 기획 문의에는 어떤 정보를 보내면 되나요?",
    answer: "만들고 싶은 행사와 필요한 도움, 현재까지 정해진 일정과 장소를 알려주세요. 일정이나 장소가 확정되지 않아도 문의할 수 있습니다. 자료나 제안서가 있다면 이메일로 함께 보내주세요.",
    href: "/inquiry", linkLabel: "프로젝트 문의하기",
  },
];

export const workingPrinciples = [
  { title: "맡을 일을 함께 정합니다", detail: "행사의 목적과 지금까지 준비된 내용을 듣고, 필요한 업무를 함께 정리합니다. 전체 제작부터 특정 업무의 협업까지 범위를 맞춥니다." },
  { title: "담당자를 같은 계획으로 연결합니다", detail: "제작팀과 전문 파트너가 일정과 담당 업무, 현장 진행 순서를 함께 확인합니다. 각자의 작업이 리허설과 본 행사로 이어지도록 준비합니다." },
  { title: "기획한 사람이 현장까지 함께합니다", detail: "기획과 운영을 연결해 리허설과 본 행사를 진행합니다. 무대의 진행, 화면 송출, 관객 입장 등 맡은 범위를 현장에서 실행합니다." },
];

export const featuredProducts = [
  {
    id: "grapetree" as const, name: "포도나무", label: "GRAPETREE",
    description: "행사 신청과 QR 입장을 관리하는 플랫폼",
    detail: "참가자는 온라인으로 행사에 신청하고, 운영자는 등록 정보를 확인해 현장에서 QR로 입장을 처리합니다.",
    href: "https://grapetree.kr/", ui: "grapetree", uiAlt: "포도나무에서 행사 티켓을 선택하는 화면", uiCaption: "포도나무 · THE SENT 티켓 신청 화면",
    field: "registration", fieldAlt: "WELOVE CAMPUS WORSHIP 2026의 현장 등록 구역", fieldCaption: "WELOVE CAMPUS WORSHIP 2026 · 등록 현장", width: 1200, height: 1391,
    stages: [
      { title: "신청·등록", detail: "참가자가 행사에 신청하고, 운영자가 등록 정보를 확인합니다." },
      { title: "현장 입장", detail: "참가자의 QR 코드를 확인하고 입장을 처리합니다." },
    ],
  },
  {
    id: "live-text" as const, name: "LIVE TEXT", label: "LIVE TEXT",
    description: "관객의 메시지·사진·질문을 화면에 띄우는 서비스",
    detail: "관객이 QR로 접속해 보낸 내용을 운영자가 검토하고, 승인한 콘텐츠를 행사 화면에 보여줍니다.",
    href: "https://live-text.app/", ui: "livetext-approval", uiAlt: "LIVE TEXT에서 관객 메시지를 승인하거나 보관하는 화면 예시", uiCaption: "LIVE TEXT 운영자 승인 화면 · 제공 자료의 데모 예시",
    field: "live-text-field", fieldAlt: "LIVE TEXT QR 참여 안내가 보이는 어노인팅 워십캠프 현장", fieldCaption: "어노인팅 워십캠프 · QR 참여 현장", width: 1200, height: 489,
    stages: [
      { title: "관객 참여", detail: "관객이 QR로 접속해 메시지·사진·질문을 보냅니다." },
      { title: "운영자 검토", detail: "행사 화면에 보낼 콘텐츠를 검토하고 승인합니다." },
      { title: "현장 송출", detail: "승인한 콘텐츠를 행사 화면에 띄웁니다." },
    ],
  },
];
