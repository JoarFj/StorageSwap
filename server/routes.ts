import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertListingSchema, 
  insertBookingSchema, 
  insertReviewSchema, 
  insertMessageSchema,
  registerUserSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints (all prefixed with /api)
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.post("/users/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Remove confirmPassword before saving
      const { confirmPassword, ...userToCreate } = userData;
      
      const user = await storage.createUser(userToCreate);
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  apiRouter.post("/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Listing routes
  apiRouter.get("/listings", async (req, res) => {
    try {
      const { 
        location, 
        spaceType, 
        minPrice, 
        maxPrice, 
        minSize, 
        maxSize,
        latitude,
        longitude,
        radius
      } = req.query;
      
      const filters: any = {};
      
      if (location) filters.location = location as string;
      if (spaceType) filters.spaceType = spaceType as string;
      if (minPrice) filters.minPrice = parseInt(minPrice as string);
      if (maxPrice) filters.maxPrice = parseInt(maxPrice as string);
      if (minSize) filters.minSize = parseInt(minSize as string);
      if (maxSize) filters.maxSize = parseInt(maxSize as string);
      if (latitude) filters.latitude = parseFloat(latitude as string);
      if (longitude) filters.longitude = parseFloat(longitude as string);
      if (radius) filters.radius = parseFloat(radius as string);
      
      const listings = await storage.getListings(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.post("/listings", async (req, res) => {
    try {
      const listingData = insertListingSchema.parse(req.body);
      const listing = await storage.createListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  apiRouter.patch("/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listingData = req.body;
      
      const updatedListing = await storage.updateListing(listingId, listingData);
      
      if (!updatedListing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(updatedListing);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.delete("/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const success = await storage.deleteListing(listingId);
      
      if (!success) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/users/:hostId/listings", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      const listings = await storage.getListingsByHost(hostId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Booking routes
  apiRouter.get("/bookings/listing/:listingId", async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      const bookings = await storage.getBookingsByListing(listingId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/bookings/renter/:renterId", async (req, res) => {
    try {
      const renterId = parseInt(req.params.renterId);
      const bookings = await storage.getBookingsByRenter(renterId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/bookings/host/:hostId", async (req, res) => {
    try {
      const hostId = parseInt(req.params.hostId);
      const bookings = await storage.getBookingsByHost(hostId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.post("/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  apiRouter.patch("/bookings/:id", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const bookingData = req.body;
      
      const updatedBooking = await storage.updateBooking(bookingId, bookingData);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review routes
  apiRouter.get("/reviews/listing/:listingId", async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      const reviews = await storage.getReviewsByListing(listingId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/reviews/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reviews = await storage.getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.post("/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Message routes
  apiRouter.get("/messages/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getMessagesByUser(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.get("/messages/:user1Id/:user2Id", async (req, res) => {
    try {
      const user1Id = parseInt(req.params.user1Id);
      const user2Id = parseInt(req.params.user2Id);
      const messages = await storage.getMessagesBetweenUsers(user1Id, user2Id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  apiRouter.post("/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  apiRouter.patch("/messages/:id/read", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const updatedMessage = await storage.markMessageAsRead(messageId);
      
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Add API router to main app
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
