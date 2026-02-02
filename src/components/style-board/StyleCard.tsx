import { cn } from "@/shared/utils/cn";
import { IconEdit, IconTrash, IconFileText } from "@tabler/icons-react";
import { CustomButton } from "@/components/ui/custom-button";
import { useState } from "react";
import { StyleSample } from "@/shared/types/database.types";

interface StyleCardProps {
  style: StyleSample;
  onEdit: (style: StyleSample) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function StyleCard({ style, onEdit, onDelete, index }: StyleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-6 relative group/feature dark:border-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-all duration-200 hover:shadow-lg",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover effect overlay */}
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none rounded-lg" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none rounded-lg" />
      )}

      {/* Icon */}
      <div className="mb-4 relative z-10 px-6 text-neutral-600 dark:text-neutral-400">
        <IconFileText className="w-6 h-6" />
      </div>

      {/* Title */}
      <div className="text-lg font-bold mb-2 relative z-10 px-6">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {style.platform}
        </span>
      </div>

      {/* Content preview */}
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-6 mb-4 line-clamp-3">
        {style.raw_text}
      </p>

      {/* Action buttons */}
      <div className="relative z-10 px-6 mt-auto flex gap-2 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-200">
        <CustomButton
          variant="outline"
          size="sm"
          onClick={() => onEdit(style)}
          className="flex items-center gap-2"
        >
          <IconEdit className="w-4 h-4" />
          Edit
        </CustomButton>
        <CustomButton
          variant="destructive"
          size="sm"
          onClick={() => onDelete(style.id)}
          className="flex items-center gap-2"
        >
          <IconTrash className="w-4 h-4" />
          Delete
        </CustomButton>
      </div>

      {/* Platform badge */}
      <div className="absolute top-4 right-4">
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
          {style.platform}
        </span>
      </div>
    </div>
  );
}
