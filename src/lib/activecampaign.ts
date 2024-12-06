export interface ActiveCampaignContact {
  email: string;
  firstName: string;
  lastName: string;
}

export interface ContactResponse {
  contact: {
    id: number;
  };
}

export interface ContactTagResponse {
  contactTag: {
    contact: number;
    tag: string;
  };
}

// Create contact with their credentials
async function createContact(
  email: string,
  name: string,
  password: string,
): Promise<number | null> {
  const API_URL = process.env.ACTIVECAMPAIGN_API_URL;
  const API_KEY = process.env.ACTIVECAMPAIGN_API_KEY;
  const PASSWORD_FIELD = process.env.ACTIVECAMPAIGN_PASSWORD_FIELD_ID;

  if (!API_URL || !API_KEY || !PASSWORD_FIELD) {
    console.error("Missing ActiveCampaign configuration");
    return null;
  }

  try {
    // Split name into first and last
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");

    const response = await fetch(`${API_URL}/api/3/contacts`, {
      method: "POST",
      headers: {
        "Api-Token": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact: {
          email,
          firstName,
          lastName,
          // Add password as a custom field
          fieldValues: [
            {
              field: PASSWORD_FIELD,
              value: password,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ActiveCampaign Error:", errorData);
      throw new Error(
        `Failed to create contact: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as ContactResponse;
    return data.contact.id;
  } catch (error) {
    console.error("ActiveCampaign Create Contact Error:", error);
    return null;
  }
}

// Add tag to contact
async function addTagToContact(
  contactId: number,
  tagId: string,
): Promise<boolean> {
  const API_URL = process.env.ACTIVECAMPAIGN_API_URL;
  const API_KEY = process.env.ACTIVECAMPAIGN_API_KEY;

  if (!API_URL || !API_KEY) {
    console.error("Missing ActiveCampaign configuration");
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/3/contactTags`, {
      method: "POST",
      headers: {
        "Api-Token": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: tagId,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ActiveCampaign Tag Error:", errorData);
      throw new Error(
        `Failed to add tag: ${response.status} ${response.statusText}`,
      );
    }

    return true;
  } catch (error) {
    console.error("ActiveCampaign Add Tag Error:", error);
    return false;
  }
}

async function findContact(email: string): Promise<number | null> {
  const API_URL = process.env.ACTIVECAMPAIGN_API_URL;
  const API_KEY = process.env.ACTIVECAMPAIGN_API_KEY;

  try {
    const response = await fetch(
      `${API_URL}/api/3/contacts?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Api-Token": API_KEY!,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to find contact: ${response.status}`);
    }

    const data = await response.json();
    return data.contacts.length > 0 ? data.contacts[0].id : null;
  } catch (error) {
    console.error("ActiveCampaign Find Contact Error:", error);
    return null;
  }
}

// Add function to update existing contact
async function updateContact(
  contactId: number,
  name: string,
  password: string,
): Promise<boolean> {
  const API_URL = process.env.ACTIVECAMPAIGN_API_URL;
  const API_KEY = process.env.ACTIVECAMPAIGN_API_KEY;
  const PASSWORD_FIELD = process.env.ACTIVECAMPAIGN_PASSWORD_FIELD_ID;

  try {
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");

    const response = await fetch(`${API_URL}/api/3/contacts/${contactId}`, {
      method: "PUT",
      headers: {
        "Api-Token": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact: {
          firstName,
          lastName,
          fieldValues: [
            {
              field: PASSWORD_FIELD,
              value: password,
            },
          ],
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("ActiveCampaign Update Contact Error:", error);
    return false;
  }
}

// Main function to create contact and add tag
export async function createActiveCampaignContact(
  email: string,
  name: string,
  password: string,
): Promise<boolean> {
  try {
    const existingContactId = await findContact(email);

    let contactId;
    if (existingContactId) {
      // Update existing contact
      const updated = await updateContact(existingContactId, name, password);
      if (!updated) {
        console.error("Failed to update existing contact");
        return false;
      }
      contactId = existingContactId;
    } else {
      // Create new contact
      contactId = await createContact(email, name, password);
    }

    if (!contactId) {
      console.error("Failed to create/update contact");
      return false;
    }

    // Add tag in either case
    const tagAdded = await addTagToContact(
      contactId,
      process.env.ACTIVECAMPAIGN_TAG_ID!,
    );

    if (!tagAdded) {
      console.error("Failed to add tag to contact");
    }

    return true;
  } catch (error) {
    console.error("ActiveCampaign Error:", error);
    return false;
  }
}
