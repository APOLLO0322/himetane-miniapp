import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ClientDetail from "./ClientDetail";
import type { Client, ClientUser, User, Shoot, CreditTransaction } from "@/lib/types";

export const dynamic = "force-dynamic";

const C = {
  green: "#007956",
  text: "#292524",
  textFaint: "#a6a09b",
  border: "#e7e5e4",
  bgWarm: "#fafaf9",
} as const;

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: clientRow, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !clientRow) {
    console.error("クライアント取得エラー:", error?.message);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center" style={{ backgroundColor: C.bgWarm }}>
        <p className="text-base font-bold" style={{ color: C.text }}>クライアントが見つかりません</p>
      </div>
    );
  }

  const client = clientRow as Client;

  const [{ data: cuRows }, { data: shootRows }, { data: txRows }] = await Promise.all([
    supabase.from("client_users").select("*").eq("client_id", id),
    supabase.from("shoots").select("*").eq("client_id", id).order("shoot_date", { ascending: false }),
    supabase.from("credit_transactions").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);

  const clientUsers = cuRows as ClientUser[] ?? [];
  const userIds = clientUsers.map((cu) => cu.user_id);

  const { data: userRows } = userIds.length > 0
    ? await supabase.from("users").select("*").in("id", userIds)
    : { data: [] };

  const typedUserRows = (userRows ?? []) as unknown as User[];
  const userMap = new Map<string, User>(typedUserRows.map((u) => [u.id, u]));

  const enrichedClientUsers = clientUsers.map((cu) => ({
    ...cu,
    user: userMap.get(cu.user_id) ?? null,
  }));

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.9)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/admin/clients">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-100"
              style={{ color: C.textFaint }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <h1 className="text-sm font-bold truncate" style={{ color: C.text }}>{client.name}</h1>
        </div>
      </header>

      <ClientDetail
        client={client}
        clientUsers={enrichedClientUsers}
        shoots={(shootRows ?? []) as Shoot[]}
        transactions={(txRows ?? []) as CreditTransaction[]}
      />
    </div>
  );
}
