import asyncio
import logging
from typing import List, Dict

from transformers import pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Hugging Face pipelines
try:
    summarizer = pipeline("summarization", model="google/flan-t5-base")
    # Use a text2text-generation pipeline for flashcards
    flashcard_generator = pipeline("text2text-generation", model="google/flan-t5-base")
    logger.info("Hugging Face models loaded successfully.")
except Exception as e:
    summarizer = None
    flashcard_generator = None
    logger.error(f"Failed to load Hugging Face models: {e}. Local fallback will not be available.")

# --- Text Chunking ---
def chunk_text(text: str, max_chunk_size: int = 512) -> List[str]:
    """
    Splits text into chunks suitable for the local model's context window.
    """
    # A simple sentence-based chunking could be more effective
    sentences = text.replace('.', '. ').replace('?', '? ').replace('!', '! ').split()
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < max_chunk_size:
            current_chunk += sentence + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

# --- Gemini CLI Functions ---
async def summarize_text_with_gemini(text: str) -> str:
    """
    Summarizes text using the Gemini CLI.
    """
    process = await asyncio.create_subprocess_shell(
        'gemini -p "Summarize the following text:"',
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate(text.encode('utf-8'))

    if process.returncode != 0:
        raise Exception(f"Gemini CLI error: {stderr.decode('utf-8')}")
    return stdout.decode('utf-8').strip()

async def generate_flashcards_with_gemini(text: str) -> List[Dict[str, str]]:
    """
    Generates flashcards from text using the Gemini CLI.
    """
    flashcard_prompt = f"Generate flashcards (question and answer pairs) from the following text. Format each flashcard as 'Q: [Question]\nA: [Answer]'.\n\n{text}"
    process = await asyncio.create_subprocess_shell(
        'gemini -p "{}"'.format(flashcard_prompt.replace('"', '\"')),
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise Exception(f"Gemini CLI error: {stderr.decode('utf-8')}")

    flashcards_raw = stdout.decode('utf-8').strip()
    generated_flashcards = []
    flashcard_pairs = flashcards_raw.split("Q: ")
    for pair in flashcard_pairs:
        if "A: " in pair:
            question, answer = pair.split("A: ", 1)
            generated_flashcards.append({"question": question.strip(), "answer": answer.strip()})
    return generated_flashcards

# --- Local Hugging Face Functions ---
def summarize_text_with_local_model(text: str) -> str:
    """
    Summarizes text using the local Hugging Face summarizer pipeline.
    """
    if not summarizer:
        raise RuntimeError("Local summarizer model is not available.")
    # The model expects a max length, this can be tuned
    summary_list = summarizer(text, max_length=150, min_length=30, do_sample=False)
    return summary_list[0]['summary_text']

def generate_flashcards_with_local_model(text: str) -> List[Dict[str, str]]:
    """
    Generates flashcards using the local Hugging Face text2text pipeline.
    """
    if not flashcard_generator:
        raise RuntimeError("Local flashcard generator model is not available.")
    
    prompt = f"Generate a question and answer based on this text: {text}"
    # Generate one question-answer pair from the text
    qa_text = flashcard_generator(prompt, max_length=100)[0]['generated_text']
    
    # Basic parsing, this might need to be improved based on model output
    try:
        question, answer = qa_text.split("answer:", 1)
        question = question.replace("question:", "").strip()
        return [{"question": question, "answer": answer.strip()}]
    except ValueError:
        # If parsing fails, return an empty list for this chunk
        logger.warning(f"Could not parse flashcard from local model output: {qa_text}")
        return []

# --- Main Processing Functions (Hybrid Approach) ---
async def process_document_for_summary(document_content: str) -> str:
    """
    Tries to summarize with Gemini CLI, falls back to local model.
    """
    try:
        logger.info("Attempting to summarize with Gemini CLI...")
        # Gemini can handle larger contexts, so we send the whole content
        summary = await summarize_text_with_gemini(document_content)
        logger.info("Successfully summarized with Gemini CLI.")
        return summary
    except Exception as e:
        logger.warning(f"Gemini CLI summarization failed: {e}. Falling back to local model.")
        if not summarizer:
            raise RuntimeError("Gemini CLI failed and local model is not available.")
        
        # Chunk for the local model and summarize
        chunks = chunk_text(document_content)
        summaries = [summarize_text_with_local_model(chunk) for chunk in chunks]
        final_summary = " ".join(summaries)
        logger.info("Successfully summarized with local model.")
        return final_summary

async def process_document_for_flashcards(document_content: str) -> List[Dict[str, str]]:
    """
    Tries to generate flashcards with Gemini CLI, falls back to local model.
    """
    try:
        logger.info("Attempting to generate flashcards with Gemini CLI...")
        # Gemini can handle larger contexts
        flashcards = await generate_flashcards_with_gemini(document_content)
        logger.info("Successfully generated flashcards with Gemini CLI.")
        return flashcards
    except Exception as e:
        logger.warning(f"Gemini CLI flashcard generation failed: {e}. Falling back to local model.")
        if not flashcard_generator:
            raise RuntimeError("Gemini CLI failed and local model is not available.")

        # Chunk for the local model and generate flashcards
        chunks = chunk_text(document_content)
        all_flashcards = []
        for chunk in chunks:
            # Generate one flashcard per chunk to keep it simple
            all_flashcards.extend(generate_flashcards_with_local_model(chunk))
        logger.info(f"Successfully generated {len(all_flashcards)} flashcards with local model.")
        return all_flashcards