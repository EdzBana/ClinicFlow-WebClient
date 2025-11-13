import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  color?: string;
  size?: "small" | "medium" | "large";
  fullscreen?: boolean; // 👈 optional flag to make it fullscreen
}

const LoadingSpinner = ({
  color = "#680000",
  size = "medium",
  fullscreen = true,
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`flex justify-center items-center ${
        fullscreen ? "fixed inset-0 z-50 bg-white/60" : "w-full h-full"
      }`}
    >
      <div
        className={`loading-spinner loading-spinner-${size}`}
        style={{ borderTopColor: color }}
      />
    </div>
  );
};

export default LoadingSpinner;
