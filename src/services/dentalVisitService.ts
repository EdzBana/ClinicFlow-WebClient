import { supabase } from "@/lib/supabaseClient";

export interface DentalVisit {
  id: string;
  patient_id: string;
  date: string;
  time: string;
  complaints: string[];
  complaints_other: string | null;
  treatment: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateDentalVisit {
  patient_id: string;
  date: string;
  time: string;
  complaints: string[];
  complaints_other?: string | null;
  treatment?: string | null;
  notes?: string | null;
}

export const dentalVisitService = {
  async create(data: CreateDentalVisit): Promise<DentalVisit> {
    const { data: record, error } = await supabase
      .from("dental_visits")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return record;
  },

  async getByPatient(patientId: string): Promise<DentalVisit[]> {
    const { data, error } = await supabase
      .from("dental_visits")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<DentalVisit> {
    const { data, error } = await supabase
      .from("dental_visits")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    data: Partial<CreateDentalVisit>,
  ): Promise<DentalVisit> {
    const { data: record, error } = await supabase
      .from("dental_visits")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return record;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("dental_visits")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
