import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertListingSchema } from "../../../../shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { spaceTypeNames } from "@/lib/utils";
import { Map } from "@/components/ui/map";
import { useGeolocation } from "@/hooks/useGeolocation";

// Extend the schema for frontend validation
const createListingSchema = insertListingSchema
  .extend({
    // Convert price from dollars to cents for storage
    pricePerMonthDollars: z.string()
      .refine(val => !isNaN(Number(val)) && Number(val) > 0, { 
        message: "Price must be a valid number greater than 0" 
      }),
    sizeSqFt: z.string()
      .refine(val => !isNaN(Number(val)) && Number(val) > 0, { 
        message: "Size must be a valid number greater than 0" 
      }),
    // Mock implementation for image uploads in this MVP
    imageUrls: z.string().url().array().min(1, { 
      message: "At least one image URL is required" 
    }),
    featuresInput: z.string(),
  })
  .omit({ 
    id: true, 
    createdAt: true, 
    pricePerMonth: true, 
    size: true,
    features: true,
    images: true
  });

type CreateListingFormValues = z.infer<typeof createListingSchema>;

export default function ListingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const { position, error: geoError } = useGeolocation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [mapZoom, setMapZoom] = useState(13);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Update map when geolocation is available
  if (position && !markerPosition) {
    const { latitude, longitude } = position.coords;
    setMapCenter([latitude, longitude]);
    setMarkerPosition([latitude, longitude]);
  }

  const form = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      spaceType: "basement",
      pricePerMonthDollars: "",
      sizeSqFt: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      latitude: position?.coords.latitude || 40.7128,
      longitude: position?.coords.longitude || -74.0060,
      accessInstructions: "",
      accessType: "24/7",
      availableFrom: new Date(),
      imageUrls: [
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      ],
      featuresInput: "Clean & Dry, Good Lighting, Security Camera",
      hostId: 1, // In a real app, this would come from the authenticated user
    },
  });

  async function onSubmit(values: CreateListingFormValues) {
    try {
      // Convert form values to API format
      const listingData = {
        ...values,
        pricePerMonth: Math.round(Number(values.pricePerMonthDollars) * 100),
        size: Number(values.sizeSqFt),
        images: values.imageUrls,
        features: values.featuresInput.split(',').map(f => f.trim()).filter(f => f !== ""),
      };
      
      // Remove form-specific fields
      const { 
        pricePerMonthDollars, 
        sizeSqFt, 
        imageUrls, 
        featuresInput, 
        ...apiData 
      } = listingData;
      
      const res = await apiRequest('POST', '/api/listings', apiData);
      const newListing = await res.json();
      
      // Invalidate and refetch listings cache
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      
      toast({
        title: "Success!",
        description: "Your storage space has been listed.",
      });
      
      // Redirect to the new listing page
      setLocation(`/listings/${newListing.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create listing. Please try again.",
      });
    }
  }

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setMarkerPosition([lat, lng]);
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const step1Fields = ["title", "description", "spaceType", "pricePerMonthDollars", "sizeSqFt"];
      const step1Valid = step1Fields.every(field => form.getFieldState(field as any).invalid === false);
      
      if (!step1Valid) {
        form.trigger(step1Fields as any);
        return;
      }
    } else if (currentStep === 2) {
      const step2Fields = ["address", "city", "state", "zipCode", "country"];
      const step2Valid = step2Fields.every(field => form.getFieldState(field as any).invalid === false);
      
      if (!step2Valid) {
        form.trigger(step2Fields as any);
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {currentStep === 1 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Spacious Basement Storage" {...field} />
                      </FormControl>
                      <FormDescription>
                        Create a catchy title that describes your space
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your space in detail..." 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include information about cleanliness, access, security, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="spaceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Space Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a space type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(spaceTypeNames).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pricePerMonthDollars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Month ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sizeSqFt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (sq ft)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="featuresInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features</FormLabel>
                      <FormControl>
                        <Input placeholder="Clean & Dry, Good Lighting, Security Camera" {...field} />
                      </FormControl>
                      <FormDescription>
                        Separate features with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select access type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="24/7">24/7 Access</SelectItem>
                            <SelectItem value="scheduled">By Appointment Only</SelectItem>
                            <SelectItem value="limited">Limited Hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accessInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Instructions</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Use side door, keypad code will be provided" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {currentStep === 2 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Location</h2>
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Pin Location on Map</FormLabel>
                  <FormDescription>
                    Click on the map to set your exact location or adjust the pin
                  </FormDescription>
                  <div className="h-80 mt-2 rounded-md overflow-hidden border">
                    <Map 
                      center={mapCenter}
                      zoom={mapZoom}
                      onClick={handleMapClick}
                      markers={markerPosition ? [{ id: 1, lat: markerPosition[0], lng: markerPosition[1] }] : []}
                    />
                  </div>
                  {geoError && (
                    <p className="text-sm text-red-500 mt-1">
                      Error getting location: {geoError.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {currentStep === 3 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Upload Photos</h2>
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="imageUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URLs</FormLabel>
                      <FormDescription>
                        In a real app, this would be a file upload. For this demo, please provide image URLs.
                      </FormDescription>
                      <div className="space-y-2">
                        {field.value.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={url}
                              onChange={(e) => {
                                const newUrls = [...field.value];
                                newUrls[index] = e.target.value;
                                field.onChange(newUrls);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const newUrls = field.value.filter((_, i) => i !== index);
                                field.onChange(newUrls);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            field.onChange([...field.value, ""]);
                          }}
                        >
                          Add Image URL
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Preview</FormLabel>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.watch("imageUrls").map((url, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                        {url ? (
                          <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            No image URL provided
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit">
              List Your Space
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
