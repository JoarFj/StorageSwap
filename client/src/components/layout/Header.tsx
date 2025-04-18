import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Menu, X, Search, FileArchive, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <FileArchive className="text-primary-500 h-7 w-7 mr-2" />
                <span className="font-sans font-bold text-2xl text-primary-600">
                  StoreShare
                </span>
              </a>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/search">
              <a className={`px-3 py-2 text-sm font-medium ${
                location === "/search" 
                  ? "text-primary-500" 
                  : "text-gray-600 hover:text-primary-500"
              } rounded-md`}>
                Find Storage
              </a>
            </Link>
            <Link href="/create-listing">
              <a className={`px-3 py-2 text-sm font-medium ${
                location === "/create-listing" 
                  ? "text-primary-500" 
                  : "text-gray-600 hover:text-primary-500"
              } rounded-md`}>
                List Your Space
              </a>
            </Link>
            <Link href="/messages">
              <a className={`px-3 py-2 text-sm font-medium ${
                location.startsWith("/messages") 
                  ? "text-primary-500" 
                  : "text-gray-600 hover:text-primary-500"
              } rounded-md`}>
                Messages
              </a>
            </Link>
            <Button asChild variant="default" size="sm">
              <Link href="/profile/1">
                <a>
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </a>
              </Link>
            </Button>
          </div>

          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center">
                      <FileArchive className="text-primary-500 h-6 w-6 mr-2" />
                      <span className="font-sans font-bold text-xl text-primary-600">
                        StoreShare
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-3">
                  <Link href="/search">
                    <a className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:text-primary-500 hover:bg-gray-50">
                      <Search className="mr-3 h-5 w-5" />
                      Find Storage
                    </a>
                  </Link>
                  <Link href="/create-listing">
                    <a className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:text-primary-500 hover:bg-gray-50">
                      <LayoutGrid className="mr-3 h-5 w-5" />
                      List Your Space
                    </a>
                  </Link>
                  <Link href="/messages">
                    <a className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:text-primary-500 hover:bg-gray-50">
                      <LayoutGrid className="mr-3 h-5 w-5" />
                      Messages
                    </a>
                  </Link>
                  <hr className="border-gray-200" />
                  <Link href="/profile/1">
                    <a className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:text-primary-500 hover:bg-gray-50">
                      <User className="mr-3 h-5 w-5" />
                      Sign In
                    </a>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
