import type { Operator } from "@prisma/client";

export interface OperatorDTO {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  status: Operator["status"];
  rating: number;
  createdAt: string;
}

export function toOperatorDTO(op: Operator): OperatorDTO {
  return {
    id: op.id,
    ownerId: op.ownerId,
    name: op.name,
    slug: op.slug,
    description: op.description,
    logoUrl: op.logoUrl,
    contactEmail: op.contactEmail,
    contactPhone: op.contactPhone,
    address: op.address,
    city: op.city,
    status: op.status,
    rating: op.rating,
    createdAt: op.createdAt.toISOString(),
  };
}
