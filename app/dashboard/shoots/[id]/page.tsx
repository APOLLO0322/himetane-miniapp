import { supabase } from "@/lib/supabase";
import { getCurrentLineUserId } from "@/lib/auth";
import type { Shoot, Asset, Client } from "@/lib/types";
import ShootClient from "./ShootClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

const C = {
  green: "#007956",
  text: "#292524",
  textFaint: "#a6a09b",
  border: "#e7e5e4",
  bgWarm: "#fafaf9",
} as const;

export default async function DashboardShootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lineUserId = await getCurrentLineUserId();

  // Get user → client
  const { data: userRows } = await supabase
    .from("users")
    .select("id")
    .eq("line_user_id", lineUserId)
    .limit(1);

  const userId = userRows?.[0]?.id ?? null;

  const { data: cuRows } = userId
    ? await supabase.from("client_users").select("client_id").eq("user_id", userId).limit(1)
    : { data: [] };

  const clientId = cuRows?.[0]?.client_id ?? null;

  const { data: clientRows } = clientId
    ? await supabase.from("clients").select("*").eq("id", clientId).limit(1)
    : { data: [] };

  const client = (clientRows?.[0] ?? null) as Client | null;

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center" style={{ backgroundColor: C.bgWarm }}>
        <p className="text-sm" style={{ color: C.text }}>クライアント情報が見つかりません</p>
        <Link href="/dashboard" className="text-xs underline" style={{ color: C.green }}>
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  // Fetch shoot
  const { data: shootRow } = await supabase
    .from("shoots")
    .select("*")
    .eq("id", id)
    .eq("client_id", client.id)
    .single();

  if (!shootRow) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center" style={{ backgroundColor: C.bgWarm }}>
        <p className="text-sm" style={{ color: C.text }}>撮影が見つかりません</p>
        <Link href="/dashboard" className="text-xs underline" style={{ color: C.green }}>
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  const shoot = shootRow as Shoot;

  // Fetch selectable assets only
  const { data: assetRows } = await supabase
    .from("assets")
    .select("*")
    .eq("shoot_id", id)
    .eq("status", "selectable")
    .order("asset_no");

  const assets = (assetRows ?? []) as Asset[];

  return <ShootClient shoot={shoot} assets={assets} client={client} />;
}
