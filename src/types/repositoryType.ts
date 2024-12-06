type Sort = "asc" | "desc";

export interface CreatedAtOrder {
  createdAt?: Sort;
}

export interface PagenationParams {
  orderBy?: CreatedAtOrder;
  take?: number;
}
export interface PagenationParamsByPage extends PagenationParams {
  skip?: number;
}