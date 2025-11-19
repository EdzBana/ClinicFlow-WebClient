// Medical History Types
export interface MedicalHistory {
  id: string;
  patient_id: string;
  // Medical History Checkboxes
  allergy: boolean;
  asthma: boolean;
  chicken_pox: boolean;
  bone_problem: boolean;
  diabetes: boolean;
  kidney_disease: boolean;
  lung_disease: boolean;
  vision_problem: boolean;
  emotional_episode: boolean;
  cancer: boolean;
  chest_pain: boolean;
  anemia: boolean;
  convulsion: boolean;
  dengue: boolean;
  epilepsy: boolean;
  loss_of_consciousness: boolean;
  skin_disease: boolean;
  liver_disease: boolean;
  hypertension: boolean;
  others: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMedicalHistory {
  patient_id: string;
  allergy?: boolean;
  asthma?: boolean;
  chicken_pox?: boolean;
  bone_problem?: boolean;
  diabetes?: boolean;
  kidney_disease?: boolean;
  lung_disease?: boolean;
  vision_problem?: boolean;
  emotional_episode?: boolean;
  cancer?: boolean;
  chest_pain?: boolean;
  anemia?: boolean;
  convulsion?: boolean;
  dengue?: boolean;
  epilepsy?: boolean;
  loss_of_consciousness?: boolean;
  skin_disease?: boolean;
  liver_disease?: boolean;
  hypertension?: boolean;
  others?: string;
}

// Physical Examination Record Types
export interface PhysicalExamRecord {
  id: string;
  patient_id: string;
  purpose?: string;
  bp?: string;
  pr?: string;
  rr?: string;
  temp?: string;
  cbc_normal?: boolean;
  cbc_abnormal?: boolean;
  cbc_image_url?: string;
  chest_xray_normal?: boolean;
  chest_xray_abnormal?: boolean;
  chest_xray_image_url?: string;
  urinalysis_normal?: boolean;
  urinalysis_abnormal?: boolean;
  urinalysis_image_url?: string;
  fecalysis_normal?: boolean;
  fecalysis_abnormal?: boolean;
  fecalysis_image_url?: string;
  ecg_normal?: boolean;
  ecg_abnormal?: boolean;
  ecg_image_url?: string;
  hbsag_reactive?: boolean;
  hbsag_nonreactive?: boolean;
  hbsag_image_url?: string;
  others_lab?: string;
  others_lab_image_url?: string;
  notes?: string;
  remarks?: string;
  evaluated_by?: string;
  control_number?: string;
  exam_date?: string;
  created_at?: string;
}

export interface CreatePhysicalExamRecord
  extends Omit<PhysicalExamRecord, "id" | "created_at"> {}
