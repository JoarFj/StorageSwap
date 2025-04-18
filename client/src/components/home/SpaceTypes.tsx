import { Link } from "wouter";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { spaceTypeNames } from "@/lib/utils";

const spaceTypes = [
  {
    type: "basement",
    image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    type: "garage",
    image: "https://images.unsplash.com/photo-1523575318206-83e1d4f6ca5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    type: "attic",
    image: "https://images.unsplash.com/photo-1617358488205-e2a00865505b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    type: "room",
    image: "https://images.unsplash.com/photo-1520096459084-096fcc53fa43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    type: "shed",
    image: "https://images.unsplash.com/photo-1530979766925-c129a19a1931?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
];

export default function SpaceTypes() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-sans font-bold text-gray-800 mb-4">Browse by Space Type</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find the perfect storage solution for your needs</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {spaceTypes.map((type) => (
            <Link key={type.type} href={`/search?spaceType=${type.type}`}>
              <a className="block group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  <AspectRatio ratio={1} className="bg-muted">
                    <img 
                      src={type.image} 
                      alt={`${spaceTypeNames[type.type]} storage`} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent flex items-end p-4">
                      <span className="text-white font-sans font-medium text-lg">{spaceTypeNames[type.type]}s</span>
                    </div>
                  </AspectRatio>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
