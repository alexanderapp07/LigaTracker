import { AppHeader } from "@/components/app-header";
import { getPanelContext } from "@/lib/tenant";

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const { tenant } = await getPanelContext(slug);
  return (
    <>
      <AppHeader title={tenant.name} href={`/panel/${tenant.slug}`} />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">{children}</main>
    </>
  );
}
