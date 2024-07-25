FROM python:3.8-slim

WORKDIR /app

COPY . /app

RUN pip3 install --no-cache-dir -r /app/requirements.txt

EXPOSE 80

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]