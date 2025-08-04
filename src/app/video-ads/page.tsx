export default function VideoAds() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">영상광고</h1>
        <p className="text-gray-600">동영상 기반 광고 캠페인을 관리하고 성과를 분석하세요.</p>
      </div>

      {/* 업로드 및 생성 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">새 영상광고 등록</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4M7 4H17M7 4L5 6M17 4L19 6M5 6V20C5 20.5523 5.44772 21 6 21H18C18.4477 21 18 20.5523 18 20V6M5 6H19" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">영상 파일 업로드</h4>
            <p className="text-sm text-gray-500 mb-4">
              MP4, MOV, AVI 파일을 지원합니다<br/>
              최대 100MB까지 업로드 가능
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              파일 선택
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">광고 제목</label>
              <input 
                type="text" 
                placeholder="영상광고 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">광고 유형</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>인스트림 광고</option>
                <option>디스플레이 광고</option>
                <option>소셜미디어 광고</option>
                <option>CTV 광고</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">타겟 플랫폼</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">YouTube</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Instagram</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">TikTok</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Facebook</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea 
                rows={3}
                placeholder="영상광고에 대한 설명을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 성과 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 영상 수</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 조회수</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
          <p className="text-sm text-green-600">+0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">평균 시청 시간</h3>
          <p className="text-2xl font-bold text-gray-900">-초</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">완료율</h3>
          <p className="text-2xl font-bold text-gray-900">-%</p>
          <p className="text-sm text-gray-500">끝까지 시청률</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">참여율</h3>
          <p className="text-2xl font-bold text-gray-900">-%</p>
          <p className="text-sm text-blue-600">클릭/좋아요/공유</p>
        </div>
      </div>

      {/* 영상광고 목록 */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">영상광고 목록</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                필터
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                정렬
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* 영상 카드 예시 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="text-white text-center z-10">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-sm">영상 미리보기</p>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  00:30
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">영상광고 제목</h4>
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>상태: 검토중</span>
                  <span>유형: 인스트림</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">조회수:</span>
                    <span className="ml-1 font-medium">-</span>
                  </div>
                  <div>
                    <span className="text-gray-500">완료율:</span>
                    <span className="ml-1 font-medium">-%</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors">
                    편집
                  </button>
                  <button className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                    분석
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 빈 상태 메시지 */}
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">등록된 영상광고가 없습니다.</p>
            <p className="text-sm text-gray-400">새 영상을 업로드하여 첫 번째 영상광고를 시작해보세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}