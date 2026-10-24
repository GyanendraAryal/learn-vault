import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import ChatBotSerializer

import logging

logger = logging.getLogger(__name__)


def _generate_answer(question):
    from rag import generate_answer

    return generate_answer(question)


def _list_library_videos():
    from rag import list_library_videos

    return list_library_videos()


class ChatAPIView(APIView):
    def post(self, request):
        serializer = ChatBotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"]

        try:
            result = _generate_answer(question)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("RAG answer generation failed")
            return Response(
                {"error": "An error occurred while generating the answer."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LibraryAPIView(APIView):
    def get(self, request):
        try:
            return Response({"videos": _list_library_videos()})
        except Exception:
            logger.exception("Lecture library retrieval failed")
            return Response(
                {"error": "An error occurred while loading the lecture library."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
