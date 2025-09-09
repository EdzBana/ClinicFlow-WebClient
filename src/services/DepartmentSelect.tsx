import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type {
  UseFormRegister,
  FieldValues,
  Path,
  UseFormSetValue,
} from "react-hook-form";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  name: Path<T>; // Field for department ID
  valueName: Path<T>; // Field for department object { name, code }
  error?: string;
}

const DepartmentSelect = <T extends FieldValues>({
  register,
  setValue,
  name,
  valueName,
  error,
}: Props<T>) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setApiError(null);
        const { data, error } = await supabase.functions.invoke("departments");

        if (error) {
          setApiError(error.message);
        } else {
          setDepartments(data?.departments || []);
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDept = departments.find((dept) => dept.id === e.target.value);

    if (selectedDept) {
      // Safely set the object field
      setValue(valueName, {
        name: selectedDept.name,
        code: selectedDept.code,
      } as T[typeof valueName]); // Explicitly cast to the expected type
    }

    // Let RHF handle the select value change for the ID field
    register(name).onChange(e);
  };

  return (
    <div>
      <select
        {...register(name, { required: "Please select a department" })}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
        disabled={loading}
        onChange={handleChange}
      >
        <option value="">
          {loading
            ? "Loading departments..."
            : apiError
            ? "Error loading departments"
            : departments.length === 0
            ? "No departments available"
            : "--- Select Department ---"}
        </option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      {apiError && (
        <p className="text-red-600 text-xs mt-1">API Error: {apiError}</p>
      )}
    </div>
  );
};

export default DepartmentSelect;
