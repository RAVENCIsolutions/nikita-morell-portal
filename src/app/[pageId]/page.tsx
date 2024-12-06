import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import NotionRenderPage from "@/components/notion-render-page";

import { validateSession } from "@/lib/notion";
import { Toaster } from "react-hot-toast";
import LogoutButton from "@/components/logout-button";

export default async function Page({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/");
  }

  const isValid = await validateSession(sessionToken);
  if (!isValid) {
    redirect("/");
  }

  const pid = (await params).pageId as string;
  return (
    <section className="flex flex-col min-h-screen">
      <Toaster position="top-right" />
      <main className={`flex-grow`}>
        <NotionRenderPage pageId={pid} />
      </main>

      <footer
        className={`px-5 py-1 fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-neutral-600 text-neutral-500`}
      >
        <p className={`text-sm italic`}>
          Designed for{" "}
          <a
            href={`https://nikitamorell.com`}
            target={`_blank`}
            className={`text-neutral-200`}
          >
            Nikita Morell
          </a>
        </p>
        <LogoutButton />
      </footer>
    </section>
  );
}
