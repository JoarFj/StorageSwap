import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Calendar, ShieldCheck } from "lucide-react";

export default function HostCTA() {
  const [spaceSize, setSpaceSize] = useState("medium");
  const [spaceType, setSpaceType] = useState("basement");
  const [location, setLocation] = useState("");
  const [earnings, setEarnings] = useState({ min: 150, max: 250 });

  const calculateEarnings = () => {
    // In a real app, this would make an API call based on inputs
    // For now, we'll use some basic logic
    const baseEarnings = {
      small: { min: 70, max: 120 },
      medium: { min: 150, max: 250 },
      large: { min: 250, max: 400 },
      xlarge: { min: 400, max: 600 },
    };
    
    const typeMultiplier = {
      basement: 1.0,
      garage: 1.1,
      attic: 0.9,
      room: 1.2,
      shed: 0.8,
    };
    
    const base = baseEarnings[spaceSize as keyof typeof baseEarnings];
    const multiplier = typeMultiplier[spaceType as keyof typeof typeMultiplier];
    
    setEarnings({
      min: Math.round(base.min * multiplier),
      max: Math.round(base.max * multiplier),
    });
  };

  return (
    <section className="py-16 bg-primary-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1464082354059-27db6ce50048?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-sans font-bold text-white mb-4">Earn money from your unused space</h2>
            <p className="text-primary-100 text-lg mb-6">Turn your empty basement, garage, or spare room into a passive income stream. Hosts on StoreShare earn an average of $200-$500 per month.</p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Wallet className="text-primary-500 h-5 w-5" />
                </div>
                <span className="ml-3 text-white">Set your own prices</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-primary-500 h-5 w-5" />
                </div>
                <span className="ml-3 text-white">Choose your availability</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="text-primary-500 h-5 w-5" />
                </div>
                <span className="ml-3 text-white">$1M host protection</span>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/create-listing">
                <a>
                  Become a Host
                </a>
              </Link>
            </Button>
          </div>
          <div className="md:w-2/5">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-sans font-medium text-xl text-gray-800 mb-4">How much could you earn?</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="space-size" className="block text-sm font-medium text-gray-700 mb-1">Space Size</label>
                  <Select value={spaceSize} onValueChange={(value) => {
                    setSpaceSize(value);
                    calculateEarnings();
                  }}>
                    <SelectTrigger id="space-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (25-50 sq ft)</SelectItem>
                      <SelectItem value="medium">Medium (50-100 sq ft)</SelectItem>
                      <SelectItem value="large">Large (100-200 sq ft)</SelectItem>
                      <SelectItem value="xlarge">Extra Large (200+ sq ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="space-type-calc" className="block text-sm font-medium text-gray-700 mb-1">Space Type</label>
                  <Select value={spaceType} onValueChange={(value) => {
                    setSpaceType(value);
                    calculateEarnings();
                  }}>
                    <SelectTrigger id="space-type-calc">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basement">Basement</SelectItem>
                      <SelectItem value="garage">Garage</SelectItem>
                      <SelectItem value="attic">Attic</SelectItem>
                      <SelectItem value="room">Spare Room</SelectItem>
                      <SelectItem value="shed">Shed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="location-calc" className="block text-sm font-medium text-gray-700 mb-1">Your Location</label>
                  <Input
                    id="location-calc"
                    placeholder="Enter your zip code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={calculateEarnings}
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md mb-5">
                <p className="text-gray-700 text-sm mb-2">Estimated monthly earnings:</p>
                <p className="font-sans font-bold text-2xl text-primary-600">${earnings.min} - ${earnings.max}</p>
                <p className="text-gray-500 text-xs">Estimates based on similar listings in your area</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/create-listing">
                  <a>
                    List Your Space
                  </a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
