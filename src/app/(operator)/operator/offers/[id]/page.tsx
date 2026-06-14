import { requireOperator } from "@/lib/auth/session";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { notFound } from "next/navigation";
import { EditOfferForm } from "./edit-offer-form";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { operatorId } = await requireOperator();
  const { id } = await params;

  const template = await offerTemplateRepository.findById(id);
  if (!template || template.operatorId !== operatorId) notFound();

  return (
    <EditOfferForm
      templateId={template.id}
      operatorId={operatorId}
      initial={{
        level: template.level,
        discountType: template.discountType as "PERCENTAGE" | "FLAT",
        percentage: template.percentage?.toString() ?? "",
        flatAmount: template.flatAmountMinor != null ? (template.flatAmountMinor / 100).toString() : "",
        maxCap: template.maxCapMinor != null ? (template.maxCapMinor / 100).toString() : "",
        groupBonusPerHead: template.groupBonusPerHead?.toString() ?? "0",
        groupBonusMaxHeads: template.groupBonusMaxHeads?.toString() ?? "0",
        unlockTripNumber: template.unlockTripNumber?.toString() ?? "",
        rewardTripNumber: template.rewardTripNumber?.toString() ?? "",
      }}
    />
  );
}
