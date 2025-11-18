import { supabase } from "@/lib/supabaseClient";
import type {
  MedicalWalkinHistory,
  CreateMedicalWalkinHistory,
  DentalTreatmentRecord,
  CreateDentalTreatmentRecord,
} from "@/types/records";

// Medical Walk-in History Service
export const medicalWalkinService = {
  async getByPatientId(patientId: string): Promise<MedicalWalkinHistory[]> {
    const { data, error } = await supabase
      .from("medical_walkin_history")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    record: CreateMedicalWalkinHistory
  ): Promise<MedicalWalkinHistory> {
    const { data, error } = await supabase
      .from("medical_walkin_history")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<CreateMedicalWalkinHistory>
  ): Promise<MedicalWalkinHistory> {
    const { data, error } = await supabase
      .from("medical_walkin_history")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("medical_walkin_history")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Dental Treatment Record Service
export const dentalTreatmentService = {
  async getByPatientId(patientId: string): Promise<DentalTreatmentRecord[]> {
    const { data, error } = await supabase
      .from("dental_treatment_record")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    record: CreateDentalTreatmentRecord
  ): Promise<DentalTreatmentRecord> {
    const { data, error } = await supabase
      .from("dental_treatment_record")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<CreateDentalTreatmentRecord>
  ): Promise<DentalTreatmentRecord> {
    const { data, error } = await supabase
      .from("dental_treatment_record")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("dental_treatment_record")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
