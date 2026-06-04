"""POST /remove-bg — Background removal using rembg"""
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import Response
import base64
router = APIRouter()

@router.post("")
async def remove_background(file: UploadFile = File(...)):
    """
    Remove image background using rembg.
    Production:
        from rembg import remove
        output_bytes = remove(await file.read())
        return Response(content=output_bytes, media_type="image/png")
    """
    img_bytes = await file.read()
    # Stub: return original as-is (in production, returns transparent PNG)
    encoded = base64.b64encode(img_bytes).decode()
    return {
        "success": True,
        "data": {
            "base64": encoded,
            "mimeType": "image/png",
            "originalSize": len(img_bytes),
            "note": "rembg background removal — connect Python service to enable"
        }
    }
