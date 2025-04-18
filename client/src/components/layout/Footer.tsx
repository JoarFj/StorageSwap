import { Link } from "wouter";
import { FileArchive, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <FileArchive className="text-primary-500 h-6 w-6 mr-2" />
              <span className="font-sans font-bold text-xl text-white">StoreShare</span>
            </div>
            <p className="text-gray-400 mb-4">The marketplace for peer-to-peer storage space rentals.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-sans font-medium text-lg mb-4">For Renters</h3>
            <ul className="space-y-2">
              <li><Link href="/search"><a className="text-gray-400 hover:text-white">Find Storage</a></Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white">How it Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Renter Security</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Cancellation Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">StoreShare Insurance</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-sans font-medium text-lg mb-4">For Hosts</h3>
            <ul className="space-y-2">
              <li><Link href="/create-listing"><a className="text-gray-400 hover:text-white">List Your Space</a></Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Host Protection</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Pricing Tips</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Host Requirements</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Host Resources</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-sans font-medium text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Trust & Safety</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 mt-8">
          <div className="flex flex-col md:flex-row md:justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2023 StoreShare, Inc. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Sitemap</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Preferences</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
