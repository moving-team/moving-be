import * as s from 'superstruct';

export const createEstimateReq = s.object({
  movingType: s.refine(s.number(), 'movingType', (value) => {
    return value >= 0 && value <= 2;
  }),
  movingDate: s.size(s.string(), 1, Infinity),
  departure: s.size(s.string(), 1, Infinity),
  arrival: s.size(s.string(), 1, Infinity),
  comment: s.optional(s.string()),
});

export type CreateEstimateReq = s.Infer<typeof createEstimateReq>;

