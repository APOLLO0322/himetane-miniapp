import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Shoot, Asset, Client } from "@/lib/types";
import ShootDetail from "./ShootDetail";

export const dynamic = "force-dynamic";

const C = {
  green: "#007956",
  text: "#292524",
  textFaint: "#a6a09b",
  border: "#e7e5e4",
  bgWarm: "#fafaf9",
} as const;

export default async function AdminShootDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: shootRow, error: shootError } = await supabase
    .from("shoots")
    .select("*")
    .eq("id", id)
    .single();

  if (shootError || !shootRow) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ backgroundColor: C.bgWarm }}
      >
        <p className="text-sm font-medium" style={{ color: C.text }}>撮影が見つかりません</p>
        <Link href="/admin/shoots" className="text-xs underline" style={{ color: C.green }}>
          一覧に戻る
        </Link>
      </div>
    );
  }

  const shoot = shootRow as Shoot;

  const { data: clientRows } = await supabase
    .from("clients")
    .select("*")
    .eq("id", shoot.client_id)
    .limit(1);

  const client = (clientRows?.[0] ?? null) as Client | null;

  if (!client) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ backgroundColor: C.bgWarm }}
      >
        <p className="text-sm" style={{ color: C.text }}>クライアント情報が見つかりません</p>
        <Link href="/admin/shoots" className="text-xs underline" style={{ color: C.green }}>
          一覧に戻る
        </Link>
      </div>
    );
  }

  const { data: assetRows } = await supabase
    .from("assets")
    .select("*")
    .eq("shoot_id", id)
    .order("asset_no");

  const assets = (assetRows ?? []) as Asset[];

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.85)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/admin/shoots">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-100"
              style={{ color: C.textFaint }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-sm font-bold" style={{ color: C.text }}>{shoot.title}</h1>
            <p className="text-xs" style={{ color: C.textFaint }}>{client.name}</p>
          </div>
        </div>
      </header>

      <ShootDetail shoot={shoot} client={client} assets={assets} />
    </div>
  );
}
