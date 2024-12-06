export interface NotionColor {
  color:
    | "default"
    | "gray"
    | "brown"
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "pink";
}

export interface NotionTextAnnotations extends NotionColor {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
}

export interface NotionRichText {
  type: "text" | "mention" | "equation";
  text: {
    content: string;
    link: { url: string } | null;
  };
  annotations: NotionTextAnnotations;
  plain_text: string;
  href: string | null;
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  paragraph?: {
    rich_text: NotionRichText[];
    color?: string;
  };
  heading_1?: {
    rich_text: NotionRichText[];
    color?: string;
  };
  heading_2?: {
    rich_text: NotionRichText[];
    color?: string;
  };
  heading_3?: {
    rich_text: NotionRichText[];
    color?: string;
  };
  bulleted_list_item?: {
    rich_text: NotionRichText[];
    color?: string;
  };
  numbered_list_item?: {
    rich_text: NotionRichText[];
    color?: string;
  };
  to_do?: {
    rich_text: NotionRichText[];
    checked: boolean;
    color?: string;
  };
  toggle?: {
    rich_text: NotionRichText[];
    color?: string;
  };
  child_page?: {
    title: string;
  };
  image?: {
    type: "external" | "file";
    external?: {
      url: string;
    };
    file?: {
      url: string;
    };
    caption?: NotionRichText[];
  };
  code?: {
    text: NotionRichText[];
    language?: string;
    caption?: NotionRichText[];
  };
  quote?: {
    rich_text: NotionRichText[];
    color?: string;
  };
  callout?: {
    rich_text: NotionRichText[];
    icon?: {
      emoji: string;
    };
    color?: string;
  };
}

export interface NotionPage {
  id: string;
  properties: {
    title?: {
      title: NotionRichText[];
    };
    [key: string]: any;
  };
}

export interface SessionUpdateParams {
  email: string;
  sessionToken: string;
  refreshToken: string;
  sessionExpiry: Date;
  refreshExpiry: Date;
  userAgent: string;
}

export interface NotionUser {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface NotionUser {
  email: string;
  password: string;
}

export interface SessionUpdateParams {
  email: string;
  sessionToken: string;
  refreshToken: string;
  sessionExpiry: Date;
  refreshExpiry: Date;
  userAgent: string;
}

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}
