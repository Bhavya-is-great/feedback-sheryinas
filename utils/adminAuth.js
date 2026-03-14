export function isMainPasswordValid(password) {
  const mainPass = process.env.MAIN_PASS || "";

  if (!mainPass || !password) {
    return false;
  }

  return password === mainPass;
}
