import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, spaceTypeNames } from "@/lib/utils";
import { Helmet } from "react-helmet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Listing, Review, User } from "@shared/schema";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Map } from "@/components/ui/map";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Star,
  MessageSquare,
  Clock,
  Shield, 
  Home,
  DoorOpen,
  Ruler
} from "lucide-react";

export default function ListingDetail() {
  const [, params] = useRoute("/listings/:id");
  const listingId = params?.id ? parseInt(params.id) : 0;
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bookingMonths, setBookingMonths] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch listing details
  const { data: listing, isLoading: isLoadingListing } = useQuery<Listing>({
    queryKey: [`/api/listings/${listingId}`],
  });

  // Fetch listing reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/reviews/listing/${listingId}`],
  });

  // Fetch host information
  const { data: host, isLoading: isLoadingHost } = useQuery<User>({
    queryKey: [`/api/users/${listing?.hostId}`],
    enabled: !!listing,
  });

  useEffect(() => {
    if (selectedDates.length === 2) {
      // Calculate the number of months between the selected dates
      const startDate = selectedDates[0];
      const endDate = selectedDates[1];
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
      setBookingMonths(months > 0 ? months : 1);
    }
  }, [selectedDates]);

  const handleBooking = async () => {
    if (!listing || selectedDates.length !== 2) return;

    const startDate = selectedDates[0];
    const endDate = selectedDates[1];
    const totalPrice = listing.pricePerMonth * bookingMonths;
    const platformFee = Math.round(totalPrice * 0.15); // 15% platform fee

    try {
      await apiRequest('POST', '/api/bookings', {
        listingId: listing.id,
        renterId: 2, // In a real app, this would be the logged-in user
        startDate,
        endDate,
        totalPrice,
        platformFee,
        status: 'pending',
        paymentStatus: 'pending'
      });

      toast({
        title: "Booking Request Sent!",
        description: "The host will review your request soon."
      });
      
      setIsBookingModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "There was an error processing your booking request."
      });
    }
  };

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (isLoadingListing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded w-full mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-6"></div>
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-6"></div>
            </div>
            <div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
            <Link href="/search">
              <Button>
                Browse Other Listings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{listing.title} - StoreShare</title>
        <meta name="description" content={listing.description.substring(0, 160)} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{listing.city}, {listing.state}</span>
            </div>
            {reviews && reviews.length > 0 && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
              </div>
            )}
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span>{spaceTypeNames[listing.spaceType as keyof typeof spaceTypeNames]}</span>
            </div>
          </div>
        </div>

        {/* Image carousel */}
        <div className="mb-8">
          <Carousel className="w-full">
            <CarouselContent>
              {listing.images.map((image, index) => (
                <CarouselItem key={index}>
                  <AspectRatio ratio={16/9}>
                    <img
                      src={image}
                      alt={`${listing.title} - image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </AspectRatio>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Listing details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">About this space</h2>
                  <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.features && listing.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-2 rounded-full mr-3">
                      <DoorOpen className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Access Type</h4>
                      <p className="text-gray-600">{listing.accessType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-2 rounded-full mr-3">
                      <Ruler className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Space Size</h4>
                      <p className="text-gray-600">{listing.size} sq ft</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-2 rounded-full mr-3">
                      <Clock className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Available From</h4>
                      <p className="text-gray-600">{new Date(listing.availableFrom).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-2 rounded-full mr-3">
                      <Shield className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Storage Protection</h4>
                      <p className="text-gray-600">$10,000 protection guarantee</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Access Instructions</h3>
                  <p className="text-gray-700">{listing.accessInstructions}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="location">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Location</h3>
                    <p className="text-gray-700">
                      {listing.address}, {listing.city}, {listing.state} {listing.zipCode}
                    </p>
                  </div>
                  
                  <div className="h-96 rounded-lg overflow-hidden border">
                    <Map
                      center={[listing.latitude, listing.longitude]}
                      zoom={15}
                      markers={[{
                        id: listing.id,
                        lat: listing.latitude,
                        lng: listing.longitude,
                        popup: listing.title
                      }]}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {reviews && reviews.length > 0
                      ? `${reviews.length} Reviews`
                      : "No Reviews Yet"}
                  </h3>
                  
                  {isLoadingReviews ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex space-x-4">
                          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
                          <div className="flex items-center mb-2">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback>
                                {review.reviewerId.toString().substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">Reviewer #{review.reviewerId}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      <p>This listing doesn't have any reviews yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking card */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">
                    {formatPrice(listing.pricePerMonth)}
                    <span className="text-gray-500 text-base font-normal">/month</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Book Storage
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book Your Storage Space</DialogTitle>
                      <DialogDescription>
                        Select your storage dates and review the details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Calendar
                        mode="range"
                        selected={selectedDates}
                        onSelect={(range) => range && setSelectedDates(range)}
                        numberOfMonths={2}
                        disabled={{ before: new Date() }}
                        className="rounded-md border"
                      />
                      {selectedDates.length === 2 && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-md space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {formatPrice(listing.pricePerMonth)} × {bookingMonths} month{bookingMonths !== 1 ? 's' : ''}
                              </span>
                              <span>{formatPrice(listing.pricePerMonth * bookingMonths)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Platform fee (15%)</span>
                              <span>{formatPrice(Math.round(listing.pricePerMonth * bookingMonths * 0.15))}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                              <span>Total</span>
                              <span>{formatPrice(Math.round(listing.pricePerMonth * bookingMonths * 1.15))}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button disabled={selectedDates.length !== 2} onClick={handleBooking}>
                        Confirm Booking
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Link href={`/messages/${listing.hostId}`}>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Host
                  </Button>
                </Link>

                {host && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={host.avatar} alt={host.fullName} />
                        <AvatarFallback>{host.fullName.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">Hosted by {host.fullName}</h3>
                        <p className="text-sm text-gray-600">
                          Joined {new Date(host.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {host.bio && (
                      <p className="text-gray-700 text-sm mt-2">{host.bio}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
