import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { User, Client, ClientUser } from "@/lib/types";
import UserDetailClient from "./UserDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!userData) notFound();

  const user = userData as User;

  // 現在の紐付け
  const { data: cuRows } = await supabase
    .from("client_users")
    .select("*")
    .eq("user_id", id);

  const clientUsers = (cuRows ?? []) as ClientUser[];

  // 全クライアント一覧（紐付け選択用）
  const { data: allClients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name");

  const clients = (allClients ?? []) as Pick<Client, "id" | "name">[];

  return (
    <UserDetailClient user={user} clientUsers={clientUsers} allClients={clients} />
  );
}
