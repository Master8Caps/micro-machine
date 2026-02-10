import { createClient } from "@/lib/supabase/server";
import { ContentList } from "./content-list";

export default async function ContentPage() {
  const supabase = await createClient();

  const { data: pieces } = await supabase
    .from("content_pieces")
    .select(
      "id, product_id, campaign_id, type, title, body, metadata, status, created_at, products(name), campaigns(angle, channel)",
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="mt-1 text-zinc-400">
          Browse and manage generated content pieces.
        </p>
      </div>

      {pieces && pieces.length > 0 ? (
        <ContentList pieces={pieces as any} />
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
          <h2 className="text-lg font-semibold">No content yet</h2>
          <p className="mt-2 text-zinc-400">
            Generate content from your campaign angles on each product&apos;s
            brain page.
          </p>
        </div>
      )}
    </>
  );
}
