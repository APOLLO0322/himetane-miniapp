export type MaterialType = "photo" | "video";
export type MaterialStatus = "draft" | "published" | "archived";

export type Material = {
  id: string;
  title: string;
  fileUrl: string;
  thumbnailUrl: string;
  type: MaterialType;
  tags: string[];
  month: string; // "YYYY-MM"
  credits: number;
  status: MaterialStatus;
  customerId: string;
};

export type Customer = {
  id: string;
  name: string;
  creditBalance: number;
  usedCredits: number;
  totalCredits: number;
};

export const customers: Customer[] = [
  {
    id: "c1",
    name: "山田 花子",
    creditBalance: 8,
    usedCredits: 12,
    totalCredits: 20,
  },
  {
    id: "c2",
    name: "鈴木 一也",
    creditBalance: 15,
    usedCredits: 5,
    totalCredits: 20,
  },
  {
    id: "c3",
    name: "佐藤 めぐみ",
    creditBalance: 3,
    usedCredits: 17,
    totalCredits: 20,
  },
];

export const materials: Material[] = [
  {
    id: "m1",
    title: "カフェ外観・朝の光",
    fileUrl: "https://example.com/files/cafe-morning.jpg",
    thumbnailUrl: "https://picsum.photos/seed/cafe1/400/300",
    type: "photo",
    tags: ["外観", "朝", "季節"],
    month: "2025-05",
    credits: 1,
    status: "published",
    customerId: "c1",
  },
  {
    id: "m2",
    title: "店内雰囲気・テーブル席",
    fileUrl: "https://example.com/files/interior.jpg",
    thumbnailUrl: "https://picsum.photos/seed/cafe2/400/300",
    type: "photo",
    tags: ["内装", "雰囲気"],
    month: "2025-05",
    credits: 1,
    status: "published",
    customerId: "c1",
  },
  {
    id: "m3",
    title: "看板メニュー紹介リール",
    fileUrl: "https://example.com/files/menu-reel.mp4",
    thumbnailUrl: "https://picsum.photos/seed/menu3/400/300",
    type: "video",
    tags: ["メニュー", "SNS", "プロモ"],
    month: "2025-05",
    credits: 3,
    status: "published",
    customerId: "c1",
  },
  {
    id: "m4",
    title: "スタッフ紹介ショート",
    fileUrl: "https://example.com/files/staff.mp4",
    thumbnailUrl: "https://picsum.photos/seed/staff4/400/300",
    type: "video",
    tags: ["スタッフ", "SNS"],
    month: "2025-04",
    credits: 2,
    status: "published",
    customerId: "c1",
  },
  {
    id: "m5",
    title: "春の新作スイーツ",
    fileUrl: "https://example.com/files/sweets.jpg",
    thumbnailUrl: "https://picsum.photos/seed/sweet5/400/300",
    type: "photo",
    tags: ["商品", "季節", "SNS"],
    month: "2025-04",
    credits: 1,
    status: "published",
    customerId: "c1",
  },
  {
    id: "m6",
    title: "イベントレポート動画",
    fileUrl: "https://example.com/files/event.mp4",
    thumbnailUrl: "https://picsum.photos/seed/event6/400/300",
    type: "video",
    tags: ["イベント", "プロモ"],
    month: "2025-04",
    credits: 4,
    status: "published",
    customerId: "c1",
  },
  {
    id: "m7",
    title: "テイクアウトカップ商品撮影",
    fileUrl: "https://example.com/files/takeout.jpg",
    thumbnailUrl: "https://picsum.photos/seed/take7/400/300",
    type: "photo",
    tags: ["商品", "外観"],
    month: "2025-03",
    credits: 1,
    status: "published",
    customerId: "c1",
  },
  {
    id: "m8",
    title: "冬のあったかメニュー特集",
    fileUrl: "https://example.com/files/winter.jpg",
    thumbnailUrl: "https://picsum.photos/seed/winter8/400/300",
    type: "photo",
    tags: ["メニュー", "季節"],
    month: "2025-03",
    credits: 1,
    status: "archived",
    customerId: "c1",
  },
  // c2 materials
  {
    id: "m9",
    title: "サロン内装・カット台",
    fileUrl: "https://example.com/files/salon.jpg",
    thumbnailUrl: "https://picsum.photos/seed/salon9/400/300",
    type: "photo",
    tags: ["内装", "雰囲気"],
    month: "2025-05",
    credits: 1,
    status: "published",
    customerId: "c2",
  },
  {
    id: "m10",
    title: "スタイリング紹介リール",
    fileUrl: "https://example.com/files/styling.mp4",
    thumbnailUrl: "https://picsum.photos/seed/style10/400/300",
    type: "video",
    tags: ["スタッフ", "SNS", "プロモ"],
    month: "2025-05",
    credits: 3,
    status: "draft",
    customerId: "c2",
  },
  // c3 materials
  {
    id: "m11",
    title: "新作アイテム一覧",
    fileUrl: "https://example.com/files/items.jpg",
    thumbnailUrl: "https://picsum.photos/seed/item11/400/300",
    type: "photo",
    tags: ["商品", "SNS"],
    month: "2025-05",
    credits: 1,
    status: "published",
    customerId: "c3",
  },
  {
    id: "m12",
    title: "ショップツアー動画",
    fileUrl: "https://example.com/files/tour.mp4",
    thumbnailUrl: "https://picsum.photos/seed/tour12/400/300",
    type: "video",
    tags: ["内装", "プロモ"],
    month: "2025-04",
    credits: 3,
    status: "published",
    customerId: "c3",
  },
];

export const ALL_MONTHS = [
  { label: "2025年5月", value: "2025-05" },
  { label: "2025年4月", value: "2025-04" },
  { label: "2025年3月", value: "2025-03" },
];
