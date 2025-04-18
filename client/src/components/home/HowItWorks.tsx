import { Search, CalendarCheck, Box } from "lucide-react";

const steps = [
  {
    icon: <Search className="h-6 w-6" />,
    title: "Find the Perfect Space",
    description: "Search listings in your area. Filter by size, price, and amenities to find the right storage space.",
  },
  {
    icon: <CalendarCheck className="h-6 w-6" />,
    title: "Book Securely",
    description: "Reserve your space through our secure platform. We protect your payment until you confirm everything's right.",
  },
  {
    icon: <Box className="h-6 w-6" />,
    title: "Store with Confidence",
    description: "Access your items whenever you need them. All hosts are verified and spaces are rated by real users.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-sans font-bold text-gray-800 mb-4">How StoreShare Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find affordable storage space in your neighborhood or make money from your unused space</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-sans font-medium text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
