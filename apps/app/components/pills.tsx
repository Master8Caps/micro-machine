// ── Channel pill colors ──────────────────────────────
const channelStyles: Record<string, string> = {
  linkedin: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  "x / twitter": "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
  "x/twitter": "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
  twitter: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
  x: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
  reddit: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  "product hunt": "border-rose-500/30 bg-rose-500/10 text-rose-400",
  "indie hackers": "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  email: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  "blog / seo": "border-green-500/30 bg-green-500/10 text-green-400",
  blog: "border-green-500/30 bg-green-500/10 text-green-400",
  seo: "border-green-500/30 bg-green-500/10 text-green-400",
  "paid ads": "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

function getChannelStyle(channel: string) {
  return (
    channelStyles[channel.toLowerCase()] ??
    "border-zinc-600/30 bg-zinc-600/10 text-zinc-400"
  );
}

export function ChannelPill({ channel }: { channel: string }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getChannelStyle(channel)}`}
    >
      {channel}
    </span>
  );
}

// ── Content type pill ────────────────────────────────
function formatContentType(type: string) {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function TypePill({ type }: { type: string }) {
  return (
    <span className="rounded-md border border-indigo-500/20 bg-indigo-500/5 px-2 py-0.5 text-xs text-indigo-300/70">
      {formatContentType(type)}
    </span>
  );
}

// ── Status pill ──────────────────────────────────────
const statusStyles: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  draft: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  archived: "border-zinc-600/30 bg-zinc-600/10 text-zinc-500",
  ready: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export function StatusPill({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? statusStyles.draft}`}
    >
      {label}
    </span>
  );
}
