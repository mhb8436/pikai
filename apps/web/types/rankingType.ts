export interface Tone {
  detail_color_id: number;
  sale_count: number;
  detailColor: {
    id: number;
    color_name: string;
    color_image: string;
    products: {
      id: number;
      name: string;
      price: number;
      color_main_image: string;
    };
  };
}

export interface RankingItemProps {
  tone: Tone;
  rank: number;
}

export interface ToneResponse {
  products: Tone[];
  title: string;
}
