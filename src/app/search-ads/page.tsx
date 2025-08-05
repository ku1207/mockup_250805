'use client';

import ProtectedRoute from "@/components/ProtectedRoute";

export default function SearchAds() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">검색광고</h1>
        <p className="text-gray-600">검색 키워드 기반 광고를 관리하세요.</p>
      </div>

      {/* 필터 및 검색 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">캠페인 상태</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>전체</option>
              <option>활성</option>
              <option>일시정지</option>
              <option>종료</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>최근 7일</option>
              <option>최근 30일</option>
              <option>최근 90일</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <input 
              type="text" 
              placeholder="캠페인명 또는 키워드 검색"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 성과 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">노출수</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
          <p className="text-sm text-green-600">+0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">클릭수</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
          <p className="text-sm text-green-600">+0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">클릭률</h3>
          <p className="text-2xl font-bold text-gray-900">-%</p>
          <p className="text-sm text-gray-500">+0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">평균 CPC</h3>
          <p className="text-2xl font-bold text-gray-900">-원</p>
          <p className="text-sm text-red-600">+0%</p>
        </div>
      </div>

      {/* 캠페인 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">검색광고 캠페인</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              새 캠페인 생성
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">캠페인명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">노출수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">클릭수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">클릭률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비용</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  검색광고 캠페인이 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}