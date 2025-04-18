import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search, Filter } from "lucide-react";
import { spaceTypeNames } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface ListingFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: {
    location?: string;
    spaceType?: string;
    minPrice?: number;
    maxPrice?: number;
    minSize?: number;
    maxSize?: number;
  };
}

export default function ListingFilters({ onFilterChange, initialFilters = {} }: ListingFiltersProps) {
  const [location, setLocation] = useState(initialFilters.location || "");
  const [spaceType, setSpaceType] = useState(initialFilters.spaceType || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPrice || 0,
    initialFilters.maxPrice || 500,
  ]);
  const [sizeRange, setSizeRange] = useState<[number, number]>([
    initialFilters.minSize || 0,
    initialFilters.maxSize || 500,
  ]);

  // Apply filters when any filter value changes
  useEffect(() => {
    const filters = {
      location,
      spaceType: spaceType && spaceType !== "any" ? spaceType : undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
      minSize: sizeRange[0] > 0 ? sizeRange[0] : undefined,
      maxSize: sizeRange[1] < 500 ? sizeRange[1] : undefined,
    };
    onFilterChange(filters);
  }, [location, spaceType, priceRange, sizeRange, onFilterChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter is already applied through the useEffect
  };

  return (
    <div className="w-full">
      {/* Desktop filters */}
      <div className="hidden md:block bg-white shadow-sm rounded-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="location"
                placeholder="City, zip code, address"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="space-type">Space Type</Label>
            <Select
              value={spaceType}
              onValueChange={setSpaceType}
            >
              <SelectTrigger id="space-type" className="mt-1">
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                {Object.entries(spaceTypeNames).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between">
              <Label>Price Range ($/month)</Label>
              <span className="text-sm text-gray-500">
                ${priceRange[0]} - ${priceRange[1]}
              </span>
            </div>
            <Slider
              className="mt-2"
              min={0}
              max={500}
              step={10}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={(value) => setPriceRange([value[0], value[1]])}
            />
          </div>

          <div>
            <div className="flex justify-between">
              <Label>Size Range (sq ft)</Label>
              <span className="text-sm text-gray-500">
                {sizeRange[0]} - {sizeRange[1]}
              </span>
            </div>
            <Slider
              className="mt-2"
              min={0}
              max={500}
              step={10}
              value={[sizeRange[0], sizeRange[1]]}
              onValueChange={(value) => setSizeRange([value[0], value[1]])}
            />
          </div>

          <Button type="submit" className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </form>
      </div>

      {/* Mobile filters */}
      <div className="md:hidden sticky top-16 z-30 bg-white shadow-sm rounded-b-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Location"
              className="pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-xl h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Customize your search to find the perfect storage space
                </SheetDescription>
              </SheetHeader>
              <form className="space-y-5 mt-4">
                <div>
                  <Label htmlFor="mobile-space-type">Space Type</Label>
                  <Select
                    value={spaceType}
                    onValueChange={setSpaceType}
                  >
                    <SelectTrigger id="mobile-space-type" className="mt-1">
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      {Object.entries(spaceTypeNames).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Price Range ($/month)</Label>
                    <span className="text-sm text-gray-500">
                      ${priceRange[0]} - ${priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    className="mt-2"
                    min={0}
                    max={500}
                    step={10}
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Size Range (sq ft)</Label>
                    <span className="text-sm text-gray-500">
                      {sizeRange[0]} - {sizeRange[1]}
                    </span>
                  </div>
                  <Slider
                    className="mt-2"
                    min={0}
                    max={500}
                    step={10}
                    value={[sizeRange[0], sizeRange[1]]}
                    onValueChange={(value) => setSizeRange([value[0], value[1]])}
                  />
                </div>
                
                <SheetClose asChild>
                  <Button className="w-full mt-6">Apply Filters</Button>
                </SheetClose>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
