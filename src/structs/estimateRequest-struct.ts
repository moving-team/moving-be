import * as s from 'superstruct';

export const createEstimateReq = s.object({
  movingType: s.enums(["SMALL", "HOUSE", "OFFICE"]),
  movingDate: s.size(s.string(), 1, Infinity),
  departure: s.size(s.string(), 1, Infinity),
  arrival: s.size(s.string(), 1, Infinity),
  comment: s.optional(s.string()),
});

export type CreateEstimateReq = s.Infer<typeof createEstimateReq>;

