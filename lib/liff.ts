"use client";

import liff from "@line/liff";

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initLiff(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) {
    throw new Error("NEXT_PUBLIC_LIFF_ID が設定されていません");
  }

  initPromise = liff.init({ liffId }).then(() => {
    initialized = true;
  });

  return initPromise;
}

export { liff };
