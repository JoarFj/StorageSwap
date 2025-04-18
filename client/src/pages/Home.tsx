import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedListings from "@/components/home/FeaturedListings";
import SpaceTypes from "@/components/home/SpaceTypes";
import HostCTA from "@/components/home/HostCTA";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import AppCTA from "@/components/home/AppCTA";
import Newsletter from "@/components/home/Newsletter";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>StoreShare - Peer-to-Peer Storage Marketplace</title>
        <meta name="description" content="StoreShare connects people with extra space to those who need a place to store their belongings" />
      </Helmet>
      
      <HeroSection />
      <HowItWorks />
      <FeaturedListings />
      <SpaceTypes />
      <HostCTA />
      <Testimonials />
      <FAQ />
      <AppCTA />
      <Newsletter />
    </>
  );
}
