from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone
import pytz
import shutil

from models import Schedule, ScheduleCreate, ScheduleUpdate, BulkScheduleCreate
from pydantic import BaseModel
from markdown_converter import html_to_whatsapp_markdown
from gateway import gateway
from scheduler import DevotionScheduler

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize scheduler
scheduler = DevotionScheduler(db)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Debug route for testing gateway
class DebugSendRequest(BaseModel):
    phone: str
    message: str
    image_path: Optional[str] = None

@api_router.post("/debug/send")
async def debug_send(request: DebugSendRequest):
    """Debug endpoint to test gateway"""
    try:
        if request.image_path:
            result = await gateway.send_image_message(request.phone, request.image_path, request.message)
        else:
            result = await gateway.send_text_message(request.phone, request.message)
        return {"success": True, "result": result}
    except Exception as e:
        logger.error(f"Debug send error: {e}")
        return {"success": False, "error": str(e)}

# Upload endpoint
@api_router.post("/uploads/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file"""
    try:
        # Generate unique filename
        ext = file.filename.split('.')[-1]
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        file_path = UPLOADS_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "success": True,
            "filename": filename,
            "path": str(file_path)
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Schedule CRUD endpoints
@api_router.post("/schedules", response_model=Schedule)
async def create_schedule(schedule_data: ScheduleCreate):
    """Create a new schedule"""
    try:
        # Convert HTML to markdown
        markdown = html_to_whatsapp_markdown(schedule_data.message_html)
        
        schedule = Schedule(
            **schedule_data.dict(),
            message_md=markdown
        )
        
        await db.schedules.insert_one(schedule.dict())
        return schedule
    except Exception as e:
        logger.error(f"Create schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/schedules/bulk", response_model=List[Schedule])
async def create_bulk_schedules(bulk_data: BulkScheduleCreate):
    """Create multiple schedules at once"""
    try:
        schedules = []
        for schedule_data in bulk_data.schedules:
            markdown = html_to_whatsapp_markdown(schedule_data.message_html)
            schedule = Schedule(
                **schedule_data.dict(),
                message_md=markdown
            )
            schedules.append(schedule.dict())
        
        if schedules:
            await db.schedules.insert_many(schedules)
        
        return [Schedule(**s) for s in schedules]
    except Exception as e:
        logger.error(f"Bulk create error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/schedules", response_model=List[Schedule])
async def get_schedules(status: Optional[str] = None, limit: int = 100):
    """Get all schedules with optional status filter"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.schedules.find(query).sort("send_at", -1).limit(limit)
        schedules = await cursor.to_list(length=limit)
        return [Schedule(**s) for s in schedules]
    except Exception as e:
        logger.error(f"Get schedules error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/schedules/{schedule_id}", response_model=Schedule)
async def get_schedule(schedule_id: str):
    """Get a specific schedule"""
    schedule = await db.schedules.find_one({"id": schedule_id})
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return Schedule(**schedule)

@api_router.put("/schedules/{schedule_id}", response_model=Schedule)
async def update_schedule(schedule_id: str, update_data: ScheduleUpdate):
    """Update a schedule"""
    try:
        # Get existing schedule
        schedule = await db.schedules.find_one({"id": schedule_id})
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        # Prepare update
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        # If message_html is updated, regenerate markdown
        if "message_html" in update_dict:
            update_dict["message_md"] = html_to_whatsapp_markdown(update_dict["message_html"])
        
        update_dict["updated_at"] = datetime.now(timezone.utc)
        
        await db.schedules.update_one(
            {"id": schedule_id},
            {"$set": update_dict}
        )
        
        updated_schedule = await db.schedules.find_one({"id": schedule_id})
        return Schedule(**updated_schedule)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str):
    """Delete a schedule"""
    result = await db.schedules.delete_one({"id": schedule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"success": True}

@api_router.post("/schedules/{schedule_id}/retry")
async def retry_schedule(schedule_id: str):
    """Retry sending a failed schedule"""
    try:
        schedule = await db.schedules.find_one({"id": schedule_id})
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        # Reset status to scheduled and set new send time
        await db.schedules.update_one(
            {"id": schedule_id},
            {
                "$set": {
                    "status": "scheduled",
                    "send_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return {"success": True, "message": "Schedule queued for retry"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Retry error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# History endpoint (same as schedules but with filters)
@api_router.get("/history", response_model=List[Schedule])
async def get_history(status: Optional[str] = None, limit: int = 100):
    """Get message history"""
    try:
        query = {}
        if status:
            query["status"] = status
        else:
            # Only show sent, failed, or canceled
            query["status"] = {"$in": ["sent", "failed", "canceled"]}
        
        cursor = db.schedules.find(query).sort("sent_at", -1).limit(limit)
        schedules = await cursor.to_list(length=limit)
        return [Schedule(**s) for s in schedules]
    except Exception as e:
        logger.error(f"Get history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

# Serve static files
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Start the scheduler
    scheduler.start()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_event():
    # Shutdown scheduler
    scheduler.shutdown()
    # Close MongoDB connection
    client.close()
    logger.info("Application shut down")
