from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import uvicorn

app = FastAPI()

# Setup CORS middleware for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust as necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files and HTML files from the Frontend directory
frontend_directory = os.path.abspath('../Frontend')
app.mount("/static", StaticFiles(directory=frontend_directory), name="static")

# Serve home.html at the root
@app.get("/", response_class=HTMLResponse)
async def root():
    return FileResponse(os.path.join(frontend_directory, 'home.html'))

# Serve admin.html via a specific route
@app.get("/admin.html", response_class=HTMLResponse)
async def admin():
    return FileResponse(os.path.join(frontend_directory, 'admin.html'))

# File upload handling
@app.post("/upload/")
async def upload_files(files: List[UploadFile] = File(...)):
    upload_dir = '../Uploaded files'  # Ensure this path is correct and accessible
    os.makedirs(upload_dir, exist_ok=True)  # Create the directory if it doesn't exist
    
    file_details = []
    for file in files:
        contents = await file.read()  # Read file contents
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, 'wb') as f:
            f.write(contents)  # Save file to disk
        file_details.append({'filename': file.filename, 'filesize': len(contents)})

    return {"message": f"Successfully processed {len(files)} files.", "file_details": file_details}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
