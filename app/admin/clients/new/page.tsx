import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewClientForm from "./NewClientForm";

export const dynamic = "force-dynamic";

const C = {
  green: "#007956",
  text: "#292524",
  textFaint: "#a6a09b",
  border: "#e7e5e4",
  bgWarm: "#fafaf9",
} as const;

export default function NewClientPage() {
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
          <h1 className="text-sm font-bold" style={{ color: C.text }}>新規クライアントを作成</h1>
        </div>
      </header>

      <NewClientForm />
    </div>
  );
}
