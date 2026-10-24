from .models import ChatMessage
from rest_framework.serializers import Serializer
from rest_framework import serializers


class ChatBotSerializer(Serializer):
    question = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        max_length=1000,
    )
