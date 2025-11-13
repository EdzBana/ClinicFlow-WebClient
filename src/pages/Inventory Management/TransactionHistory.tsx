import { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import { apiClient } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

interface TransactionItem {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    category: string;
  };
}

interface Transaction {
  id: string;
  user_type: string;
  method: string;
  created_by: string;
  created_at: string;
  transaction_items: TransactionItem[];
}

const TransactionHistory = () => {
  const { userType } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      const result = await apiClient.getTransactions(page, 10);
      console.log("Fetched transactions:", result);

      if (result.error) {
        setError(result.error);
        setTransactions([]);
        setTotal(0);
      } else {
        // Filter by user type
        const filtered = (result.data || []).filter(
          (t: Transaction) => t.user_type === userType
        );

        setTransactions(filtered);
        setTotal(result.total);
      }

      setLoading(false);
    };

    fetchTransactions();
  }, [page, userType]);

  const hasNextPage = page * 10 < total;

  return (
    <MainTemplate initialPage="Transaction History">
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

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4">Transaction History</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">No transactions found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-2 border">ID</th>
                    <th className="px-4 py-2 border">Method</th>
                    <th className="px-4 py-2 border">Created By</th>
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border font-mono text-xs">
                        {trx.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2 border capitalize">
                        {trx.method}
                      </td>
                      <td className="px-4 py-2 border font-mono text-xs">
                        {trx.created_by.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2 border">
                        {new Date(trx.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border">
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {trx.transaction_items.map((ti) => (
                            <li key={ti.id}>
                              {ti.item.name} ({ti.quantity})
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} • {transactions.length} of {total} total
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNextPage}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </MainTemplate>
  );
};

export default TransactionHistory;
