// Swap this for LIFF.getProfile().userId when LINE login is implemented
export const LINE_USER_ID = "U_TEST_USER_001";

export async function getCurrentLineUserId(): Promise<string> {
  // TODO: Replace with liff.getProfile().userId
  return LINE_USER_ID;
}
