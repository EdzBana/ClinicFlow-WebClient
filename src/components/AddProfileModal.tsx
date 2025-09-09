import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import DepartmentSelect from "../services/DepartmentSelect";
import Modal from "./Modal";

interface FormValues {
  lastName: string;
  firstName: string;
  idNumber: string;
  departmentId: string;
  department: {
    name: string;
    code: string;
  } | null;
}

export default function AddProfileModal({
  modalOpen,
  setModalOpen,
  onProfileAdded,
}: {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  onProfileAdded?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      department: null,
    },
  });

  const selectedDepartment = watch("department");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (!data.department) {
        throw new Error("Please select a department.");
      }

      const payload = {
        last_name: data.lastName,
        first_name: data.firstName,
        id_number: data.idNumber,
        dept_name: data.department.name,
        dept_code: data.department.code,
      };

      console.log("Submitting payload:", payload);

      const { data: result, error } = await supabase.functions.invoke(
        "patient-profiles",
        { body: payload }
      );

      if (error) throw error;

      reset();
      setModalOpen(false);
      onProfileAdded?.();
      console.log("Profile added:", result);
    } catch (err: any) {
      console.error("Error creating profile:", err);
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    name: keyof Omit<FormValues, "department">,
    errorMsg?: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        {...register(name, { required: `${label} is required` })}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2
                   focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
      />
      {errorMsg && <p className="text-red-600 text-xs mt-1">{errorMsg}</p>}
    </div>
  );

  return (
    <Modal>
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Add New Profile</h2>

            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {submitError}
              </div>
            )}

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {renderInput("Last Name", "lastName", errors.lastName?.message)}
              {renderInput(
                "First Name",
                "firstName",
                errors.firstName?.message
              )}
              {renderInput("ID Number", "idNumber", errors.idNumber?.message)}

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <DepartmentSelect
                  register={register}
                  setValue={setValue}
                  name="departmentId"
                  valueName="department"
                  error={
                    !selectedDepartment && errors.department
                      ? "Department is required"
                      : undefined
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="col-span-2 flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
