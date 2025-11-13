import { supabase } from "@/lib/supabaseClient";
import type {
  Queue,
  QueueInsert,
  QueueSettings,
  ServiceType,
  QueueStatus,
  QueueHistory,
} from "@/types/queue";
import { RealtimeChannel } from "@supabase/supabase-js";

export const queueService = {
  // Get next queue number (M001, D001, etc.) - Resets daily
  async getNextQueueNumber(serviceType: ServiceType): Promise<string> {
    const prefix = serviceType === "Medical" ? "M" : "D";
    const today = new Date().toISOString().split("T")[0];

    // Get count of today's queues for this service type
    const { count } = await supabase
      .from("queue")
      .select("*", { count: "exact", head: true })
      .eq("queue_date", today)
      .eq("service_type", serviceType);

    const nextNumber = (count || 0) + 1;
    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
  },

  // Add to queue
  async addToQueue(
    name: string,
    idNumber: string,
    serviceType: ServiceType
  ): Promise<Queue> {
    const queueNumber = await this.getNextQueueNumber(serviceType);
    const today = new Date().toISOString().split("T")[0];

    const queueData: QueueInsert = {
      name,
      id_number: idNumber,
      service_type: serviceType,
      queue_number: queueNumber,
      queue_date: today,
      status: "waiting",
    };

    const { data, error } = await supabase
      .from("queue")
      .insert([queueData])
      .select()
      .single();

    if (error) throw error;
    return data as Queue;
  },

  // Get waiting queue count by service type (today only)
  async getWaitingCount(serviceType: ServiceType): Promise<number> {
    const today = new Date().toISOString().split("T")[0];

    const { count } = await supabase
      .from("queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "waiting")
      .eq("service_type", serviceType)
      .eq("queue_date", today);

    return count || 0;
  },

  // Get all waiting queues by service type (today only)
  async getWaitingQueues(serviceType: ServiceType): Promise<Queue[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("status", "waiting")
      .eq("service_type", serviceType)
      .eq("queue_date", today)
      .order("created_at", { ascending: true });

    return (data as Queue[]) || [];
  },

  // Get current serving by service type (today only)
  async getCurrentServing(serviceType: ServiceType): Promise<Queue | null> {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("status", "serving")
      .eq("service_type", serviceType)
      .eq("queue_date", today)
      .order("served_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data as Queue | null;
  },

  // Get next in queue by service type (today only)
  async getNextInQueue(serviceType: ServiceType): Promise<Queue | null> {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("status", "waiting")
      .eq("service_type", serviceType)
      .eq("queue_date", today)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return data as Queue | null;
  },

  // Serve next client by service type
  async serveNext(serviceType: ServiceType): Promise<Queue | null> {
    // Complete any currently serving for this service type first
    const currentServing = await this.getCurrentServing(serviceType);
    if (currentServing) {
      await this.completeService(currentServing.id);
    }

    // Get next in queue for this service type
    const next = await this.getNextInQueue(serviceType);
    if (!next) return null;

    // Update status to serving
    const { data, error } = await supabase
      .from("queue")
      .update({
        status: "serving" as QueueStatus,
        served_at: new Date().toISOString(),
      })
      .eq("id", next.id)
      .select()
      .single();

    if (error) throw error;
    return data as Queue;
  },

  // Complete current service
  async completeService(queueId: number): Promise<Queue> {
    const { data, error } = await supabase
      .from("queue")
      .update({
        status: "completed" as QueueStatus,
        completed_at: new Date().toISOString(),
      })
      .eq("id", queueId)
      .select()
      .single();

    if (error) throw error;
    return data as Queue;
  },

  // Clear all waiting queues by service type (today only)
  async clearQueue(serviceType: ServiceType): Promise<void> {
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("queue")
      .update({ status: "cancelled" as QueueStatus })
      .eq("status", "waiting")
      .eq("service_type", serviceType)
      .eq("queue_date", today);

    if (error) throw error;
  },

  // Get queue settings
  async getSettings(): Promise<QueueSettings | null> {
    const { data } = await supabase.from("queue_settings").select("*").single();

    return data as QueueSettings | null;
  },

  // Update queue settings
  async updateSettings(isAccepting: boolean): Promise<QueueSettings> {
    const { data, error } = await supabase
      .from("queue_settings")
      .update({
        is_accepting_queue: isAccepting,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single();

    if (error) throw error;
    return data as QueueSettings;
  },

  // Subscribe to queue changes
  subscribeToQueue(callback: (payload: any) => void): RealtimeChannel {
    const subscription = supabase
      .channel("queue-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue",
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  // Subscribe to settings changes
  subscribeToSettings(callback: (payload: any) => void): RealtimeChannel {
    const subscription = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_settings",
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  // History Functions

  // Get queue history with filters
  async getQueueHistory(
    startDate?: string,
    endDate?: string,
    serviceType?: ServiceType,
    status?: QueueStatus,
    limit: number = 100
  ): Promise<QueueHistory[]> {
    let query = supabase
      .from("queue_history")
      .select("*")
      .order("queue_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte("queue_date", startDate);
    }

    if (endDate) {
      query = query.lte("queue_date", endDate);
    }

    if (serviceType) {
      query = query.eq("service_type", serviceType);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data } = await query;
    return (data as QueueHistory[]) || [];
  },

  // Get today's completed queues
  async getTodayCompleted(serviceType?: ServiceType): Promise<Queue[]> {
    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("queue")
      .select("*")
      .eq("queue_date", today)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (serviceType) {
      query = query.eq("service_type", serviceType);
    }

    const { data } = await query;
    return (data as Queue[]) || [];
  },

  // Get statistics for a date range
  async getQueueStats(
    startDate: string,
    endDate: string
  ): Promise<{
    totalQueues: number;
    completedQueues: number;
    cancelledQueues: number;
    medicalQueues: number;
    dentalQueues: number;
    averageWaitTime: number | null;
  }> {
    const { data: historyData } = await supabase
      .from("queue_history")
      .select("*")
      .gte("queue_date", startDate)
      .lte("queue_date", endDate);

    const { data: currentData } = await supabase
      .from("queue")
      .select("*")
      .gte("queue_date", startDate)
      .lte("queue_date", endDate);

    const allData = [...(historyData || []), ...(currentData || [])];

    const stats = {
      totalQueues: allData.length,
      completedQueues: allData.filter((q) => q.status === "completed").length,
      cancelledQueues: allData.filter((q) => q.status === "cancelled").length,
      medicalQueues: allData.filter((q) => q.service_type === "Medical").length,
      dentalQueues: allData.filter((q) => q.service_type === "Dental").length,
      averageWaitTime: null as number | null,
    };

    // Calculate average wait time for completed queues
    const completedWithTimes = allData.filter(
      (q) => q.status === "completed" && q.created_at && q.served_at
    );

    if (completedWithTimes.length > 0) {
      const totalWaitMinutes = completedWithTimes.reduce((sum, q) => {
        const created = new Date(q.created_at).getTime();
        const served = new Date(q.served_at!).getTime();
        return sum + (served - created) / (1000 * 60); // Convert to minutes
      }, 0);

      stats.averageWaitTime = Math.round(
        totalWaitMinutes / completedWithTimes.length
      );
    }

    return stats;
  },

  // Archive old queues manually (can be called from admin panel)
  async archiveOldQueues(): Promise<void> {
    const { error } = await supabase.rpc("archive_old_queues");
    if (error) throw error;
  },
};
