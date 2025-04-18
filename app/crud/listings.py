from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, and_
from fastapi import HTTPException, status
from typing import Optional, List, Dict, Any
import math

from app.models.models import Listing, User
from app.schemas.listings import ListingCreate, ListingUpdate, ListingFilters

def get_listing(db: Session, listing_id: int) -> Optional[Listing]:
    """Get a listing by ID"""
    return db.query(Listing).filter(Listing.id == listing_id).first()

def get_listings_by_host(db: Session, host_id: int) -> List[Listing]:
    """Get all listings by a specific host"""
    return db.query(Listing).filter(Listing.host_id == host_id).all()

def get_listings(db: Session, filters: Optional[ListingFilters] = None) -> List[Listing]:
    """Get listings with optional filters"""
    query = db.query(Listing)
    
    if filters:
        # Apply location filter (city or state)
        if filters.location:
            query = query.filter(
                or_(
                    Listing.city.ilike(f"%{filters.location}%"),
                    Listing.state.ilike(f"%{filters.location}%"),
                    Listing.address.ilike(f"%{filters.location}%")
                )
            )
        
        # Apply space type filter
        if filters.space_type:
            query = query.filter(Listing.space_type == filters.space_type)
        
        # Apply price range filters
        if filters.min_price is not None:
            query = query.filter(Listing.price_per_month >= filters.min_price)
        if filters.max_price is not None:
            query = query.filter(Listing.price_per_month <= filters.max_price)
        
        # Apply size range filters
        if filters.min_size is not None:
            query = query.filter(Listing.size >= filters.min_size)
        if filters.max_size is not None:
            query = query.filter(Listing.size <= filters.max_size)
        
        # Apply geolocation radius filter
        if filters.latitude is not None and filters.longitude is not None and filters.radius is not None:
            # TODO: Implement proper geospatial filtering
            # This is a simplified approach for demo purposes
            # For production, consider using PostGIS or a specialized geospatial solution
            
            # Convert radius from miles to degrees (approximate)
            lat_radius = filters.radius / 69.0  # 1 degree lat is approximately 69 miles
            lon_radius = filters.radius / (69.0 * math.cos(filters.latitude * (math.pi / 180)))
            
            query = query.filter(
                and_(
                    Listing.latitude.between(filters.latitude - lat_radius, filters.latitude + lat_radius),
                    Listing.longitude.between(filters.longitude - lon_radius, filters.longitude + lon_radius)
                )
            )
    
    return query.all()

def create_listing(db: Session, listing: ListingCreate, host_id: int) -> Listing:
    """Create a new listing"""
    # Ensure the host exists
    host = db.query(User).filter(User.id == host_id).first()
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Host not found"
        )

    # Ensure the host has is_host set to True
    if not host.is_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not registered as a host"
        )
    
    # Create new listing
    db_listing = Listing(
        host_id=host_id,
        **listing.model_dump()
    )
    
    try:
        db.add(db_listing)
        db.commit()
        db.refresh(db_listing)
        return db_listing
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create listing: {str(e)}"
        )

def update_listing(db: Session, listing_id: int, listing_update: ListingUpdate, user_id: int) -> Listing:
    """Update a listing"""
    db_listing = get_listing(db, listing_id)
    
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Ensure the user is the owner of the listing
    if db_listing.host_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    # Update listing fields if they are provided
    update_data = listing_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_listing, key, value)
    
    try:
        db.commit()
        db.refresh(db_listing)
        return db_listing
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not update listing: {str(e)}"
        )

def delete_listing(db: Session, listing_id: int, user_id: int) -> bool:
    """Delete a listing"""
    db_listing = get_listing(db, listing_id)
    
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Ensure the user is the owner of the listing
    if db_listing.host_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    try:
        db.delete(db_listing)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not delete listing: {str(e)}"
        )