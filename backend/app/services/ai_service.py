import os
from dotenv import load_dotenv
from groq import AsyncGroq, APIConnectionError, APIStatusError, RateLimitError

load_dotenv()

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))


class AIServiceError(Exception):
    pass


async def generate_ai_response(prompt: str) -> str:
    try:
        response = await client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are an AI assistant that helps users organize and manage their tasks."},
                {"role": "user", "content": prompt}
            ],
        )

        return response.choices[0].message.content or ""

    except RateLimitError as error:
        raise AIServiceError("AI service rate limit exceeded") from error

    except APIConnectionError as error:
        raise AIServiceError("Could not connect to AI service") from error

    except APIStatusError as error:
        raise AIServiceError("AI service returned an error") from error