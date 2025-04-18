import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";

export default function HeroSection() {
  const [location, setLocation] = useState("");
  const [spaceType, setSpaceType] = useState("");
  const [, setLocation2] = useLocation();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (spaceType && spaceType !== "any") params.set("spaceType", spaceType);
    
    setLocation2(`/search?${params.toString()}`);
  };

  return (
    <section className="relative bg-primary-600 overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 relative z-10">
        <div className="max-w-2xl">
          <h1 className="font-sans font-bold text-3xl md:text-5xl text-white leading-tight mb-4">
            Rent storage space from people in your community
          </h1>
          <p className="text-primary-100 text-lg md:text-xl mb-8">
            StoreShare connects people with extra space to those who need a place to store their belongings
          </p>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="text-gray-400 h-5 w-5" />
                  </div>
                  <Input 
                    id="location" 
                    placeholder="City, zip code" 
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="space-type" className="block text-sm font-medium text-gray-700 mb-1">Space Type</label>
                <Select value={spaceType} onValueChange={setSpaceType}>
                  <SelectTrigger id="space-type">
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="basement">Basement</SelectItem>
                    <SelectItem value="garage">Garage</SelectItem>
                    <SelectItem value="shed">Shed</SelectItem>
                    <SelectItem value="attic">Attic</SelectItem>
                    <SelectItem value="room">Spare Room</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                <Button 
                  onClick={handleSearch}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Find Storage
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
