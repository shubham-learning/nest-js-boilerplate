export interface SaveResponse {
  data: { publicId: string };
}

export interface FindAllResponse<T> {
  data: T[];
  count: number;
}

export interface FindOneResponse<T> {
  data: T | null;
}
