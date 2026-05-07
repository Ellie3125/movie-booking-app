interface ChartTabProps {
  selected: "Monthly" | "Quarterly" | "Annually";
  onChange: (period: "Monthly" | "Quarterly" | "Annually") => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ selected, onChange }) => {
  const getButtonClass = (option: "Monthly" | "Quarterly" | "Annually") =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => onChange("Monthly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "Monthly"
        )}`}
      >
        Tháng
      </button>

      <button
        onClick={() => onChange("Quarterly")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "Quarterly"
        )}`}
      >
        Quý
      </button>

      <button
        onClick={() => onChange("Annually")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "Annually"
        )}`}
      >
        Năm
      </button>
    </div>
  );
};

export default ChartTab;
