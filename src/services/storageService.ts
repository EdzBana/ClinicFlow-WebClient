// src/services/storageService.ts
import { supabase } from "@/lib/supabaseClient";

export const storageService = {
  async uploadLabResultImage(
    file: File,
    patientId: string,
    labType: string
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${patientId}/${labType}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("lab-results")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Return the path instead of public URL
    // We'll generate signed URLs when needed
    return data.path;
  },

  async deleteLabResultImage(imagePath: string): Promise<void> {
    // If it's a full URL, extract the path
    let path = imagePath;
    if (imagePath.includes("/lab-results/")) {
      path = imagePath.split("/lab-results/").pop() || imagePath;
    }

    const { error } = await supabase.storage.from("lab-results").remove([path]);

    if (error) throw error;
  },

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    // If it's already a full URL, extract just the path
    let filePath = path;
    if (path.includes("/lab-results/")) {
      filePath = path.split("/lab-results/").pop() || path;
    }

    const { data, error } = await supabase.storage
      .from("lab-results")
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;

    return data.signedUrl;
  },

  // Batch version for efficiency when loading multiple images
  async getSignedUrls(
    paths: string[],
    expiresIn: number = 3600
  ): Promise<Record<string, string>> {
    const urlPromises = paths.map(async (path) => {
      try {
        const signedUrl = await this.getSignedUrl(path, expiresIn);
        return { path, signedUrl };
      } catch (error) {
        console.error(`Error getting signed URL for ${path}:`, error);
        return { path, signedUrl: "" };
      }
    });

    const results = await Promise.all(urlPromises);

    // Convert to object for easy lookup
    return results.reduce((acc, { path, signedUrl }) => {
      acc[path] = signedUrl;
      return acc;
    }, {} as Record<string, string>);
  },

  // For backward compatibility if you need public URLs
  getPublicUrl(path: string): string {
    const { data } = supabase.storage.from("lab-results").getPublicUrl(path);

    return data.publicUrl;
  },
};
