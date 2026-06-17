import CamelFormPage from "@/imports/registry/ui/pages/CamelFormPage.jsx";

export default async function Page({ params }) {
  const { id } = await params;
  return <CamelFormPage id={id} />;
}
