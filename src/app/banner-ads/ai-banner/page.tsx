'use client';

import { useState } from 'react';
import { MaterialAnalysisData } from '@/services/aiMaterialAnalysis';
import { BannerCopyResponse } from '@/services/bannerCopyGeneration';

export default function AIBanner() {
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandMessage, setBrandMessage] = useState('');
  const [eventContent, setEventContent] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [selectedCopyType, setSelectedCopyType] = useState('');
  const [selectedImageSize, setSelectedImageSize] = useState('');
  
  // AI 소재 분석 관련 상태
  const [aiAnalysisResult, setAiAnalysisResult] = useState<MaterialAnalysisData | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // AI 카피 생성 관련 상태
  const [bannerCopyResult, setBannerCopyResult] = useState<BannerCopyResponse | null>(null);
  const [isCopyGenerating, setIsCopyGenerating] = useState(false);

  // 카테고리 데이터 (세부검색 기능과 동일)
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
    '프랜차이즈': ['카페', '음식점', '교육', '피트니스', '뷰티', '헬스케어', '기타'],
    '기타': ['분류되지 않는 기타 광고주']
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  // AI 소재 분석 실행 함수
  const handleConfirm = async () => {
    console.log('=== AI 소재 분석 시작 ===');
    console.log('선택된 대분류:', selectedMainCategory || '전체');
    console.log('선택된 소분류:', selectedSubCategory || '전체');

    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      console.log('API 요청 시작...');
      const response = await fetch('/api/ai-material-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedMainCategory,
          selectedSubCategory
        }),
      });
      
      console.log('API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('AI 분석 요청이 실패했습니다.');
      }

      const result = await response.json();
      console.log('API 응답 데이터:', result);
      
      if (result.success) {
        console.log('분석 결과 설정 중...');
        setAiAnalysisResult(result.data);
        console.log('분석 결과 설정 완료');
      } else {
        throw new Error(result.error || 'AI 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 소재 분석 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`AI 소재 분석 중 오류가 발생했습니다:\n${errorMessage}`);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // AI 카피 제안 생성 함수
  const handleGenerateBannerCopy = async () => {
    console.log('=== AI 카피 제안 생성 시작 ===');
    
    // AI 소재 분석 결과가 없는 경우
    if (!aiAnalysisResult) {
      alert('먼저 AI 소재 분석을 실행해주세요.');
      return;
    }

    // 브랜드 메시지와 이벤트 내용이 없는 경우
    if (!brandMessage.trim() || !eventContent.trim()) {
      alert('브랜드 메시지와 이벤트 내용을 모두 입력해주세요.');
      return;
    }

    setIsCopyGenerating(true);
    setBannerCopyResult(null);

    try {
      console.log('API 요청 시작...');
      const response = await fetch('/api/banner-copy-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisResult: aiAnalysisResult.aiAnalysis,
          brandMessage: brandMessage,
          brandEvent: eventContent
        }),
      });
      
      console.log('API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('배너 카피 생성 요청이 실패했습니다.');
      }

      const result = await response.json();
      console.log('API 응답 데이터:', result);
      
      if (result.success) {
        console.log('배너 카피 생성 결과 설정 중...');
        setBannerCopyResult(result.data);
        console.log('배너 카피 생성 결과 설정 완료');
      } else {
        throw new Error(result.error || '배너 카피 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('배너 카피 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`배너 카피 생성 중 오류가 발생했습니다:\n${errorMessage}`);
    } finally {
      setIsCopyGenerating(false);
    }
  };

  // copyType을 한국어로 변환하는 함수
  const getCopyTypeDisplayName = (copyType: string) => {
    const typeMap: { [key: string]: string } = {
      'discountBenefitEmphasis': '할인·혜택 강조형',
      'scarcityUrgencyEmphasis': '한정·긴급성 강조형', 
      'customerReviewTrustEmphasis': '고객후기·신뢰 강조형',
      'keywordShortEmphasis': '키워드·짧은 강조형',
      'performanceResultEmphasis': '실적·성과 강조형',
      'emotionalEmpathy': '감성·공감형',
      'challengeParticipationInducement': '도전·참여 유도형',
      'hookingPhrase': '후킹성 문구형',
      'comparisonContrast': '비교·대조형'
    };
    return typeMap[copyType] || copyType;
  };

  return (
    <div className="w-4/5 mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI 배너 광고</h1>
        <p className="text-gray-600">AI 기술을 활용하여 자동으로 최적화된 배너 광고를 생성하고 관리하세요.</p>
      </div>

      {/* AI 소재 분석 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 소재 분석</h3>
        
        {/* 카테고리 선택 및 브랜드명 입력 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대분류 선택</label>
            <select 
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedSubCategory(''); // 대분류 변경시 소분류 초기화
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
            >
              <option value="">전체</option>
              {Object.keys(categoryData).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">소분류 선택</label>
            <select 
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedMainCategory}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed h-10"
            >
              <option value="">전체</option>
              {selectedMainCategory && categoryData[selectedMainCategory as keyof typeof categoryData]?.map((subCategory) => (
                <option key={subCategory} value={subCategory}>{subCategory}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">브랜드명</label>
            <input 
              type="text" 
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="브랜드명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleConfirm}
              disabled={isAiAnalyzing}
              className={`w-1/3 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isAiAnalyzing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isAiAnalyzing ? '분석 중...' : '확인'}
            </button>
          </div>
        </div>

        {/* 분석 중 로딩 표시 */}
        {isAiAnalyzing && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800 text-sm">AI가 상위 20% 소재를 분석하고 있습니다...</span>
            </div>
          </div>
        )}

        {/* 좌/우 분할 영역 (6:4 비중) */}
        <div className="grid grid-cols-10 gap-6">
          {/* 왼쪽 영역 (6/10) */}
          <div className="col-span-6">
            <div className="w-full">
              <table className="w-full border-collapse border border-gray-300 table-fixed">
                <colgroup>
                  <col className="w-1/3" />
                  <col className="w-1/3" />
                  <col className="w-1/3" />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center">CTR(상위 20% 평균)</td>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center">CVR(상위 20% 평균)</td>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center">ROAS(상위 20% 평균)</td>
                  </tr>
                  <tr>
                    <td className={`border border-gray-300 p-3 text-center ${!aiAnalysisResult ? 'h-12' : ''}`}>
                      {aiAnalysisResult ? aiAnalysisResult.avgCTR : '-'}
                    </td>
                    <td className={`border border-gray-300 p-3 text-center ${!aiAnalysisResult ? 'h-12' : ''}`}>
                      {aiAnalysisResult ? aiAnalysisResult.avgCVR : '-'}
                    </td>
                    <td className={`border border-gray-300 p-3 text-center ${!aiAnalysisResult ? 'h-12' : ''}`}>
                      {aiAnalysisResult ? aiAnalysisResult.avgROAS : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center">메시지 유형분석</td>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center">CTA 분석</td>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center">디자인 분석</td>
                  </tr>
                                     <tr>
                     <td className={`border border-gray-300 p-3 text-left align-top ${!aiAnalysisResult ? 'h-24' : ''}`}>
                       {aiAnalysisResult ? (
                         <div className="space-y-1 text-xs">
                           {aiAnalysisResult.aiAnalysis.messageTypeAnalyze.map((item, index) => (
                             <div key={index} className="break-words">{item}</div>
                           ))}
                         </div>
                       ) : '-'}
                     </td>
                     <td className={`border border-gray-300 p-3 text-left align-top ${!aiAnalysisResult ? 'h-24' : ''}`}>
                       {aiAnalysisResult ? (
                         <div className="space-y-1 text-xs">
                           {aiAnalysisResult.aiAnalysis.ctaAnalyze.map((item, index) => (
                             <div key={index} className="break-words">{item}</div>
                           ))}
                         </div>
                       ) : '-'}
                     </td>
                     <td className={`border border-gray-300 p-3 text-left align-top ${!aiAnalysisResult ? 'h-24' : ''}`}>
                       {aiAnalysisResult ? (
                         <div className="space-y-1 text-xs">
                           {aiAnalysisResult.aiAnalysis.designAnalyze.map((item, index) => (
                             <div key={index} className="break-words">{item}</div>
                           ))}
                         </div>
                       ) : '-'}
                     </td>
                   </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center" colSpan={3}>AI 종합분석</td>
                  </tr>
                  <tr>
                    <td className={`border border-gray-300 p-3 text-center align-top ${!aiAnalysisResult ? 'h-24' : ''}`} colSpan={3}>
                      {aiAnalysisResult ? (
                        <div className="text-xs break-words">
                          {aiAnalysisResult.aiAnalysis.aiTotalAnalyze}
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 오른쪽 영역 (4/10) */}
          <div className="col-span-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">브랜드 메시지</label>
              <input 
                type="text" 
                value={brandMessage}
                onChange={(e) => setBrandMessage(e.target.value)}
                placeholder="브랜드 메시지를 입력하세요."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이벤트 내용</label>
              <input 
                type="text" 
                value={eventContent}
                onChange={(e) => setEventContent(e.target.value)}
                placeholder="이벤트 내용을 입력하세요."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">삽입할 이미지</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {!uploadedImage ? (
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm text-gray-500">이미지를 선택하세요</span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(uploadedImage)}
                      alt="업로드된 이미지"
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 카피 제안 생성 버튼 */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={handleGenerateBannerCopy}
          disabled={isCopyGenerating}
          className={`px-8 py-3 rounded-md transition-all duration-200 font-medium ${
            isCopyGenerating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
          }`}
        >
          {isCopyGenerating ? 'AI 카피 생성 중...' : 'AI 카피 제안 생성'}
        </button>
      </div>

      {/* AI 카피 제안 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 카피 제안</h3>
        
        {/* 카피 생성 중 로딩 표시 */}
        {isCopyGenerating && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800 text-sm">AI가 배너 카피를 생성하고 있습니다...</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="border-collapse border border-gray-300 text-sm min-w-full">
            <colgroup>
              <col className="w-48" />
              <col className="w-64" />
              <col className="w-80" />
              <col className="w-40" />
              <col className="w-80" />
              <col className="w-40" />
              <col className="w-64" />
            </colgroup>
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-center font-medium sticky left-0 bg-gray-50 z-10">카피 유형</th>
                <th className="border border-gray-300 p-3 text-center font-medium">설명</th>
                <th className="border border-gray-300 p-3 text-center font-medium">배너 샘플 카피</th>
                <th className="border border-gray-300 p-3 text-center font-medium">성과 측정 예시</th>
                <th className="border border-gray-300 p-3 text-center font-medium">A/B 테스트 문구 예시</th>
                <th className="border border-gray-300 p-3 text-center font-medium">추천 색상 톤</th>
                <th className="border border-gray-300 p-3 text-center font-medium">추천 CTA 문구 예시</th>
              </tr>
            </thead>
            <tbody>
              {bannerCopyResult ? (
                bannerCopyResult.bannerCopyTable.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center sticky left-0 z-10">
                      {getCopyTypeDisplayName(item.copyType)}
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-xs">
                      {item.description || '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-xs">
                      {item.bannerSampleCopy || '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-xs">
                      {item.performanceMetricExamples?.length > 0 
                        ? item.performanceMetricExamples.join(', ') 
                        : '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-xs">
                      {item.abTestCopyExamples ? (
                        <div className="space-y-1">
                          <div>A: {item.abTestCopyExamples.optionA || '-'}</div>
                          <div>B: {item.abTestCopyExamples.optionB || '-'}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-xs">
                      {item.recommendedColorTone?.length > 0 
                        ? item.recommendedColorTone.join(', ') 
                        : '-'}
                    </td>
                    <td className="border border-gray-300 p-3 text-center text-xs">
                      {item.recommendedCtaCopyExamples?.length > 0 
                        ? item.recommendedCtaCopyExamples.join(', ') 
                        : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                // 기본 빈 행들
                [
                  '할인·혜택 강조형',
                  '한정·긴급성 강조형', 
                  '고객후기·신뢰 강조형',
                  '키워드·짧은 강조형',
                  '실적·성과 강조형',
                  '감성·공감형',
                  '도전·참여 유도형',
                  '후킹성 문구형',
                  '비교·대조형'
                ].map((copyType, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-center sticky left-0 z-10">{copyType}</td>
                    <td className="border border-gray-300 p-3 text-center">-</td>
                    <td className="border border-gray-300 p-3 text-center">-</td>
                    <td className="border border-gray-300 p-3 text-center">-</td>
                    <td className="border border-gray-300 p-3 text-center">-</td>
                    <td className="border border-gray-300 p-3 text-center">-</td>
                    <td className="border border-gray-300 p-3 text-center">-</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 카피 유형 선택 및 AI 이미지 제안 생성 */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <div className="w-1/6">
          <select 
            value={selectedCopyType}
            onChange={(e) => setSelectedCopyType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">카피 유형 선택</option>
            <option value="할인·혜택 강조형">할인·혜택 강조형</option>
            <option value="한정·긴급성 강조형">한정·긴급성 강조형</option>
            <option value="고객후기·신뢰 강조형">고객후기·신뢰 강조형</option>
            <option value="키워드·짧은 강조형">키워드·짧은 강조형</option>
            <option value="실적·성과 강조형">실적·성과 강조형</option>
            <option value="감성·공감형">감성·공감형</option>
            <option value="도전·참여 유도형">도전·참여 유도형</option>
            <option value="후킹성 문구형">후킹성 문구형</option>
            <option value="비교·대조형">비교·대조형</option>
          </select>
        </div>
        <div className="w-1/6">
          <select 
            value={selectedImageSize}
            onChange={(e) => setSelectedImageSize(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">사이즈 선택</option>
            <option value="1024x1024">1024x1024</option>
            <option value="1024x1536">1024x1536</option>
            <option value="1536x1024">1536x1024</option>
          </select>
        </div>
        <div>
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 font-medium whitespace-nowrap">
            AI 이미지 제안 생성
          </button>
        </div>
      </div>


    </div>
  );
}