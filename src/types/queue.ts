export type ServiceType = "Medical" | "Dental";

export type QueueStatus = "waiting" | "serving" | "completed" | "cancelled";

export interface Queue {
  id: number;
  name: string;
  id_number: string;
  service_type: ServiceType;
  queue_number: string;
  queue_date: string;
  status: QueueStatus;
  created_at: string;
  served_at: string | null;
  completed_at: string | null;
}

export interface QueueHistory {
  id: number;
  queue_id: number;
  name: string;
  id_number: string;
  service_type: ServiceType;
  queue_number: string;
  queue_date: string;
  status: QueueStatus;
  created_at: string;
  served_at: string | null;
  completed_at: string | null;
  archived_at: string;
}

export interface QueueSettings {
  id: number;
  is_accepting_queue: boolean;
  current_serving_id: number | null;
  updated_at: string;
}

export interface QueueInsert {
  name: string;
  id_number: string;
  service_type: ServiceType;
  queue_number: string;
  queue_date: string;
  status?: QueueStatus;
}
