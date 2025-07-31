import { MediaResultData } from '@/data/mediaResultsData';
import OpenAI from 'openai';

export interface AIAnalysisResult {
  messageTypeAnalyze: string[];
  ctaAnalyze: string[];
  designAnalyze: string[];
  aiTotalAnalyze: string;
}

export interface MaterialAnalysisData {
  avgCTR: string;
  avgCVR: string;
  avgROAS: string;
  topMaterials: MediaResultData[];
  aiAnalysis: AIAnalysisResult;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_ANALYSIS_PROMPT = `###지시사항
첨부한 배너광고 항목을 분석하여 아래 항목을 채워 기입하십시오.
 
###중요: 출력 규칙
- 응답은 반드시 순수한 JSON 형태로만 출력하십시오.
- JSON 코드 블록(\`\`\`json)을 사용하지 마십시오.
- 어떠한 설명, 주석, 추가 텍스트도 포함하지 마십시오.
- 첫 글자는 반드시 '{' 로 시작하고 마지막 글자는 '}' 로 끝나야 합니다.
 
###작성지침
1. 전체 구조
- 결과는 순수 JSON(UTF-8) 만 출력합니다.
- JSON 외의 문장·설명·주석은 절대 출력하지 마십시오.
- 최상위 키는 4개이며 **누락되는 항목 없이 출력하십시오.**
- 모든 값은 반드시 출력하며, 값이 없거나 파악 불가한 경우 단일 문자열 "-" 로 기재합니다.
- 텍스트 값 내부에 **":"** 또는 **"→"** 기호가 실제 카피로 포함될 경우 \\\: \\\→ 로 이스케이프하십시오.   
 
2. 필드 및 값 규칙
(1) messageTypeAnalyze
   - ":(콜론)" 앞에 어떤 mainCopyType를 분석하였는 지 기입하십시오. 
   - ":(콜론)" 뒤에는 mainCopy·subCopy분석과 분석결론을 작성하십시오. 사이에는 "→"을 삽입하여 가독성을 추가하십시오.
(2) ctaAnalyze
   - 3개의 항목으로 구성된 단일 리스트를 출력하십시오.
   - 각 항목은 아래와 같이 구성하십시오.
     - ctacopy 분석
     - ctaType·ctaPosition·ctaRatio분석
     - cta분석결론
(3) designAnalyze
  - 4개의 항목으로 구성된 단일 리스트를 출력하십시오.
     - visualElements 분석
     - creativeColorTone 분석
     - eyeFlow 분석
     - designAnalysis 분석
(4) aiTotalAnalyze
  - messageTypeAnalyze·ctaAnalyze·designAnalyze에 대해 분석하여 결론을 기입하십시오.
3. 검증 규칙
- 모든 문자열 값 앞뒤에 불필요한 공백이나 줄바꿈이 없어야 합니다.  
- JSON 파싱 오류가 없도록 필드명·구조를 정확히 지켜 출력하십시오.
###출력형태
{
  "messageTypeAnalyze": ["<mainCopyType>: <메시지분석> → <메시지분석결론>"],
  "ctaAnalyze": ["<ctacopy분석>", "<ctaType, ctaPosition, ctaRatio분석>", "<cta분석결론>"],
  "designAnalyze": ["<visualElement분석>", "<materialColorTone분석>", "<eyeFlow분석>", "<designAnalysis분석>"],
  "aiTotalAnalyze": "<messageTypeAnalyze, ctaAnalyze, designAnalyze에 대한 전반적인 분석 결론>"
}
###배너광고데이터
{{배너광고데이터}}`;

/**
 * 상위 20% 소재 추출 함수
 */
export function extractTop20PercentMaterials(
  materials: MediaResultData[],
  selectedMainCategory: string,
  selectedSubCategory: string
): MediaResultData[] {
  // 카테고리 필터링
  let filteredMaterials = materials;
  
  if (selectedMainCategory) {
    filteredMaterials = filteredMaterials.filter(item => item.category === selectedMainCategory);
  }
  
  if (selectedSubCategory) {
    filteredMaterials = filteredMaterials.filter(item => item.subCategory === selectedSubCategory);
  }

  if (filteredMaterials.length === 0) {
    return [];
  }

  // CTR, CVR, ROAS 각각 상위 20% 추출
  const top20PercentCount = Math.ceil(filteredMaterials.length * 0.2);
  
  const topCTRMaterials = [...filteredMaterials]
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, top20PercentCount);
    
  const topCVRMaterials = [...filteredMaterials]
    .sort((a, b) => b.cvr - a.cvr)
    .slice(0, top20PercentCount);
    
  const topROASMaterials = [...filteredMaterials]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, top20PercentCount);

  // 중복 제거를 위해 Set 사용
  const uniqueMaterialIds = new Set([
    ...topCTRMaterials.map(item => item.creativeId),
    ...topCVRMaterials.map(item => item.creativeId),
    ...topROASMaterials.map(item => item.creativeId)
  ]);

  // 고유한 소재들만 반환
  return filteredMaterials.filter(item => uniqueMaterialIds.has(item.creativeId));
}

/**
 * 평균 지표 계산 함수
 */
export function calculateAverageMetrics(materials: MediaResultData[]): {
  avgCTR: string;
  avgCVR: string;
  avgROAS: string;
} {
  if (materials.length === 0) {
    return { avgCTR: '0%', avgCVR: '0%', avgROAS: '0%' };
  }

  // 전체 합계 계산
  const totals = materials.reduce((acc, item) => ({
    impressions: acc.impressions + item.impressions,
    clicks: acc.clicks + item.clicks,
    conversions: acc.conversions + item.conversions,
    adCost: acc.adCost + item.adCost,
    revenue: acc.revenue + item.revenue
  }), { impressions: 0, clicks: 0, conversions: 0, adCost: 0, revenue: 0 });

  // 공식에 따른 계산
  const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCVR = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
  const avgROAS = totals.adCost > 0 ? (totals.revenue / totals.adCost) * 100 : 0;

  return {
    avgCTR: `${Math.round(avgCTR)}%`,
    avgCVR: `${Math.round(avgCVR)}%`,
    avgROAS: `${Math.round(avgROAS)}%`
  };
}

/**
 * GPT를 통한 AI 분석
 */
export async function analyzeWithGPT(materials: MediaResultData[]): Promise<AIAnalysisResult> {
  try {
    // 배너광고데이터 문자열 생성
    const bannerData = materials.map(item => ({
      소재명: item.creativeName,
      메인카피: item.mainCopy || '-',
      메인카피유형: item.mainCopyType || '-',
      서브카피: item.subCopy || '-',
      CTA문구: item.ctaText || '-',
      CTA위치: item.ctaPosition || '-',
      비주얼요소: item.visualElements || '-',
      소재칼라톤: item.creativeColorTone || '-',
      시선흐름: item.eyeFlow || '-',
      디자인분석: item.designAnalysis || '-',
      CTR: `${item.ctr.toFixed(2)}%`,
      CVR: `${item.cvr.toFixed(2)}%`,
      ROAS: `${item.roas.toFixed(2)}%`
    }));

    const bannerDataString = JSON.stringify(bannerData, null, 2);
    const prompt = AI_ANALYSIS_PROMPT.replace('{{배너광고데이터}}', bannerDataString);

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      temperature: 0.4,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('GPT로부터 응답을 받지 못했습니다.');
    }

    // JSON 파싱
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysisResult = JSON.parse(cleanContent) as AIAnalysisResult;
    
    // 필수 필드 검증
    const requiredFields = ['messageTypeAnalyze', 'ctaAnalyze', 'designAnalyze', 'aiTotalAnalyze'];
    for (const field of requiredFields) {
      if (!(field in analysisResult)) {
        throw new Error(`필수 필드가 누락되었습니다: ${field}`);
      }
    }

    return analysisResult;
  } catch (error) {
    console.error('GPT 분석 실패:', error);
    throw error;
  }
}

/**
 * 전체 AI 소재 분석 프로세스
 */
export async function performAIMaterialAnalysis(
  materials: MediaResultData[],
  selectedMainCategory: string,
  selectedSubCategory: string
): Promise<MaterialAnalysisData> {
  try {
    // 1. 상위 20% 소재 추출
    const topMaterials = extractTop20PercentMaterials(materials, selectedMainCategory, selectedSubCategory);
    
    if (topMaterials.length === 0) {
      throw new Error('선택한 카테고리에 해당하는 소재가 없습니다.');
    }

    // 2. 평균 지표 계산
    const metrics = calculateAverageMetrics(topMaterials);

    // 3. GPT 분석
    const aiAnalysis = await analyzeWithGPT(topMaterials);

    return {
      avgCTR: metrics.avgCTR,
      avgCVR: metrics.avgCVR,
      avgROAS: metrics.avgROAS,
      topMaterials,
      aiAnalysis
    };
  } catch (error) {
    console.error('AI 소재 분석 실패:', error);
    throw error;
  }
}