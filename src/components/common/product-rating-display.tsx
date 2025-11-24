import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProductReviews } from "@/service/review";
import { cn } from "@/lib/utils";

interface ProductRatingDisplayProps {
  productId: number;
  fallbackRating?: number;
  size?: "sm" | "md" | "lg";
  showReviewsCount?: boolean;
  className?: string;
}

export function ProductRatingDisplay({
  productId,
  fallbackRating = 0,
  size = "md",
  showReviewsCount = false,
  className,
}: ProductRatingDisplayProps) {
  // Fetch review data
  const { data: reviewData } = useQuery({
    queryKey: ["PRODUCT_REVIEWS", productId],
    queryFn: () => getProductReviews(productId),
    enabled: !!productId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const averageRating = reviewData?.averageRating || fallbackRating || 0;
  const totalReviews = reviewData?.totalReviews || 0;

  const sizeClasses = {
    sm: { star: "w-3 h-3", text: "text-xs" },
    md: { star: "w-4 h-4", text: "text-base" },
    lg: { star: "w-5 h-5", text: "text-lg" },
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className={cn("font-semibold text-foreground", sizeClass.text)}>
        {averageRating.toFixed(1)}
      </span>
      <Star
        className={cn(
          "fill-yellow-500 text-yellow-500",
          sizeClass.star
        )}
      />
      {showReviewsCount && totalReviews > 0 && (
        <span className={cn("text-muted-foreground", sizeClass.text)}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
}

