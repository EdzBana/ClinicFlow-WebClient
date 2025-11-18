import { supabase } from "@/lib/supabaseClient";
import type {
  MedicalHistory,
  CreateMedicalHistory,
  PhysicalExamRecord,
  CreatePhysicalExamRecord,
} from "@/types/physicalExamTypes";

// Medical History Service (One per patient)
export const medicalHistoryService = {
  async getByPatientId(patientId: string): Promise<MedicalHistory | null> {
    const { data, error } = await supabase
      .from("medical_history")
      .select("*")
      .eq("patient_id", patientId)
      .single();

    if (error) {
      // If no record exists, return null instead of throwing
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async create(record: CreateMedicalHistory): Promise<MedicalHistory> {
    const { data, error } = await supabase
      .from("medical_history")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    patientId: string,
    updates: Partial<CreateMedicalHistory>
  ): Promise<MedicalHistory> {
    const { data, error } = await supabase
      .from("medical_history")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("patient_id", patientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsert(record: CreateMedicalHistory): Promise<MedicalHistory> {
    const { data, error } = await supabase
      .from("medical_history")
      .upsert(
        { ...record, updated_at: new Date().toISOString() },
        { onConflict: "patient_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Physical Examination Record Service (Multiple per patient)
export const physicalExamService = {
  async getByPatientId(patientId: string): Promise<PhysicalExamRecord[]> {
    const { data, error } = await supabase
      .from("physical_exam_record")
      .select("*")
      .eq("patient_id", patientId)
      .order("exam_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PhysicalExamRecord | null> {
    const { data, error } = await supabase
      .from("physical_exam_record")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async create(record: CreatePhysicalExamRecord): Promise<PhysicalExamRecord> {
    const { data, error } = await supabase
      .from("physical_exam_record")
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<CreatePhysicalExamRecord>
  ): Promise<PhysicalExamRecord> {
    const { data, error } = await supabase
      .from("physical_exam_record")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("physical_exam_record")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
