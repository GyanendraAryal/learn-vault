from unittest.mock import patch

from django.test import TestCase


class LibraryAPITests(TestCase):
    @patch(
        "chatbot.views._list_library_videos",
        return_value=[
            {
                "video_id": "example",
                "chunk_count": 3,
                "start": 0,
                "end": 120,
                "youtube_url": "https://www.youtube.com/watch?v=example",
            }
        ],
    )
    def test_library_returns_indexed_videos(self, list_videos):
        response = self.client.get("/api/v1/library/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["videos"]), 1)
        self.assertEqual(response.json()["videos"][0]["video_id"], "example")
        list_videos.assert_called_once_with()
