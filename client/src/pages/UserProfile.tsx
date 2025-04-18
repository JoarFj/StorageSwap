import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, Listing, Booking, Review } from "@shared/schema";
import { Helmet } from "react-helmet";
import { formatDistanceToNow, formatPrice } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserCircle, MessageSquare, Star, Home, Clock, CheckCircle } from "lucide-react";

import ListingCard from "@/components/listings/ListingCard";

export default function UserProfile() {
  const [, params] = useRoute("/profile/:id");
  const userId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState("listings");

  // Fetch user profile data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  // Fetch user listings if they're a host
  const { data: listings, isLoading: isLoadingListings } = useQuery<Listing[]>({
    queryKey: [`/api/users/${userId}/listings`],
    enabled: !!user?.isHost,
  });

  // Fetch user bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: [`/api/bookings/renter/${userId}`],
  });

  // Fetch reviews about this user
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/reviews/user/${userId}`],
  });

  if (isLoadingUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className="rounded-full bg-gray-200 h-24 w-24 mr-6"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="mt-8 h-4 bg-gray-200 rounded w-full max-w-md"></div>
          <div className="mt-2 h-4 bg-gray-200 rounded w-full max-w-sm"></div>
          <div className="mt-6">
            <div className="h-10 bg-gray-200 rounded w-full max-w-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>
                Return to Home
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
        <title>{user.fullName} - StoreShare Profile</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
          <Avatar className="h-24 w-24 mb-4 md:mb-0 md:mr-6">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback>{user.fullName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.fullName}</h1>
                <p className="text-gray-600">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex gap-3">
                <Link href={`/messages/${userId}`}>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </Link>
              </div>
            </div>
            
            {user.bio && (
              <p className="mt-4 text-gray-700">{user.bio}</p>
            )}
            
            <div className="mt-6 flex flex-wrap gap-2">
              {user.isHost && (
                <Badge variant="secondary">Host</Badge>
              )}
              {reviews && reviews.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                  <span>
                    {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                    {' '}({reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            {user.isHost && (
              <TabsTrigger value="listings">Listings</TabsTrigger>
            )}
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          {user.isHost && (
            <TabsContent value="listings">
              <h2 className="text-2xl font-bold mb-6">Storage Spaces</h2>
              
              {isLoadingListings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
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
                <Card>
                  <CardContent className="flex flex-col items-center py-12">
                    <Home className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Listings Yet</h3>
                    <p className="text-gray-600 text-center mb-6">
                      {userId === 1 
                        ? "You haven't created any listings yet." 
                        : "This user hasn't created any listings yet."}
                    </p>
                    {userId === 1 && (
                      <Link href="/create-listing">
                        <Button>
                          Create a Listing
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="bookings">
            <h2 className="text-2xl font-bold mb-6">Bookings</h2>
            
            {isLoadingBookings ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-32 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Badge 
                              variant={
                                booking.status === "confirmed" ? "default" :
                                booking.status === "pending" ? "outline" :
                                booking.status === "cancelled" ? "destructive" :
                                "secondary"
                              }
                              className="mr-2"
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Booking #{booking.id}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-1">
                            <Link href={`/listings/${booking.listingId}`}>
                              Listing #{booking.listingId}
                            </Link>
                          </h3>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {new Date(booking.startDate).toLocaleDateString()} -
                                {booking.endDate ? ` ${new Date(booking.endDate).toLocaleDateString()}` : " Ongoing"}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span>
                                Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <span className="font-semibold">
                              {formatPrice(booking.totalPrice)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              (includes {formatPrice(booking.platformFee)} platform fee)
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                  <p className="text-gray-600 text-center mb-6">
                    {userId === 1 
                      ? "You haven't made any bookings yet." 
                      : "This user hasn't made any bookings yet."}
                  </p>
                  {userId === 1 && (
                    <Link href="/search">
                      <Button>
                        Find Storage Space
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="reviews">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            
            {isLoadingReviews ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
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
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {review.reviewerId.toString().substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Reviewer #{review.reviewerId}</div>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.createdAt))}
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
                    
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                    
                    {review.listingId && (
                      <div className="mt-3">
                        <Link href={`/listings/${review.listingId}`}>
                          <Button variant="link" className="px-0 h-auto font-normal text-primary-500">
                            View Listing
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600 text-center">
                    {userId === 1 
                      ? "You don't have any reviews yet." 
                      : "This user doesn't have any reviews yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
