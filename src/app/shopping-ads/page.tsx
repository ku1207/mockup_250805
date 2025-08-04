export default function ShoppingAds() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">쇼핑광고</h1>
        <p className="text-gray-600">상품 기반 쇼핑 광고를 관리하세요.</p>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상품 카테고리</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>전체 카테고리</option>
              <option>패션</option>
              <option>전자제품</option>
              <option>생활용품</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">가격대</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>전체</option>
              <option>1만원 이하</option>
              <option>1-5만원</option>
              <option>5만원 이상</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">광고 상태</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>전체</option>
              <option>승인</option>
              <option>검토중</option>
              <option>거부</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상품명 검색</label>
            <input 
              type="text" 
              placeholder="상품명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 성과 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 상품수</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">활성 광고</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 판매수</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 매출</h3>
          <p className="text-2xl font-bold text-gray-900">-원</p>
        </div>
      </div>

      {/* 상품 광고 목록 */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">쇼핑광고 목록</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              상품 등록
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* 상품 카드 예시 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-500">상품 이미지</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">상품명이 여기에 표시됩니다</h4>
              <p className="text-lg font-bold text-blue-600 mb-2">-원</p>
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>노출: -</span>
                <span>클릭: -</span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors">
                  수정
                </button>
                <button className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                  일시정지
                </button>
              </div>
            </div>
          </div>
          
          {/* 빈 상태 메시지 */}
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 쇼핑광고가 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}