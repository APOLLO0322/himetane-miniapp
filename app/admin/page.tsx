"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Camera,
  Video,
  Tag,
  Calendar,
  Coins,
  User,
  Link2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customers, ALL_MONTHS } from "@/lib/dummy-data";

const C = {
  green: "#007956",
  greenDark: "#005e40",
  lime: "#9dc926",
  limeLight: "#d4e8a0",
  limePale: "#f0fdf4",
  text: "#292524",
  textMid: "#44403b",
  textMuted: "#79716b",
  textFaint: "#a6a09b",
  border: "#e7e5e4",
  bgTint: "#f5f5f4",
  bgWarm: "#fafaf9",
} as const;

const schema = z.object({
  customerId: z.string().min(1, "顧客を選択してください"),
  title: z.string().min(1, "タイトルを入力してください"),
  fileUrl: z.string().url("有効なURLを入力してください"),
  type: z.enum(["photo", "video"]),
  tags: z.string().optional(),
  month: z.string().min(1, "月を選択してください"),
  credits: z.coerce
    .number()
    .int()
    .min(1, "1以上の値を入力してください")
    .max(20, "20以下の値を入力してください"),
  status: z.enum(["draft", "published", "archived"]),
});

type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "published", label: "公開" },
  { value: "draft", label: "下書き" },
  { value: "archived", label: "アーカイブ" },
];

function FieldSection({
  label,
  icon,
  children,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        className="flex items-center gap-1.5 text-sm font-medium"
        style={{ color: C.textMid }}
      >
        <span style={{ color: C.green }}>{icon}</span>
        {label}
      </Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "photo",
      status: "draft",
      credits: 1,
    },
  });

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    console.log("Registered material:", {
      ...data,
      tags: data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    });
    setSubmittedTitle(data.title);
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"
        style={{ backgroundColor: C.bgWarm }}
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: C.limePale }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: C.green }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: C.text }}>
            登録しました
          </p>
          <p className="mt-1 text-sm" style={{ color: C.textMuted }}>
            「{submittedTitle}」を素材ライブラリに追加しました
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            style={{ borderColor: C.border }}
            onClick={() => setSubmitted(false)}
          >
            続けて登録する
          </Button>
          <Link href="/dashboard">
            <Button
              className="rounded-xl text-white"
              style={{ backgroundColor: C.green }}
            >
              ダッシュボードへ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: "rgba(250,250,249,0.85)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-stone-100"
              style={{ color: C.textMuted }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold" style={{ color: C.text }}>
              素材を登録
            </h1>
            <p className="text-xs" style={{ color: C.textFaint }}>
              管理者メニュー
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/requests">
              <span
                className="rounded-xl px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: C.bgTint, color: C.textMid, border: `1px solid ${C.border}` }}
              >
                リクエスト
              </span>
            </Link>
            <Link href="/admin/assets/new">
              <span
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: C.green }}
              >
                ファイルUP
              </span>
            </Link>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 px-4">
        {/* Customer */}
        <FieldSection
          label="顧客"
          icon={<User className="h-4 w-4" />}
          error={errors.customerId?.message}
        >
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className="rounded-xl bg-white"
                  style={{ borderColor: C.border }}
                >
                  <SelectValue placeholder="顧客を選んでください" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FieldSection>

        {/* Title */}
        <FieldSection
          label="タイトル"
          icon={<Tag className="h-4 w-4" />}
          error={errors.title?.message}
        >
          <Input
            {...register("title")}
            placeholder="例: カフェ外観・朝の光"
            className="rounded-xl bg-white"
            style={{ borderColor: C.border }}
          />
        </FieldSection>

        {/* File URL */}
        <FieldSection
          label="ファイルURL"
          icon={<Link2 className="h-4 w-4" />}
          error={errors.fileUrl?.message}
        >
          <Input
            {...register("fileUrl")}
            placeholder="https://..."
            className="rounded-xl bg-white"
            style={{ borderColor: C.border }}
            type="url"
          />
        </FieldSection>

        {/* Type */}
        <FieldSection
          label="種別"
          icon={<Camera className="h-4 w-4" />}
          error={errors.type?.message}
        >
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="flex gap-3">
                {[
                  { value: "photo" as const, label: "写真", icon: <Camera className="h-4 w-4" /> },
                  { value: "video" as const, label: "動画", icon: <Video className="h-4 w-4" /> },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors"
                    style={
                      field.value === opt.value
                        ? { borderColor: C.green, backgroundColor: C.limePale, color: C.green }
                        : { borderColor: C.border, backgroundColor: "white", color: C.textMuted }
                    }
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          />
        </FieldSection>

        {/* Tags */}
        <FieldSection
          label="タグ（カンマ区切り）"
          icon={<Tag className="h-4 w-4" />}
        >
          <Input
            {...register("tags")}
            placeholder="例: 外観, 朝, SNS"
            className="rounded-xl bg-white"
            style={{ borderColor: C.border }}
          />
          <p className="text-xs" style={{ color: C.textFaint }}>
            複数のタグはカンマで区切ってください
          </p>
        </FieldSection>

        {/* Month */}
        <FieldSection
          label="対象月"
          icon={<Calendar className="h-4 w-4" />}
          error={errors.month?.message}
        >
          <Controller
            name="month"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className="rounded-xl bg-white"
                  style={{ borderColor: C.border }}
                >
                  <SelectValue placeholder="月を選んでください" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FieldSection>

        {/* Credits */}
        <FieldSection
          label="消費クレジット (pt)"
          icon={<Coins className="h-4 w-4" />}
          error={errors.credits?.message}
        >
          <div className="flex items-center gap-3">
            <Controller
              name="credits"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => field.onChange(n)}
                      className="h-10 w-10 rounded-xl border text-sm font-semibold transition-colors"
                      style={
                        field.value === n
                          ? { borderColor: C.lime, backgroundColor: C.limePale, color: C.green }
                          : { borderColor: C.border, backgroundColor: "white", color: C.textMuted }
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            />
            <span className="text-xs" style={{ color: C.textFaint }}>pt</span>
          </div>
          <p className="text-xs" style={{ color: C.textFaint }}>
            写真: 1pt / ショート動画: 2-3pt / 長尺動画: 4-5pt が目安
          </p>
        </FieldSection>

        {/* Status */}
        <FieldSection
          label="ステータス"
          icon={<CheckCircle2 className="h-4 w-4" />}
          error={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className="flex-1 rounded-xl border py-2.5 text-xs font-medium transition-colors"
                    style={
                      field.value === opt.value
                        ? { borderColor: C.green, backgroundColor: C.limePale, color: C.green }
                        : { borderColor: C.border, backgroundColor: "white", color: C.textMuted }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          />
        </FieldSection>

        <div className="h-px" style={{ backgroundColor: C.border }} />

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: C.green }}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              登録中...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              素材を登録する
            </>
          )}
        </button>

        <p className="text-center text-xs" style={{ color: C.textFaint }}>
          Supabase連携後、実際のDBに保存されます
        </p>
      </form>
    </div>
  );
}
