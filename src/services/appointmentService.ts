import { supabase } from "@/lib/supabaseClient";

const getSupabaseConfig = () => {
  return {
    supabaseUrl: (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: (supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
};

export interface Appointment {
  id?: string;
  last_name: string;
  first_name: string;
  id_number: string;
  department: string;
  email: string;
  reason: string;
  additional_notes?: string;
  service_type: "Medical" | "Dental";
  appointment_date?: string;
  appointment_time?: string;
  assigned_staff?: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentResponse {
  data: Appointment[] | Appointment | null;
  error: any;
}

// Submit a new appointment (student-facing)
export const submitAppointment = async (
  appointmentData: Omit<Appointment, "id" | "created_at" | "updated_at" | "status">
): Promise<AppointmentResponse> => {
  const { data, error } = await supabase
    .from("appointments")
    .insert([{ ...appointmentData, status: "pending" }]);
  return { data, error };
};

// Get all appointments (admin-facing)
export const getAllAppointments = async (): Promise<AppointmentResponse> => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
};

// Get a single appointment by ID
export const getAppointmentById = async (id: string): Promise<AppointmentResponse> => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
};

// Update appointment (admin: set date, time, staff, status)
export const updateAppointment = async (
  id: string,
  updates: Partial<Appointment>
): Promise<AppointmentResponse> => {
  const { data, error } = await supabase
    .from("appointments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
};

// Delete an appointment
export const deleteAppointment = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  return { error };
};

// Get appointments by status
export const getAppointmentsByStatus = async (
  status: Appointment["status"]
): Promise<AppointmentResponse> => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  return { data, error };
};

// Send email via Supabase Edge Function (Resend - free tier)
export const sendAppointmentEmail = async (
  appointment: Appointment,
  emailType: "confirmed" | "cancelled" | "completed"
): Promise<{ success: boolean; error: any }> => {
  try {
    const config = getSupabaseConfig();
    const response = await fetch(
      `${config.supabaseUrl}/functions/v1/send-appointment-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.supabaseKey}`,
        },
        body: JSON.stringify({ appointment, emailType }),
      }
    );
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.error };
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};