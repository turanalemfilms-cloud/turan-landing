from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LeadCreate(BaseModel):
    # Basic Info
    name: str

    # Brief Details
    businessName: Optional[str] = None
    businessType: Optional[str] = None
    businessDescription: Optional[str] = None
    targetAudience: Optional[str] = None

    # Contact Info
    email: str
    phone: str

    # Site Preferences
    selectedTheme: str = "modern"
    preferredColors: Optional[str] = None
    websiteGoal: Optional[str] = None

    # Features Needed
    featuresNeeded: Optional[str] = None
    hasLogo: bool = False
    hasContent: bool = False
    hasPhotos: bool = False

    # Additional Info
    competitors: Optional[str] = None
    additionalNotes: Optional[str] = None
    budgetRange: Optional[str] = None
    deadline: Optional[str] = None

    # Terms
    agreedToTerms: bool = True

class LeadResponse(BaseModel):
    id: int
    name: str

    # Brief Details
    business_name: Optional[str]
    business_type: Optional[str]
    business_description: Optional[str]
    target_audience: Optional[str]

    # Contact Info
    email: str
    phone: str

    # Site Preferences
    selected_theme: str
    preferred_colors: Optional[str]
    website_goal: Optional[str]

    # Features
    features_needed: Optional[str]
    has_logo: bool
    has_content: bool
    has_photos: bool

    # Additional
    competitors: Optional[str]
    additional_notes: Optional[str]
    budget_range: Optional[str]
    deadline: Optional[str]

    created_at: datetime
    agreed_to_terms: bool

    class Config:
        from_attributes = True

class LeadList(BaseModel):
    leads: list[LeadResponse]
    total: int
