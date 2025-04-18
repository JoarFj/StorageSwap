import { 
  users, type User, type InsertUser,
  listings, type Listing, type InsertListing,
  bookings, type Booking, type InsertBooking,
  reviews, type Review, type InsertReview,
  messages, type Message, type InsertMessage
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Listings
  getListing(id: number): Promise<Listing | undefined>;
  getListingsByHost(hostId: number): Promise<Listing[]>;
  getListings(filters?: ListingFilters): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  
  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByListing(listingId: number): Promise<Booking[]>;
  getBookingsByRenter(renterId: number): Promise<Booking[]>;
  getBookingsByHost(hostId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  
  // Reviews
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByListing(listingId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
}

export type ListingFilters = {
  location?: string;
  spaceType?: string;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  latitude?: number;
  longitude?: number;
  radius?: number; // in miles
};

// Calculate distance between two coordinates in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private listings: Map<number, Listing>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private messages: Map<number, Message>;
  
  private currentUserId: number;
  private currentListingId: number;
  private currentBookingId: number;
  private currentReviewId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.messages = new Map();
    
    this.currentUserId = 1;
    this.currentListingId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.currentMessageId = 1;
    
    // Add some sample data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Listing methods
  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }
  
  async getListingsByHost(hostId: number): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(
      (listing) => listing.hostId === hostId && listing.isActive
    );
  }
  
  async getListings(filters?: ListingFilters): Promise<Listing[]> {
    let filteredListings = Array.from(this.listings.values()).filter(
      (listing) => listing.isActive
    );
    
    if (!filters) return filteredListings;
    
    // Filter by space type
    if (filters.spaceType) {
      filteredListings = filteredListings.filter(
        (listing) => listing.spaceType === filters.spaceType
      );
    }
    
    // Filter by price range
    if (filters.minPrice !== undefined) {
      filteredListings = filteredListings.filter(
        (listing) => listing.pricePerMonth >= filters.minPrice!
      );
    }
    
    if (filters.maxPrice !== undefined) {
      filteredListings = filteredListings.filter(
        (listing) => listing.pricePerMonth <= filters.maxPrice!
      );
    }
    
    // Filter by size range
    if (filters.minSize !== undefined) {
      filteredListings = filteredListings.filter(
        (listing) => listing.size >= filters.minSize!
      );
    }
    
    if (filters.maxSize !== undefined) {
      filteredListings = filteredListings.filter(
        (listing) => listing.size <= filters.maxSize!
      );
    }
    
    // Filter by location (basic text search)
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filteredListings = filteredListings.filter(
        (listing) => {
          return listing.city.toLowerCase().includes(locationLower) ||
                 listing.state.toLowerCase().includes(locationLower) ||
                 listing.zipCode.toLowerCase().includes(locationLower) ||
                 listing.address.toLowerCase().includes(locationLower);
        }
      );
    }
    
    // Filter by distance if latitude, longitude, and radius are provided
    if (filters.latitude !== undefined && 
        filters.longitude !== undefined && 
        filters.radius !== undefined) {
      filteredListings = filteredListings.filter(
        (listing) => {
          const distance = calculateDistance(
            filters.latitude!, 
            filters.longitude!, 
            listing.latitude, 
            listing.longitude
          );
          return distance <= filters.radius!;
        }
      );
    }
    
    return filteredListings;
  }
  
  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.currentListingId++;
    const now = new Date();
    const listing: Listing = { ...insertListing, id, createdAt: now };
    this.listings.set(id, listing);
    return listing;
  }
  
  async updateListing(id: number, listingData: Partial<InsertListing>): Promise<Listing | undefined> {
    const listing = await this.getListing(id);
    if (!listing) return undefined;
    
    const updatedListing = { ...listing, ...listingData };
    this.listings.set(id, updatedListing);
    return updatedListing;
  }
  
  async deleteListing(id: number): Promise<boolean> {
    const listing = await this.getListing(id);
    if (!listing) return false;
    
    // Instead of deleting, just mark as inactive
    const updatedListing = { ...listing, isActive: false };
    this.listings.set(id, updatedListing);
    return true;
  }

  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByListing(listingId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.listingId === listingId
    );
  }
  
  async getBookingsByRenter(renterId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.renterId === renterId
    );
  }
  
  async getBookingsByHost(hostId: number): Promise<Booking[]> {
    const hostListings = await this.getListingsByHost(hostId);
    const hostListingIds = hostListings.map(listing => listing.id);
    
    return Array.from(this.bookings.values()).filter(
      (booking) => hostListingIds.includes(booking.listingId)
    );
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const now = new Date();
    const booking: Booking = { ...insertBooking, id, createdAt: now };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = await this.getBooking(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByListing(listingId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.listingId === listingId && review.isPublic
    );
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.reviewedId === userId && review.isPublic
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = { ...insertReview, id, createdAt: now };
    this.reviews.set(id, review);
    return review;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        message.senderId === userId || message.receiverId === userId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, createdAt: now };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = await this.getMessage(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Seed initial data
  private seedData() {
    // Create some sample users
    const user1: InsertUser = {
      username: "johndoe",
      password: "password123", // In a real app, this would be hashed
      email: "john@example.com",
      fullName: "John Doe",
      bio: "I'm a host with extra space in my home.",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      isHost: true,
    };
    
    const user2: InsertUser = {
      username: "janedoe",
      password: "password123",
      email: "jane@example.com",
      fullName: "Jane Doe",
      bio: "Looking for affordable storage solutions.",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      isHost: false,
    };
    
    this.createUser(user1).then(createdUser1 => {
      this.createUser(user2).then(createdUser2 => {
        // Create sample listings for the first user
        const listing1: InsertListing = {
          hostId: createdUser1.id,
          title: "Spacious Basement Storage",
          description: "Clean, dry basement space perfect for storing furniture, boxes, or seasonal items.",
          spaceType: "basement",
          size: 200, // square feet
          pricePerMonth: 12000, // $120.00
          address: "123 Main St",
          city: "Brooklyn",
          state: "NY",
          zipCode: "11201",
          country: "USA",
          latitude: 40.7128,
          longitude: -74.0060,
          images: [
            "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          ],
          features: ["Clean & Dry", "24/7 Access", "Climate Controlled"],
          accessInstructions: "Enter through the side door. Keypad code will be provided after booking.",
          accessType: "24/7",
          availableFrom: new Date(),
          isActive: true,
        };
        
        const listing2: InsertListing = {
          hostId: createdUser1.id,
          title: "Secure Garage Storage",
          description: "Clean garage space with security cameras and drive-up access.",
          spaceType: "garage",
          size: 150, // square feet
          pricePerMonth: 9500, // $95.00
          address: "456 Oak St",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
          country: "USA",
          latitude: 47.6062,
          longitude: -122.3321,
          images: [
            "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          ],
          features: ["Security Camera", "Drive-up Access", "Locked Garage"],
          accessInstructions: "Garage door opener will be provided upon booking confirmation.",
          accessType: "24/7",
          availableFrom: new Date(),
          isActive: true,
        };
        
        this.createListing(listing1).then(createdListing1 => {
          this.createListing(listing2).then(createdListing2 => {
            // Create a booking for the second user
            const booking: InsertBooking = {
              listingId: createdListing1.id,
              renterId: createdUser2.id,
              startDate: new Date(),
              endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
              totalPrice: 36000, // $360.00 for 3 months
              platformFee: 5400, // $54.00 (15%)
              status: "confirmed",
              paymentStatus: "paid",
            };
            
            this.createBooking(booking).then(createdBooking => {
              // Create a review for the booking
              const review: InsertReview = {
                bookingId: createdBooking.id,
                reviewerId: createdUser2.id,
                reviewedId: createdUser1.id,
                listingId: createdListing1.id,
                rating: 5,
                comment: "Great storage space! Clean, dry, and secure. John was very helpful and accommodating.",
                isPublic: true,
              };
              
              this.createReview(review);
              
              // Create some messages between the users
              const message1: InsertMessage = {
                senderId: createdUser2.id,
                receiverId: createdUser1.id,
                listingId: createdListing1.id,
                bookingId: createdBooking.id,
                message: "Hi John, I'm interested in your basement storage space. Is it still available?",
                isRead: true,
              };
              
              const message2: InsertMessage = {
                senderId: createdUser1.id,
                receiverId: createdUser2.id,
                listingId: createdListing1.id,
                bookingId: createdBooking.id,
                message: "Hi Jane, yes it's still available! When would you like to start?",
                isRead: true,
              };
              
              const message3: InsertMessage = {
                senderId: createdUser2.id,
                receiverId: createdUser1.id,
                listingId: createdListing1.id,
                bookingId: createdBooking.id,
                message: "I'd like to start next week if possible. How do I access the space?",
                isRead: true,
              };
              
              this.createMessage(message1).then(() => {
                this.createMessage(message2).then(() => {
                  this.createMessage(message3);
                });
              });
            });
          });
        });
      });
    });
  }
}

export const storage = new MemStorage();
