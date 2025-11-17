import { supabase } from "@/lib/supabaseClient";

// Helper to get Supabase config
const getSupabaseConfig = () => {
  // Access the internal config from supabase client
  return {
    supabaseUrl: (supabase as any).supabaseUrl || process.env.VITE_SUPABASE_URL,
    supabaseKey:
      (supabase as any).supabaseKey || process.env.VITE_SUPABASE_ANON_KEY,
  };
};

export interface MedicalServiceRequest {
  id?: string;
  name: string;
  location: string;
  event_name: string;
  date: string;
  department_organization: string;
  time: string;
  approval_status?: "pending" | "approved" | "rejected";
  requirements_submitted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MedicalServiceResponse {
  data: MedicalServiceRequest[] | MedicalServiceRequest | null;
  error: any;
}

// Submit a new medical service request via Edge Function
export const submitMedicalServiceRequest = async (
  requestData: Omit<MedicalServiceRequest, "id" | "created_at" | "updated_at">
): Promise<MedicalServiceResponse> => {
  try {
    const config = getSupabaseConfig();
    const response = await fetch(
      `${config.supabaseUrl}/functions/v1/submit-medical-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.supabaseKey}`,
        },
        body: JSON.stringify(requestData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Get all medical service requests
export const getAllMedicalServiceRequests =
  async (): Promise<MedicalServiceResponse> => {
    const { data, error } = await supabase
      .from("medical_service_requests")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  };

// Get a single medical service request by ID
export const getMedicalServiceRequestById = async (
  id: string
): Promise<MedicalServiceResponse> => {
  const { data, error } = await supabase
    .from("medical_service_requests")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
};

// Update medical service request (approval status and requirements)
export const updateMedicalServiceRequest = async (
  id: string,
  updates: Partial<MedicalServiceRequest>
): Promise<MedicalServiceResponse> => {
  const { data, error } = await supabase
    .from("medical_service_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
};

// Delete a medical service request
export const deleteMedicalServiceRequest = async (
  id: string
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from("medical_service_requests")
    .delete()
    .eq("id", id);

  return { error };
};

// Get requests by status
export const getMedicalServiceRequestsByStatus = async (
  status: "pending" | "approved" | "rejected"
): Promise<MedicalServiceResponse> => {
  const { data, error } = await supabase
    .from("medical_service_requests")
    .select("*")
    .eq("approval_status", status)
    .order("created_at", { ascending: false });

  return { data, error };
};
