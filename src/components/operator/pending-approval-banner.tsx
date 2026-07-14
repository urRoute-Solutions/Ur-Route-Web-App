import { Hourglass, ShieldAlert } from "lucide-react";

export function PendingApprovalBanner({ status }: { status: "PENDING" | "SUSPENDED" }) {
  if (status === "SUSPENDED") {
    return (
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 px-4 py-2.5 text-sm text-red-800 dark:text-red-300">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <p className="flex-1">
          Your operator account has been suspended. Contact support if you believe this is a mistake — publishing routes and trips is disabled until it's lifted.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300">
      <Hourglass className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        Your operator account is awaiting admin approval. You can explore the dashboard now, but publishing routes and trips is disabled until you're approved.
      </p>
    </div>
  );
}
