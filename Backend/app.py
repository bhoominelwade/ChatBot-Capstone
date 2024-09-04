from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import uvicorn  # Ensure uvicorn is imported

app = FastAPI()

# Setup CORS middleware for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or the port where your frontend will run
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI server!"}

@app.post("/upload/")
async def upload_files(files: List[UploadFile] = File(...)):
    file_details = []
    for file in files:
        contents = await file.read()  # Read file contents
        file_path = f'./uploaded_files/{file.filename}'  # Define path to save file
        with open(file_path, 'wb') as f:
            f.write(contents)  # Write the contents to a file
        file_details.append({'filename': file.filename, 'filesize': len(contents)})
    return {"message": f"Successfully processed {len(files)} files.", "file_details": file_details}

@app.post("/chat/")
async def chat(message: str):
    # Placeholder for actual chat processing logic
    response = process_chat_message(message)  # Assume this function handles chat logic
    return {"response": response}

def process_chat_message(message: str):
    # Implement your chatbot logic here
    # For now, it just echoes the message
    return f"Chatbot response to the message: {message}"

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
