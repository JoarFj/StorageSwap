import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Star } from "lucide-react";
import { Listing } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { id, title, city, state, pricePerMonth, images, features } = listing;
  
  // In a real app, these would be computed from actual reviews
  const rating = 4.8;
  const reviewCount = 24;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <AspectRatio ratio={16/9}>
        <img 
          src={images[0]} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </AspectRatio>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-sans font-medium text-lg text-gray-800">{title}</h3>
            <p className="text-gray-600 text-sm">{city}, {state}</p>
          </div>
          <div className="flex items-center">
            <Star className="text-amber-500 mr-1 h-4 w-4 fill-amber-500" />
            <span className="font-medium">{rating}</span>
            <span className="text-gray-500 text-sm ml-1">({reviewCount})</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {features && features.map((feature, index) => (
            <Badge key={index} variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
              {feature}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="font-sans font-medium text-lg text-gray-800">
            {formatPrice(pricePerMonth)}
            <span className="text-sm font-normal text-gray-500">/month</span>
          </span>
          <Button asChild size="sm">
            <Link href={`/listings/${id}`}>
              <a>View Details</a>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
