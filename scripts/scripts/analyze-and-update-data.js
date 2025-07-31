"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mediaResultsData_1 = require("../src/data/mediaResultsData");
const gptService_1 = require("../src/services/gptService");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 환경변수 로드
dotenv_1.default.config({ path: '.env.local' });
/**
 * 데이터를 TypeScript 파일로 저장하는 함수
 */
function saveDataToFile(data) {
    const fileContent = `export interface MediaResultData {
  category: string;
  subCategory: string;
  brandName: string;
  campaignName: string;
  campaignPeriod: string;
  adPlatform: string;
  adTarget: string;
  targetAge: string;
  creativeId: string;
  creativeName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cvr: number;
  adCost: number;
  revenue: number;
  roas: number;
  creativeContent: string;
  mainCopy: string;
  mainCopyType: string;
  mainCopyRatio: string;
  subCopy: string;
  subCopyRatio: string;
  ctaText: string;
  ctaPosition: string;
  ctaRatio: string;
  modelRatio: string;
  productRatio: string;
  visualElements: string;
  creativeColorTone: string;
  eyeFlow: string;
  designAnalysis: string;
}

export const mediaResultsData: MediaResultData[] = ${JSON.stringify(data, null, 2)};`;
    const filePath = path_1.default.join(process.cwd(), 'src/data/mediaResultsData.ts');
    fs_1.default.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`✅ 데이터가 ${filePath}에 저장되었습니다.`);
}
/**
 * 빈 값이 있는지 확인하는 함수
 */
function hasEmptyValues(item) {
    return !item.mainCopy ||
        !item.mainCopyType ||
        !item.subCopy ||
        !item.ctaText ||
        !item.ctaPosition ||
        !item.visualElements ||
        !item.creativeColorTone ||
        !item.eyeFlow ||
        !item.designAnalysis ||
        item.mainCopy === '' ||
        item.mainCopyType === '' ||
        item.subCopy === '' ||
        item.ctaText === '' ||
        item.ctaPosition === '' ||
        item.visualElements === '' ||
        item.creativeColorTone === '' ||
        item.eyeFlow === '' ||
        item.designAnalysis === '';
}
/**
 * 메인 분석 함수
 */
async function analyzeAndUpdateData() {
    console.log('🚀 GPT 이미지 분석을 시작합니다...');
    // API 키 확인
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY가 .env.local 파일에 설정되지 않았습니다.');
        console.log('1. .env.local 파일을 프로젝트 루트에 생성하세요.');
        console.log('2. OPENAI_API_KEY=your_api_key_here 를 추가하세요.');
        process.exit(1);
    }
    // 분석이 필요한 항목들 필터링
    const itemsToAnalyze = mediaResultsData_1.mediaResultsData.filter(hasEmptyValues);
    console.log(`📊 총 ${mediaResultsData_1.mediaResultsData.length}개 중 ${itemsToAnalyze.length}개 항목이 분석이 필요합니다.`);
    if (itemsToAnalyze.length === 0) {
        console.log('✅ 모든 데이터가 이미 완성되어 있습니다.');
        return;
    }
    const updatedData = [...mediaResultsData_1.mediaResultsData];
    let successCount = 0;
    let failCount = 0;
    // 각 항목별로 분석 실행
    for (let i = 0; i < itemsToAnalyze.length; i++) {
        const item = itemsToAnalyze[i];
        const progress = `[${i + 1}/${itemsToAnalyze.length}]`;
        try {
            console.log(`${progress} 분석 중: ${item.creativeName} (${item.creativeContent})`);
            // GPT 분석 실행
            const analysis = await (0, gptService_1.analyzeImageWithGPT)(item.creativeContent);
            // 원본 데이터에서 해당 항목 찾아서 업데이트
            const dataIndex = updatedData.findIndex(d => d.creativeId === item.creativeId);
            if (dataIndex !== -1) {
                updatedData[dataIndex] = Object.assign(Object.assign({}, updatedData[dataIndex]), { mainCopy: analysis.mainCopy === '-' ? '' : analysis.mainCopy, mainCopyType: analysis.mainCopyType === '-' ? '' : analysis.mainCopyType, mainCopyRatio: analysis.mainCopyRatio === '-' ? '' : analysis.mainCopyRatio, subCopy: analysis.subCopy === '-' ? '' : analysis.subCopy, subCopyRatio: analysis.subCopyRatio === '-' ? '' : analysis.subCopyRatio, ctaText: analysis.ctaText === '-' ? '' : analysis.ctaText, ctaPosition: analysis.ctaPosition === '-' ? '' : analysis.ctaPosition, ctaRatio: analysis.ctaRatio === '-' ? '' : analysis.ctaRatio, modelRatio: analysis.modelRatio === '-' ? '' : analysis.modelRatio, productRatio: analysis.productRatio === '-' ? '' : analysis.productRatio, visualElements: analysis.visualElements === '-' ? '' : analysis.visualElements, creativeColorTone: analysis.creativeColorTone === '-' ? '' : analysis.creativeColorTone, eyeFlow: analysis.eyeFlow === '-' ? '' : analysis.eyeFlow, designAnalysis: analysis.designAnalysis === '-' ? '' : analysis.designAnalysis });
            }
            successCount++;
            console.log(`✅ ${progress} ${item.creativeName} 분석 완료`);
            // API 레이트 리밋을 고려하여 1초 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        catch (error) {
            failCount++;
            console.error(`❌ ${progress} ${item.creativeName} 분석 실패:`, error);
            // 실패한 경우에도 계속 진행
            continue;
        }
    }
    // 결과 저장
    console.log('\n📝 분석 결과를 파일에 저장하는 중...');
    saveDataToFile(updatedData);
    // 최종 결과 출력
    console.log('\n🎉 분석 완료!');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${failCount}개`);
    console.log(`📈 전체 진행률: ${Math.round((successCount / itemsToAnalyze.length) * 100)}%`);
}
// 스크립트 실행
if (require.main === module) {
    analyzeAndUpdateData()
        .then(() => {
        console.log('\n🏁 모든 작업이 완료되었습니다.');
        process.exit(0);
    })
        .catch((error) => {
        console.error('\n💥 오류 발생:', error);
        process.exit(1);
    });
}
