import { NextRequest, NextResponse } from 'next/server';
import { mediaResultsData } from '@/data/mediaResultsData';
import { performAIMaterialAnalysis } from '@/services/aiMaterialAnalysis';

export async function POST(request: NextRequest) {
  try {
    const { selectedMainCategory, selectedSubCategory } = await request.json();

    console.log('AI 소재 분석 요청:', {
      selectedMainCategory,
      selectedSubCategory,
      totalMaterials: mediaResultsData.length
    });

    // AI 소재 분석 수행
    const analysisResult = await performAIMaterialAnalysis(
      mediaResultsData,
      selectedMainCategory || '',
      selectedSubCategory || ''
    );

    console.log('AI 소재 분석 완료:', {
      topMaterialsCount: analysisResult.topMaterials.length,
      avgCTR: analysisResult.avgCTR,
      avgCVR: analysisResult.avgCVR,
      avgROAS: analysisResult.avgROAS
    });

    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('AI 소재 분석 API 오류:', error);
    
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