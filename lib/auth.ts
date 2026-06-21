import { cookies } from "next/headers";

const LINE_USER_COOKIE = "line_user_id";

/** 開発用フォールバック（LIFF ID未設定時 or LIFF初期化前のSSR） */
const DEV_FALLBACK_USER_ID = "U_TEST_USER_001";

/**
 * 現在のLINEユーザーIDを取得する。
 * - LIFFが初期化済みの場合: クッキーから取得（LiffProviderがセット）
 * - LIFF未設定 / 未初期化: 開発用フォールバックを返す
 */
export async function getCurrentLineUserId(): Promise<string> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(LINE_USER_COOKIE)?.value;
  return userId ?? DEV_FALLBACK_USER_ID;
}
