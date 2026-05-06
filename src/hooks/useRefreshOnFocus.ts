import { useEffect } from "react";

const useRefreshOnFocus = (refetch: () => void) => {
  useEffect(() => {
    // Re-fetch when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetch();
      }
    };

    // Re-fetch when window regains focus
    const handleFocus = () => refetch();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch]);
};

export default useRefreshOnFocus;
