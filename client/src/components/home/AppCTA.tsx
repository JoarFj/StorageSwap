import { Button } from "@/components/ui/button";
import { FaApple, FaGooglePlay } from "react-icons/fa";

export default function AppCTA() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary-600 rounded-2xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-white mb-4">Get the StoreShare App</h2>
              <p className="text-primary-100 mb-6">Manage your storage, communicate with hosts or renters, and get instant notifications—all from your phone.</p>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" className="bg-black hover:bg-gray-800 text-white border-none">
                  <FaApple className="mr-2 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-75">Download on the</span>
                    <span className="text-sm font-medium">App Store</span>
                  </div>
                </Button>
                <Button variant="outline" className="bg-black hover:bg-gray-800 text-white border-none">
                  <FaGooglePlay className="mr-2 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-75">Get it on</span>
                    <span className="text-sm font-medium">Google Play</span>
                  </div>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <img 
                src="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="StoreShare mobile app" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
