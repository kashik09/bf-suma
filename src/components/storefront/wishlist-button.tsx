"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface WishlistButtonProps {
  slug: string;
  className?: string;
}

export function WishlistButton({ slug, className }: WishlistButtonProps) {
  const { toggle, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const wishlisted = isWishlisted(slug);

  const label = wishlisted ? "Remove from wishlist" : "Add to wishlist";

  return (
    <button
      aria-label={label}
      aria-pressed={wishlisted}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-1.5 transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        className
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        const next = toggle(slug);
        toast({
          title: next ? "Added to wishlist" : "Removed",
          description: next ? "Product saved for later." : "Product removed from wishlist.",
          variant: "info"
        });
      }}
      type="button"
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600"
        )}
      />
    </button>
  );
}
