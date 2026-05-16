import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import UploadForm from "./UploadForm";

const C = {
  green: "#007956",
  text: "#292524",
  textFaint: "#a6a09b",
  border: "#e7e5e4",
  bgWarm: "#fafaf9",
} as const;

export default async function NewAssetPage() {
  const [{ data: clients }, { data: shoots }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase.from("shoots").select("*").order("shoot_date", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bgWarm }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: "rgba(250,250,249,0.85)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-stone-100"
              style={{ color: C.textFaint }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-sm font-bold" style={{ color: C.text }}>
              素材をアップロード
            </h1>
            <p className="text-xs" style={{ color: C.textFaint }}>
              Vercel Blob → Supabase
            </p>
          </div>
        </div>
      </header>

      <UploadForm
        clients={clients ?? []}
        allShoots={shoots ?? []}
      />
    </div>
  );
}
