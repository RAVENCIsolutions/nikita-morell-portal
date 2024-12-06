"use client";

import bcrypt from "bcryptjs";

export default async function Page() {
  const plaintextPassword = "f6bf030a86325970";
  const hashedPasswordFromNotion =
    "$2a$12$NzVxe20clMD3.xtT0HwrWumrkQwEDq150K5xBtXkbmtqPXph2cv46";

  const isMatch = await bcrypt.compare(
    plaintextPassword,
    hashedPasswordFromNotion,
  );
  console.log("Password match:", isMatch);

  return (
    <div>
      <h1>Test page</h1>
    </div>
  );
}
