import MainTemplate from "@/components/MainTemplate";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const InventoryManagementMain = () => {
  const navigate = useNavigate();

  const handleViewItem = () => {
    navigate("/inventory-management/view-item");
  };

  const handleAddItem = () => {
    navigate("/inventory-management/add-item");
  };

  const handleTransactionHistory = () => {
    navigate("/inventory-management/transaction-history");
  };

  const handleViewTool = () => {
    navigate("/tools-management");
  };

  return (
    <MainTemplate>
      <div className="flex items-center justify-center pt-40">
        <div className="grid grid-cols-2 gap-10 max-w-4xl">
          <Button
            style={{ backgroundColor: "#680000", color: "white" }}
            className="w-90 h-45 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            onClick={handleViewItem}
          >
            View Item
          </Button>
          <Button
            style={{ backgroundColor: "#680000", color: "white" }}
            className="w-90 h-45 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            onClick={handleViewTool}
          >
            Tools Management
          </Button>
          <Button
            style={{ backgroundColor: "#680000", color: "white" }}
            className="w-90 h-45 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            onClick={handleAddItem}
          >
            Add Item
          </Button>
          <Button
            style={{ backgroundColor: "#680000", color: "white" }}
            className="w-90 h-45 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            onClick={handleTransactionHistory}
          >
            Transaction History
          </Button>
        </div>
      </div>
    </MainTemplate>
  );
};

export default InventoryManagementMain;
