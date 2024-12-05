import * as s from 'superstruct';

const dateTime = s.refine(s.string(), 'dateTime', (value) => {
  // 유효한 날짜 문자열인지 확인
  const parsedDate = new Date(value);
  return !isNaN(parsedDate.getTime()); // 날짜가 유효하면 true 반환
});

export const createEstimateReq = s.object({
  movingType: s.enums(['SMALL', 'HOUSE', 'OFFICE']),
  movingDate: dateTime,
  departure: s.size(s.string(), 1, Infinity),
  arrival: s.size(s.string(), 1, Infinity),
  comment: s.optional(s.string()),
});

export type CreateEstimateReq = s.Infer<typeof createEstimateReq>;
