import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Room, Message
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from datetime import datetime
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("=====> WebSocket connected")
        access_tocken = self.scope["cookies"].get("access_token")

        # Validate the token and authenticate the user
        try:
            validated_token = await sync_to_async(JWTAuthentication().get_validated_token)(access_tocken)
            self.user = await sync_to_async(JWTAuthentication().get_user)(validated_token)
            self.user_id = self.user.id
        except AuthenticationFailed as e:
            print(f"Authentication failed: {e}")
            await self.close()
            return

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            print(f"Received message: {text_data}")
            data = json.loads(text_data)
            message = data['content']

            # Fetch the User object using the user ID from query params
            user = await sync_to_async(get_user_model().objects.get)(id=self.user_id)
            # username = user.username
            
            timestamp = datetime.now().isoformat()  # You can format this as needed

            # Save message to the database
            room = await sync_to_async(Room.objects.get)(name=self.room_name)
            # await sync_to_async(Message.objects.create)(user=user, room=room, content=message)
            await sync_to_async(Message.objects.create)(user=user, room=room, content=message, timestamp=timestamp)

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    # 'username': username
                    'user_id': self.user_id,  # Include the user ID
                    'timestamp': timestamp
                }
            )
        except Exception as e:
            print(f"An error occurred: {e}")

    async def chat_message(self, event):
        message = event['message']
        # username = event['username']
        user_id = event['user_id']
        timestamp = event['timestamp']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            # 'username': username,
            'message': message,
            'user_id': user_id,
            'timestamp': timestamp
        }))

class UserStatusConsumer(AsyncWebsocketConsumer):
    active_users = {}

    async def connect(self):
        print("=====> WebSocket connected")
        access_token = self.scope["cookies"].get("access_token")
        
        try:
            validated_token = await sync_to_async(JWTAuthentication().get_validated_token)(access_token)
            self.user = await sync_to_async(JWTAuthentication().get_user)(validated_token)
            self.user_id = self.user.id
            
            # Store user connection 
            UserStatusConsumer.active_users[self.user_id] = self.channel_name
            
            await self.channel_layer.group_add("online_users", self.channel_name)
            await self.accept()

            # Ensure active users list is sent every time a user connects
            active_users = UserStatusConsumer.get_active_users()
            await self.send(text_data=json.dumps({
                "type": "active_users_list",
                "active_users": active_users
            }))

            # Broadcast user online status
            await self.channel_layer.group_send(
                "online_users",
                {
                    "type": "user_status",
                    "user_id": self.user_id,
                    "status": "online"
                }
            )
        except AuthenticationFailed:
            print("Authentication failed. Closing WebSocket connection.")
            await self.close()


    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")
        if hasattr(self, 'user_id'):
            UserStatusConsumer.active_users.pop(self.user_id, None)

            await self.channel_layer.group_discard("online_users", self.channel_name)

            # Broadcast user offline status
            await self.channel_layer.group_send(
                "online_users",
                {
                    "type": "user_status",
                    "user_id": self.user_id,
                    "status": "offline"
                }
            )

    async def user_status(self, event):
        # Send status update to client using user_id instead of user
        await self.send(text_data=json.dumps({
            "user_id": event["user_id"],
            "status": event["status"],
            'type': 'user_status'
        }))

    @classmethod
    def get_active_users(cls):
        return list(cls.active_users.keys())
