import asyncio
import logging
from datetime import datetime, timezone
import pytz
from motor.motor_asyncio import AsyncIOMotorDatabase
from gateway import gateway

logger = logging.getLogger(__name__)

class BackgroundWorker:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.running = False
        self.task = None
        
    async def start(self):
        """Start the background worker"""
        if not self.running:
            self.running = True
            self.task = asyncio.create_task(self._worker_loop())
            logger.info("Background worker started")
    
    async def stop(self):
        """Stop the background worker"""
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Background worker stopped")
    
    async def _worker_loop(self):
        """Main worker loop that checks and sends scheduled messages"""
        logger.info("Background worker loop started")
        
        while self.running:
            try:
                await self._check_and_send_messages()
            except Exception as e:
                logger.error(f"Error in worker loop: {e}", exc_info=True)
            
            # Wait 30 seconds before next check
            await asyncio.sleep(30)
    
    async def _check_and_send_messages(self):
        """Check for due messages and send them"""
        try:
            # Get current time in GMT+7
            tz = pytz.timezone('Asia/Jakarta')
            now_utc = datetime.now(timezone.utc)
            now_gmt7 = now_utc.astimezone(tz)
            
            # Find all scheduled messages that are due
            # Compare with UTC time stored in database
            cursor = self.db.schedules.find({
                "status": "scheduled",
                "send_at": {"$lte": now_utc}
            })
            
            schedules = await cursor.to_list(length=100)
            
            if schedules:
                logger.info(f"Found {len(schedules)} messages to send at {now_gmt7}")
            
            for schedule in schedules:
                await self._send_schedule(schedule)
                
        except Exception as e:
            logger.error(f"Error checking messages: {e}", exc_info=True)
    
    async def _send_schedule(self, schedule: dict):
        """Send a single scheduled message"""
        schedule_id = schedule["id"]
        
        try:
            # Update status to sending
            await self.db.schedules.update_one(
                {"id": schedule_id},
                {
                    "$set": {
                        "status": "sending",
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            # Send the message
            phone = schedule["phone"]
            message = schedule.get("message_md", "")
            image_path = schedule.get("image_path")
            
            if image_path:
                # Send with image
                result = await gateway.send_image_message(
                    phone=phone,
                    image_path=image_path,
                    caption=message
                )
            else:
                # Send text only
                result = await gateway.send_text_message(
                    phone=phone,
                    message=message
                )
            
            # Determine final status
            if result.get("code") == "SUCCESS":
                status = "sent"
                logger.info(f"Successfully sent message {schedule_id} to {phone}")
            else:
                status = "failed"
                logger.warning(f"Failed to send message {schedule_id}: {result}")
            
            # Update final status
            await self.db.schedules.update_one(
                {"id": schedule_id},
                {
                    "$set": {
                        "status": status,
                        "sent_at": datetime.now(timezone.utc),
                        "gateway_response": result,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Error sending schedule {schedule_id}: {e}", exc_info=True)
            
            # Mark as failed
            await self.db.schedules.update_one(
                {"id": schedule_id},
                {
                    "$set": {
                        "status": "failed",
                        "gateway_response": {"error": str(e)},
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
