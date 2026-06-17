import ReconciliationPage from "@/imports/integrity/ui/pages/ReconciliationPage.jsx";

export default async function Page({ params }) {
  const { id } = await params;
  return <ReconciliationPage subjectId={id} />;
}
