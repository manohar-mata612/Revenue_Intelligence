from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import query, deals, digest

app = FastAPI(title="Revenue Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router,  prefix="/api")
app.include_router(deals.router,  prefix="/api")
app.include_router(digest.router, prefix="/api")