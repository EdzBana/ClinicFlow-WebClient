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
      const response = await fetch(`${EDGE_FUNCTIONS_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
  ): Promise<ApiResponse<{ records: PatientRecord[]; message: string }>> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append("patientId", uploadData.patientId);
      formData.append("patientName", uploadData.patientName);

      formData.append("userId", uploadData.userId);
      formData.append("userType", uploadData.userType);

      console.log(
        "Uploading files:",
        uploadData.files.map((f) => ({
          name: f.file.name,
          size: f.file.size,
          type: f.file.type,
        }))
      );

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
        const status = xhr.status;
        console.log("Upload response:", {
          status,
          responseText: xhr.responseText,
        });

        try {
          const response = JSON.parse(xhr.responseText);
          if (status >= 200 && status < 300) {
            resolve({ data: response });
          } else {
            resolve({
              error: response.error || "Upload failed",
              message: response.details,
            });
          }
        } catch (e) {
          console.error("Failed to parse response:", e);
          resolve({ error: "Failed to parse server response" });
        }
      });

      xhr.addEventListener("error", () => {
        console.error("XHR Error:", xhr.statusText);
        resolve({ error: "Network error occurred" });
      });

      xhr.open("POST", `${EDGE_FUNCTIONS_URL}/patient-records`);
      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      );
      xhr.send(formData);
    });
  }

  async getPatientRecords(
    patientId: string
  ): Promise<ApiResponse<{ records: PatientRecord[] }>> {
    return this.request<{ records: PatientRecord[] }>("/patient-records", {
      method: "POST",
      body: JSON.stringify({
        action: "getRecords",
        patientId,
      }),
    });
  }

  /** ---------------------
   * Inventory
   * --------------------- */
  async getItemList() {
    return this.request<InvetoryItemList[]>("/get-item-list");
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

export interface InvetoryItemList {
  id: string;
  type: string;
  name: string;
  category: string;
  quantity_box: number;
  quantity_unit: number;
  cost_per_unit: number;
  cost_per_box: number;
  expiration_date: Date;
  min_threshold: number;
  min_thresh_type: string;
}

export const apiClient = new ApiClient();
