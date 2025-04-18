import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Star } from "lucide-react";
import { Listing } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import ListingCard from "@/components/listings/ListingCard";

export default function FeaturedListings() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);

  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/listings'],
  });

  // Select the first 3 listings as featured
  useEffect(() => {
    if (listings && Array.isArray(listings)) {
      setFeaturedListings(listings.slice(0, 3));
    }
  }, [listings]);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-sans font-bold text-gray-800">Featured Storage Spaces</h2>
          <Link href="/search">
            <a className="text-primary-500 hover:text-primary-600 font-medium flex items-center">
              View all listings
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-6 w-48 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
