from django.db import models


class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True)
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question[:50]
