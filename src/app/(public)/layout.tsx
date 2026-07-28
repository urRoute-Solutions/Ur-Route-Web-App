import { SiteHeader } from "@/components/layout/site-header";

// Public layout — no auth required. Shows site-wide nav with optional login state.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader dashboardHref={null} />
      <main>{children}</main>
    </div>
  );
}
