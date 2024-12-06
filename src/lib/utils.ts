export function extractNotionId(url: string): string {
  // If it's already a UUID with dashes, return it
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url)
  ) {
    return url;
  }

  // If it's a UUID without dashes, add them
  if (/^[0-9a-f]{32}$/i.test(url)) {
    return `${url.slice(0, 8)}-${url.slice(8, 12)}-${url.slice(
      12,
      16,
    )}-${url.slice(16, 20)}-${url.slice(20)}`;
  }

  // If it's a full Notion URL or contains text, extract the ID
  const matches = url.match(/([0-9a-f]{32})/i);
  if (matches) {
    const id = matches[1];
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(
      16,
      20,
    )}-${id.slice(20)}`;
  }

  throw new Error("Invalid Notion ID or URL");
}

export function generatePassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789()!@#$&[]";
  let password = "";

  // Ensure at least one of each type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Capital
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
  password += "()!@#$&[]"[Math.floor(Math.random() * 9)]; // Special

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
