import OpenAI from 'openai';

export interface BannerCopyData {
  copyType: string;
  description: string;
  bannerSampleCopy: string;
  performanceMetricExamples: string[];
  abTestCopyExamples: {
    optionA: string;
    optionB: string;
  };
  recommendedColorTone: string[];
  recommendedCtaCopyExamples: string[];
}

export interface BannerCopyResponse {
  bannerCopyTable: BannerCopyData[];
}

export interface BannerCopyRequest {
  analysisResult: {
    messageTypeAnalyze: string[];
    ctaAnalyze: string[];
    designAnalyze: string[];
    aiTotalAnalyze: string;
  };
  brandMessage: string;
  brandEvent: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBannerCopy(request: BannerCopyRequest): Promise<BannerCopyResponse> {
  // 배너광고분석결과 텍스트 조합
  const analysisResultText = [
    '메시지 유형분석:',
    ...request.analysisResult.messageTypeAnalyze,
    '',
    'CTA 분석:',
    ...request.analysisResult.ctaAnalyze,
    '',
    '디자인 분석:',
    ...request.analysisResult.designAnalyze,
    '',
    'AI 종합분석:',
    request.analysisResult.aiTotalAnalyze
  ].join('\n');

  const prompt = `###지시사항
첨부한 정보들을 기반으로 배너광고 카피를 작성하십시오.
 
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
 
2. 필드 및 값 규칙
(1) copyType
   - 목록 : ["discountBenefitEmphasis", "scarcityUrgencyEmphasis", "customerReviewTrustEmphasis", "keywordShortEmphasis", "performanceResultEmphasis", "emotionalEmpathy", "challengeParticipationInducement", "hookingPhrase", "comparisonContrast"]
(2) description
   - copyType을 기반으로 목표 지향점을 개조식으로 작성하십시오.
(3) bannerSampleCopy
   - copyType을 마케팅 관점에서의 목표 지향점을 기반으로 배너광고 메인카피를 작성하십시오.
(4) performanceMetricExamples
   - 해당 배너광고를 집행하였을 때 예상되는 성과 증진 지표를 아래 항목에서 찾아 기입하십시오.
   - 목록 : [ROAS, CTR, CVR, 노출수, 클릭수, 전환수, 광고비, 매출액]
(5) abTestCopyExamples
   - bannerSampleCopy와 함께 사용할 A/B 테스트용 서브 카피를 각각 optionA, optionB에 작성하십시오.
(6) recommenedColorTone
   - 배너광고 이미지에 주로 사용할 색상을 기입하십시오.
(7) recommendedCtaCopyExamples
   - 배너광고에 CTA 버튼을 넣는다고 가정하였을 때 CTA 버튼에 넣을 문구를 기입하십시오.
 
###출력형태
{
"bannerCopyTable": [
{
"copyType": "discountBenefitEmphasis", "description": "<copyType마케팅목표지향점>", "bannerSampleCopy": "<배너광고메인카피>", "performanceMetricExamples": [<예상 증진 지표>, ...],
"abTestCopyExamples": {"optionA": "<A/B테스트용 서브카피A>", "optionB": "<A/B테스트용 서브카피B>"},
"recommendedColorTone": ["<배너광고추천색상>", ...], "recommendedCtaCopyExamples": ["<cta버튼문구>", ...]
},
...coptType 목록 개수만큼 출력...
]
}
 
###배너광고분석결과
${analysisResultText}
 
###브랜드메시지
${request.brandMessage}
 
###브랜드이벤트
${request.brandEvent}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 4000
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('GPT 응답을 받지 못했습니다.');
    }

    // JSON 파싱 시도
    try {
      const parsedResponse = JSON.parse(responseContent) as BannerCopyResponse;
      return parsedResponse;
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('GPT 응답 내용:', responseContent);
      throw new Error('GPT 응답을 JSON으로 파싱할 수 없습니다.');
    }
  } catch (error) {
    console.error('GPT API 오류:', error);
    throw new Error(`배너 카피 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}