import OpenAI from 'openai';

// GPT 이미지 생성 요청 인터페이스
export interface GPTImageGenerationRequest {
  messageTypeAnalyze: string;
  ctaAnalyze: string;
  designAnalyze: string;
  copyType: string;
  bannerSampleCopy: string;
  abTestCopyExamples: string;
  recommendedColorTone: string;
  recommendedCtaCopyExamples: string;
  size: string;
}

// GPT 이미지 생성 결과 인터페이스
export interface GPTImageGenerationResult {
  imageBase64: string;
  success: boolean;
  error?: string;
}

// OpenAI 클라이언트 초기화 (새로운 API 키 사용)
console.log('OpenAI 이미지 클라이언트 초기화 중...');
console.log('이미지 API 키 존재:', !!process.env.OPENAI_IMAGE_API_KEY);

const openaiImageClient = new OpenAI({
  apiKey: process.env.OPENAI_IMAGE_API_KEY,
});

console.log('OpenAI 이미지 클라이언트 초기화 완료');

/**
 * 프롬프트 템플릿 - 변수 치환을 위한 함수
 */
function createImageGenerationPrompt(params: GPTImageGenerationRequest): string {
  // abTestCopyExamples에서 optionA 값만 추출
  const subCopy = typeof params.abTestCopyExamples === 'object' && params.abTestCopyExamples.optionB 
    ? params.abTestCopyExamples.optionB
    : params.abTestCopyExamples;

  return `###지시사항
성과가 우수한 배너광고 정보를 분석하십시오. 그리고 '제작 요청 배너광고'에서 요청한 정보를 기반으로 이미지를 생성하십시오.
실제 운영되는 배너광고 이미지를 참고하여 이미지를 생성하십시오.

###성과가 우수한 배너광고 정보
${params.messageTypeAnalyze}
${params.ctaAnalyze}
${params.designAnalyze}

###제작 요청 배너광고
카피 유형 : ${params.copyType}
배너 카피 : ${params.bannerSampleCopy}
배너 서브 카피 : ${subCopy}
배너 색상 : ${params.recommendedColorTone}
CTA 문구 : ${params.recommendedCtaCopyExamples}`;
}

/**
 * GPT Image-1 모델을 사용하여 배너 이미지 생성
 */
export async function generateBannerImageWithGPT(
  params: GPTImageGenerationRequest
): Promise<GPTImageGenerationResult> {
  try {
    console.log('=== GPT 이미지 생성 시작 ===');
    console.log('요청 파라미터:', {
      copyType: params.copyType,
      size: params.size,
      bannerSampleCopy: params.bannerSampleCopy?.substring(0, 50) + '...'
    });

    // 프롬프트 생성
    const prompt = createImageGenerationPrompt(params);
    console.log('생성된 프롬프트 길이:', prompt.length);

    // OpenAI 이미지 생성 API 호출
    console.log('OpenAI 이미지 생성 API 호출 시작...');
    const response = await openaiImageClient.images.generate({
      model: 'gpt-image-1',
      prompt: prompt,
      size: params.size as any // 사이즈는 OpenAI API 규격에 맞게 전달
    });

    console.log('OpenAI 이미지 생성 API 응답 완료:', {
      dataLength: response.data?.length,
      hasB64Json: !!response.data?.[0]?.b64_json
    });

    // 응답 검증 및 base64 추출
    if (!response.data || !response.data[0]) {
      console.error('이미지 생성 실패: 응답 데이터 없음', response);
      throw new Error('이미지 생성에 실패했습니다. 응답 데이터가 없습니다.');
    }

    // b64_json에서 base64 데이터 추출
    const imageBase64 = response.data[0].b64_json;
    if (!imageBase64) {
      console.error('이미지 생성 실패: b64_json 데이터 없음', response.data[0]);
      throw new Error('이미지 생성에 실패했습니다. base64 데이터가 없습니다.');
    }
    
    console.log('이미지 생성 성공, Base64 길이:', imageBase64.length);

    return {
      imageBase64,
      success: true
    };

  } catch (error) {
    console.error('=== GPT 이미지 생성 실패 ===');
    console.error('에러 타입:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.stack) {
      console.error('스택 트레이스:', error.stack);
    }

    // 사용자 친화적인 에러 메시지 생성
    let userMessage = '이미지 생성 중 오류가 발생했습니다.';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        userMessage = 'OpenAI 이미지 API 키 설정에 문제가 있습니다.';
      } else if (error.message.includes('quota')) {
        userMessage = 'API 사용량 한도를 초과했습니다.';
      } else if (error.message.includes('rate limit')) {
        userMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('model')) {
        userMessage = 'gpt-image-1 모델을 사용할 수 없습니다.';
      }
    }

    return {
      imageBase64: '',
      success: false,
      error: `${userMessage} (${error instanceof Error ? error.message : '알 수 없는 오류'})`
    };
  }
}

/**
 * Base64 이미지를 파일로 저장하는 유틸리티 함수
 */
export function saveBase64Image(base64Data: string, filename: string): string {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Base64 데이터를 바이너리로 변환
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // public 폴더에 저장
    const publicPath = path.join(process.cwd(), 'public', 'generated-banners');
    
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    
    const filePath = path.join(publicPath, filename);
    fs.writeFileSync(filePath, imageBuffer);
    
    // 웹에서 접근 가능한 경로 반환
    return `/generated-banners/${filename}`;
    
  } catch (error) {
    console.error('이미지 파일 저장 실패:', error);
    throw new Error('생성된 이미지를 저장하는데 실패했습니다.');
  }
}

/**
 * 지원되는 이미지 사이즈 목록
 */
export const SUPPORTED_IMAGE_SIZES = [
  '1024x1024',
  '1024x1536',
  '1536x1024'
] as const;

export type ImageSize = typeof SUPPORTED_IMAGE_SIZES[number];

/**
 * 사이즈 유효성 검증
 */
export function validateImageSize(size: string): size is ImageSize {
  return SUPPORTED_IMAGE_SIZES.includes(size as ImageSize);
}