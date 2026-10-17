import os
from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer

load_dotenv()
api_key = os.getenv("LLM_API_KEY")
if not api_key:
    raise ValueError("API key kaha xa babu??")
client = Groq(api_key=api_key)
model = "openai/gpt-oss-20b"
sys_prompt = "Act as an expert AI engineer as answer the users query."
user_prompt = "What is rag?"
sys_message = {
    "role": "system",
    "content": sys_prompt,
}
user_message = {
    "role": "user",
    "content": user_prompt,
}
messages = [sys_message, user_message]
stream = client.chat.completions.create(model=model, messages=messages, stream=True)
for chunk in stream:
    content = chunk.choices[0].delta.content
    if content is not None:
        print(content, end="", flush=True)
print("Program end")
