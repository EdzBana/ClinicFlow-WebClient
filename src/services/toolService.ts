import { supabase } from "@/lib/supabaseClient";
import type { Tool, CreateToolRequest, UpdateToolRequest } from "@/types/tools";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ToolService {
  /**
   * Get all tools
   */
  async getToolsList(): Promise<ApiResponse<Tool[]>> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to fetch tools",
      };
    }
  }

  /**
   * Get tool by ID
   */
  async getToolDetails(id: string): Promise<ApiResponse<Tool>> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to fetch tool",
      };
    }
  }

  /**
   * Create a new tool
   */
  async createTool(
    toolData: CreateToolRequest
  ): Promise<ApiResponse<{ message: string; tool: Tool }>> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .insert([toolData])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return {
        data: {
          message: "Tool created successfully",
          tool: data,
        },
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to create tool",
      };
    }
  }

  /**
   * Update a tool
   */
  async updateTool(
    id: string,
    updateData: UpdateToolRequest
  ): Promise<ApiResponse<{ message: string; tool: Tool }>> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return {
        data: {
          message: "Tool updated successfully",
          tool: data,
        },
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to update tool",
      };
    }
  }

  /**
   * Delete a tool
   */
  async deleteTool(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const { error } = await supabase.from("tools").delete().eq("id", id);

      if (error) {
        return { error: error.message };
      }

      return {
        data: {
          message: "Tool deleted successfully",
        },
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to delete tool",
      };
    }
  }

  /**
   * Search tools by name or category
   */
  async searchTools(searchQuery: string, limit: number = 10): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(limit)
        .order("name");

      if (error) {
        console.error("Search error:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Search error:", err);
      return [];
    }
  }
}

export const toolService = new ToolService();
