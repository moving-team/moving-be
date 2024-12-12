import { Prisma } from "@prisma/client";

type Sort = "asc" | "desc";

export interface CreatedAtOrder {
  createdAt?: Sort;
}

export interface PagenationParams {
  take?: number;
}

export interface PagenationParamsByPage extends PagenationParams {
  orderBy?: CreatedAtOrder;
  skip?: number;
}

export interface MovingInfoPagenationParamsByPage extends PagenationParams {
  orderBy?: any
  skip?: number;
}

// 리뷰 레포지토리 타입 추가
export interface ReviewQueryParams {
  moverId: number;
  skip?: number;
  take?: number;
}
