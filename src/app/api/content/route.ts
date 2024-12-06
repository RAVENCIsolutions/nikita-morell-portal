import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { ContentResponse } from "@/types/api";
import { NotionAPI } from "notion-client";

const notionX = new NotionAPI();
const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ContentResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { success: false, message: "Page ID is required" },
        { status: 400 },
      );
    }

    const page = await notion.pages.retrieve({ page_id: pageId });
    const recordMap = await notionX.getPage(page.id);

    return NextResponse.json({
      success: true,
      recordMap,
    });
  } catch (error: any) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: `Error fetching content: ${error.message}`,
      },
      { status: 500 },
    );
  }
}
