import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would submit to an API endpoint
    if (email) {
      toast({
        title: "Success!",
        description: "Thanks for subscribing to our newsletter!",
      });
      setEmail("");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address.",
      });
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-sans font-bold text-gray-800 mb-4">Stay in the loop</h2>
        <p className="text-gray-600 mb-6">Sign up for our newsletter to receive updates, new listing alerts, and special offers</p>
        <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
          <div className="flex">
            <Input
              type="email"
              placeholder="Enter your email"
              className="rounded-r-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="rounded-l-none">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">By subscribing, you agree to receive marketing emails. You can unsubscribe anytime.</p>
        </form>
      </div>
    </section>
  );
}
