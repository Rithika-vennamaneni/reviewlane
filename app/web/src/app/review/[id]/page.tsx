// app/web/app/review/[id]/page.tsx
import ItemDetailClient from "./ItemDetailClient";

export default function ReviewItemPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { batch_id?: string };
}) {
  const batchId = searchParams?.batch_id ?? "batch_a";
  return <ItemDetailClient id={params.id} batchId={batchId} />;
}
