from fastapi import FastAPI, File, Request, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import boto3
from botocore.exceptions import NoCredentialsError
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

load_dotenv()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


def upload_to_s3(file: UploadFile, bucket_name: str, object_name: str):
    s3_client = boto3.client('s3')
    try:
        s3_client.upload_fileobj(
            file.file,  
            bucket_name,
            object_name
        )
    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="AWS credentials not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/upload")
async def handle_upload(file: UploadFile = File(...)):
    bucket_name = os.getenv("BUCKET_NAME")
    object_name = f"{os.getenv('OBJECT_NAME_PREFIX')}/{file.filename}"
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    upload_to_s3(file, bucket_name, object_name)
    return JSONResponse(status_code=200, content={"message": "File uploaded successfully"})

@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")