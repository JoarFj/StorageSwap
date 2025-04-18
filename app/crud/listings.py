from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, func, asc, desc
from fastapi import HTTPException, status
from typing import Optional, List

from app.models.models import Listing
from app.schemas.listings import ListingCreate, ListingUpdate, ListingFilters

def get_listing(db: Session, listing_id: int) -> Optional[Listing]:
    """Get a listing by ID"""
    return db.query(Listing).filter(Listing.id == listing_id).first()

def get_listings_by_host(db: Session, host_id: int) -> List[Listing]:
    """Get all listings by a specific host"""
    return db.query(Listing).filter(Listing.host_id == host_id).all()

def get_listings(db: Session, filters: Optional[ListingFilters] = None, skip: int = 0, limit: int = 100) -> List[Listing]:
    """Get listings with optional filters"""
    query = db.query(Listing).filter(Listing.is_active == True)
    
    if filters:
        # Location filter (city, state, or zip)
        if filters.location:
            query = query.filter(
                or_(
                    Listing.city.ilike(f"%{filters.location}%"),
                    Listing.state.ilike(f"%{filters.location}%"),
                    Listing.zip_code.ilike(f"%{filters.location}%")
                )
            )
        
        # Space type filter
        if filters.space_type:
            query = query.filter(Listing.space_type == filters.space_type)
        
        # Price range filters
        if filters.min_price is not None:
            query = query.filter(Listing.price_per_month >= filters.min_price)
        if filters.max_price is not None:
            query = query.filter(Listing.price_per_month <= filters.max_price)
        
        # Size range filters
        if filters.min_size is not None:
            query = query.filter(Listing.size >= filters.min_size)
        if filters.max_size is not None:
            query = query.filter(Listing.size <= filters.max_size)
        
        # Proximity search (if latitude, longitude, and radius are provided)
        if all([filters.latitude, filters.longitude, filters.radius]):
            # Calculate distance in miles (approximate)
            # Using Haversine formula via SQL
            earth_radius_miles = 3959  # Earth radius in miles
            distance = (
                earth_radius_miles * 
                func.acos(
                    func.cos(func.radians(filters.latitude)) * 
                    func.cos(func.radians(Listing.latitude)) * 
                    func.cos(func.radians(Listing.longitude) - func.radians(filters.longitude)) + 
                    func.sin(func.radians(filters.latitude)) * 
                    func.sin(func.radians(Listing.latitude))
                )
            )
            query = query.filter(distance <= filters.radius)
            # Sort by distance
            query = query.order_by(asc(distance))
    
    # Apply pagination
    return query.offset(skip).limit(limit).all()

def create_listing(db: Session, listing: ListingCreate, host_id: int) -> Listing:
    """Create a new listing"""
    db_listing = Listing(**listing.model_dump(), host_id=host_id)
    
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
    if db_listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Verify ownership or admin permission
    if db_listing.host_id != user_id:
        # This check is a backup; routes should already enforce this
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    # Update listing data
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
    if db_listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Verify ownership or admin permission
    if db_listing.host_id != user_id:
        # This check is a backup; routes should already enforce this
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
            detail=f"Error deleting listing: {str(e)}"
        )