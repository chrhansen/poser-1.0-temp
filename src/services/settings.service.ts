import type { SettingsProfile } from "@/lib/types";
import { mockProfile, delay } from "./mock-data";

const MAX_AVATAR_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// TODO_BACKEND_HOOKUP: Replace with real settings API
export const settingsService = {
  getProfile: async (): Promise<SettingsProfile> => {
    await delay(300);
    return { ...mockProfile };
  },

  updateProfile: async (data: Partial<Pick<SettingsProfile, "name" | "notifications">>): Promise<SettingsProfile> => {
    // TODO_BACKEND_HOOKUP: Persist profile changes
    await delay(500);
    return { ...mockProfile, ...data };
  },

  updateEmail: async (_newEmail: string): Promise<{ needsConfirmation: boolean }> => {
    // TODO_BACKEND_HOOKUP: Send confirmation email for new address
    await delay(500);
    return { needsConfirmation: true };
  },

  validateAvatar: (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: "Please upload a JPG, PNG, WebP, or GIF image." };
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `Image must be under ${MAX_AVATAR_SIZE_MB}MB.` };
    }
    return { valid: true };
  },

  uploadAvatar: async (_file: File): Promise<{ url: string }> => {
    // TODO_BACKEND_HOOKUP: Upload avatar to storage
    await delay(600);
    return { url: URL.createObjectURL(_file) };
  },
};
