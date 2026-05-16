import { supabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // 最初のクライアントを取得（LINE連携後は liff.getProfile() の line_id で絞り込む）
  const { data: clientRows, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .limit(1);

  if (clientError) {
    throw new Error(`クライアント取得エラー: ${clientError.message}`);
  }

  const client = clientRows?.[0] ?? null;

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-[#fafaf9]">
        <p className="text-base font-bold text-[#292524]">クライアントデータがありません</p>
        <p className="text-sm text-[#79716b]">Supabase の clients テーブルにデータを追加してください</p>
      </div>
    );
  }

  const clientId = client.id;

  // 残りのデータを並列取得
  const [assetsRes, shootsRes, transactionsRes] = await Promise.all([
    supabase
      .from("assets")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("shoots")
      .select("*")
      .eq("client_id", clientId)
      .order("shoot_date", { ascending: false }),
    supabase
      .from("credit_transactions")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
  ]);

  if (assetsRes.error) {
    throw new Error(`素材取得エラー: ${assetsRes.error.message}`);
  }
  if (shootsRes.error) {
    throw new Error(`撮影データ取得エラー: ${shootsRes.error.message}`);
  }
  if (transactionsRes.error) {
    throw new Error(`クレジット取得エラー: ${transactionsRes.error.message}`);
  }

  return (
    <DashboardClient
      client={client}
      assets={assetsRes.data ?? []}
      shoots={shootsRes.data ?? []}
      transactions={transactionsRes.data ?? []}
    />
  );
}
