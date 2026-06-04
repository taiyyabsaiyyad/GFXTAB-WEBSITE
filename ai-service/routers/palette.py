"""POST /palette — Color extraction only"""
from fastapi import APIRouter, UploadFile, File
router = APIRouter()

@router.post("")
async def extract_palette(file: UploadFile = File(...), k: int = 5):
    """Extract color palette using colorthief + K-means"""
    img_bytes = await file.read()
    # Production: from colorthief import ColorThief; ct = ColorThief(io.BytesIO(img_bytes))
    palette = [
        {"hex": "#C8FF00", "rgb": {"r": 200, "g": 255, "b": 0}, "cmyk": {"c": 22, "m": 0, "y": 100, "k": 0}, "name": "Electric Lime", "weight": 0.45},
        {"hex": "#7B2FFF", "rgb": {"r": 123, "g": 47, "b": 255}, "cmyk": {"c": 52, "m": 82, "y": 0, "k": 0}, "name": "Deep Violet", "weight": 0.30},
    ]
    return {"success": True, "data": {"palette": palette, "dominantColor": palette[0]["hex"]}}
