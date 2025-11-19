import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomOut,
} from "lucide-react";
import {
  medicalHistoryService,
  physicalExamService,
} from "@/services/physicalExamService";
import { storageService } from "@/services/storageService";
import type {
  MedicalHistory,
  PhysicalExamRecord,
} from "@/types/physicalExamTypes";
import EditMedicalHistoryModal from "./EditMedicalHistoryModal";
import AddPhysicalExamModal from "./AddPhysicalExamModal";

interface PhysicalRecordTabProps {
  patientId: string;
}

interface LabImage {
  url: string;
  label: string;
  labType: string;
}

// Image Viewer Modal Component
const ImageViewerModal = ({
  images,
  initialIndex,
  isOpen,
  onClose,
}: {
  images: LabImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentImage.labType}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft" && hasMultipleImages) handlePrevious();
    if (e.key === "ArrowRight" && hasMultipleImages) handleNext();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex flex-col"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black bg-opacity-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {currentImage.labType.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">{currentImage.label}</h3>
            {hasMultipleImages && (
              <p className="text-gray-400 text-sm">
                {currentIndex + 1} / {images.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm px-2">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Previous Button */}
        {hasMultipleImages && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 z-10 p-3 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 rounded-full text-white transition-all"
            title="Previous (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image Container */}
        <div
          className="flex items-center justify-center w-full h-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage.url}
            alt={currentImage.label}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>

        {/* Next Button */}
        {hasMultipleImages && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 z-10 p-3 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 rounded-full text-white transition-all"
            title="Next (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip (if multiple images) */}
      {hasMultipleImages && (
        <div className="bg-black bg-opacity-50 px-4 py-3">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-white scale-110"
                    : "border-gray-600 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Thumbnail Component
const LabImageThumbnail = ({
  imageUrl,
  label,
  onOpenViewer,
}: {
  imageUrl: string;
  label: string;
  onOpenViewer: () => void;
}) => {
  return (
    <button
      onClick={onOpenViewer}
      className="relative w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden hover:border-red-900 transition-all group"
    >
      <img
        src={imageUrl}
        alt={`${label} result`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
        <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 px-2 truncate">
        {label}
      </div>
    </button>
  );
};

const PhysicalRecordTab = ({ patientId }: PhysicalRecordTabProps) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(
    null
  );
  const [examRecords, setExamRecords] = useState<PhysicalExamRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<LabImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // New state for signed URLs
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const fetchMedicalHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await medicalHistoryService.getByPatientId(patientId);
      setMedicalHistory(data);
    } catch (err) {
      console.error("Error fetching medical history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchExamRecords = async () => {
    setIsLoadingExams(true);
    try {
      const data = await physicalExamService.getByPatientId(patientId);
      setExamRecords(data);

      // Collect all image paths
      const allImagePaths: string[] = [];
      data.forEach((record) => {
        if (record.cbc_image_url) allImagePaths.push(record.cbc_image_url);
        if (record.chest_xray_image_url)
          allImagePaths.push(record.chest_xray_image_url);
        if (record.urinalysis_image_url)
          allImagePaths.push(record.urinalysis_image_url);
        if (record.fecalysis_image_url)
          allImagePaths.push(record.fecalysis_image_url);
        if (record.ecg_image_url) allImagePaths.push(record.ecg_image_url);
        if (record.hbsag_image_url) allImagePaths.push(record.hbsag_image_url);
        if (record.others_lab_image_url)
          allImagePaths.push(record.others_lab_image_url);
      });

      // Fetch signed URLs for all images at once
      if (allImagePaths.length > 0) {
        const urls = await storageService.getSignedUrls(allImagePaths);
        setSignedUrls(urls);
      }
    } catch (err) {
      console.error("Error fetching exam records:", err);
    } finally {
      setIsLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
    fetchExamRecords();
  }, [patientId]);

  const getCheckedConditions = () => {
    if (!medicalHistory) return [];
    const conditions = [
      { key: "allergy", label: "Allergy" },
      { key: "asthma", label: "Asthma" },
      { key: "chicken_pox", label: "Chicken Pox" },
      { key: "bone_problem", label: "Bone Problem" },
      { key: "diabetes", label: "Diabetes" },
      { key: "kidney_disease", label: "Kidney Disease" },
      { key: "lung_disease", label: "Lung Disease" },
      { key: "vision_problem", label: "Vision Problem" },
      { key: "emotional_episode", label: "Emotional Episode" },
      { key: "cancer", label: "Cancer" },
      { key: "chest_pain", label: "Chest Pain" },
      { key: "anemia", label: "Anemia" },
      { key: "convulsion", label: "Convulsion" },
      { key: "dengue", label: "Dengue" },
      { key: "epilepsy", label: "Epilepsy" },
      { key: "loss_of_consciousness", label: "Loss of Consciousness" },
      { key: "skin_disease", label: "Skin Disease" },
      { key: "liver_disease", label: "Liver Disease" },
      { key: "hypertension", label: "Hypertension" },
    ];

    return conditions.filter((c) => (medicalHistory as any)[c.key]);
  };

  const getRecordImages = (record: PhysicalExamRecord): LabImage[] => {
    const images: LabImage[] = [];

    if (record.cbc_image_url) {
      images.push({
        url: signedUrls[record.cbc_image_url] || "",
        label: "CBC",
        labType: "cbc",
      });
    }
    if (record.chest_xray_image_url) {
      images.push({
        url: signedUrls[record.chest_xray_image_url] || "",
        label: "Chest X-Ray",
        labType: "chest_xray",
      });
    }
    if (record.urinalysis_image_url) {
      images.push({
        url: signedUrls[record.urinalysis_image_url] || "",
        label: "Urinalysis",
        labType: "urinalysis",
      });
    }
    if (record.fecalysis_image_url) {
      images.push({
        url: signedUrls[record.fecalysis_image_url] || "",
        label: "Fecalysis",
        labType: "fecalysis",
      });
    }
    if (record.ecg_image_url) {
      images.push({
        url: signedUrls[record.ecg_image_url] || "",
        label: "ECG",
        labType: "ecg",
      });
    }
    if (record.hbsag_image_url) {
      images.push({
        url: signedUrls[record.hbsag_image_url] || "",
        label: "HBsAg",
        labType: "hbsag",
      });
    }
    if (record.others_lab_image_url) {
      images.push({
        url: signedUrls[record.others_lab_image_url] || "",
        label: "Others",
        labType: "others_lab",
      });
    }

    return images.filter((img) => img.url); // Filter out any with empty URLs
  };

  const openImageViewer = (images: LabImage[], index: number) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setViewerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Medical History Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Medical History
          </h3>
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>{medicalHistory ? "Edit" : "Add"} History</span>
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading medical history...</p>
          </div>
        ) : medicalHistory ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-2">
              {getCheckedConditions().map((condition) => (
                <div key={condition.key} className="text-sm text-gray-900">
                  ✓ {condition.label}
                </div>
              ))}
            </div>
            {medicalHistory.others && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">Others:</p>
                <p className="text-sm text-gray-900">{medicalHistory.others}</p>
              </div>
            )}
            {getCheckedConditions().length === 0 && !medicalHistory.others && (
              <p className="text-sm text-gray-500 italic">
                No conditions recorded
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500 italic">No medical history recorded</p>
            <button
              onClick={() => setHistoryModalOpen(true)}
              className="mt-3 text-red-900 hover:text-red-800 font-medium text-sm"
            >
              Add Medical History
            </button>
          </div>
        )}
      </div>

      {/* Physical Examination Records Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Physical Examination Records ({examRecords.length})
          </h3>
          <button
            onClick={() => setExamModalOpen(true)}
            className="px-4 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>

        {isLoadingExams ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading examination records...</p>
          </div>
        ) : examRecords.length > 0 ? (
          <div className="space-y-4">
            {examRecords.map((record) => {
              const recordImages = getRecordImages(record);

              return (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {record.purpose && (
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {record.purpose}
                        </h4>
                      )}
                      <p className="text-sm text-gray-600">
                        {record.exam_date
                          ? new Date(record.exam_date).toLocaleDateString()
                          : "No date"}{" "}
                        {record.control_number &&
                          `• Control #${record.control_number}`}
                      </p>
                    </div>
                  </div>

                  {/* Vitals */}
                  {(record.bp || record.pr || record.rr || record.temp) && (
                    <div className="grid grid-cols-4 gap-4 mb-3 bg-gray-50 p-3 rounded">
                      {record.bp && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            BP:
                          </span>
                          <p className="text-sm text-gray-900">{record.bp}</p>
                        </div>
                      )}
                      {record.pr && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            PR:
                          </span>
                          <p className="text-sm text-gray-900">{record.pr}</p>
                        </div>
                      )}
                      {record.rr && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            RR:
                          </span>
                          <p className="text-sm text-gray-900">{record.rr}</p>
                        </div>
                      )}
                      {record.temp && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            Temp:
                          </span>
                          <p className="text-sm text-gray-900">
                            {record.temp}°
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lab Results */}
                  <div className="space-y-1 text-sm">
                    {(record.cbc_normal || record.cbc_abnormal) && (
                      <p className="text-gray-700">
                        <span className="font-medium">CBC:</span>{" "}
                        {record.cbc_normal ? "Normal" : "Abnormal"}
                      </p>
                    )}
                    {(record.chest_xray_normal ||
                      record.chest_xray_abnormal) && (
                      <p className="text-gray-700">
                        <span className="font-medium">Chest X-Ray:</span>{" "}
                        {record.chest_xray_normal ? "Normal" : "Abnormal"}
                      </p>
                    )}
                    {(record.urinalysis_normal ||
                      record.urinalysis_abnormal) && (
                      <p className="text-gray-700">
                        <span className="font-medium">Urinalysis:</span>{" "}
                        {record.urinalysis_normal ? "Normal" : "Abnormal"}
                      </p>
                    )}
                    {(record.fecalysis_normal || record.fecalysis_abnormal) && (
                      <p className="text-gray-700">
                        <span className="font-medium">Fecalysis:</span>{" "}
                        {record.fecalysis_normal ? "Normal" : "Abnormal"}
                      </p>
                    )}
                    {(record.ecg_normal || record.ecg_abnormal) && (
                      <p className="text-gray-700">
                        <span className="font-medium">ECG:</span>{" "}
                        {record.ecg_normal ? "Normal" : "Abnormal"}
                      </p>
                    )}
                    {(record.hbsag_reactive || record.hbsag_nonreactive) && (
                      <p className="text-gray-700">
                        <span className="font-medium">HBsAg:</span>{" "}
                        {record.hbsag_reactive ? "Reactive" : "Nonreactive"}
                      </p>
                    )}
                    {record.others_lab && (
                      <p className="text-gray-700">
                        <span className="font-medium">Others:</span>{" "}
                        {record.others_lab}
                      </p>
                    )}
                  </div>

                  {/* Image Attachments */}
                  {recordImages.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Attachments ({recordImages.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recordImages.map((image, index) => (
                          <LabImageThumbnail
                            key={index}
                            imageUrl={image.url}
                            label={image.label}
                            onOpenViewer={() =>
                              openImageViewer(recordImages, index)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes and Remarks */}
                  {record.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Notes:
                      </p>
                      <p className="text-sm text-gray-700">{record.notes}</p>
                    </div>
                  )}
                  {record.remarks && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Remarks:
                      </p>
                      <p className="text-sm text-gray-700">{record.remarks}</p>
                    </div>
                  )}

                  {/* Evaluated By */}
                  {record.evaluated_by && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Evaluated by:{" "}
                        <span className="font-medium">
                          {record.evaluated_by}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-400 italic">
              No physical examination records found.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditMedicalHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        patientId={patientId}
        existingHistory={medicalHistory}
        onSuccess={fetchMedicalHistory}
      />
      <AddPhysicalExamModal
        isOpen={examModalOpen}
        onClose={() => setExamModalOpen(false)}
        patientId={patientId}
        onSuccess={fetchExamRecords}
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        images={selectedImages}
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default PhysicalRecordTab;
