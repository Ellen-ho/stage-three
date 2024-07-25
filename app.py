from aifc import Error
from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
import boto3
from botocore.exceptions import NoCredentialsError
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from database import get_db_connection
from nanoid import generate
from io import BytesIO

load_dotenv()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


def upload_to_s3(file: UploadFile, bucket_name: str, object_key: str):
    s3_client = boto3.client('s3')
    try:
        s3_client.upload_fileobj(
            file.file,  
            bucket_name,
            object_key
        )
    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="AWS credentials not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def insert_text_to_rds(text_content: str, object_key: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("INSERT INTO posts (text, object_key) VALUES (%s, %s)", (text_content, object_key))
        conn.commit()
    except Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def get_image_from_s3(bucket_name: str, object_key: str):
    s3_client = boto3.client('s3')
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
        return response['Body'].read()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="File not found")
    
@app.post("/upload")
async def handle_upload(file: UploadFile = File(...), text_content: str = Form(...)):
    bucket_name = os.getenv("BUCKET_NAME")
    unique_filename = generate(size=10) + os.path.splitext(file.filename)[1]
    object_key = f"{os.getenv('OBJECT_NAME_PREFIX')}/{unique_filename}"
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    upload_to_s3(file, bucket_name, object_key)

    insert_text_to_rds(text_content, object_key)
    return JSONResponse(status_code=200, content={"message": "File uploaded successfully"})

@app.get("/posts")
async def get_all_posts():
    cloudfront_domain = os.getenv('CLOUDFRONT_DOMAIN')
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT text, object_key FROM posts")
        posts = cursor.fetchall()
        for post in posts:
            post['image_url'] = f'https://{cloudfront_domain}/{post["object_key"]}'
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
    return posts

@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")