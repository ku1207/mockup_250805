export default function BannerAds() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">배너광고</h1>
        <p className="text-gray-600">다양한 형태의 배너 광고를 관리하세요.</p>
      </div>

      {/* 퀵 액세스 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">매체 결과 데이터</h3>
              <p className="text-sm text-gray-600">광고 매체별 성과 분석 및 리포트</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">→ 바로가기</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI 배너광고</h3>
              <p className="text-sm text-gray-600">AI 기반 자동 배너 생성 및 최적화</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">→ 바로가기</div>
        </div>
      </div>

      {/* 배너 광고 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 배너 수</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
          <p className="text-sm text-gray-500">전체 등록된 배너</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">활성 배너</h3>
          <p className="text-2xl font-bold text-green-600">-</p>
          <p className="text-sm text-gray-500">현재 노출 중인 배너</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 노출수</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
          <p className="text-sm text-green-600">+0% 어제 대비</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">평균 CTR</h3>
          <p className="text-2xl font-bold text-gray-900">-%</p>
          <p className="text-sm text-gray-500">클릭률</p>
        </div>
      </div>

      {/* 배너 목록 */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">배너 목록</h3>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                필터
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                새 배너 생성
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* 배너 카드 예시 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">배너 미리보기</span>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">배너 제목</h4>
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>상태: 활성</span>
                  <span>크기: 300x250</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">노출수:</span>
                    <span className="ml-1 font-medium">-</span>
                  </div>
                  <div>
                    <span className="text-gray-500">클릭수:</span>
                    <span className="ml-1 font-medium">-</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors">
                    수정
                  </button>
                  <button className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                    통계
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 빈 상태 메시지 */}
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 배너가 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}