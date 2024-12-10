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

export interface EstimateReqWithDate extends EstimateReq {
  createdAt: Date;
  updatedAt: Date;
}

export interface EstimateReqWithMovingInfo extends EstimateReq {
  MovingInfo: MovingInfo;
}

export interface MovingInfoWithEstimateReqAndhDate extends MovingInfo {
  EstimateRequest: EstimateReqWithDate[];
}

export interface Estimate {
  id: number;
  comment: string;
  isMovingComplete: boolean;
  status: $Enums.status;
  isAssigned: boolean;
  price: number;
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
