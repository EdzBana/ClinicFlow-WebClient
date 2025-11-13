import { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import {
  apiClient,
  type InventoryItemList,
  type ItemCategory,
  type CreateTransactionRequest,
} from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/SearchBar";

interface CartItem {
  item: InventoryItemList;
  quantity: number;
}

const StockControl = () => {
  const { user, userType } = useAuth();
  const [items, setItems] = useState<InventoryItemList[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, categoriesRes] = await Promise.all([
        apiClient.getItemList(),
        apiClient.getCategories(),
      ]);
      setItems(
        (itemsRes.data || []).filter(
          (item, index, self) =>
            index === self.findIndex((i) => i.id === item.id)
        )
      );

      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setMessage({ type: "error", text: "Failed to load stock data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddToCart = (item: InventoryItemList) => {
    const existing = cart.find((ci) => ci.item.id === item.id);
    if (existing) {
      setCart(
        cart.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    setMessage({ type: "", text: "" });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter((ci) => ci.item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart(
      cart.map((ci) =>
        ci.item.id === itemId ? { ...ci, quantity: newQuantity } : ci
      )
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setProcessing(true);
    setMessage({ type: "", text: "" });

    try {
      const payload: CreateTransactionRequest = {
        user_type: userType ?? "unknown",
        method: "dispense",
        created_by: user?.id ?? "unknown",
        items: cart.map((ci) => ({
          item_id: ci.item.id,
          quantity: ci.quantity,
        })),
      };

      const response = await apiClient.createTransaction(payload);
      if (response.error) throw new Error(response.error);

      setMessage({
        type: "success",
        text: response.data?.message ?? "Transaction recorded",
      });
      setCart([]);
      await fetchData();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setMessage({
        type: "error",
        text: err?.message || "Failed to record transaction",
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredItems = items.filter((i) => {
    const matchesCategory =
      selectedCategory === "all" || i.category === selectedCategory;

    const matchesSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.generic_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesUserType = i.item_type === userType;

    return matchesCategory && matchesSearch && matchesUserType;
  });

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <MainTemplate initialPage="Stock Control">
      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search by name or generic name..."
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Stock Items</h2>

            {message.text && (
              <Alert
                variant={message.type === "error" ? "destructive" : "default"}
                className="mb-4"
              >
                <AlertTitle>
                  {message.type === "error" ? "Error" : "Success"}
                </AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {/* Category Tabs */}
            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="mb-4"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.name}>
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 cursor-pointer bg-[#680000] hover:shadow-md"
                  onClick={() => handleAddToCart(item)}
                >
                  <h3 className="font-medium text-white">{item.name}</h3>
                  <p className="text-gray-300 text-sm">
                    {item.generic_name || "—"}
                  </p>
                  <p className="text-green-400 text-xs mt-1">
                    Click to add to dispense list
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dispense Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-medium mb-4">Dispense List</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No items selected. Click on an item to add.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-gray-200">
                  {cart.map((ci) => (
                    <li key={ci.item.id} className="py-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{ci.item.name}</span>
                        <button
                          onClick={() => handleRemoveFromCart(ci.item.id)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(ci.item.id, ci.quantity - 1)
                            }
                            className="bg-gray-200 px-2 py-1 rounded"
                          >
                            -
                          </button>
                          <span className="mx-2">{ci.quantity}</span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(ci.item.id, ci.quantity + 1)
                            }
                            className="bg-gray-200 px-2 py-1 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={handleCheckout}
                    disabled={processing || cart.length === 0}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {processing ? "Processing..." : "Complete Dispense"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainTemplate>
  );
};

export default StockControl;
