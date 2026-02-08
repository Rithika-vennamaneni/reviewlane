// app/web/app/review/[id]/page.tsx
import ItemDetailClient from "./ItemDetailClient";

export default async function ReviewItemPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>;
  searchParams?: { batch_id?: string } | Promise<{ batch_id?: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearch = await Promise.resolve(searchParams ?? {});
  const batchId = resolvedSearch.batch_id ?? "batch_a";
  return <ItemDetailClient id={resolvedParams.id} batchId={batchId} />;
}
