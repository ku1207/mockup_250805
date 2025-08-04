"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImageWithGPT = analyzeImageWithGPT;
exports.analyzeMultipleImages = analyzeMultipleImages;
exports.analyzeSingleMediaData = analyzeSingleMediaData;
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// OpenAI 클라이언트 초기화
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// 이미지 분석 프롬프트 템플릿
const ANALYSIS_PROMPT = `###지시사항
첨부한 배너광고 이미지를 분석하여 사용자가 요구하는 정보를 찾아 기입하십시오.
 
###작성지침
1. 전체 구조
- 결과는 순수 JSON(UTF-8) 만 출력합니다.
- JSON 외의 문장·설명·주석은 절대 출력하지 마십시오.
- 최상위 키는 14개이며 **누락되는 항목 없이 출력하십시오.**
- 모든 값은 반드시 출력하며, 값이 없거나 파악 불가한 경우 단일 문자열 "-" 로 기재합니다.
 
2. 필드 및 값 규칙
(1) mainCopy  
   - 이미지에서 메인 카피로 인식되는 문구를 기입하십시오. 
(2) mainCopyType
   - 메인 카피의 전달 의도를 판단하여 아래 리스트 중 **정확히 하나**를 입력하십시오.  
     ['할인 · 혜택 강조형', '한정 · 긴급성 강조형', '고객후기 · 신뢰 강조형', '키워드 · 짧은 강조형', '실적 · 성과 강조형', '감성 · 공감형', '도전 · 참여 유도형', '후기성 문구형', '비교 · 대조형']
(3) mainCopyRatio
   - 배너 전체 면적(가로×세로)을 100%로 가정하고, 메인 카피가 차지하는 영역 비중을 **정수+"%"** 형식으로 입력하십시오.
(4) subCopy
   - 이미지에서 서브 카피로 인식되는 문구를 기입하십시오.
(5) subCopyRatio
   - 서브 카피(보조 설명·문장)의 면적 비중을 **정수+"%"** 형식으로 입력하십시오.
(6) ctaText
   - 이미지에서 CTA 버튼에 기입된 문구를 기입하십시오.
(7) ctaPosition
   - CTA(Button·링크) 가 위치한 화면 좌표를 소문자 카멜 케이스로 명시하십시오.
     가능 값: topLeft, topCenter, topRight, centerLeft, center, centerRight, bottomLeft, bottomCenter, bottomRight  
(8) ctaRatio
   - CTA 요소(버튼·텍스트 포함)가 차지하는 면적 비중을 **정수+"%"** 형식으로 입력하십시오.  
(9) modelRatio
   - 인물(모델·손·얼굴 등)이 차지하는 면적 비중을 **정수+"%"** 형식으로 입력하십시오.  
(10) productRatio
   - 제품(실물·패키지 등)이 차지하는 면적 비중을 **정수+"%"** 형식으로 입력하십시오.  
(11) visualElements
   - 배너의 주된 비주얼 표현 방식을 아래 리스트 중 **하나**로 기입하십시오.  
     [일러스트, 실사, 3D]  
   - 복합 사용 시 **가장 지배적인** 요소를 선택합니다.
(12) creativeColorTone
   - 색채·톤을 아래 리스트 중 **하나**로 기입하십시오.  
     ['비비드톤', '라이트톤', '소프트톤', '다크톤', '페일톤', '브라이트톤', '그레이시톤', '딥톤', '파스텔톤', '네온톤']
(13) eyeFlow
   - 시선 흐름을 아래 리스트 중 **하나**로 기입하십시오.  
     ['Z', 'F', 'O']
(14) designAnalysis
   - 디자이너 관점에서 레이아웃·타이포·컬러·균형 등을 종합 평가한 **1~2문장**(120자 이내)으로 작성하십시오.  
   - 주관적 의견 허용하되 구체적 디자인 요소를 언급해야 하며, "좋다/나쁘다" 같은 단순 평가는 피하십시오.
 
3. 검증 규칙
- 모든 문자열 값 앞뒤에 불필요한 공백이나 줄바꿈이 없어야 합니다.  
- JSON 파싱 오류가 없도록 필드명·구조를 정확히 지켜 출력하십시오.
 
###출력형태
{
  "mainCopy": "-",
  "mainCopyType": "-",
  "mainCopyRatio": "-",
  "subCopy": "-",
  "subCopyRatio": "-",
  "ctaText": "-",
  "ctaPosition": "-",
  "ctaRatio": "-",
  "modelRatio": "-",
  "productRatio": "-",
  "visualElements": "-",
  "creativeColorTone": "-",
  "eyeFlow": "-",
  "designAnalysis": "-"
}`;
/**
 * 이미지를 base64로 인코딩하는 함수
 */
function encodeImageToBase64(imagePath) {
    try {
        const absolutePath = path_1.default.join(process.cwd(), 'public', imagePath);
        const imageBuffer = fs_1.default.readFileSync(absolutePath);
        return imageBuffer.toString('base64');
    }
    catch (error) {
        console.error(`이미지 인코딩 실패: ${imagePath}`, error);
        throw new Error(`이미지 파일을 찾을 수 없습니다: ${imagePath}`);
    }
}
/**
 * 이미지 MIME 타입 결정 함수
 */
function getImageMimeType(imagePath) {
    const ext = path_1.default.extname(imagePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.webp':
            return 'image/webp';
        default:
            return 'image/jpeg'; // 기본값
    }
}
/**
 * GPT-4V를 사용하여 단일 이미지 분석
 */
async function analyzeImageWithGPT(imagePath) {
    var _a, _b;
    try {
        // 이미지 파일 존재 확인
        const absolutePath = path_1.default.join(process.cwd(), 'public', imagePath);
        if (!fs_1.default.existsSync(absolutePath)) {
            throw new Error(`이미지 파일이 존재하지 않습니다: ${imagePath}`);
        }
        // 이미지를 base64로 인코딩
        const base64Image = encodeImageToBase64(imagePath);
        const mimeType = getImageMimeType(imagePath);
        console.log(`이미지 분석 시작: ${imagePath}`);
        // OpenAI API 호출
        const response = await openai.chat.completions.create({
            model: 'gpt-4.1',
            temperature: 0.4,
            max_tokens: 1000,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: ANALYSIS_PROMPT
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ]
        });
        const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        if (!content) {
            throw new Error('GPT로부터 응답을 받지 못했습니다.');
        }
        console.log(`GPT 응답 받음: ${imagePath}`);
        // JSON 파싱
        try {
            const analysisResult = JSON.parse(content);
            // 필수 필드 검증
            const requiredFields = [
                'mainCopy', 'mainCopyType', 'mainCopyRatio', 'subCopy', 'subCopyRatio',
                'ctaText', 'ctaPosition', 'ctaRatio', 'modelRatio', 'productRatio',
                'visualElements', 'creativeColorTone', 'eyeFlow', 'designAnalysis'
            ];
            for (const field of requiredFields) {
                if (!(field in analysisResult)) {
                    throw new Error(`필수 필드가 누락되었습니다: ${field}`);
                }
            }
            return analysisResult;
        }
        catch (parseError) {
            console.error('JSON 파싱 실패:', content);
            throw new Error('GPT 응답을 JSON으로 파싱할 수 없습니다.');
        }
    }
    catch (error) {
        console.error(`이미지 분석 실패: ${imagePath}`, error);
        throw error;
    }
}
/**
 * 여러 미디어 결과 데이터를 일괄 분석
 */
async function analyzeMultipleImages(mediaData, onProgress) {
    const results = [];
    for (let i = 0; i < mediaData.length; i++) {
        const item = mediaData[i];
        try {
            // 진행 상황 콜백 호출
            if (onProgress) {
                onProgress(i + 1, mediaData.length, item.creativeName);
            }
            console.log(`분석 중 ${i + 1}/${mediaData.length}: ${item.creativeName}`);
            // 이미지 분석 실행
            const analysis = await analyzeImageWithGPT(item.creativeContent);
            // 분석 결과를 원본 데이터에 병합
            const updatedItem = Object.assign(Object.assign({}, item), { mainCopy: analysis.mainCopy, mainCopyType: analysis.mainCopyType, mainCopyRatio: analysis.mainCopyRatio === '-' ? 0 : parseInt(analysis.mainCopyRatio.replace('%', '')), subCopy: analysis.subCopy, subCopyRatio: analysis.subCopyRatio === '-' ? 0 : parseInt(analysis.subCopyRatio.replace('%', '')), ctaText: analysis.ctaText, ctaPosition: analysis.ctaPosition, ctaRatio: analysis.ctaRatio === '-' ? 0 : parseInt(analysis.ctaRatio.replace('%', '')), modelRatio: analysis.modelRatio === '-' ? 0 : parseInt(analysis.modelRatio.replace('%', '')), productRatio: analysis.productRatio === '-' ? 0 : parseInt(analysis.productRatio.replace('%', '')), visualElements: analysis.visualElements, creativeColorTone: analysis.creativeColorTone, eyeFlow: analysis.eyeFlow, designAnalysis: analysis.designAnalysis });
            results.push(updatedItem);
            // API 레이트 리밋을 고려하여 지연 추가 (1초)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        catch (error) {
            console.error(`${item.creativeName} 분석 실패:`, error);
            // 실패한 경우 원본 데이터를 그대로 추가
            results.push(item);
        }
    }
    return results;
}
/**
 * 단일 미디어 결과 데이터 분석
 */
async function analyzeSingleMediaData(mediaItem) {
    try {
        const analysis = await analyzeImageWithGPT(mediaItem.creativeContent);
        return Object.assign(Object.assign({}, mediaItem), { mainCopy: analysis.mainCopy, mainCopyType: analysis.mainCopyType, mainCopyRatio: analysis.mainCopyRatio === '-' ? 0 : parseInt(analysis.mainCopyRatio.replace('%', '')), subCopy: analysis.subCopy, subCopyRatio: analysis.subCopyRatio === '-' ? 0 : parseInt(analysis.subCopyRatio.replace('%', '')), ctaText: analysis.ctaText, ctaPosition: analysis.ctaPosition, ctaRatio: analysis.ctaRatio === '-' ? 0 : parseInt(analysis.ctaRatio.replace('%', '')), modelRatio: analysis.modelRatio === '-' ? 0 : parseInt(analysis.modelRatio.replace('%', '')), productRatio: analysis.productRatio === '-' ? 0 : parseInt(analysis.productRatio.replace('%', '')), visualElements: analysis.visualElements, creativeColorTone: analysis.creativeColorTone, eyeFlow: analysis.eyeFlow, designAnalysis: analysis.designAnalysis });
    }
    catch (error) {
        console.error(`미디어 데이터 분석 실패: ${mediaItem.creativeName}`, error);
        throw error;
    }
}
