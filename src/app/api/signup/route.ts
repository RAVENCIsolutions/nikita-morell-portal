import { NextResponse } from "next/server";
import { createUser } from "@/lib/notion";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { createActiveCampaignContact } from "@/lib/activecampaign";

export async function POST(request: Request) {
  try {
    console.log("Environment check in signup route:", {
      hasNotionKey: !!process.env.NOTION_API_KEY,
      hasDbId: !!process.env.NOTION_DATABASE_ID,
      hasActiveKey: !!process.env.ACTIVECAMPAIGN_API_KEY,
    });

    const { name, email } = await request.json();
    console.log("Received signup request for:", { name, email });

    // Generate a random password
    const password = randomBytes(8).toString("hex");
    console.log("Generated password (for debugging):", password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Notion
    const userCreated = await createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    if (!userCreated) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create user in Notion database",
        },
        { status: 500 },
      );
    }

    // Create contact in ActiveCampaign
    const activeCampaignSuccess = await createActiveCampaignContact(
      email,
      name,
      password, // Send plain password to ActiveCampaign
    );

    if (!activeCampaignSuccess) {
      console.error("Failed to create ActiveCampaign contact");
      // Continue since user is created in Notion
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Detailed signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Server error during signup",
      },
      { status: 500 },
    );
  }
}
