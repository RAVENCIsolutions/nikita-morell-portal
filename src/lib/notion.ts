import { Client } from "@notionhq/client";

import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import bcrypt from "bcryptjs";

import { CreateUserParams, NotionUser } from "@/types/notion";
import { SessionUpdateParams } from "@/types/notion";

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY is not defined");
}

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

type NotionProperties = {
  Email: {
    type: "email";
    email: string | null;
    id: string;
  };
  "Refresh Token Expiry": {
    type: "date";
    date: { start: string; end: string | null } | null;
    id: string;
  };
};

// Debug environment variables
console.log("Environment variables check on load:", {
  apiKey: process.env.NOTION_API_KEY?.slice(0, 5), // Show just first 5 chars for safety
  dbId: process.env.NOTION_DATABASE_ID?.slice(0, 5),
});

// Modify the check to throw more specific errors
if (!process.env.NOTION_API_KEY) {
  console.error("NOTION_API_KEY is missing from environment");
  throw new Error("NOTION_API_KEY is not defined");
}

if (!process.env.NOTION_DATABASE_ID) {
  console.error("NOTION_DATABASE_ID is missing from environment");
  throw new Error("NOTION_DATABASE_ID is not defined");
}

export async function validateRefreshToken(
  refreshToken: string,
): Promise<{ email: string; refreshExpiry: Date } | null> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: "Refresh Token",
            rich_text: {
              equals: refreshToken,
            },
          },
          {
            property: "Refresh Token Expiry",
            date: {
              after: new Date().toISOString(),
            },
          },
        ],
      },
    });

    if (!response.results.length) {
      return null;
    }

    const page = response.results[0] as PageObjectResponse;
    const properties = page.properties as NotionProperties;

    const emailValue = properties.Email?.email;
    const refreshExpiryValue = properties["Refresh Token Expiry"]?.date?.start;

    if (!emailValue || !refreshExpiryValue) {
      return null;
    }

    return {
      email: emailValue,
      refreshExpiry: new Date(refreshExpiryValue),
    };
  } catch (error) {
    console.error("Error validating refresh token:", error);
    return null;
  }
}

export async function verifyCredentials(
  credentials: NotionUser,
): Promise<boolean> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: "Email",
        email: {
          equals: credentials.email.toLowerCase(),
        },
      },
    });

    if (!response.results.length) {
      return false;
    }

    const page = response.results[0] as PageObjectResponse;
    const passwordProperty = page.properties.Password;

    if (
      !passwordProperty ||
      !("rich_text" in passwordProperty) ||
      !passwordProperty.rich_text[0]?.plain_text
    ) {
      return false;
    }

    const storedPassword = passwordProperty.rich_text[0].plain_text;

    // Compare the provided password with the stored hash
    return await bcrypt.compare(credentials.password, storedPassword);
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return false;
  }
}

export async function updateUserSession({
  email,
  sessionToken,
  refreshToken,
  sessionExpiry,
  refreshExpiry,
  userAgent,
}: SessionUpdateParams) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Email",
        email: {
          equals: email,
        },
      },
    });

    if (!response.results.length) {
      throw new Error("User not found");
    }

    const pageId = response.results[0].id;

    // Update the user's page with new session information
    await notion.pages.update({
      page_id: pageId,
      properties: {
        "Session Token": {
          rich_text: [
            {
              text: {
                content: sessionToken,
              },
            },
          ],
        },
        "Refresh Token": {
          rich_text: [
            {
              text: {
                content: refreshToken,
              },
            },
          ],
        },
        "Session Expiry": {
          date: {
            start: sessionExpiry.toISOString(),
          },
        },
        "Refresh Token Expiry": {
          date: {
            start: refreshExpiry.toISOString(),
          },
        },
        "Last Login": {
          date: {
            start: new Date().toISOString(),
          },
        },
        "User Agent": {
          rich_text: [
            {
              text: {
                content: userAgent.substring(0, 2000),
              },
            },
          ],
        },
        "Failed Login Attempts": {
          number: 0, // Reset failed attempts on successful login
        },
      },
    });

    return true;
  } catch (error) {
    console.error("Error updating user session:", error);
    throw error;
  }
}

// Add function to increment failed login attempts
export async function incrementFailedLoginAttempts(email: string) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Email",
        email: {
          equals: email,
        },
      },
    });

    if (!response.results.length) {
      return;
    }

    const page = response.results[0] as PageObjectResponse;
    const currentFailedAttempts =
      "number" in page.properties["Failed Login Attempts"]
        ? page.properties["Failed Login Attempts"].number || 0
        : 0;

    await notion.pages.update({
      page_id: page.id,
      properties: {
        "Failed Login Attempts": {
          number: currentFailedAttempts + 1,
        },
      },
    });
  } catch (error) {
    console.error("Error incrementing failed login attempts:", error);
  }
}

export async function validateSession(sessionToken: string): Promise<boolean> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: "Session Token",
            rich_text: {
              equals: sessionToken,
            },
          },
          {
            property: "Session Expiry",
            date: {
              after: new Date().toISOString(),
            },
          },
        ],
      },
    });

    // If we found a result, the session is valid
    return response.results.length > 0;
  } catch (error) {
    console.error("Error validating session:", error);
    return false;
  }
}

export async function createUser({
  name,
  email,
  password,
}: CreateUserParams): Promise<boolean> {
  try {
    // Check if user already exists
    const existingUser = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Email",
        email: {
          equals: email,
        },
      },
    });

    if (existingUser.results.length > 0) {
      throw new Error("User already exists");
    }

    try {
      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: {
            // This is your title column
            title: [
              {
                text: {
                  content: name,
                },
              },
            ],
          },
          Email: {
            email: email,
          },
          Password: {
            // Changed to Text type
            rich_text: [
              {
                text: {
                  content: password,
                },
              },
            ],
          },
          "Failed Login Attempts": {
            number: 0,
          },
          "Created At": {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      });

      console.log("User created successfully in Notion:", response.id);
      return true;
    } catch (notionError) {
      // Log the specific Notion error
      console.error("Notion API Error Details:", {
        error: notionError,
        message:
          notionError instanceof Error ? notionError.message : "Unknown error",
        stack: notionError instanceof Error ? notionError.stack : undefined,
      });
      throw notionError;
    }
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return false;
  }
}
