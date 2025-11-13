import React, { useState, useRef } from "react";
import { X, Upload, File, Trash2 } from "lucide-react";
import { apiClient, type PatientProfile } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface FileWithPreview {
  file: File;
  id: string;
  description: string;
}

interface AddRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onSuccess?: () => void;
}

const AddRecordsModal: React.FC<AddRecordsModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ pull both user + userType from your updated AuthContext
  const { user, userType } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: FileWithPreview[] = files.map((file) => ({
      file,
      id: crypto.randomUUID(),
      description: "",
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDescriptionChange = (fileId: string, description: string) => {
    setSelectedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, description } : f))
    );
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (!user || !userType) throw new Error("Missing user info or type");

      const uploadData = {
        patientId: patient.id,
        patientName: `${patient.last_name}_${patient.first_name}`,
        userId: user.id,
        userType,
        files: selectedFiles.map((f) => ({
          file: f.file,
          description: f.description || f.file.name,
        })),
      };

      const response = await apiClient.uploadPatientRecords(
        uploadData,
        (progress) => setUploadProgress(progress)
      );

      if (response.error) throw new Error(response.error);
      if (!response.data?.records.length)
        throw new Error("No records uploaded");

      setSelectedFiles([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload files for {patient.last_name}, {patient.first_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to select files or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: PDF, DOC, DOCX, JPG, PNG, etc.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Selected Files ({selectedFiles.length})
              </h3>
              {selectedFiles.map((fileWithPreview) => (
                <div
                  key={fileWithPreview.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <File className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileWithPreview.file.name}
                      </p>
                      <button
                        onClick={() => handleRemoveFile(fileWithPreview.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        disabled={isUploading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {formatFileSize(fileWithPreview.file.size)}
                    </p>
                    <input
                      type="text"
                      placeholder="Add description (optional)"
                      value={fileWithPreview.description}
                      onChange={(e) =>
                        handleDescriptionChange(
                          fileWithPreview.id,
                          e.target.value
                        )
                      }
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={isUploading}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-900 rounded-md hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading
              ? "Uploading..."
              : `Upload ${selectedFiles.length} File${
                  selectedFiles.length !== 1 ? "s" : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecordsModal;
