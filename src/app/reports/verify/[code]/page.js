import ReportVerifyPage from "@/imports/reports/ui/pages/ReportVerifyPage.jsx";

export default async function Page({ params }) {
  const { code } = await params;
  return <ReportVerifyPage code={decodeURIComponent(code)} />;
}
