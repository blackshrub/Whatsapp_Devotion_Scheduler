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
from markdown_converter import html_to_whatsapp_markdown
from gateway import gateway
from background_worker import BackgroundWorker
from pydantic import BaseModel

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

# Initialize background worker
worker = BackgroundWorker(db)

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
    image_base64: Optional[str] = None
    image_filename: Optional[str] = None

@api_router.post("/debug/send")
async def debug_send(request: DebugSendRequest):
    """Debug endpoint to test gateway - stateless, no filesystem"""
    import base64
    
    try:
        if request.image_base64:
            # Decode base64 directly to bytes (no temp file)
            image_filename = request.image_filename or "debug_image.jpg"
            image_bytes = base64.b64decode(request.image_base64)
            
            logger.info(f"Debug: sending image ({len(image_bytes)} bytes) to {request.phone}")
            
            result = await gateway.send_image_message(
                phone=request.phone,
                image_bytes=image_bytes,
                filename=image_filename,
                caption=request.message
            )
        else:
            result = await gateway.send_text_message(request.phone, request.message)
        
        return {"success": True, "result": result}
    except Exception as e:
        logger.error(f"Debug send error: {e}")
        return {"success": False, "error": str(e)}

# Upload endpoint
@api_router.post("/uploads/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file and return base64 encoding"""
    try:
        import base64
        
        # Read file content
        file_content = await file.read()
        
        # Verify file is not empty
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Convert to base64
        image_base64 = base64.b64encode(file_content).decode('utf-8')
        
        # Generate filename for reference
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        
        logger.info(f"Image uploaded and encoded: {filename} ({len(file_content)} bytes)")
        
        return {
            "success": True,
            "filename": filename,
            "image_base64": image_base64,
            "size": len(file_content)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Schedule CRUD endpoints
@api_router.post("/schedules", response_model=Schedule)
async def create_schedule(schedule_data: ScheduleCreate):
    """Create a new schedule (pure database operation)"""
    try:
        # Convert HTML to markdown
        markdown = html_to_whatsapp_markdown(schedule_data.message_html)
        
        # Create dict and set message_md
        schedule_dict = schedule_data.dict()
        schedule_dict['message_md'] = markdown
        
        schedule = Schedule(**schedule_dict)
        
        # Simple database insert - no tasks, no futures
        await db.schedules.insert_one(schedule.dict())
        
        logger.info(f"Created schedule {schedule.id} for {schedule.send_at}")
        return schedule
    except Exception as e:
        logger.error(f"Create schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/schedules/bulk", response_model=List[Schedule])
async def create_bulk_schedules(bulk_data: BulkScheduleCreate):
    """Create multiple schedules at once (pure database operation)"""
    try:
        schedules = []
        for schedule_data in bulk_data.schedules:
            markdown = html_to_whatsapp_markdown(schedule_data.message_html)
            schedule_dict = schedule_data.dict()
            schedule_dict['message_md'] = markdown
            schedule = Schedule(**schedule_dict)
            schedules.append(schedule.dict())
        
        if schedules:
            # Simple database insert - no tasks, no futures
            await db.schedules.insert_many(schedules)
        
        logger.info(f"Created {len(schedules)} schedules via bulk add")
        return [Schedule(**s) for s in schedules]
    except Exception as e:
        logger.error(f"Bulk create error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/schedules", response_model=List[Schedule])
async def get_schedules(status: Optional[str] = None, limit: int = 100):
    """Get all schedules with optional status filter (pure database read)"""
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
    """Get a specific schedule (pure database read)"""
    schedule = await db.schedules.find_one({"id": schedule_id})
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return Schedule(**schedule)

@api_router.put("/schedules/{schedule_id}", response_model=Schedule)
async def update_schedule(schedule_id: str, update_data: ScheduleUpdate):
    """Update a schedule (pure database update)"""
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
        
        # Simple database update - no tasks, no futures
        await db.schedules.update_one(
            {"id": schedule_id},
            {"$set": update_dict}
        )
        
        updated_schedule = await db.schedules.find_one({"id": schedule_id})
        logger.info(f"Updated schedule {schedule_id}")
        return Schedule(**updated_schedule)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str):
    """Delete a schedule (pure database delete)"""
    # Simple database delete - no task cancellation needed
    result = await db.schedules.delete_one({"id": schedule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    logger.info(f"Deleted schedule {schedule_id}")
    return {"success": True}

@api_router.post("/schedules/{schedule_id}/retry")
async def retry_schedule(schedule_id: str):
    """Retry sending a failed schedule (pure database update)"""
    try:
        schedule = await db.schedules.find_one({"id": schedule_id})
        if not schedule:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        # Reset status to scheduled and set new send time to now
        # Background worker will pick it up in the next cycle
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
        
        logger.info(f"Retry queued for schedule {schedule_id}")
        return {"success": True, "message": "Schedule queued for retry"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Retry error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# History endpoint (same as schedules but with filters)
@api_router.get("/history", response_model=List[Schedule])
async def get_history(status: Optional[str] = None, limit: int = 100):
    """Get message history (pure database read)"""
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
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

@app.on_event("startup")
async def startup_event():
    """Start the background worker in the same event loop"""
    # Start background worker using asyncio.create_task
    # This ensures it runs in the same event loop as FastAPI
    await worker.start()
    logger.info("Application started with background worker")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown the background worker and close connections"""
    # Stop background worker
    await worker.stop()
    # Close MongoDB connection
    client.close()
    logger.info("Application shut down")
