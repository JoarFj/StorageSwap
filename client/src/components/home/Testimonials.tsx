import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah K.",
    role: "Renter in Brooklyn",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    rating: 5,
    content: "StoreShare helped me find affordable storage when I was between apartments. The basement I rented was clean, secure, and half the price of commercial storage units."
  },
  {
    id: 2,
    name: "Michael T.",
    role: "Host in Seattle",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    rating: 4.5,
    content: "I've been renting out my garage for the past 8 months and have earned over $1,500. The platform makes it easy to communicate with renters, and payments are always on time."
  },
  {
    id: 3,
    name: "Jennifer P.",
    role: "Renter in Austin",
    avatar: "https://randomuser.me/api/portraits/women/29.jpg",
    rating: 5,
    content: "I found the perfect attic space to store my seasonal decorations. The host is wonderful, and I love that I'm supporting someone in my community instead of a big storage company."
  }
];

export default function Testimonials() {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-amber-500 text-amber-500 h-4 w-4" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 h-4 w-4">
          <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" strokeWidth="0" fill="rgba(245, 158, 11, 0.5)" />
          <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253" strokeWidth="0" fill="rgb(245, 158, 11)" />
        </svg>
      );
    }
    
    // Fill the rest with empty stars
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-amber-500 h-4 w-4" />);
    }
    
    return stars;
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-sans font-bold text-gray-800 mb-4">What People Are Saying</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Real experiences from our community members</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h3 className="font-sans font-medium text-gray-800">{testimonial.name}</h3>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex text-amber-500 mb-3">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-gray-700">{testimonial.content}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">
            Read more reviews
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
