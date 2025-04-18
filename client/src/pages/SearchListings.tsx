import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "@shared/schema";
import { Helmet } from "react-helmet";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "@/components/ui/map";
import { Grid, List, MapPin } from "lucide-react";

import ListingCard from "@/components/listings/ListingCard";
import ListingFilters from "@/components/listings/ListingFilters";

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  popup: string;
}

export default function SearchListings() {
  const [location] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    new URLSearchParams(window.location.search)
  );
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    spaceType: searchParams.get("spaceType") || "",
    minPrice: searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined,
    minSize: searchParams.get("minSize") ? parseInt(searchParams.get("minSize")!) : undefined,
    maxSize: searchParams.get("maxSize") ? parseInt(searchParams.get("maxSize")!) : undefined,
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  // Update search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.location) params.set("location", filters.location);
    if (filters.spaceType) params.set("spaceType", filters.spaceType);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.minSize) params.set("minSize", filters.minSize.toString());
    if (filters.maxSize) params.set("maxSize", filters.maxSize.toString());
    
    setSearchParams(params);
    
    // Optionally update the URL without causing a navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [filters]);

  // Generate API query string from filters
  const queryString = searchParams.toString();

  // Fetch listings based on filters
  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: [`/api/listings${queryString ? `?${queryString}` : ""}`],
  });

  // Create markers for map view
  const markers: MapMarker[] = listings
    ? listings.map(listing => ({
        id: listing.id,
        lat: listing.latitude,
        lng: listing.longitude,
        popup: `${listing.title} - $${(listing.pricePerMonth / 100).toFixed(0)}/month`
      }))
    : [];

  // Center map on first listing if available
  useEffect(() => {
    if (listings && listings.length > 0 && viewMode === "map") {
      setMapCenter([listings[0].latitude, listings[0].longitude]);
    }
  }, [listings, viewMode]);

  // Handle marker click
  const handleMarkerClick = (id: number) => {
    setSelectedListingId(id);
    const listing = listings?.find(l => l.id === id);
    if (listing) {
      setMapCenter([listing.latitude, listing.longitude]);
    }
  };

  return (
    <>
      <Helmet>
        <title>Find Storage Space - StoreShare</title>
        <meta name="description" content="Search for affordable storage spaces in your area. Filter by location, type, price, and more." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar - desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              <ListingFilters onFilterChange={setFilters} initialFilters={filters} />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Mobile filters */}
            <div className="md:hidden mb-4">
              <ListingFilters onFilterChange={setFilters} initialFilters={filters} />
            </div>

            {/* Results header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  `${listings?.length || 0} Storage Spaces ${
                    filters.location ? `in ${filters.location}` : ""
                  }`
                )}
              </h1>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Map</span>
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Results content */}
            {viewMode === "grid" ? (
              <div>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
                      </div>
                    ))}
                  </div>
                ) : listings && listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No storage spaces found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your filters or searching for a different location.</p>
                    <Button onClick={() => setFilters({
                      location: "",
                      spaceType: "",
                      minPrice: undefined,
                      maxPrice: undefined,
                      minSize: undefined,
                      maxSize: undefined,
                    })}>
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
                <div className="md:col-span-2 h-[600px] rounded-lg overflow-hidden border">
                  {isLoading ? (
                    <div className="h-full bg-gray-200 animate-pulse"></div>
                  ) : (
                    <Map
                      center={mapCenter}
                      zoom={mapZoom}
                      markers={markers}
                      onMarkerClick={handleMarkerClick}
                    />
                  )}
                </div>
                <div className="space-y-4 overflow-auto max-h-[600px] pr-2">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : listings && listings.length > 0 ? (
                    listings.map(listing => (
                      <div
                        key={listing.id}
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-shadow ${
                          selectedListingId === listing.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
                        }`}
                        onClick={() => handleMarkerClick(listing.id)}
                      >
                        <div className="flex h-32">
                          <div className="w-1/3">
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="w-2/3 p-3">
                            <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
                            <p className="text-xs text-gray-600 mb-1">{listing.city}, {listing.state}</p>
                            <p className="text-sm font-semibold">${(listing.pricePerMonth / 100).toFixed(0)}/month</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {listing.features && listing.features.slice(0, 2).map((feature, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                  {feature}
                                </span>
                              ))}
                              {listing.features && listing.features.length > 2 && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                  +{listing.features.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">No storage spaces found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your filters or searching for a different location.</p>
                      <Button size="sm" onClick={() => setFilters({
                        location: "",
                        spaceType: "",
                        minPrice: undefined,
                        maxPrice: undefined,
                        minSize: undefined,
                        maxSize: undefined,
                      })}>
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
