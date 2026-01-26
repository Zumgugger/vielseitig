"""Twilio SMS integration for admin notifications."""
import logging
from typing import Optional

from app.config import get_settings

logger = logging.getLogger(__name__)


class TwilioClient:
    """SMS client for sending notifications via Twilio."""
    
    def __init__(self):
        settings = get_settings()
        self.account_sid = settings.twilio_account_sid
        self.auth_token = settings.twilio_auth_token
        self.from_number = settings.twilio_from_number
        self.admin_phone = settings.admin_phone_number
        self.enabled = bool(self.account_sid and self.auth_token and self.from_number)
    
    async def send_registration_notification(self, email: str, school_name: str) -> bool:
        """
        Send SMS notification to admin about new user registration.
        
        Returns True if sent successfully, False otherwise or if SMS is disabled.
        """
        if not self.enabled or not self.admin_phone:
            logger.info(f"SMS disabled or no admin phone configured. New registration: {email}")
            return False
        
        try:
            # Import here to avoid hard dependency if Twilio not installed
            from twilio.rest import Client
            
            client = Client(self.account_sid, self.auth_token)
            message = client.messages.create(
                body=f"Neue Registrierung bei Vielseitig:\nEmail: {email}\nSchule: {school_name}",
                from_=self.from_number,
                to=self.admin_phone
            )
            
            logger.info(f"SMS sent to admin: {message.sid}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send SMS notification: {e}")
            # Fail gracefully - registration should not be blocked by SMS failure
            return False


twilio_client = TwilioClient()
