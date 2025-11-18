export interface MedicalWalkinHistory {
  id: string;
  patient_id: string;
  created_at: string;
  date: string | null;
  time: string | null;
  notes: string | null;
  treatment: string | null;
  complaints_and_vital: string | null;
}

export interface CreateMedicalWalkinHistory {
  patient_id: string;
  date: string;
  time: string;
  notes?: string;
  treatment?: string;
  complaints_and_vital?: string;
}

// Dental Treatment Record Types
export interface DentalTreatmentRecord {
  id: string;
  patient_id: string;
  date: string | null;
  tooth_no: string | null;
  procedure: string | null;
  dentist: string | null;
  created_at: string;
}

export interface CreateDentalTreatmentRecord {
  patient_id: string;
  date: string;
  tooth_no?: string;
  procedure?: string;
  dentist?: string;
}
