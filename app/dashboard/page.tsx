import { supabase } from "@/lib/supabase";
import { getCurrentLineUserId } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const LINE_USER_ID = await getCurrentLineUserId();

  // 1. line_user_id でユーザーを取得
  const { data: userRows, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("line_user_id", LINE_USER_ID)
    .limit(1);

  if (userError) {
    console.error("ユーザー取得エラー:", userError.message);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-[#fafaf9]">
        <p className="text-base font-bold text-[#292524]">データの読み込みに失敗しました</p>
        <p className="text-sm text-[#79716b]">しばらくしてからもう一度お試しください</p>
      </div>
    );
  }

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

  if (cuError) {
    console.error("クライアント紐付け取得エラー:", cuError.message);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-[#fafaf9]">
        <p className="text-base font-bold text-[#292524]">データの読み込みに失敗しました</p>
        <p className="text-sm text-[#79716b]">しばらくしてからもう一度お試しください</p>
      </div>
    );
  }

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

  if (clientError) {
    console.error("クライアント取得エラー:", clientError.message);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-[#fafaf9]">
        <p className="text-base font-bold text-[#292524]">データの読み込みに失敗しました</p>
        <p className="text-sm text-[#79716b]">しばらくしてからもう一度お試しください</p>
      </div>
    );
  }

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

  // 4. 並列取得
  const [shootsRes, transactionsRes, requestsRes] = await Promise.all([
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
    supabase
      .from("asset_requests")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  if (shootsRes.error) console.error("撮影データ取得エラー:", shootsRes.error.message);
  if (transactionsRes.error) console.error("クレジット取得エラー:", transactionsRes.error.message);
  if (requestsRes.error) console.error("リクエスト取得エラー:", requestsRes.error.message);

  return (
    <DashboardClient
      currentUser={currentUser}
      client={client}
      shoots={shootsRes.data ?? []}
      transactions={transactionsRes.data ?? []}
      recentRequests={requestsRes.data ?? []}
    />
  );
}
