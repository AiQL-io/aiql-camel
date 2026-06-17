import CamelProfilePage from "@/imports/registry/ui/pages/CamelProfilePage.jsx";

export default async function Page({ params }) {
  const { id } = await params;
  return <CamelProfilePage id={id} />;
}
