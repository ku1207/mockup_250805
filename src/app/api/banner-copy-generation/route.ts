import { NextRequest, NextResponse } from 'next/server';
import { generateBannerCopy, BannerCopyRequest } from '@/services/bannerCopyGeneration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== 배너 카피 생성 API 요청 ===');
    console.log('요청 데이터:', body);

    // 요청 데이터 검증
    if (!body.analysisResult || !body.brandMessage || !body.brandEvent) {
      return NextResponse.json(
        { 
          success: false, 
          error: '필수 데이터가 누락되었습니다. AI 소재 분석 결과, 브랜드 메시지, 브랜드 이벤트가 모두 필요합니다.' 
        },
        { status: 400 }
      );
    }

    const requestData: BannerCopyRequest = {
      analysisResult: body.analysisResult,
      brandMessage: body.brandMessage,
      brandEvent: body.brandEvent
    };

    console.log('GPT 요청 시작...');
    const result = await generateBannerCopy(requestData);
    console.log('GPT 응답 완료:', result);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('=== 배너 카피 생성 API 오류 ===');
    console.error('에러 상세:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}