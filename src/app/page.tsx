import Link from 'next/link'

const features = [
  {
    title: '자산',
    description: '내 모든 자산을 한곳에서 관리하세요',
    details: [
      '전세보증금, 적금, 투자 계좌 등 자산을 유형별로 등록',
      '월 납입일 설정 시 매월 자동으로 금액이 반영돼요',
      '순서를 바꿔 원하는 대로 정렬할 수 있어요',
    ],
    icon: '🏦',
    href: '/assets',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: '부채',
    description: '대출과 상환 현황을 추적하고 순자산을 파악하세요',
    details: [
      '대출 종류와 잔액을 등록해 총 부채를 한눈에 확인',
      '월 상환일 설정 시 매월 자동으로 잔액이 차감돼요',
      '총자산 - 총부채로 순자산을 실시간으로 계산해요',
    ],
    icon: '📋',
    href: '/debts',
    color: 'bg-red-100 text-red-600',
  },
  {
    title: '투자',
    description: '보유 종목의 실시간 수익률을 카테고리별로 확인하세요',
    details: [
      '종목명과 티커를 입력하면 현재가를 자동으로 조회해요',
      '해외 주식은 실시간 환율을 적용해 원화로 환산해요',
      '카테고리별 비중과 수익률 추이를 차트로 확인할 수 있어요',
    ],
    icon: '📈',
    href: '/investments',
    color: 'bg-green-100 text-green-700',
  },
  {
    title: '데일리 리포트',
    description: 'AI가 매일 포트폴리오를 분석하고 액션을 제안해요',
    details: [
      '보유 종목을 기반으로 오늘의 시장 동향을 요약해드려요',
      '카테고리별 이슈와 흐름을 분석해 리스크와 기회를 짚어줘요',
      '오늘 취할 투자 액션 1가지를 구체적으로 제안해요',
    ],
    icon: '🤖',
    href: '/reports',
    color: 'bg-purple-100 text-purple-700',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-20">
        {/* Hero */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />내 자산 관리 시작하기
          </div>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-5">부자되기 ❤️</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            자산부터 투자까지, 내 재정을 한눈에 파악하고
            <br />
            AI로 매일 스마트한 인사이트를 받아보세요
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-10">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400 font-medium tracking-widest uppercase">
            Features
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group flex gap-6 p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${feature.color}`}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-base font-bold text-gray-900">{feature.title}</p>
                  <span className="text-gray-400 group-hover:text-gray-600 transition-colors text-base">
                    →
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 font-medium">
            매일 자정 자산이 자동으로 업데이트됩니다 🕛
          </p>
        </div>
      </div>
    </div>
  )
}
