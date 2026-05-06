import { useState, useEffect, useCallback } from "react";
import MainTemplate from "@/components/MainTemplate";
import { apiClient } from "@/services/api";
import { queueService } from "@/services/queueService";
import { useAuth } from "@/hooks/useAuth";
import { medicalWalkinService } from "@/services/medicalDentalService";
import { getAppointmentsByStatus } from "@/services/appointmentService";
import { getMedicalServiceRequestsByStatus } from "@/services/medicalService";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  Package,
  Calendar,
  TrendingUp,
  Activity,
  ClipboardList,
  Stethoscope,
  FileText,
  Loader2,
} from "lucide-react";
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus";

const NEAR_EXPIRATION_DAYS = 14;

interface DashboardStats {
  lowStockCount: number;
  nearExpirationCount: number;
  expiredCount: number;
  pendingAppointments: number;
  pendingServiceRequests: number;
}

interface ChartData {
  date: string;
  count: number;
}

interface AppointmentData {
  date: string;
  count: number;
}

interface CategoryData {
  category: string;
  count: number;
}

interface SymptomData {
  symptom: string;
  count: number;
}

interface Transaction {
  created_at: string;
  user_type: string;
  transaction_items?: {
    quantity: number;
    item?: {
      name: string;
    };
  }[];
}

const calculateDaysDifference = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  return (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
};

const BAR_COLORS = [
  "#680000",
  "#1e40af",
  "#15803d",
  "#b45309",
  "#7e22ce",
  "#0e7490",
  "#be123c",
  "#4d7c0f",
  "#c2410c",
  "#1d4ed8",
];

// ─── Report Generation ──────────────────────────────────────────────────────

const generateReport = async (
  userType: string,
  timeRange: string,
  stats: DashboardStats,
  dispenseData: ChartData[],
  appointmentData: AppointmentData[],
  categoryData: CategoryData[],
  symptomData: SymptomData[],
) => {
  // Dynamically import docx to avoid adding it to the main bundle
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    WidthType,
    ShadingType,
    VerticalAlign,
  } = await import("docx");

  const now = new Date();
  const generatedAt = now.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeRangeLabel: Record<string, string> = {
    "7": "Last 7 Days",
    "30": "Last 30 Days",
    "90": "Last 90 Days",
    "180": "Last 180 Days",
  };

  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const headerFill = { fill: "680000", type: ShadingType.CLEAR };
  const altFill = { fill: "F5F5F5", type: ShadingType.CLEAR };

  const cellText = (
    text: string,
    opts?: {
      bold?: boolean;
      color?: string;
      size?: number;
      align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    },
  ) =>
    new Paragraph({
      alignment: opts?.align ?? AlignmentType.LEFT,
      children: [
        new TextRun({
          text,
          bold: opts?.bold ?? false,
          color: opts?.color ?? "000000",
          size: opts?.size ?? 20,
          font: "Arial",
        }),
      ],
    });

  // ── Helper: 2-column stat table ──
  const makeStatTable = (
    rows: { label: string; value: string | number; highlight?: boolean }[],
  ) =>
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [6240, 3120],
      rows: rows.map(
        (row, i) =>
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 6240, type: WidthType.DXA },
                shading: i % 2 === 0 ? undefined : altFill,
                margins: { top: 80, bottom: 80, left: 140, right: 140 },
                children: [cellText(row.label, { bold: false, size: 20 })],
              }),
              new TableCell({
                borders,
                width: { size: 3120, type: WidthType.DXA },
                shading: i % 2 === 0 ? undefined : altFill,
                margins: { top: 80, bottom: 80, left: 140, right: 140 },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  cellText(String(row.value), {
                    bold: true,
                    color: row.highlight ? "680000" : "000000",
                    align: AlignmentType.RIGHT,
                  }),
                ],
              }),
            ],
          }),
      ),
    });

  // ── Helper: generic data table (header + rows) ──
  const makeDataTable = (
    headers: { label: string; width: number }[],
    dataRows: (string | number)[][],
  ) => {
    const totalWidth = headers.reduce((acc, h) => acc + h.width, 0);
    return new Table({
      width: { size: totalWidth, type: WidthType.DXA },
      columnWidths: headers.map((h) => h.width),
      rows: [
        // Header row
        new TableRow({
          tableHeader: true,
          children: headers.map(
            (h) =>
              new TableCell({
                borders,
                width: { size: h.width, type: WidthType.DXA },
                shading: headerFill,
                margins: { top: 80, bottom: 80, left: 140, right: 140 },
                children: [
                  cellText(h.label, { bold: true, color: "FFFFFF", size: 20 }),
                ],
              }),
          ),
        }),
        // Data rows
        ...dataRows.map(
          (row, ri) =>
            new TableRow({
              children: row.map(
                (cell, ci) =>
                  new TableCell({
                    borders,
                    width: { size: headers[ci].width, type: WidthType.DXA },
                    shading: ri % 2 !== 0 ? altFill : undefined,
                    margins: { top: 80, bottom: 80, left: 140, right: 140 },
                    children: [
                      cellText(String(cell), {
                        align:
                          ci === row.length - 1
                            ? AlignmentType.RIGHT
                            : AlignmentType.LEFT,
                      }),
                    ],
                  }),
              ),
            }),
        ),
      ],
    });
  };

  const spacer = () =>
    new Paragraph({
      children: [new TextRun({ text: "", size: 12 })],
      spacing: { after: 120 },
    });

  const sectionHeading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 320, after: 160 },
      children: [
        new TextRun({
          text,
          bold: true,
          color: "680000",
          size: 28,
          font: "Arial",
        }),
      ],
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: "680000",
          space: 1,
        },
      },
    });

  // ── Build the dispense trend summary (min / max / avg) ──
  const trendSummary = (
    data: { date: string; count: number }[],
    label: string,
  ) => {
    if (!data.length) return [];
    const counts = data.map((d) => d.count);
    const total = counts.reduce((a, b) => a + b, 0);
    const peak = data.reduce((a, b) => (b.count > a.count ? b : a));
    return [
      { label: `Total ${label}`, value: total },
      { label: "Daily Average", value: (total / data.length).toFixed(1) },
      { label: `Peak Day`, value: `${peak.date} (${peak.count})` },
    ];
  };

  // ─── Document ────────────────────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 40, bold: true, font: "Arial", color: "680000" },
          paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: "680000" },
          paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // ── Cover / Title Block ──────────────────────────────────────────
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 120 },
            children: [
              new TextRun({
                text: `${userType} Clinic Dashboard Report`,
                bold: true,
                size: 44,
                font: "Arial",
                color: "680000",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `Period: ${timeRangeLabel[timeRange] ?? timeRange}`,
                size: 24,
                color: "555555",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 },
            children: [
              new TextRun({
                text: `Generated: ${generatedAt}`,
                size: 20,
                color: "888888",
                font: "Arial",
                italics: true,
              }),
            ],
          }),

          // ── 1. Inventory Alerts ──────────────────────────────────────────
          sectionHeading("1. Inventory Alerts"),
          makeStatTable([
            {
              label: "Expired Items",
              value: stats.expiredCount,
              highlight: stats.expiredCount > 0,
            },
            {
              label: "Near Expiration (within 14 days)",
              value: stats.nearExpirationCount,
              highlight: stats.nearExpirationCount > 0,
            },
            {
              label: "Low Stock Items (below minimum threshold)",
              value: stats.lowStockCount,
              highlight: stats.lowStockCount > 0,
            },
          ]),
          spacer(),

          // ── 2. Appointments & Service Requests ──────────────────────────
          sectionHeading("2. Pending Appointments & Service Requests"),
          makeStatTable([
            {
              label: "Pending Appointments",
              value: stats.pendingAppointments,
              highlight: stats.pendingAppointments > 0,
            },
            ...(userType === "Medical"
              ? [
                  {
                    label: "Pending Medical Service Requests",
                    value: stats.pendingServiceRequests,
                    highlight: stats.pendingServiceRequests > 0,
                  },
                ]
              : []),
          ]),
          spacer(),

          // ── 3. Item Dispense Trend ───────────────────────────────────────
          sectionHeading("3. Item Dispense Trend"),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `Daily breakdown of item dispenses over the selected period.`,
                size: 20,
                color: "555555",
                font: "Arial",
              }),
            ],
          }),
          ...(dispenseData.length > 0
            ? [
                makeStatTable(trendSummary(dispenseData, "Dispenses")),
                spacer(),
                makeDataTable(
                  [
                    { label: "Date", width: 5760 },
                    { label: "Dispenses", width: 3600 },
                  ],
                  dispenseData.map((d) => [d.date, d.count]),
                ),
              ]
            : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "No dispense data for this period.",
                      color: "888888",
                      size: 20,
                      font: "Arial",
                    }),
                  ],
                }),
              ]),
          spacer(),

          // ── 4. Appointments / Queue Trend ───────────────────────────────
          sectionHeading("4. Appointments / Queue Trend"),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `Daily appointment and queue activity over the selected period.`,
                size: 20,
                color: "555555",
                font: "Arial",
              }),
            ],
          }),
          ...(appointmentData.length > 0
            ? [
                makeStatTable(trendSummary(appointmentData, "Appointments")),
                spacer(),
                makeDataTable(
                  [
                    { label: "Date", width: 5760 },
                    { label: "Appointments", width: 3600 },
                  ],
                  appointmentData.map((d) => [d.date, d.count]),
                ),
              ]
            : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "No appointment data for this period.",
                      color: "888888",
                      size: 20,
                      font: "Arial",
                    }),
                  ],
                }),
              ]),
          spacer(),

          // ── 5. Transaction History by Item ───────────────────────────────
          sectionHeading("5. Transaction History by Item"),
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `Units dispensed per item, sorted from most to least frequent.`,
                size: 20,
                color: "555555",
                font: "Arial",
              }),
            ],
          }),
          ...(categoryData.length > 0
            ? [
                makeDataTable(
                  [
                    { label: "Rank", width: 1200 },
                    { label: "Item Name", width: 6000 },
                    { label: "Units Dispensed", width: 2160 },
                  ],
                  categoryData.map((d, i) => [i + 1, d.category, d.count]),
                ),
              ]
            : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "No transaction data for this period.",
                      color: "888888",
                      size: 20,
                      font: "Arial",
                    }),
                  ],
                }),
              ]),
          spacer(),

          // ── 6. Most Common Symptoms (Medical only) ───────────────────────
          ...(userType !== "Dental"
            ? [
                sectionHeading("6. Most Common Symptoms"),
                new Paragraph({
                  spacing: { after: 160 },
                  children: [
                    new TextRun({
                      text: `Top complaints from walk-in records, ranked by frequency.`,
                      size: 20,
                      color: "555555",
                      font: "Arial",
                    }),
                  ],
                }),
                ...(symptomData.length > 0
                  ? [
                      makeDataTable(
                        [
                          { label: "Rank", width: 1200 },
                          { label: "Symptom / Complaint", width: 6000 },
                          { label: "No. of Patients", width: 2160 },
                        ],
                        symptomData.map((d, i) => [i + 1, d.symptom, d.count]),
                      ),
                    ]
                  : [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "No symptom data for this period.",
                            color: "888888",
                            size: 20,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ]),
                spacer(),
              ]
            : []),

          // ── Footer note ──────────────────────────────────────────────────
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 480 },
            border: {
              top: {
                style: BorderStyle.SINGLE,
                size: 4,
                color: "CCCCCC",
                space: 1,
              },
            },
            children: [
              new TextRun({
                text: `This report was automatically generated by the ${userType} Clinic Dashboard System on ${generatedAt}.`,
                size: 18,
                color: "AAAAAA",
                italics: true,
                font: "Arial",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = now.toISOString().split("T")[0];
  a.href = url;
  a.download = `${userType}_Dashboard_Report_${dateStr}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─── Dashboard Component ─────────────────────────────────────────────────────

const Dashboard = () => {
  const { userType } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    lowStockCount: 0,
    nearExpirationCount: 0,
    expiredCount: 0,
    pendingAppointments: 0,
    pendingServiceRequests: 0,
  });
  const [dispenseData, setDispenseData] = useState<ChartData[]>([]);
  const [appointmentData, setAppointmentData] = useState<AppointmentData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "180">("30");
  const [symptomData, setSymptomData] = useState<SymptomData[]>([]);
  const [symptomLoading, setSymptomLoading] = useState(true);
  const [reportGenerating, setReportGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setReportGenerating(true);
    try {
      await generateReport(
        userType as string,
        timeRange,
        stats,
        dispenseData,
        appointmentData,
        categoryData,
        symptomData,
      );
    } catch (err) {
      console.error("Failed to generate report:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setReportGenerating(false);
    }
  };

  // Fetch inventory items for alerts
  const fetchInventoryAlerts = useCallback(async () => {
    try {
      const [itemsResponse, appointmentsResponse, serviceRequestsResponse] =
        await Promise.all([
          apiClient.getItemList(),
          getAppointmentsByStatus("pending"),
          userType === "Medical"
            ? getMedicalServiceRequestsByStatus("pending")
            : Promise.resolve({ data: [], error: null }),
        ]);

      let lowStock = 0;
      let nearExpiration = 0;
      let expired = 0;

      if (!itemsResponse.error && itemsResponse.data) {
        const items = itemsResponse.data.filter(
          (item) => item.item_type === userType,
        );

        items.forEach((item) => {
          if (item.expiration_date) {
            const diffDays = calculateDaysDifference(item.expiration_date);
            if (diffDays < 0) expired++;
            else if (diffDays <= NEAR_EXPIRATION_DAYS) nearExpiration++;
          }

          const currentQuantity =
            item.min_thresh_type === "unit"
              ? parseInt(item.quantity_unit, 10)
              : parseInt(item.quantity_box, 10);

          if (currentQuantity <= item.min_threshold) lowStock++;
        });
      }

      const pendingAppointments = Array.isArray(appointmentsResponse.data)
        ? appointmentsResponse.data.filter((a) => a.service_type === userType)
            .length
        : 0;

      const pendingServiceRequests = Array.isArray(serviceRequestsResponse.data)
        ? serviceRequestsResponse.data.length
        : 0;

      setStats({
        lowStockCount: lowStock,
        nearExpirationCount: nearExpiration,
        expiredCount: expired,
        pendingAppointments,
        pendingServiceRequests,
      });
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
    }
  }, [userType]);

  useEffect(() => {
    fetchInventoryAlerts();
  }, [fetchInventoryAlerts]);
  useRefreshOnFocus(fetchInventoryAlerts);

  // Fetch appointment/queue data
  const fetchAppointmentData = useCallback(async () => {
    setAppointmentLoading(true);
    try {
      const daysToShow = Number(timeRange);
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - (daysToShow - 1));

      const serviceType: "Medical" | "Dental" | undefined =
        userType === "Medical" || userType === "Dental" ? userType : undefined;

      const history = await queueService.getQueueHistory(
        startDate.toISOString().split("T")[0],
        today.toISOString().split("T")[0],
        serviceType,
        undefined,
        1000,
      );

      interface QueueHistoryEntry {
        queue_date: string;
      }

      const dateMap = new Map<string, number>();
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dateMap.set(date.toISOString().split("T")[0], 0);
      }

      history.forEach((queue: QueueHistoryEntry) => {
        if (dateMap.has(queue.queue_date)) {
          dateMap.set(
            queue.queue_date,
            (dateMap.get(queue.queue_date) ?? 0) + 1,
          );
        }
      });

      const chartData: AppointmentData[] = [...dateMap.entries()].map(
        ([date, count]) => ({
          date: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          count,
        }),
      );

      setAppointmentData(chartData);
    } catch (error) {
      console.error("Error fetching appointment data:", error);
      setAppointmentData([]);
    } finally {
      setAppointmentLoading(false);
    }
  }, [userType, timeRange]);

  useEffect(() => {
    fetchAppointmentData();
  }, [fetchAppointmentData]);
  useRefreshOnFocus(fetchAppointmentData);

  // Fetch transaction data for dispense chart + category breakdown
  const fetchDispenseData = useCallback(async () => {
    setLoading(true);
    setCategoryLoading(true);
    try {
      const response = await apiClient.getTransactions(1, 1000);
      if (response.error || !response.data) {
        setDispenseData([]);
        setCategoryData([]);
        return;
      }

      const filtered = response.data.filter(
        (t: Transaction) => !userType || t.user_type === userType,
      );

      const dateMap = new Map<string, number>();
      const daysToShow = parseInt(timeRange);
      const today = new Date();

      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dateMap.set(dateStr, 0);
      }

      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - (daysToShow - 1));

      filtered.forEach((transaction: Transaction) => {
        const date = transaction.created_at.split("T")[0];
        if (dateMap.has(date)) dateMap.set(date, (dateMap.get(date) || 0) + 1);
      });

      const chartData = Array.from(dateMap.entries()).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count,
      }));

      setDispenseData(chartData);

      const categoryMap = new Map<string, number>();

      filtered.forEach((transaction: Transaction) => {
        const txDate = new Date(transaction.created_at);
        if (txDate < cutoffDate) return;

        if (transaction.transaction_items?.length) {
          transaction.transaction_items.forEach((item) => {
            const name = item.item?.name || "Unknown";
            categoryMap.set(
              name,
              (categoryMap.get(name) || 0) + (item.quantity || 1),
            );
          });
        }
      });

      const catData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      setCategoryData(catData);
    } catch (error) {
      console.error("Error fetching dispense data:", error);
      setDispenseData([]);
      setCategoryData([]);
    } finally {
      setLoading(false);
      setCategoryLoading(false);
    }
  }, [userType, timeRange]);

  useEffect(() => {
    fetchDispenseData();
  }, [fetchDispenseData]);
  useRefreshOnFocus(fetchDispenseData);

  // Fetch symptom data (Medical only)
  const fetchSymptomData = useCallback(async () => {
    if (userType === "Dental") {
      setSymptomData([]);
      setSymptomLoading(false);
      return;
    }
    setSymptomLoading(true);
    try {
      const daysToShow = parseInt(timeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (daysToShow - 1));
      cutoffDate.setHours(0, 0, 0, 0);

      const records = await medicalWalkinService.getAll();
      const symptomMap = new Map<string, number>();

      records.forEach((record) => {
        if (!record.date || new Date(record.date) < cutoffDate) return;
        if (Array.isArray(record.complaints_and_vital)) {
          record.complaints_and_vital.forEach((symptom: string) => {
            symptomMap.set(symptom, (symptomMap.get(symptom) || 0) + 1);
          });
        }
        if (record.complaints_other?.trim()) {
          symptomMap.set("Others", (symptomMap.get("Others") || 0) + 1);
        }
      });

      setSymptomData(
        Array.from(symptomMap.entries())
          .map(([symptom, count]) => ({ symptom, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      );
    } catch (error) {
      console.error("Error fetching symptom data:", error);
      setSymptomData([]);
    } finally {
      setSymptomLoading(false);
    }
  }, [userType, timeRange]);

  useEffect(() => {
    fetchSymptomData();
  }, [fetchSymptomData]);
  useRefreshOnFocus(fetchSymptomData);

  const isAnyLoading =
    loading || appointmentLoading || categoryLoading || symptomLoading;

  return (
    <MainTemplate>
      <div className="space-y-6">
        {/* Header row with Generate Report button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerateReport}
            disabled={reportGenerating || isAnyLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#680000] text-white rounded-lg hover:bg-[#560000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
          >
            {reportGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Expired Items Alert */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Expired Items
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.expiredCount}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Items that have passed expiration date
            </p>
          </div>

          {/* Near Expiration Alert */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Near Expiration
                </p>
                <p className="text-3xl font-bold text-orange-500 mt-2">
                  {stats.nearExpirationCount}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Items expiring within 14 days
            </p>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#680000]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-[#680000] mt-2">
                  {stats.lowStockCount}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <Package className="w-8 h-8 text-[#680000]" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Items below minimum threshold
            </p>
          </div>

          {/* Pending Appointments */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Appointments
                </p>
                <p className="text-3xl font-bold text-blue-500 mt-2">
                  {stats.pendingAppointments}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <ClipboardList className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Appointments awaiting confirmation
            </p>
          </div>

          {/* Pending Service Requests — Medical only */}
          {userType === "Medical" && (
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Service Requests
                  </p>
                  <p className="text-3xl font-bold text-purple-500 mt-2">
                    {stats.pendingServiceRequests}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Stethoscope className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Medical service requests awaiting approval
              </p>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Dispenses Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Item Dispenses
              </h2>
              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value as "7" | "30" | "90" | "180")
                }
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000] text-sm"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="180">Last 180 Days</option>
              </select>
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dispenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#680000"
                    strokeWidth={2}
                    name="Dispenses"
                    dot={{ fill: "#680000" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Appointments Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Appointments / Queue
              </h2>
              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value as "7" | "30" | "90" | "180")
                }
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000] text-sm"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="180">Last 180 Days</option>
              </select>
            </div>
            {appointmentLoading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1e40af"
                    strokeWidth={2}
                    name="Appointments"
                    dot={{ fill: "#1e40af" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Transaction History Graph */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <TrendingUp className="w-6 h-6 text-[#680000]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Transaction History by Item
                </h2>
                <p className="text-sm text-gray-500">
                  Units dispensed per category in the last{" "}
                  <span className="font-medium text-[#680000]">
                    {timeRange} days
                  </span>{" "}
                  .
                </p>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) =>
                setTimeRange(e.target.value as "7" | "30" | "90" | "180")
              }
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000] text-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 180 Days</option>
            </select>
          </div>

          {categoryLoading ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center gap-2">
              <Package className="w-12 h-12 text-gray-300" />
              <p className="text-gray-400 text-sm">
                No transaction data for this period
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 20, left: 0, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  angle={-35}
                  textAnchor="end"
                  height={90}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Units Dispensed",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: { fontSize: 12, fill: "#6b7280" },
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(104, 0, 0, 0.05)" }}
                  formatter={(value: number) => [value, "Units Dispensed"]}
                />
                <Bar
                  dataKey="count"
                  name="Units Dispensed"
                  radius={[4, 4, 0, 0]}
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {!categoryLoading && categoryData.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {categoryData.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{
                    backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                  }}
                >
                  <span>{item.category}</span>
                  <span className="bg-white bg-opacity-25 rounded-full px-1.5">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Common Symptoms — Medical only */}
        {userType !== "Dental" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-full p-2">
                  <Activity className="w-6 h-6 text-[#680000]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Most Common Symptoms
                  </h2>
                  <p className="text-sm text-gray-500">
                    Top complaints from walk-in records in the last{" "}
                    <span className="font-medium text-[#680000]">
                      {timeRange} days
                    </span>
                    .
                  </p>
                </div>
              </div>
              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value as "7" | "30" | "90" | "180")
                }
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000] text-sm"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="180">Last 180 Days</option>
              </select>
            </div>

            {symptomLoading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : symptomData.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center gap-2">
                <Activity className="w-12 h-12 text-gray-300" />
                <p className="text-gray-400 text-sm">
                  No symptom data for this period
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={symptomData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "No. of Patients",
                      position: "insideBottom",
                      offset: -2,
                      style: { fontSize: 12, fill: "#6b7280" },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="symptom"
                    tick={{ fontSize: 12 }}
                    width={135}
                  />
                  <Tooltip formatter={(value: number) => [value, "Patients"]} />
                  <Bar dataKey="count" name="Patients" radius={[0, 4, 4, 0]}>
                    {symptomData.map((_, index) => (
                      <Cell
                        key={`symptom-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {!symptomLoading && symptomData.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {symptomData.map((item, index) => (
                  <div
                    key={item.symptom}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{
                      backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                    }}
                  >
                    <span>{item.symptom}</span>
                    <span className="bg-white bg-opacity-25 rounded-full px-1.5">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => (window.location.href = "/inventory")}
              className="px-6 py-3 bg-[#680000] text-white rounded-lg hover:bg-[#560000] transition-colors"
            >
              View Inventory
            </button>
            <button
              onClick={() => (window.location.href = "/appointments/queue")}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Queue
            </button>
            <button
              onClick={() => (window.location.href = "/transaction-history")}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Transaction History
            </button>
          </div>
        </div>
      </div>
    </MainTemplate>
  );
};

export default Dashboard;
