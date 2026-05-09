import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { buildImageUrl } from "../../utils/imageUrl";

interface Avatar {
  name: string;
  url: string;
}

interface AvatarPickerProps {
  value?: string;
  onChange: (url: string) => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ value, onChange }) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await api.get("/meta/avatars");
        setAvatars(response.data.data);
      } catch (error) {
        console.error("Failed to fetch avatars", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  if (loading) {
    return <div className="py-4 text-center">Loading avatars...</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-4 p-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
      {avatars.map((avatar) => (
        <button
          key={avatar.name}
          type="button"
          onClick={() => onChange(avatar.url)}
          className={`relative overflow-hidden rounded-full border-2 transition-all hover:scale-105 ${
            value === avatar.url
              ? "border-brand-500 ring-2 ring-brand-500/20"
              : "border-transparent hover:border-gray-300"
          }`}
        >
          <img
            src={buildImageUrl(avatar.url)}
            alt={avatar.name}
            className="h-full w-full object-cover"
          />
          {value === avatar.url && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-500/10">
              <div className="rounded-full bg-brand-500 p-0.5 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default AvatarPicker;
