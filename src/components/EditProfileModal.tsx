import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import DepartmentSelect from "../services/DepartmentSelect";
import Modal from "./Modal";
import type { PatientProfile } from "@/services/api";

interface FormValues {
  lastName: string;
  firstName: string;
  middleInitial?: string;
  suffix?: string;
  idNumber: string;
  departmentId: string;
  department: {
    name: string;
    code: string;
  } | null;
  homeAddress?: string;
  officeAddress?: string;
  contactNo?: string;
  designation?: string;
  occupation?: string;
  gender?: string;
  maritalStatus?: string;
  weight?: string;
  height?: string;
  birthdate?: string;
  age?: string;
  emergencyPerson?: string;
  emergencyContact?: string;
}

interface EditProfileModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  profile: PatientProfile | null;
  onProfileUpdated?: () => void;
}

export default function EditProfileModal({
  modalOpen,
  setModalOpen,
  profile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      department: null,
    },
  });

  const selectedDepartment = watch("department");

  // Populate form when profile changes
  useEffect(() => {
    if (profile && modalOpen) {
      setValue("lastName", profile.last_name);
      setValue("firstName", profile.first_name);
      setValue("middleInitial", profile.middle_initial || "");
      setValue("suffix", profile.suffix || "");
      setValue("idNumber", profile.id_number);

      if (profile.dept_name && profile.dept_code) {
        setValue("department", {
          name: profile.dept_name,
          code: profile.dept_code,
        });
      }

      // Set additional fields if they exist
      setValue("homeAddress", profile.home_address || "");
      setValue("officeAddress", profile.office_address || "");
      setValue("contactNo", profile.contact_no || "");
      setValue("designation", profile.designation || "");
      setValue("occupation", profile.occupation || "");
      setValue("gender", profile.gender || "");
      setValue("maritalStatus", profile.marital_status || "");
      setValue("weight", profile.weight || "");
      setValue("height", profile.height || "");
      setValue("birthdate", profile.birthdate || "");
      setValue("age", profile.age || "");
      setValue("emergencyPerson", profile.emergency_person || "");
      setValue("emergencyContact", profile.emergency_contact || "");
    }
  }, [profile, modalOpen, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!profile) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (!data.department) {
        throw new Error("Please select a department.");
      }

      const payload = {
        action: "update",
        id: profile.id,
        last_name: data.lastName,
        first_name: data.firstName,
        middle_initial: data.middleInitial || null,
        suffix: data.suffix || null,
        id_number: data.idNumber,
        dept_name: data.department.name,
        dept_code: data.department.code,
        home_address: data.homeAddress || null,
        office_address: data.officeAddress || null,
        contact_no: data.contactNo || null,
        designation: data.designation || null,
        occupation: data.occupation || null,
        gender: data.gender || null,
        marital_status: data.maritalStatus || null,
        weight: data.weight || null,
        height: data.height || null,
        birthdate: data.birthdate || null,
        age: data.age || null,
        emergency_person: data.emergencyPerson || null,
        emergency_contact: data.emergencyContact || null,
      };

      console.log("Updating profile:", payload);

      const { data: result, error } = await supabase.functions.invoke(
        "patient-profiles",
        { body: payload }
      );

      if (error) throw error;

      setModalOpen(false);
      onProfileUpdated?.();
      console.log("Profile updated:", result);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    name: keyof Omit<FormValues, "department" | "departmentId">,
    errorMsg?: string,
    required: boolean = false,
    type: string = "text"
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        {...register(
          name,
          required ? { required: `${label} is required` } : {}
        )}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2
                   focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
      />
      {errorMsg && <p className="text-red-600 text-xs mt-1">{errorMsg}</p>}
    </div>
  );

  if (!profile) return null;

  return (
    <Modal>
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {submitError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    "Last Name",
                    "lastName",
                    errors.lastName?.message,
                    true
                  )}
                  {renderInput(
                    "First Name",
                    "firstName",
                    errors.firstName?.message,
                    true
                  )}
                  {renderInput(
                    "Middle Initial",
                    "middleInitial",
                    errors.middleInitial?.message
                  )}
                  {renderInput("Suffix", "suffix", errors.suffix?.message)}
                  {renderInput(
                    "ID Number",
                    "idNumber",
                    errors.idNumber?.message,
                    true
                  )}

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Department <span className="text-red-600">*</span>
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
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    "Home Address",
                    "homeAddress",
                    errors.homeAddress?.message
                  )}
                  {renderInput(
                    "Office Address",
                    "officeAddress",
                    errors.officeAddress?.message
                  )}
                  {renderInput(
                    "Contact Number",
                    "contactNo",
                    errors.contactNo?.message
                  )}
                </div>
              </div>

              {/* Emergency Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Emergency Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    "Emergency Contact Person",
                    "emergencyPerson",
                    errors.emergencyPerson?.message
                  )}
                  {renderInput(
                    "Emergency Contact Number",
                    "emergencyContact",
                    errors.emergencyContact?.message,
                    false,
                    "tel"
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(
                    "Designation",
                    "designation",
                    errors.designation?.message
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Occupation
                    </label>
                    <select
                      {...register("occupation")}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2
               focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      <option value="">Select Occupation</option>
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      {...register("gender")}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2
                                 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Marital Status
                    </label>
                    <select
                      {...register("maritalStatus")}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2
                                 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  {renderInput(
                    "Birthdate",
                    "birthdate",
                    errors.birthdate?.message,
                    false,
                    "date"
                  )}
                  {renderInput("Age", "age", errors.age?.message)}
                  {renderInput("Weight (kg)", "weight", errors.weight?.message)}
                  {renderInput("Height (cm)", "height", errors.height?.message)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
