// AI 추천 API에서 전달받는 응답 데이터 타입
export interface RecommendationResponseType {
  score: number;
  messageType: string;
  title: string;
  message: string;
  recommend: boolean;
}
