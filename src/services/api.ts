const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Dynamically import supabase client (so no circular deps)
      const { supabase } = await import("@/lib/supabaseClient");
      const { data: session } = await supabase.auth.getSession();

      const accessToken =
        session?.session?.access_token ||
        import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${EDGE_FUNCTIONS_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        return { error: result.error || "An error occurred" };
      }

      return { data: result };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  /** ---------------------
   * PATIENT PROFILES
   * --------------------- */
  async createPatientProfile(profileData: CreatePatientProfileRequest) {
    return this.request<{ message: string }>("/patient-profiles", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
  }

  async searchPatientProfiles(
    searchQuery: string,
    limit: number = 10
  ): Promise<PatientProfile[]> {
    const response = await this.request<{ results: PatientProfile[] }>(
      "/patient-profiles",
      {
        method: "POST",
        body: JSON.stringify({
          action: "search",
          searchQuery,
          limit,
        }),
      }
    );

    if (response.error) {
      console.error(response.error);
      return [];
    }

    return response.data?.results ?? [];
  }

  async getPatientProfileDetails(id: string) {
    return this.request<{
      profile: PatientProfile;
    }>("/patient-profiles", {
      method: "POST",
      body: JSON.stringify({
        action: "getDetails",
        id,
      }),
    });
  }

  /** ---------------------
   * DEPARTMENTS
   * --------------------- */
  async getDepartments() {
    return this.request<Department[]>("/departments");
  }

  /** ---------------------
   * RECORDS
   * --------------------- */

  async uploadPatientRecords(
    uploadData: UploadPatientRecordsRequest,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ records: PatientRecord[] }>> {
    if (!uploadData.files.length) return { error: "No files to upload" };

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append("patientId", uploadData.patientId);
      formData.append("patientName", uploadData.patientName);
      formData.append("userId", uploadData.userId);
      formData.append("userType", uploadData.userType);

      uploadData.files.forEach((fileData, index) => {
        formData.append("files", fileData.file);
        formData.append(`description_${index}`, fileData.description);
      });

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ data: response });
          } else {
            resolve({ error: response.error || "Upload failed" });
          }
        } catch (e) {
          resolve({ error: "Failed to parse response from server" });
        }
      });

      xhr.addEventListener("error", () => resolve({ error: "Network error" }));

      xhr.open("POST", `${EDGE_FUNCTIONS_URL}/patient-records`);

      xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_ANON_KEY);

      // Add the access token from supabase.auth
      import("@/lib/supabaseClient").then(({ supabase }) => {
        supabase.auth.getSession().then(({ data }) => {
          const accessToken =
            data?.session?.access_token ||
            import.meta.env.VITE_SUPABASE_ANON_KEY;
          xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
          xhr.send(formData);
        });
      });
    });
  }

  async getFileSignedUrl(
    recordId: string,
    expiresIn: number = 3600
  ): Promise<ApiResponse<FileSignedUrlResponse>> {
    return this.request<FileSignedUrlResponse>("/serve-file", {
      method: "POST",
      body: JSON.stringify({
        action: "getSignedUrl",
        recordId,
        expiresIn,
      }),
    });
  }

  /** ---------------------
   * Inventory
   * --------------------- */
  async getItemList(): Promise<ApiResponse<InventoryItemList[]>> {
    return this.request<InventoryItemList[]>("/get-item-list");
  }

  async getCategories() {
    return this.request<ItemCategory[]>("/categories");
  }

  async createItem(itemData: CreateItemRequest) {
    return this.request<{ message: string; item: InventoryItemList }>(
      "/add-item",
      {
        method: "POST",
        body: JSON.stringify(itemData),
      }
    );
  }

  async getItemDetails(id: string) {
    return this.request<Item>("/get-item-details", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /** ---------------------
   * Transactions
   * --------------------- */
  async createTransaction(transactionData: CreateTransactionRequest) {
    return this.request<CreateTransactionResponse>("/create-transaction", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactions(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    try {
      // Use the shared request method for consistency
      const { supabase } = await import("@/lib/supabaseClient");
      const { data: session } = await supabase.auth.getSession();

      const accessToken =
        session?.session?.access_token ||
        import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${EDGE_FUNCTIONS_URL}/get-transactions?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Error fetching transactions:", result);
        return {
          data: [],
          total: 0,
          error: result.error || "Failed to fetch transactions",
        };
      }

      return {
        data: result.data ?? [],
        total: result.total ?? 0,
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  /** ---------------------
   * ITEM OPERATIONS
   * --------------------- */
  async getItemDetailsById(id: string) {
    return this.request<InventoryItemList>("/item-operations", {
      method: "POST",
      body: JSON.stringify({
        action: "getItemDetails",
        id,
      }),
    });
  }

  async getItemBatches(itemId: string) {
    return this.request<ItemBatch[]>("/item-operations", {
      method: "POST",
      body: JSON.stringify({
        action: "getItemBatches",
        itemId,
      }),
    });
  }

  async searchItems(
    searchQuery: string,
    limit: number = 10,
    userType?: string
  ): Promise<InventoryItemList[]> {
    const response = await this.request<{ results: InventoryItemList[] }>(
      "/item-operations",
      {
        method: "POST",
        body: JSON.stringify({
          action: "searchItems",
          searchQuery,
          limit,
          userType, // Pass userType for filtering
        }),
      }
    );

    if (response.error) {
      console.error(response.error);
      return [];
    }

    return response.data?.results ?? [];
  }

  async updateItem(id: string, updateData: UpdateItemRequest) {
    return this.request<{ message: string; item: InventoryItemList }>(
      "/item-operations",
      {
        method: "POST",
        body: JSON.stringify({
          action: "updateItem",
          id,
          ...updateData,
        }),
      }
    );
  }

  async deleteItem(id: string) {
    return this.request<{ message: string }>("/item-operations", {
      method: "POST",
      body: JSON.stringify({
        action: "deleteItem",
        id,
      }),
    });
  }

  async restockItem(restockData: RestockItemRequest) {
    return this.request<{ message: string; batch: ItemBatch }>(
      "/item-operations",
      {
        method: "POST",
        body: JSON.stringify({
          action: "restockItem",
          ...restockData,
        }),
      }
    );
  }
}

/* -------------------------
 * TYPES
 * ------------------------- */
export interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  dept_name: string;
  dept_code?: string;
  middle_initial?: string;
  suffix?: string;
  created_at: string;
  home_address?: string;
  office_address?: string;
  contact_no?: string;
  designation?: string;
  occupation?: string;
  gender?: string;
  marital_status?: string;
  weight?: string;
  height?: string;
  birthdate?: string;
  age?: string;
  is_active?: boolean;
  updated_at?: string;
}

export interface CreatePatientProfileRequest {
  first_name: string;
  last_name: string;
  id_number: string;
  dept_name: string;
  dept_code?: string;
  middle_initial?: string;
  suffix?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  department_type: string;
  is_active: boolean;
  created_at: string;
}

export interface PatientRecord {
  id: string;
  patient_id: string;
  file_name: string;
  file_url: string;
  description?: string;
  uploaded_by?: string;
  created_at: string;
  record_type?: string;
  file_path: string; // Add file_path to PatientRecord
}

export interface FileSignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
}

export interface UploadPatientRecordsRequest {
  patientId: string;
  patientName: string;
  userId: string;
  userType: string;
  files: {
    file: File;
    description: string;
  }[];
}

export interface InventoryItemList {
  id: string;
  item_type: "Medical" | "Dental";
  name: string;
  generic_name: string | null;
  category: string;

  quantity_box: string;
  quantity_unit: string;
  total_stock: string;

  quantity_per_box: number;

  cost_per_unit: number | null;
  cost_per_box: number | null;
  expiration_date: string | null;

  min_threshold: number;
  min_thresh_type: "unit" | "box" | "percentage";

  received_at: string | null; // ✅ NEW
}

export interface ItemCategory {
  id: number;
  name: string;
}

export interface Item {
  id: string;
  item_type: string;
  name: string;
  category: string;
  quantity_box: number | null;
  quantity_unit: number | null;
  cost_per_unit: number | null;
  cost_per_box: number | null;
  expiration_date: string | null;
  min_threshold: number;
  min_thresh_type: string;
  created_at: string;
}

export interface CreateItemRequest {
  itemType: string;
  name: string;
  genericName: string | null;
  category: string;

  // Box-related fields (all required together or all null)
  quantityBox: number | null;
  quantityPerBox: number | null; // ✅ Changed: now nullable
  costPerBox: number | null;

  // Unit-related fields
  quantityUnit: number | null;
  costPerUnit: number | null;

  // Other fields
  expirationDate: string | null;
  minThreshold: number;
  minThresholdType: "unit" | "box" | "percentage";
}
export interface TransactionItemInput {
  item_id: string;
  quantity: number;
}

export interface CreateTransactionRequest {
  user_type: string;
  method: string;
  created_by: string;
  items: TransactionItemInput[];
  dispensed_to_name?: string;
  dispensed_to_id_number?: string;
}

export interface CreateTransactionResponse {
  message: string;
}

export interface TransactionItemRecord {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    category: string;
  };
}

export interface TransactionRecord {
  id: string;
  user_type: string;
  method: string;
  created_by: string;
  created_at: string;
  transaction_items: TransactionItemRecord[];
}

export interface ItemBatch {
  id: string;
  item_id: string;
  received_at: string;
  expiration_date: string | null;
  quantity_box: number;
  quantity_unit: number;
  cost_per_unit: number | null;
  cost_per_box: number | null;
}

export interface UpdateItemRequest {
  itemType?: string;
  name?: string;
  genericName?: string | null;
  category?: string;
  quantityPerBox?: number | null;
  minThreshold?: number;
  minThresholdType?: "unit" | "box" | "percentage";
}

export interface RestockItemRequest {
  itemId: string;
  quantityBox: number;
  quantityUnit: number;
  costPerBox: number | null;
  costPerUnit: number | null;
  expirationDate: string | null;
}

export const apiClient = new ApiClient();
