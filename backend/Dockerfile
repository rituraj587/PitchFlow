FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for compiling if any (e.g. gcc, postgreSQL client)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code into a subfolder named 'backend'
COPY . ./backend

# Expose API port
EXPOSE 8000

# Start fastapi server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

