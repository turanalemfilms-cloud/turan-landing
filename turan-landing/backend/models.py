from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    name = Column(String, nullable=False)

    # Brief Details
    business_name = Column(String, nullable=True)
    business_type = Column(String, nullable=True)
    business_description = Column(Text, nullable=True)
    target_audience = Column(String, nullable=True)

    # Contact Info
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    # Site Preferences
    selected_theme = Column(String, default="modern")
    preferred_colors = Column(String, nullable=True)
    website_goal = Column(String, nullable=True)  # e.g., "sales", "info", "portfolio"

    # Features Needed
    features_needed = Column(Text, nullable=True)  # JSON string of features
    has_logo = Column(Boolean, default=False)
    has_content = Column(Boolean, default=False)
    has_photos = Column(Boolean, default=False)

    # Additional Info
    competitors = Column(Text, nullable=True)
    additional_notes = Column(Text, nullable=True)
    budget_range = Column(String, nullable=True)
    deadline = Column(String, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    agreed_to_terms = Column(Boolean, default=True)
