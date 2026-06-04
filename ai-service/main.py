"""
MockupAI Studio — FastAPI AI Microservice
GFXTAB Productions · Taiyyab Saiyyad
taiyyab@gfxtab.com · tabsaiyyad@okicici
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from routers import analyze, palette, remove_bg, suggest

app = FastAPI(
    title="MockupAI Studio — AI Service",
    description="Computer Vision & AI pipeline for brand mockup generation",
    version="1.0.0",
    contact={"name": "Taiyyab Saiyyad", "email": "taiyyab@gfxtab.com"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4000", "https://mockupai.studio"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(analyze.router, prefix="/analyze", tags=["Analysis"])
app.include_router(palette.router, prefix="/palette", tags=["Color"])
app.include_router(remove_bg.router, prefix="/remove-bg", tags=["Background"])
app.include_router(suggest.router, prefix="/suggest", tags=["Suggestions"])


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "MockupAI Studio AI Service",
        "version": "1.0.0",
        "author": "GFXTAB Productions · taiyyab@gfxtab.com",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
