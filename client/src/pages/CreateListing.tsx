import { Helmet } from "react-helmet";
import ListingForm from "@/components/listings/ListingForm";

export default function CreateListing() {
  return (
    <>
      <Helmet>
        <title>List Your Storage Space - StoreShare</title>
        <meta name="description" content="Earn money by renting out your unused storage space to people in your community." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List Your Storage Space</h1>
          <p className="mt-2 text-lg text-gray-600">
            Earn money by renting out your unused space to people in your community
          </p>
        </div>

        <ListingForm />
      </div>
    </>
  );
}
