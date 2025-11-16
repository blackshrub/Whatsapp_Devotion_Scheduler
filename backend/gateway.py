import httpx
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class WhatsAppGateway:
    def __init__(self):
        self.base_url = os.environ.get('GATEWAY_BASE_URL', 'http://dermapack.net:3001')
        self.username = os.environ.get('GATEWAY_USER', '')
        self.password = os.environ.get('GATEWAY_PASS', '')
        
    def _get_auth(self) -> Optional[httpx.BasicAuth]:
        if self.username and self.password:
            return httpx.BasicAuth(self.username, self.password)
        return None
    
    async def send_text_message(self, phone: str, message: str) -> Dict[str, Any]:
        """Send text message via WhatsApp gateway"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/send/message",
                    json={
                        "phone": phone,
                        "message": message
                    },
                    auth=self._get_auth()
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to send text message: {e}")
            return {"code": "ERROR", "message": str(e), "results": {}}
    
    async def send_image_message(self, phone: str, image_path: str, caption: str = "") -> Dict[str, Any]:
        """Send image with optional caption via WhatsApp gateway"""
        try:
            # Check if file exists
            import os
            if not os.path.exists(image_path):
                logger.error(f"Image file not found: {image_path}")
                return {"code": "ERROR", "message": f"Image file not found: {image_path}", "results": {}}
            
            logger.info(f"Sending image from path: {image_path} to {phone}")
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                with open(image_path, 'rb') as f:
                    files = {'image': f}
                    data = {
                        'phone': phone,
                        'caption': caption
                    }
                    response = await client.post(
                        f"{self.base_url}/send/image",
                        files=files,
                        data=data,
                        auth=self._get_auth()
                    )
                    response.raise_for_status()
                    return response.json()
        except Exception as e:
            logger.error(f"Failed to send image message: {e}", exc_info=True)
            return {"code": "ERROR", "message": str(e), "results": {}}

gateway = WhatsAppGateway()
