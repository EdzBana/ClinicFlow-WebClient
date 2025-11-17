import MainTemplate from "@/components/MainTemplate";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { apiClient, type InventoryItemList } from "@/services/api";
import RecordSearch from "@/components/RecordSearch";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

const SearchBar = RecordSearch;

const ViewItem = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();

  const handleItemClick = useCallback(
    (item: InventoryItemList) => {
      navigate(`/inventory-management/view-item/${item.id}`);
    },
    [navigate]
  );

  const searchItems = (query: string) =>
    apiClient.searchItems(query, 10, userType ?? undefined);

  return (
    <MainTemplate>
      <div className="flex justify-start mb-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center px-4 py-2 text-white bg-[#680000] rounded-lg shadow hover:bg-red-900 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Inventory Management
        </button>
      </div>
      <div className="flex justify-center items-start mb-8">
        <SearchBar<InventoryItemList>
          placeholder="Enter Item Name"
          searchFunction={searchItems}
          onSelect={handleItemClick}
          getKey={(item) => item.id}
          renderItem={(item) => (
            <>
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-600">
                {item.category} • {item.item_type}
              </div>
            </>
          )}
        />
      </div>

      <div className="flex justify-center align-items-center mt-60">
        <i>
          <h1 className="text-gray-400 text-3xl">Nothing Searched Yet</h1>
        </i>
      </div>
    </MainTemplate>
  );
};

export default ViewItem;
