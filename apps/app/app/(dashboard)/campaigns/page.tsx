import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChannelPill, TypePill } from "@/components/pills";

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, product_id, angle, channel, hook, content_type, status, created_at, products(name), avatars(name)",
    )
    .order("created_at", { ascending: false });

  // Count content pieces per campaign
  const { data: contentPieces } = await supabase
    .from("content_pieces")
    .select("campaign_id");

  const countMap = new Map<string, number>();
  contentPieces?.forEach((row) => {
    if (row.campaign_id) {
      countMap.set(row.campaign_id, (countMap.get(row.campaign_id) ?? 0) + 1);
    }
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <p className="mt-1 text-zinc-400">
          All campaign angles across your products.
        </p>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const contentCount = countMap.get(campaign.id) ?? 0;
            const product = campaign.products as unknown as { name: string } | null;
            const avatar = campaign.avatars as unknown as { name: string } | null;

            return (
              <Link
                key={campaign.id}
                href={`/products/${campaign.product_id}/brain`}
                className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ChannelPill channel={campaign.channel} />
                  <TypePill type={campaign.content_type} />
                  {avatar && (
                    <span className="text-xs text-zinc-500">for {avatar.name}</span>
                  )}
                  {product && (
                    <span className="ml-auto text-xs text-zinc-600">
                      {product.name}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-semibold">{campaign.angle}</h3>
                <p className="mt-1 text-sm italic text-zinc-400">
                  &ldquo;{campaign.hook}&rdquo;
                </p>
                {contentCount > 0 && (
                  <p className="mt-3 text-xs text-zinc-500">
                    {contentCount} content piece{contentCount === 1 ? "" : "s"} generated
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
          <h2 className="text-lg font-semibold">No campaigns yet</h2>
          <p className="mt-2 text-zinc-400">
            Create a product and generate its Marketing Brain to see campaigns
            here.
          </p>
        </div>
      )}
    </>
  );
}
