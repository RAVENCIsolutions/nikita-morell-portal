import { ExtendedRecordMap } from "notion-types";

export interface AuthResponse {
  success: boolean;
  message?: string;
  sessionToken?: string;
}

export interface ContentResponse {
  success: boolean;
  message?: string;
  recordMap?: ExtendedRecordMap;
  page?: any;
}
