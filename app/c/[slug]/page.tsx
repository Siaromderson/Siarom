import { ClientDashboardLive } from "@/components/ClientDashboardLive";

export default function ClienteDashboard({ params }: { params: { slug: string } }) {
  return <ClientDashboardLive slug={params.slug} />;
}
