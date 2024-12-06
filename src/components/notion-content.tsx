"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

import { toast } from "react-hot-toast";

import { NotionRenderer } from "react-notion-x";
import { ExtendedRecordMap } from "notion-types";

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then((m) => m.Code),
);
const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection,
  ),
);
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation),
);
const Pdf = dynamic(
  () => import("react-notion-x/build/third-party/pdf").then((m) => m.Pdf),
  {
    ssr: false,
  },
);
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  {
    ssr: false,
  },
);

export default function NotionContentViewer() {
  const [recordMap, setRecordMap] = useState<ExtendedRecordMap | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const params = new URLSearchParams({
          pageId: process.env.NEXT_PUBLIC_NOTION_PAGE_URL || "",
        });

        const response = await fetch(`/api/content?${params}`);
        const data = await response.json();

        if (data.success && data.recordMap) {
          setRecordMap(data.recordMap);
        } else {
          toast.error(data.message || "Error loading content");
        }
      } catch (error) {
        toast.error("Error loading content");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-200" />
      </div>
    );
  }

  if (!recordMap) {
    return (
      <div className="text-center text-red-600">Failed to load content</div>
    );
  }

  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={true}
      darkMode={true}
      components={{
        Code,
        Collection,
        Equation,
        Pdf,
        Modal,
      }}
    />
  );
}
