from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Any, Optional

from app.db.database import get_db
from app.schemas.listings import ListingCreate, ListingResponse, ListingUpdate, ListingFilters, ListingCreateFromFrontend
from app.crud import listings as listings_crud
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter(prefix="/listings", tags=["listings"])

@router.get("", response_model=List[ListingResponse])
def get_listings(
    location: Optional[str] = None,
    space_type: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_size: Optional[int] = None,
    max_size: Optional[int] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius: Optional[float] = None,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all listings with optional filtering.
    """
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
    return listings_crud.get_listings(db=db, filters=filters)

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new listing.
    """
    return listings_crud.create_listing(db=db, listing=listing, host_id=current_user.id)

@router.post("/from-frontend", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing_from_frontend(
    listing_data: ListingCreateFromFrontend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new listing from frontend form data.
    """
    # Convert from frontend format to backend format
    listing_dict = listing_data.model_dump(exclude_unset=True)
    
    # Handle price conversion (string dollars to int cents)
    price_per_month = int(float(listing_dict.pop('pricePerMonthDollars', 0)) * 100)
    
    # Handle size conversion (string to int)
    size = int(float(listing_dict.pop('sizeSqFt', 0)))
    
    # Handle features (string to array)
    features_input = listing_dict.pop('featuresInput', '')
    features = [f.strip() for f in features_input.split(',') if f.strip()]
    
    # Copy image URLs
    images = listing_dict.pop('imageUrls', [])
    
    # Create listing object with converted data
    listing = ListingCreate(
        title=listing_dict.get('title'),
        description=listing_dict.get('description'),
        space_type=listing_dict.get('space_type'),
        size=size,
        price_per_month=price_per_month,
        address=listing_dict.get('address'),
        city=listing_dict.get('city'),
        state=listing_dict.get('state'),
        zip_code=listing_dict.get('zip_code'),
        country=listing_dict.get('country'),
        latitude=listing_dict.get('latitude'),
        longitude=listing_dict.get('longitude'),
        images=images,
        features=features,
        access_instructions=listing_dict.get('access_instructions'),
        access_type=listing_dict.get('access_type'),
        available_from=listing_dict.get('available_from'),
        available_to=listing_dict.get('available_to'),
        is_active=listing_dict.get('is_active', True)
    )
    
    return listings_crud.create_listing(db=db, listing=listing, host_id=current_user.id)

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific listing by id.
    """
    db_listing = listings_crud.get_listing(db=db, listing_id=listing_id)
    if db_listing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    return db_listing

@router.patch("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a specific listing.
    """
    return listings_crud.update_listing(
        db=db, 
        listing_id=listing_id, 
        listing_update=listing_update, 
        user_id=current_user.id
    )

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete a specific listing.
    """
    listings_crud.delete_listing(db=db, listing_id=listing_id, user_id=current_user.id)
    return None

@router.get("/host/{host_id}", response_model=List[ListingResponse])
def get_listings_by_host(
    host_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all listings by a specific host.
    """
    return listings_crud.get_listings_by_host(db=db, host_id=host_id)