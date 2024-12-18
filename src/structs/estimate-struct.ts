import * as s from 'superstruct';

export const createEstimate = s.object({
  estimateRequestId: s.min(s.number(), 1),
  price: s.number(),
  comment: s.size(s.string(), 1, Infinity),
});

export type CreateEstimate = s.Infer<typeof createEstimate>;
