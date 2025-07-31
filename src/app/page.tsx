import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* 헤로 섹션 */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI 배너 광고 관리 시스템
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          인공지능 기술을 활용하여 더 효과적인 광고 캠페인을 만들고, 
          실시간으로 성과를 분석하며, 최적화된 결과를 얻으세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            대시보드 바로가기
          </Link>
          <Link 
            href="/banner-ads/ai-banner"
            className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            AI 배너 생성하기
          </Link>
        </div>
      </div>

      {/* 주요 기능 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <Link href="/dashboard" className="group">
          <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">대시보드</h3>
            <p className="text-gray-600">전체 광고 현황을 한눈에 확인하고 실시간 성과를 모니터링하세요.</p>
          </div>
        </Link>

        <Link href="/search-ads" className="group">
          <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">검색광고</h3>
            <p className="text-gray-600">키워드 기반 검색 광고를 효율적으로 관리하고 최적화하세요.</p>
          </div>
        </Link>

        <Link href="/banner-ads" className="group">
          <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">배너광고</h3>
            <p className="text-gray-600">AI 기술로 자동 생성된 배너로 더 높은 성과를 달성하세요.</p>
          </div>
        </Link>

        <Link href="/video-ads" className="group">
          <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">영상광고</h3>
            <p className="text-gray-600">동영상 기반 광고로 더 강력한 메시지를 전달하세요.</p>
          </div>
        </Link>
      </div>

      {/* 통계 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">AI 배너가 만드는 차이</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold mb-2">+150%</div>
            <div className="text-blue-100">클릭률 향상</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">-60%</div>
            <div className="text-blue-100">제작 시간 단축</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">+200%</div>
            <div className="text-blue-100">ROI 개선</div>
          </div>
        </div>
      </div>
    </div>
  );
}