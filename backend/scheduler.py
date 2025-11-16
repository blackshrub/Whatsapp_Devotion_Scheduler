from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timezone
import pytz
import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from gateway import gateway

logger = logging.getLogger(__name__)

class DevotionScheduler:
    def __init__(self, db):
        self.db = db
        self.scheduler = BackgroundScheduler(timezone=pytz.timezone('Asia/Jakarta'))
        self.scheduler.add_job(
            self.check_and_send_messages,
            IntervalTrigger(minutes=1),
            id='check_messages',
            name='Check and send scheduled messages',
            replace_existing=True
        )
        
    def start(self):
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Scheduler started in Asia/Jakarta timezone")
    
    def shutdown(self):
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler shut down")
    
    def check_and_send_messages(self):
        """Check for due messages and send them"""
        try:
            asyncio.run(self._async_check_and_send())
        except Exception as e:
            logger.error(f"Error in scheduler: {e}")
    
    async def _async_check_and_send(self):
        try:
            now = datetime.now(timezone.utc)
            
            # Find all scheduled messages that are due
            cursor = self.db.schedules.find({
                "status": "scheduled",
                "send_at": {"$lte": now}
            })
            
            schedules = await cursor.to_list(length=100)
            
            for schedule in schedules:
                await self._send_schedule(schedule)
                
        except Exception as e:
            logger.error(f"Error checking messages: {e}")
    
    async def _send_schedule(self, schedule: dict):
        """Send a scheduled message"""
        try:
            # Update status to sending
            await self.db.schedules.update_one(
                {"id": schedule["id"]},
                {"$set": {"status": "sending", "updated_at": datetime.now(timezone.utc)}}
            )
            
            # Send the message
            if schedule.get("image_path"):
                # Send with image
                result = await gateway.send_image_message(
                    phone=schedule["phone"],
                    image_path=schedule["image_path"],
                    caption=schedule.get("message_md", "")
                )
            else:
                # Send text only
                result = await gateway.send_text_message(
                    phone=schedule["phone"],
                    message=schedule.get("message_md", "")
                )
            
            # Update status based on result
            status = "sent" if result.get("code") == "SUCCESS" else "failed"
            await self.db.schedules.update_one(
                {"id": schedule["id"]},
                {
                    "$set": {
                        "status": status,
                        "sent_at": datetime.now(timezone.utc),
                        "gateway_response": result,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            logger.info(f"Message {schedule['id']} sent with status: {status}")
            
        except Exception as e:
            logger.error(f"Error sending schedule {schedule['id']}: {e}")
            await self.db.schedules.update_one(
                {"id": schedule["id"]},
                {
                    "$set": {
                        "status": "failed",
                        "gateway_response": {"error": str(e)},
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
