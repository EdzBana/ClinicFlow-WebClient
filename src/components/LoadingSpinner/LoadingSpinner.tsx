import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  color?: string;
  size?: "small" | "medium" | "large";
}

const LoadingSpinner = ({
  color = "#680000",
  size = "medium",
}: LoadingSpinnerProps) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`loading-spinner loading-spinner-${size}`}
        style={{ borderTopColor: color }}
      />
    </div>
  );
};

export default LoadingSpinner;
