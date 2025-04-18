from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.models import User, Listing
from app.schemas.listings import ListingCreate, ListingResponse, ListingUpdate, ListingFilters, ListingCreateFromFrontend
from app.crud import listings as listings_crud
from app.core.security import get_current_user

router = APIRouter(
    prefix="/listings",
    tags=["listings"],
)

@router.post("/", response_model=ListingResponse, status_code=201)
def create_listing(
    listing: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new listing (requires authentication)"""
    if not current_user.is_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not registered as a host"
        )
    return listings_crud.create_listing(db=db, listing=listing, host_id=current_user.id)

@router.post("/from-frontend", response_model=ListingResponse, status_code=201)
def create_listing_from_frontend(
    listing_data: ListingCreateFromFrontend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new listing from frontend form data (requires authentication)"""
    if not current_user.is_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not registered as a host"
        )
    
    # Convert frontend data to a ListingCreate object
    try:
        size = int(listing_data.sizeSqFt)
        price_per_month = int(float(listing_data.pricePerMonthDollars) * 100)  # Convert to cents
        features = listing_data.featuresInput.split(',') if listing_data.featuresInput else []
        features = [feature.strip() for feature in features if feature.strip()]
    except (ValueError, AttributeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid data format: {str(e)}"
        )
    
    listing = ListingCreate(
        title=listing_data.title,
        description=listing_data.description,
        space_type=listing_data.space_type,
        size=size,
        price_per_month=price_per_month,
        address=listing_data.address,
        city=listing_data.city,
        state=listing_data.state,
        zip_code=listing_data.zip_code,
        country=listing_data.country,
        latitude=listing_data.latitude,
        longitude=listing_data.longitude,
        images=listing_data.imageUrls,
        features=features,
        access_instructions=listing_data.access_instructions,
        access_type=listing_data.access_type,
        available_from=listing_data.available_from,
        available_to=listing_data.available_to,
        is_active=listing_data.is_active
    )
    
    return listings_crud.create_listing(db=db, listing=listing, host_id=current_user.id)

@router.get("/", response_model=List[ListingResponse])
def read_listings(
    location: Optional[str] = None,
    space_type: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_size: Optional[int] = None,
    max_size: Optional[int] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all listings with optional filters"""
    filters = ListingFilters(
        location=location,
        space_type=space_type,
        min_price=min_price,
        max_price=max_price,
        min_size=min_size,
        max_size=max_size,
        latitude=latitude,
        longitude=longitude,
        radius=radius
    )
    
    return listings_crud.get_listings(db=db, filters=filters, skip=skip, limit=limit)

@router.get("/my-listings", response_model=List[ListingResponse])
def read_user_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all listings owned by the current user"""
    return listings_crud.get_listings_by_host(db=db, host_id=current_user.id)

@router.get("/{listing_id}", response_model=ListingResponse)
def read_listing(listing_id: int, db: Session = Depends(get_db)):
    """Get a specific listing by ID"""
    db_listing = listings_crud.get_listing(db, listing_id=listing_id)
    if db_listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific listing (only by owner or admin)"""
    db_listing = listings_crud.get_listing(db, listing_id=listing_id)
    if db_listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if db_listing.host_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this listing"
        )
    
    return listings_crud.update_listing(db=db, listing_id=listing_id, listing_update=listing, user_id=current_user.id)

@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a listing (only by owner or admin)"""
    db_listing = listings_crud.get_listing(db, listing_id=listing_id)
    if db_listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if db_listing.host_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this listing"
        )
    
    listings_crud.delete_listing(db=db, listing_id=listing_id, user_id=current_user.id)
    return None