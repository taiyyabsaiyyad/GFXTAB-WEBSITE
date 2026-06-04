"""GET /suggest — Product suggestions by image type"""
from fastapi import APIRouter, Query
router = APIRouter()

SUGGESTIONS_MAP = {
    "logo": [
        {"product": "tshirt-crew", "score": 0.95, "reason": "Perfect for apparel branding"},
        {"product": "poster-a3", "score": 0.91, "reason": "Scales to large format beautifully"},
        {"product": "book-cover", "score": 0.88, "reason": "Great visual impact on print"},
        {"product": "mug-ceramic", "score": 0.82, "reason": "High contrast merchandise"},
        {"product": "business-card", "score": 0.79, "reason": "Professional branding asset"},
    ],
    "photograph": [
        {"product": "frame-print", "score": 0.94, "reason": "Showcase photography beautifully"},
        {"product": "poster-a3", "score": 0.90, "reason": "Large format photo print"},
        {"product": "pillow", "score": 0.82, "reason": "Home decor merchandise"},
        {"product": "phone-case", "score": 0.78, "reason": "Personal photo accessory"},
        {"product": "canvas-bag", "score": 0.72, "reason": "Casual photo tote"},
    ],
    "illustration": [
        {"product": "book-cover", "score": 0.95, "reason": "Illustration perfect for cover art"},
        {"product": "poster-a3", "score": 0.89, "reason": "Wall art potential is high"},
        {"product": "sticker-sheet", "score": 0.84, "reason": "Sticker-worthy illustration"},
        {"product": "notebook", "score": 0.78, "reason": "Cover illustration for notebooks"},
        {"product": "mug-ceramic", "score": 0.72, "reason": "Art merch on drinkware"},
    ],
    "pattern": [
        {"product": "tshirt-oversized", "score": 0.93, "reason": "All-over pattern print"},
        {"product": "pillow", "score": 0.88, "reason": "Home textile pattern"},
        {"product": "tote-bag", "score": 0.83, "reason": "Fashion tote with pattern"},
        {"product": "hoodie", "score": 0.79, "reason": "Streetwear pattern hoodie"},
        {"product": "mousepad", "score": 0.71, "reason": "Desk mat pattern"},
    ],
}

@router.get("")
async def get_suggestions(imageType: str = Query(default="logo", alias="imageType")):
    suggestions = SUGGESTIONS_MAP.get(imageType, SUGGESTIONS_MAP["logo"])
    return {"success": True, "data": suggestions}
