import AlertDetailPage from "@/imports/integrity/ui/pages/AlertDetailPage.jsx";

export default async function Page({ params }) {
  const { id } = await params;
  return <AlertDetailPage alertId={id} />;
}
