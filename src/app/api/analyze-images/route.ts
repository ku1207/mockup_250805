import { NextRequest, NextResponse } from 'next/server';
import { mediaResultsData } from '@/data/mediaResultsData';
import { analyzeMultipleImages, analyzeSingleMediaData } from '@/services/gptService';

export async function POST(request: NextRequest) {
  try {
    console.log('=== GPT 분석 API 요청 시작 ===');
    const { action, creativeId } = await request.json();
    console.log('요청 데이터:', { action, creativeId });

    // API 키 상태 확인
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('API 키 존재:', !!apiKey);
    console.log('API 키 길이:', apiKey ? apiKey.length : 0);
    console.log('API 키 시작 부분:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.error('API 키 설정 오류:', { exists: !!apiKey, value: apiKey?.substring(0, 10) });
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다. .env.local 파일에서 OPENAI_API_KEY를 설정해주세요.' },
        { status: 500 }
      );
    }

    // 단일 이미지 분석
    if (action === 'single' && creativeId) {
      console.log('단일 분석 요청:', { creativeId });
      
      const targetItem = mediaResultsData.find(item => item.creativeId === creativeId);
      
      if (!targetItem) {
        console.error('크리에이티브 ID를 찾을 수 없음:', creativeId);
        return NextResponse.json(
          { error: '해당 크리에이티브 ID를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      console.log('분석 대상 아이템:', { 
        creativeId: targetItem.creativeId, 
        creativeName: targetItem.creativeName,
        creativeContent: targetItem.creativeContent 
      });

      try {
        console.log('analyzeSingleMediaData 호출 중...');
        const analyzedItem = await analyzeSingleMediaData(targetItem);
        console.log('분석 완료:', analyzedItem.creativeId);
        return NextResponse.json({ 
          success: true, 
          data: analyzedItem 
        });
      } catch (error) {
        console.error('=== 단일 이미지 분석 실패 ===');
        console.error('에러 객체:', error);
        console.error('에러 타입:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('에러 메시지:', error instanceof Error ? error.message : String(error));
        
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        
        // OpenAI API 키 관련 에러인지 확인
        if (errorMessage.includes('OPENAI_API_KEY')) {
          return NextResponse.json(
            { error: 'OpenAI API 키가 올바르게 설정되지 않았습니다. .env.local 파일을 확인하고 서버를 재시작하세요.' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { error: `이미지 분석 중 오류가 발생했습니다: ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    // 전체 이미지 일괄 분석
    if (action === 'batch') {
      try {
        // 빈 값을 가진 항목들만 필터링
        const itemsToAnalyze = mediaResultsData.filter(item => 
          !item.mainCopy || 
          !item.mainCopyType || 
          !item.subCopy || 
          !item.ctaText ||
          !item.visualElements ||
          !item.creativeColorTone ||
          !item.eyeFlow ||
          !item.designAnalysis
        );

        if (itemsToAnalyze.length === 0) {
          return NextResponse.json({
            success: true,
            message: '분석이 필요한 항목이 없습니다.',
            data: mediaResultsData
          });
        }

        console.log(`총 ${itemsToAnalyze.length}개 항목 분석 시작`);

        const analyzedResults = await analyzeMultipleImages(
          itemsToAnalyze,
          (current, total, currentItem) => {
            console.log(`진행률: ${current}/${total} - ${currentItem}`);
          }
        );

        // 원본 데이터와 분석 결과 병합
        const updatedData = mediaResultsData.map(originalItem => {
          const analyzedItem = analyzedResults.find(
            analyzed => analyzed.creativeId === originalItem.creativeId
          );
          return analyzedItem || originalItem;
        });

        return NextResponse.json({
          success: true,
          message: `${itemsToAnalyze.length}개 항목 분석 완료`,
          analyzedCount: itemsToAnalyze.length,
          data: updatedData
        });

      } catch (error) {
        console.error('일괄 이미지 분석 실패:', error);
        return NextResponse.json(
          { error: '일괄 분석 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: '유효하지 않은 액션입니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API 요청 처리 실패:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // API 상태 테스트
  const apiKey = process.env.OPENAI_API_KEY;
  const apiKeyStatus = !apiKey ? 'missing' : 
                     apiKey === 'your_openai_api_key_here' ? 'placeholder' : 
                     'configured';
  
  return NextResponse.json({
    message: 'Image Analysis API',
    status: 'healthy',
    apiKey: {
      status: apiKeyStatus,
      length: apiKey ? apiKey.length : 0,
      prefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    },
    actions: {
      single: 'POST /api/analyze-images with { action: "single", creativeId: "..." }',
      batch: 'POST /api/analyze-images with { action: "batch" }'
    }
  });
}