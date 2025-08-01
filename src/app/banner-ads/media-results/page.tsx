'use client';

import { useState } from 'react';
import Image from 'next/image';
import { mediaResultsData, MediaResultData } from '@/data/mediaResultsData';

export default function MediaResults() {
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [firstMetric, setFirstMetric] = useState('');
  const [secondMetric, setSecondMetric] = useState('');
  const [data, setData] = useState<MediaResultData[]>(mediaResultsData);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0, item: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  // 페이지네이션 관련 계산
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // 계산된 총합 값들
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
  const totalAdCost = data.reduce((sum, item) => sum + item.adCost, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalRoas = totalAdCost > 0 ? (totalRevenue / totalAdCost * 100) : 0;

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 행 개수 변경 핸들러
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // 첫 페이지로 리셋
  };

  // GPT 일괄 분석 함수
  const handleBatchAnalysis = async () => {
    if (!confirm('모든 이미지를 GPT로 분석하시겠습니까?')) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress({ current: 0, total: 0, item: '분석 시작...' });

    try {
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'batch' }),
      });

      if (!response.ok) {
        throw new Error('분석 요청이 실패했습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        alert(`분석 완료! ${result.analyzedCount}개 항목이 분석되었습니다.`);
      } else {
        throw new Error(result.error || '분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('GPT 분석 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`일괄 분석 중 오류가 발생했습니다:\n${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress({ current: 0, total: 0, item: '' });
    }
  };

  // 단일 이미지 분석 함수
  const handleSingleAnalysis = async (creativeId: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress({ current: 1, total: 1, item: '분석 중...' });

    try {
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'single', creativeId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('=== HTTP 오류 상세 정보 ===');
        console.error('상태 코드:', response.status);
        console.error('상태 텍스트:', response.statusText);
        console.error('응답 헤더:', Object.fromEntries(response.headers.entries()));
        console.error('서버 응답 내용:', errorText);
        console.error('요청 URL:', response.url);
        throw new Error(`분석 요청이 실패했습니다. (${response.status}: ${response.statusText})`);
      }

      const result = await response.json();
      console.log('API 응답:', result);
      
      if (result.success) {
        // 데이터 업데이터
        setData(prevData => 
          prevData.map(item => 
            item.creativeId === creativeId ? result.data : item
          )
        );
        alert('분석이 완료되었습니다!');
      } else {
        throw new Error(result.error || '분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('=== GPT 분석 오류 (프론트엔드) ===');
      console.error('에러 객체:', error);
      console.error('에러 타입:', error instanceof Error ? error.constructor.name : typeof error);
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      
      // 사용자에게 더 친화적인 에러 메시지 제공
      let userMessage = '분석 중 오류가 발생했습니다.';
      
      if (errorMessage.includes('OPENAI_API_KEY')) {
        userMessage = 'OpenAI API 키 설정에 문제가 있습니다.\n관리자에게 문의하세요.';
      } else if (errorMessage.includes('500: Internal Server Error')) {
        userMessage = '서버 내부 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.';
      } else if (errorMessage.includes('이미지 파일')) {
        userMessage = '이미지 파일을 찾을 수 없습니다.\n파일 경로를 확인해주세요.';
      }
      
      alert(`${userMessage}\n\n기술적 오류: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress({ current: 0, total: 0, item: '' });
    }
  };
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  

  // 현재 날짜 기준으로 기본값 설정
  const today = new Date();
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // 카테고리 데이터
  const categoryData = {
    '금융': ['은행', '보험', '증권', '카드', '저축은행', '캐피탈', '핀테크'],
    '통신': ['이동통신사', '알뜰폰', '인터넷', 'IPTV', '통신유통'],
    '유통·쇼핑': ['백화점', '마트', '편의점', '홈쇼핑', '이커머스', '리테일 전문몰'],
    '식음료': ['F&B브랜드', '외식프랜차이즈', '배달', '가공식품', '음료', '주류'],
    '패션·뷰티': ['패션(의류/잡화)', '뷰티(화장품/스킨케어)', '온라인 쇼핑몰'],
    '자동차·모빌리티': ['완성차', '수입차', '중고차', '렌터카', '리스', '내비게이션', 'EV'],
    '건설·부동산': ['시행사', '시공사', '분양대행', '부동산중개', '도시개발', '오피스텔'],
    '교육': ['입시', '초중고 교육', '성인교육', '외국어', '온라인 클래스', '학습지'],
    '여행·레저': ['OTA', '호텔', '항공', '렌터카', '놀이공원', '레저시설'],
    '공공·기관': ['지자체', '정부부처', '공공기관', '협회', '공익캠페인'],
    'IT·전자': ['가전', '모바일기기', 'B2B솔루션', 'SaaS', '보안', '클라우드'],
    '헬스케어': ['병원', '의원', '제약', '건강식품', '바이오', '의료기기'],
    '생활용품': ['주방', '욕실', '청소', '위생', '인테리어', '반려동물용품'],
    '엔터테인먼트': ['OTT', '영화', '방송', '공연', '음반', '팬 플랫폼'],
    '게임·e스포츠': ['모바일게임', '콘솔', 'PC게임', '게임사', '플랫폼', '스트리밍'],
    '물류·운송': ['택배', '물류', '퀵서비스', '창고', '배송대행'],
    '제조·산업체': ['중공업', '기계', '부품', '화학', '철강', 'B2B생산재'],
    '스타트업·기타': ['테크 스타트업', '플랫폼', 'O2O', '커머스', '공유경제'],
    '프랜차이즈': ['카페', '음식점', '교육', '피트니스', '기타 생활 서비스'],
    '기타': ['분류되지 않는 기타 광고주']
  };

  const getUnitByMetric = (metric: string) => {
    switch (metric) {
      case '노출수':
      case '클릭수':
        return '회';
      case 'CTR':
      case 'CVR':
      case 'ROAS':  
      case '메인카피 비중':
      case '서브카피 비중':
      case 'CTA 비중':
      case '모델 비중':
        return '%';
      case '전환수':
        return '건';
      case '광고비':
      case '매출액':
        return '원';
      default:
        return '';
    }
  };


  return (
    <div className="w-4/5 mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">매체 결과 데이터</h1>
        <p className="text-gray-600">각 광고 매체별 성과 분석 및 상세 리포트를 확인하세요.</p>
      </div>

      {/* 검색 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="캠페인명, 메인카피 등 검색"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors">
            검색
          </button>
          <button 
            onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
          >
            세부검색
          </button>
        </div>

        {/* 세부검색 영역 */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isAdvancedSearchOpen ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-200 pt-6">
            {/* (1) 카테고리 및 브랜드 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리 및 브랜드</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">대분류</label>
                  <select 
                    value={selectedMainCategory}
                    onChange={(e) => setSelectedMainCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 text-sm"
                  >
                    <option value="">전체</option>
                    {Object.keys(categoryData).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">소분류</label>
                  <select 
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    disabled={!selectedMainCategory}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed h-10 text-sm"
                  >
                    <option value="">전체</option>
                    {selectedMainCategory && categoryData[selectedMainCategory as keyof typeof categoryData]?.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>{subCategory}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">브랜드명</label>
                  <input 
                    type="text" 
                    placeholder="브랜드명 입력"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* (2) 기간 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">기간</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시작일</label>
                  <input 
                    type="date" 
                    defaultValue={formatDate(firstDayOfCurrentMonth)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">종료일</label>
                  <input 
                    type="date" 
                    defaultValue={formatDate(yesterday)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* (3) 플랫폼 및 창작 요소 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">플랫폼 및 창작 요소</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">광고 플랫폼</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 text-sm">
                    <option>전체</option>
                    <option>카카오</option>
                    <option>구글</option>
                    <option>메타</option>
                    <option>틱톡</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">비주얼요소</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 text-sm">
                    <option>전체</option>
                    <option>실사</option>
                    <option>3D</option>
                    <option>일러스트</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">소재칼라톤</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 text-sm">
                    <option>전체</option>
                    <option>딥톤</option>
                    <option>다크톤</option>
                    <option>네온톤</option>
                    <option>브라이트톤</option>
                    <option>비비드톤</option>
                    <option>소프트톤</option>
                    <option>라이트톤</option>
                    <option>그레이시톤</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">시선흐름</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 text-sm">
                    <option>전체</option>
                    <option>Z</option>
                    <option>F</option>
                    <option>O</option>
                  </select>
                </div>
              </div>
            </div>

            {/* (4) 타겟 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">타겟</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">광고 타겟</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      남성
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      여성
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">타겟 연령</label>
                  <div className="flex flex-wrap gap-2">
                    {['10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대', '90대'].map((age) => (
                      <label key={age} className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-1" />
                        <span className="text-sm">{age}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* (5) 지표 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">지표</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="min-w-[100px] flex-shrink-0">
                  <select 
                    value={firstMetric}
                    onChange={(e) => setFirstMetric(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs h-10"
                  >
                    <option value="">선택</option>
                    <option>노출수</option>
                    <option>클릭수</option>
                    <option>CTR</option>
                    <option>전환수</option>
                    <option>CVR</option>
                    <option>광고비</option>
                    <option>매출액</option>
                    <option>ROAS</option>
                    <option>메인카피 비중</option>
                    <option>서브카피 비중</option>
                    <option>CTA 비중</option>
                    <option>모델 비중</option>
                  </select>
                </div>
                <div className="min-w-[100px] flex-shrink-0">
                  <div className="flex h-10">
                    <input 
                      type="number" 
                      placeholder="값 입력"
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs min-w-[60px]"
                    />
                    <span className="px-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-xs text-gray-600 flex items-center justify-center min-w-[30px]">
                      {getUnitByMetric(firstMetric)}
                    </span>
                  </div>
                </div>
                <div className="min-w-[60px] flex-shrink-0">
                  <select className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs h-10">
                    <option>이상</option>
                    <option>이하</option>
                  </select>
                </div>
                <div className="min-w-[70px] flex-shrink-0">
                  <select className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs h-10">
                    <option>그리고</option>
                    <option>또는</option>
                  </select>
                </div>
                <div className="min-w-[100px] flex-shrink-0">
                  <select 
                    value={secondMetric}
                    onChange={(e) => setSecondMetric(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs h-10"
                  >
                    <option value="">선택</option>
                    <option>노출수</option>
                    <option>클릭수</option>
                    <option>CTR</option>
                    <option>전환수</option>
                    <option>CVR</option>
                    <option>광고비</option>
                    <option>매출액</option>
                    <option>ROAS</option>
                    <option>메인카피 비중</option>
                    <option>서브카피 비중</option>
                    <option>CTA 비중</option>
                    <option>모델 비중</option>
                  </select>
                </div>
                <div className="min-w-[100px] flex-shrink-0">
                  <div className="flex h-10">
                    <input 
                      type="number" 
                      placeholder="값 입력"
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs min-w-[60px]"
                    />
                    <span className="px-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-xs text-gray-600 flex items-center justify-center min-w-[30px]">
                      {getUnitByMetric(secondMetric)}
                    </span>
                  </div>
                </div>
                <div className="min-w-[60px] flex-shrink-0">
                  <select className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs h-10">
                    <option>이상</option>
                    <option>이하</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 주요 지표 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 노출수</h3>
          <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
          <p className="text-sm text-green-600">+0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 클릭수</h3>
          <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          <p className="text-sm text-green-600">+0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">클릭률</h3>
          <p className="text-2xl font-bold text-gray-900">{totalCtr.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">+0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 비용</h3>
          <p className="text-2xl font-bold text-gray-900">{totalAdCost.toLocaleString()}원</p>
          <p className="text-sm text-red-600">+0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">ROAS</h3>
          <p className="text-2xl font-bold text-gray-900">{totalRoas.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">+0%</p>
        </div>
      </div>

      {/* 매체별 상세 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">매체별 상세 데이터</h3>
            <button
              onClick={handleBatchAnalysis}
              disabled={isAnalyzing}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                isAnalyzing
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              {isAnalyzing ? '분석 중...' : '전체 일괄 분석'}
            </button>
          </div>
          
          {/* 진행 상황 표시 */}
          {isAnalyzing && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-800">
                  {analysisProgress.item}
                </span>
                {analysisProgress.total > 0 && (
                  <span className="text-blue-600">
                    {analysisProgress.current} / {analysisProgress.total}
                  </span>
                )}
              </div>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: analysisProgress.total > 0 
                      ? `${(analysisProgress.current / analysisProgress.total) * 100}%` 
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">대분류</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">소분류</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">브랜드명</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">캠페인명</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">캠페인 기간</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">광고플랫폼</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">광고타겟</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">타겟연령</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">소재ID</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">소재명</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">노출수</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">클릭수</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">CTR</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">전환수</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">CVR</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">광고비</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">매출액</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ROAS</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">소재</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">메인카피</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">메인카피 유형</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">메인카피 비중</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">서브카피</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">서브카피 비중</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">CTA 문구</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">CTA 위치</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">CTA 비중</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">모델 비중</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">제품 비중</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">비주얼요소</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">소재칼라톤</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">시선흐름</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[400px]">디자인분석</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">{item.category}</td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">{item.subCategory}</td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">{item.brandName}</td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">{item.campaignName}</td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">{item.campaignPeriod}</td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">
                      {Array.isArray(item.adPlatform) ? item.adPlatform.join(', ') : item.adPlatform}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">
                      {Array.isArray(item.adTarget) ? item.adTarget.join(', ') : item.adTarget}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">
                      {Array.isArray(item.targetAge) ? item.targetAge.join(', ') : item.targetAge}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-center">{item.creativeId}</td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{item.creativeName}</span>
                        <button
                          onClick={() => handleSingleAnalysis(item.creativeId)}
                          disabled={isAnalyzing}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            isAnalyzing
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title="이 항목만 GPT 분석"
                        >
                          분석
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.impressions.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.clicks.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.ctr.toFixed(2)}%
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.conversions.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.cvr.toFixed(2)}%
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.adCost.toLocaleString()}원
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.revenue.toLocaleString()}원
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.roas.toFixed(2)}%
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <Image
                          src={item.creativeContent}
                          alt={item.creativeName}
                          width={60}
                          height={40}
                          className="rounded border object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap max-w-[200px] truncate">
                      {item.mainCopy || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">
                      {item.mainCopyType || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.mainCopyRatio || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap max-w-[200px] truncate">
                      {item.subCopy || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.subCopyRatio || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">
                      {item.ctaText || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">
                      {item.ctaPosition || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.ctaRatio || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.modelRatio || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap text-right">
                      {item.productRatio || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">
                      {item.visualElements || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">
                      {item.creativeColorTone || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">
                      {item.eyeFlow || '-'}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-900 min-w-[400px] max-w-[500px] break-words">
                      {item.designAnalysis || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={32} className="px-6 py-12 text-center text-gray-500">
                    선택한 조건에 해당하는 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* 페이지네이션 */}
        <div className="mt-6 flex items-center justify-between px-6 py-4 border-t border-gray-200">
          {/* 행 개수 선택 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">페이지당 표시:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">
              전체 {totalItems}개 중 {startIndex + 1}-{Math.min(endIndex, totalItems)}개 표시
            </span>
          </div>

          {/* 페이지네이션 버튼 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              &lt;
            </button>
            
            <span className="text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}