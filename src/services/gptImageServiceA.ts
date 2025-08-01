import fs from 'fs';
import path from 'path';
import OpenAI, { toFile } from 'openai';
import { MediaResultData } from '@/data/mediaResultsData';
import { mediaResultsData } from '@/data/mediaResultsData';

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
  selectedMainCategory?: string;
  selectedSubCategory?: string;
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
 * 상위 4개 소재 추출 함수 (extractTop20PercentMaterials와 유사)
 */
function extractTop4Materials(
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

  // CTR, CVR, ROAS 기준으로 상위 소재들 추출
  const topCTRMaterials = [...filteredMaterials]
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 2); // 상위 2개
    
  const topCVRMaterials = [...filteredMaterials]
    .sort((a, b) => b.cvr - a.cvr)
    .slice(0, 1); // 상위 1개
    
  const topROASMaterials = [...filteredMaterials]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 1); // 상위 1개

  // 중복 제거를 위해 Set 사용
  const uniqueMaterialIds = new Set([
    ...topCTRMaterials.map(item => item.creativeId),
    ...topCVRMaterials.map(item => item.creativeId),
    ...topROASMaterials.map(item => item.creativeId)
  ]);

  // 고유한 소재들만 반환하되 최대 4개로 제한
  const topMaterials = filteredMaterials.filter(item => uniqueMaterialIds.has(item.creativeId));
  return topMaterials.slice(0, 4);
}

/**
 * 프롬프트 템플릿 - 변수 치환을 위한 함수
 */
function createImageGenerationPrompt(params: GPTImageGenerationRequest): string {
  // abTestCopyExamples에서 optionA 값만 추출
  const subCopy = typeof params.abTestCopyExamples === 'object' && params.abTestCopyExamples.optionA 
    ? params.abTestCopyExamples.optionA 
    : params.abTestCopyExamples;

  // recommendedCtaCopyExamples를 쉼표로 분할하여 첫 번째 요소 사용
  const ctaElements = params.recommendedCtaCopyExamples.split(',').map(item => item.trim());
  const ctaCopy = ctaElements.length >= 1 ? ctaElements[0] : params.recommendedCtaCopyExamples;

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
CTA 문구 : ${ctaCopy}`;
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
      bannerSampleCopy: params.bannerSampleCopy?.substring(0, 50) + '...',
      selectedMainCategory: params.selectedMainCategory,
      selectedSubCategory: params.selectedSubCategory
    });

    // 상위 4개 소재 추출
    const topMaterials = extractTop4Materials(
      mediaResultsData, 
      params.selectedMainCategory || '', 
      params.selectedSubCategory || ''
    );
    
    console.log('추출된 상위 소재 수:', topMaterials.length);

    // 프롬프트 생성
    const prompt = createImageGenerationPrompt(params);
    console.log('생성된 프롬프트 길이:', prompt.length);

    // 상위 소재 이미지 파일들을 toFile 형태로 변환
    const imageFiles: string[] = topMaterials.map(material => material.creativeContent);
    console.log('참조 이미지 파일들:', imageFiles);

    const images = await Promise.all(
      imageFiles.map(async (filePath) => {
        try {
          // 경로 앞의 슬래시 제거
          const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
          const absolutePath = path.join(process.cwd(), 'public', cleanPath);
          
          if (!fs.existsSync(absolutePath)) {
            console.warn(`이미지 파일 없음: ${absolutePath}`);
            return null;
          }
          
          return await toFile(fs.createReadStream(absolutePath), path.basename(absolutePath), {
            type: 'image/png',
          });
        } catch (error) {
          console.error(`이미지 파일 로드 실패: ${filePath}`, error);
          return null;
        }
      })
    );

    // null 값 제거
    const validImages = images.filter(img => img !== null);
    console.log('유효한 참조 이미지 수:', validImages.length);

    // OpenAI 이미지 편집 API 호출 (참조 이미지가 있는 경우)
    console.log('OpenAI 이미지 생성 API 호출 시작...');
    const response = validImages.length > 0 
      ? await openaiImageClient.images.edit({
          model: 'gpt-image-1',
          image: validImages,
          prompt: prompt,
          size: params.size as "1024x1024" | "1536x1024" | "1024x1536"
        })
      : await openaiImageClient.images.generate({
          model: 'gpt-image-1',
          prompt: prompt,
          size: params.size as "1024x1024" | "1536x1024" | "1024x1536"
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