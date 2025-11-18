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
  purpose: string | null;
  bp: string | null;
  pr: string | null;
  rr: string | null;
  temp: string | null;
  // Lab Results
  cbc_normal: boolean;
  cbc_abnormal: boolean;
  chest_xray_normal: boolean;
  chest_xray_abnormal: boolean;
  urinalysis_normal: boolean;
  urinalysis_abnormal: boolean;
  fecalysis_normal: boolean;
  fecalysis_abnormal: boolean;
  ecg_normal: boolean;
  ecg_abnormal: boolean;
  hbsag_reactive: boolean;
  hbsag_nonreactive: boolean;
  others_lab: string | null;
  notes: string | null;
  remarks: string | null;
  evaluated_by: string | null;
  control_number: string | null;
  exam_date: string | null;
  created_at: string;
}

export interface CreatePhysicalExamRecord {
  patient_id: string;
  purpose?: string;
  bp?: string;
  pr?: string;
  rr?: string;
  temp?: string;
  cbc_normal?: boolean;
  cbc_abnormal?: boolean;
  chest_xray_normal?: boolean;
  chest_xray_abnormal?: boolean;
  urinalysis_normal?: boolean;
  urinalysis_abnormal?: boolean;
  fecalysis_normal?: boolean;
  fecalysis_abnormal?: boolean;
  ecg_normal?: boolean;
  ecg_abnormal?: boolean;
  hbsag_reactive?: boolean;
  hbsag_nonreactive?: boolean;
  others_lab?: string;
  notes?: string;
  remarks?: string;
  evaluated_by?: string;
  control_number?: string;
  exam_date?: string;
}
