import { NextRequest, NextResponse } from 'next/server';
import { generateBannerImageWithGPT, GPTImageGenerationRequest } from '@/services/gptImageServiceA';

export async function POST(request: NextRequest) {
  try {
    console.log('=== AI 이미지 생성 API 호출 시작 ===');
    
    // 요청 본문 파싱 (FormData 또는 JSON 지원)
    let requestData: GPTImageGenerationRequest;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      requestData = {
        messageTypeAnalyze: formData.get('messageTypeAnalyze') as string,
        ctaAnalyze: formData.get('ctaAnalyze') as string,
        designAnalyze: formData.get('designAnalyze') as string,
        copyType: formData.get('copyType') as string,
        bannerSampleCopy: formData.get('bannerSampleCopy') as string,
        abTestCopyExamples: formData.get('abTestCopyExamples') as string,
        recommendedColorTone: formData.get('recommendedColorTone') as string,
        recommendedCtaCopyExamples: formData.get('recommendedCtaCopyExamples') as string,
        size: formData.get('size') as string,
        selectedMainCategory: formData.get('selectedMainCategory') as string,
        selectedSubCategory: formData.get('selectedSubCategory') as string,
        userUploadedImage: formData.get('userUploadedImage') as File | null || undefined
      };
    } else {
      requestData = await request.json();
    }
    
    console.log('요청 데이터:', {
      copyType: requestData.copyType,
      size: requestData.size,
      hasAnalysisData: !!(requestData.messageTypeAnalyze && requestData.ctaAnalyze && requestData.designAnalyze),
      hasUserImage: !!requestData.userUploadedImage
    });

    // 필수 필드 검증
    const requiredFields = [
      'messageTypeAnalyze', 'ctaAnalyze', 'designAnalyze',
      'copyType', 'bannerSampleCopy', 'size'
    ];

    for (const field of requiredFields) {
      if (!requestData[field as keyof GPTImageGenerationRequest]) {
        console.error(`필수 필드 누락: ${field}`);
        return NextResponse.json({
          success: false,
          error: `필수 필드가 누락되었습니다: ${field}`
        }, { status: 400 });
      }
    }

    console.log('필수 필드 검증 완료');

    // GPT 이미지 생성 서비스 호출
    console.log('GPT 이미지 생성 서비스 호출 중...');
    const result = await generateBannerImageWithGPT(requestData);
    
    console.log('GPT 이미지 생성 결과:', {
      success: result.success,
      hasImage: !!result.imageBase64,
      imageSize: result.imageBase64 ? result.imageBase64.length : 0,
      error: result.error
    });

    if (result.success) {
      console.log('이미지 생성 성공');
      return NextResponse.json({
        success: true,
        imageBase64: result.imageBase64,
        message: '이미지가 성공적으로 생성되었습니다.'
      });
    } else {
      console.error('이미지 생성 실패:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || '이미지 생성에 실패했습니다.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('=== AI 이미지 생성 API 오류 ===');
    console.error('에러 타입:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.stack) {
      console.error('스택 트레이스:', error.stack);
    }

    // 사용자 친화적인 에러 메시지 생성
    let userMessage = 'AI 이미지 생성 중 서버 오류가 발생했습니다.';
    
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        userMessage = '요청 데이터 형식이 올바르지 않습니다.';
      } else if (error.message.includes('API key')) {
        userMessage = 'OpenAI API 키 설정에 문제가 있습니다.';
      } else if (error.message.includes('quota')) {
        userMessage = 'API 사용량 한도를 초과했습니다.';
      } else if (error.message.includes('rate limit')) {
        userMessage = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      }
    }

    return NextResponse.json({
      success: false,
      error: userMessage,
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}