from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging
import json
import sys

# Configure logging to work with Uvicorn
logger = logging.getLogger("cra_assistant")
logger.setLevel(logging.INFO)

# Create a handler that outputs to stdout
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)

# Create a formatter
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)

# Add handler to logger if not already present
if not logger.handlers:
    logger.addHandler(handler)

# Prevent propagation to avoid duplicate logs
logger.propagate = False


from langchain import hub
prompt = hub.pull("rlm/rag-prompt")

from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
# llm = ChatOpenAI()

# Create FastAPI instance
app = FastAPI(
    title="CRA Assistant API",
    description="A FastAPI application for CRA Assistant functionality",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    message: str

class CRARequest(BaseModel):
    query: str
    context: Optional[str] = None

class CRAResponse(BaseModel):
    response: str
    confidence: Optional[float] = None

# Routes
@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint to check if the API is running"""
    return HealthResponse(
        status="success",
        message="CRA Assistant API is running!"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="API is healthy and ready to serve requests"
    )

@app.post("/cra/query", response_model=CRAResponse)
async def process_cra_query(request: CRARequest):
    """
    Process CRA-related queries
    This is a placeholder endpoint - you can implement your CRA logic here
    """
    # Log the incoming request details
    
    # Also use logger
    logger.info("=" * 50)
    logger.info(f"{prompt} ______________________")
    # logger.info("CRA QUERY REQUEST RECEIVED")
    # logger.info("=" * 50)
    
    try:
        # Placeholder logic - replace with your actual CRA processing
        response_text = f"Processing query: {request.query}"

        if request.context:
            response_text += f" with context: {request.context}"
        
        # Log the response
        print(f"Response generated: {response_text}")
        print("=" * 50)
        logger.info(f"Response generated: {response_text}")
        logger.info("=" * 50)
        
        return CRAResponse(
            response=response_text,
            confidence=0.85
        )
    except Exception as e:
        error_msg = f"Error processing CRA query: {str(e)}"
        print(error_msg)
        print("=" * 50)
        logger.error(error_msg)
        logger.error("=" * 50)
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/cra/status")
async def get_cra_status():
    """Get the current status of the CRA system"""
    return {
        "status": "operational",
        "version": "1.0.0",
        "features": [
            "query_processing",
            "context_analysis",
            "response_generation"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
