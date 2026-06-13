import { z } from "zod";

const baseShape = z.object({
  level: z.enum(["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"]),
  title: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  percentage: z.number().min(0).max(100).optional(),
  flatAmountMinor: z.number().int().min(0).optional(),
  maxCapMinor: z.number().int().min(0).optional(),
  groupBonusPerHead: z.number().min(0).max(50).default(0),
  groupBonusMaxHeads: z.number().int().min(0).max(20).default(0),
  unlockTripNumber: z.number().int().min(1),
  rewardTripNumber: z.number().int().min(1),
});

const discountRefine = (d: { discountType: string; percentage?: number | null; flatAmountMinor?: number | null }) =>
  (d.discountType === "PERCENTAGE" && d.percentage != null) ||
  (d.discountType === "FLAT" && d.flatAmountMinor != null);

const refineMsg = { message: "Provide percentage for PERCENTAGE type, or flatAmountMinor for FLAT type" };

export const createOfferTemplateSchema = baseShape.refine(discountRefine, refineMsg);
export const updateOfferTemplateSchema = baseShape.partial().omit({ level: true }).refine(
  (d) => {
    if (d.discountType == null) return true;
    return discountRefine({ discountType: d.discountType, percentage: d.percentage, flatAmountMinor: d.flatAmountMinor });
  },
  refineMsg,
);

export type CreateOfferTemplateInput = z.infer<typeof createOfferTemplateSchema>;
export type UpdateOfferTemplateInput = z.infer<typeof updateOfferTemplateSchema>;
