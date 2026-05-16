import { supabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

// 将来: LIFF.getProfile().userId で差し替える
const LINE_USER_ID = "U_TEST_USER_001";

export default async function DashboardPage() {
  // 1. line_user_id でユーザーを取得
  const { data: userRows, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("line_user_id", LINE_USER_ID)
    .limit(1);

  if (userError) throw new Error(`ユーザー取得エラー: ${userError.message}`);

  const currentUser = userRows?.[0] ?? null;

  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-[#fafaf9]">
        <p className="text-base font-bold text-[#292524]">ユーザーが見つかりません</p>
        <p className="text-sm text-[#79716b]">
          Supabase の users テーブルに line_user_id: {LINE_USER_ID} を追加してください
        </p>
      </div>
    );
  }

  // 2. 所属client_idを取得
  const { data: clientUserRows, error: cuError } = await supabase
    .from("client_users")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at");

  if (cuError) throw new Error(`クライアント紐付け取得エラー: ${cuError.message}`);

  // 複数clientがある場合は最初を使用（将来: 切替UI追加）
  const firstClientId = clientUserRows?.[0]?.client_id ?? null;

  if (!firstClientId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-[#fafaf9]">
        <p className="text-base font-bold text-[#292524]">所属クライアントがありません</p>
        <p className="text-sm text-[#79716b]">
          client_users テーブルにこのユーザーの紐付けを追加してください
        </p>
      </div>
    );
  }

  // 3. client情報を取得
  const { data: clientRows, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", firstClientId)
    .limit(1);

  if (clientError) throw new Error(`クライアント取得エラー: ${clientError.message}`);

  const client = clientRows?.[0] ?? null;

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-[#fafaf9]">
        <p className="text-base font-bold text-[#292524]">所属クライアントがありません</p>
        <p className="text-sm text-[#79716b]">
          client_users テーブルにこのユーザーの紐付けを追加してください
        </p>
      </div>
    );
  }

  const clientId = client.id;

  // 4. client_id で素材・撮影・クレジットを並列取得
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

  if (assetsRes.error) throw new Error(`素材取得エラー: ${assetsRes.error.message}`);
  if (shootsRes.error) throw new Error(`撮影データ取得エラー: ${shootsRes.error.message}`);
  if (transactionsRes.error) throw new Error(`クレジット取得エラー: ${transactionsRes.error.message}`);

  return (
    <DashboardClient
      currentUser={currentUser}
      client={client}
      assets={assetsRes.data ?? []}
      shoots={shootsRes.data ?? []}
      transactions={transactionsRes.data ?? []}
    />
  );
}
