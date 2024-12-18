import { $Enums } from '@prisma/client';

export interface MovingInfo {
  id: number;
  movingType: $Enums.serviceType;
  movingDate: Date;
  departure: string;
  arrival: string;
}

export interface EstimateReq {
  id: number;
  comment: string | null;
  isConfirmed: boolean;
  isCancelled: boolean;
}
export interface Review {
  id: number;
  description: string;
  score: number;
}

export interface EstimateReqWithDate extends EstimateReq {
  createdAt: Date;
  updatedAt: Date;
}

export interface EstimateReqWithMovingInfo extends EstimateReq {
  MovingInfo: MovingInfo;
}

export interface EstimateReqWithMovingInfoAndDate extends EstimateReqWithDate {
  MovingInfo: MovingInfo;
}

export interface MovingInfoWithEstimateReqAndhDate extends MovingInfo {
  EstimateRequest: EstimateReqWithDate;
}

export interface Estimate {
  id: number;
  comment: string;
  isMovingComplete: boolean;
  status: $Enums.status;
  isAssigned: boolean;
  price: number;
}

export interface EstimateWithDate extends Estimate {
  createdAt: Date;
  updatedAt: Date;
}

export interface Mover {
  id: number;
  profileImage: string | null;
  serviceType: $Enums.serviceType[];
  nickname: string;
  career: number;
  summary: string;
  description: string;
  serviceRegion: $Enums.serviceRegion[];
  confirmationCount: number;
}

export interface EstimateWithMover extends Estimate {
  Mover: Mover;
}

export interface CustomerName {
  User: {
    name: string;
  };
}

export interface EstimateWithMovingInfoAndcustomerName extends Estimate {
  MovingInfo: MovingInfo;
  Customer: CustomerName;
}

export interface EstimateWithMovingInfoAndcustomerNameAndIsConfirmed
  extends EstimateWithMovingInfoAndcustomerName {
  EstimateRequest: {
    isConfirmed: boolean;
  };
}

export interface FindEstimateReqListByMoverType {
  movingType: $Enums.serviceType;
  movingDate: Date;
  departure: string;
  arrival: string;
  id: number;
  EstimateRequest: {
    id: number;
    comment: string | null;
    isConfirmed: boolean;
    isCancelled: boolean;
    createdAt: Date;
    updatedAt: Date;
    Customer: CustomerName;
    AssignedEstimateRequest: {
      id: number;
    }[];
  };
}

// 리뷰 서비스 타입 추가
export interface ReviewStats {
  totalReviews: number;
  reviewCount: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface CreateReviewInput {
  customerId: number;
  estimateId: number;
  moverId: number;
  score: number;
  description: string;
}
