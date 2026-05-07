import { Link } from "react-router";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info"; // Alert type
  title: string; // Title of the alert
  message: string; // Message of the alert
  showLink?: boolean; // Whether to show the "Learn More" link
  linkHref?: string; // Link URL
  linkText?: string; // Link text
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
}) => {
  // Tailwind classes for each variant matching TailAdmin screenshots
  const variantClasses = {
    success: {
      container:
        "border-[#12B76A] bg-[#12B76A]/[0.05] dark:bg-[#12B76A]/[0.08]",
      icon: "text-[#12B76A]",
      title: "text-[#12B76A]",
    },
    error: {
      container:
        "border-[#F04438] bg-[#F04438]/[0.05] dark:bg-[#F04438]/[0.08]",
      icon: "text-[#F04438]",
      title: "text-[#F04438]",
    },
    warning: {
      container:
        "border-[#F79009] bg-[#F79009]/[0.05] dark:bg-[#F79009]/[0.08]",
      icon: "text-[#F79009]",
      title: "text-[#F79009]",
    },
    info: {
      container:
        "border-[#465FFF] bg-[#465FFF]/[0.05] dark:bg-[#465FFF]/[0.08]",
      icon: "text-[#465FFF]",
      title: "text-[#465FFF]",
    },
  };

  // Icon for each variant
  const icons = {
    success: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11.003 16L6.76 11.757L8.174 10.343L11.003 13.172L15.833 8.343L17.247 9.757L11.003 16Z"
          fill="currentColor"
        />
      </svg>
    ),
    error: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"
          fill="currentColor"
        />
      </svg>
    ),
    warning: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"
          fill="currentColor"
        />
      </svg>
    ),
    info: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 11H13V17H11V11ZM11 7H13V9H11V7Z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 ${variantClasses[variant].container}`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 ${variantClasses[variant].icon}`}>
          {icons[variant]}
        </div>

        <div className="w-full">
          <h4 className={`mb-1 text-base font-bold ${variantClasses[variant].title}`}>
            {title}
          </h4>

          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {message}
          </p>

          {showLink && (
            <Link
              to={linkHref}
              className={`inline-block mt-3 text-sm font-medium underline opacity-80 hover:opacity-100 ${variantClasses[variant].title}`}
            >
              {linkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;
