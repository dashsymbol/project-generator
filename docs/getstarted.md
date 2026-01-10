```md
# getstarted.md
Bootstrapping and Running the MVP Skeleton (React + Django API + SQLite) with Docker Support

git remote set-url origin https://dashsymbol@github.com/dashsymbol/project-generator.git

## 1. Objective
Produce a runnable baseline before implementing product features.

Baseline requirements:
1. React frontend renders a placeholder page and can call the API
2. Django API exposes a health endpoint
3. SQLite persistence is enabled
4. Docker images can be built and run via Docker Compose

## 2. Prerequisites
Required:
1. Git
2. Docker Desktop (or Docker Engine with Docker Compose)
3. Node.js LTS (recommended 20.x)
4. Python (recommended 3.12.x)

Optional (for local non Docker Python env management):
1. pipx or virtualenv tooling

## 3. Repository Layout
Target structure:

.
  frontend/
  backend/
  docker-compose.yml
  docker-compose.prod.yml (optional)
  .env.example
  .gitignore
  mvp.md
  getstarted.md

## 4. Backend: Django API (minimal)

### 4.1 Create Django project
From repo root:

    mkdir backend
    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install django djangorestframework django-cors-headers
    django-admin startproject app .
    python manage.py startapp api

### 4.2 Create requirements.txt
Create backend/requirements.txt:

    Django>=5.0,<6.0
    djangorestframework>=3.15,<4.0
    django-cors-headers>=4.3,<5.0
    gunicorn>=22.0,<23.0

Install dependencies:

    pip install -r requirements.txt

### 4.3 Configure settings
Edit backend/app/settings.py

1. Add apps:

    INSTALLED_APPS = [
        "django.contrib.admin",
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.messages",
        "django.contrib.staticfiles",
        "rest_framework",
        "corsheaders",
        "api",
    ]

2. Add middleware (corsheaders near top):

    MIDDLEWARE = [
        "corsheaders.middleware.CorsMiddleware",
        "django.middleware.security.SecurityMiddleware",
        "django.contrib.sessions.middleware.SessionMiddleware",
        "django.middleware.common.CommonMiddleware",
        "django.middleware.csrf.CsrfViewMiddleware",
        "django.contrib.auth.middleware.AuthenticationMiddleware",
        "django.contrib.messages.middleware.MessageMiddleware",
        "django.middleware.clickjacking.XFrameOptionsMiddleware",
    ]

3. Allow local frontend origin for development:

    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",
    ]

4. SQLite database
Django defaults to SQLite. For Docker persistence under a volume, explicitly set:

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": "/app/db/db.sqlite3",
        }
    }

Note:
If running locally (not in Docker), this path may not exist. For local dev you can keep default db.sqlite3, and only switch to /app/db/db.sqlite3 when using Docker. If switching dynamically is required later, handle via environment variables.

### 4.4 Health endpoint
Create backend/api/views.py:

    from rest_framework.decorators import api_view
    from rest_framework.response import Response

    @api_view(["GET"])
    def health(request):
        return Response({"status": "ok"})

Create backend/api/urls.py:

    from django.urls import path
    from .views import health

    urlpatterns = [
        path("health", health),
    ]

Edit backend/app/urls.py:

    from django.contrib import admin
    from django.urls import path, include

    urlpatterns = [
        path("admin/", admin.site.urls),
        path("api/", include("api.urls")),
    ]

### 4.5 Run migrations and start the API
From backend:

    python manage.py migrate
    python manage.py runserver 0.0.0.0:8000

Verify:
Open http://localhost:8000/api/health
Expected JSON: {"status":"ok"}

## 5. Frontend: React (minimal)

### 5.1 Create React app (Vite)
From repo root:

    npm create vite@latest frontend -- --template react
    cd frontend
    npm install

### 5.2 Configure API base URL
Create frontend/.env:

    VITE_API_BASE_URL=http://localhost:8000

### 5.3 Minimal API call
Edit frontend/src/App.jsx:

    import { useEffect, useState } from "react";

    export default function App() {
      const [apiStatus, setApiStatus] = useState("unknown");
      const apiBase = import.meta.env.VITE_API_BASE_URL;

      const checkHealth = () => {
        setApiStatus("checking...");
        fetch(`${apiBase}/api/health`)
          .then((r) => r.json())
          .then((data) => setApiStatus(data.status ?? "invalid"))
          .catch(() => setApiStatus("error"));
      };

      useEffect(() => {
        checkHealth();
      }, [apiBase]);

      return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1>MVP Skeleton</h1>
          <p>API status: {apiStatus}</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={checkHealth}>Test Connection</button>
            <button type="button">Create New Project</button>
          </div>
        </div>
      );
    }

### 5.4 Run frontend
From frontend:

    npm run dev -- --host 0.0.0.0 --port 5173

Verify:
Open http://localhost:5173
Expected: API status is ok

## 6. Docker: Development setup (recommended)

### 6.1 Root environment example
Create .env.example at repo root:

    OPENAI_API_KEY=
    DJANGO_SECRET_KEY=dev-secret-key
    DJANGO_DEBUG=1

Do not commit real secrets. Use a local .env for actual values.

### 6.2 Backend Dockerfile
Create backend/Dockerfile:

    FROM python:3.12-slim

    WORKDIR /app

    ENV PYTHONDONTWRITEBYTECODE=1
    ENV PYTHONUNBUFFERED=1

    RUN pip install --no-cache-dir --upgrade pip

    COPY requirements.txt /app/requirements.txt
    RUN pip install --no-cache-dir -r /app/requirements.txt

    COPY . /app

    EXPOSE 8000

    CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

### 6.3 Frontend Dockerfile (dev)
Create frontend/Dockerfile:

    FROM node:20-alpine

    WORKDIR /app

    COPY package.json package-lock.json* /app/
    RUN npm install

    COPY . /app

    EXPOSE 5173

    CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

### 6.4 Docker Compose (dev)
Create docker-compose.yml at repo root:

    services:
      backend:
        build:
          context: ./backend
        environment:
          DJANGO_DEBUG: "1"
          DJANGO_SECRET_KEY: "dev-secret-key"
        volumes:
          - ./backend:/app
          - backend_db:/app/db
        ports:
          - "8000:8000"
        command: sh -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"

      frontend:
        build:
          context: ./frontend
        environment:
          VITE_API_BASE_URL: "http://localhost:8000"
        volumes:
          - ./frontend:/app
          - /app/node_modules
        ports:
          - "5173:5173"
        depends_on:
          - backend

    volumes:
      backend_db:

Important:
For SQLite persistence inside the Docker volume, backend/app/settings.py must point to /app/db/db.sqlite3 as described in section 4.3.

### 6.5 Run Docker dev
From repo root:

    docker compose up --build

Verify:
1. http://localhost:8000/api/health returns {"status":"ok"}
2. http://localhost:5173 shows API status ok

## 7. Docker: Production oriented setup (optional)
This setup builds:
1. Backend served with gunicorn
2. Frontend built and served with nginx

### 7.1 Backend entrypoint
Create backend/entrypoint.sh:

    #!/bin/sh
    set -e
    python manage.py migrate
    exec gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers 2 --threads 4

Make executable:

    chmod +x backend/entrypoint.sh

Update backend/Dockerfile to use entrypoint:
Replace CMD with:

    CMD ["sh", "/app/entrypoint.sh"]

### 7.2 Frontend production Dockerfile
Create frontend/Dockerfile.prod:

    FROM node:20-alpine AS build
    WORKDIR /app
    COPY package.json package-lock.json* /app/
    RUN npm install
    COPY . /app
    ARG VITE_API_BASE_URL
    ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
    RUN npm run build

    FROM nginx:alpine
    COPY --from=build /app/dist /usr/share/nginx/html
    EXPOSE 80

### 7.3 Docker Compose (prod)
Create docker-compose.prod.yml:

    services:
      backend:
        build:
          context: ./backend
        environment:
          DJANGO_DEBUG: "0"
          DJANGO_SECRET_KEY: "change-me"
        volumes:
          - backend_db:/app/db
        ports:
          - "8000:8000"

      frontend:
        build:
          context: ./frontend
          dockerfile: Dockerfile.prod
          args:
            VITE_API_BASE_URL: "http://localhost:8000"
        ports:
          - "8080:80"
        depends_on:
          - backend

    volumes:
      backend_db:

Run:

    docker compose -f docker-compose.prod.yml up --build

Verify:
1. http://localhost:8000/api/health returns {"status":"ok"}
2. http://localhost:8080 loads the frontend

## 8. Ready to start feature work checklist
1. Django runs and returns ok on /api/health
2. React runs and displays API status ok
3. Docker Compose dev starts both services without manual steps beyond compose up
4. SQLite persistence works (db file exists and is writable)
5. The repository structure matches section 3

## 9. Next Steps after baseline
Implement in this order:
1. GET /api/config/questionnaire (read local config file)
2. GET /api/projects (list existing projects)
3. GET /api/projects/{id} (project detail)
4. POST /api/projects/generate (start as stub returning fixed JSON)
5. Replace stub with Gemini generation with strict JSON validation
```

## 10. Django Admin

### 10.1 Verify Admin Access
The Django Admin is enabled by default. To access it, you need a superuser.

### 10.2 Create Superuser
If you haven't created one yet, run:

    docker compose exec backend python manage.py createsuperuser

Or if running locally:

    cd backend
    python manage.py createsuperuser

### 10.3 Access
1. Open http://localhost:8000/admin/
2. Login with your superuser credentials.
3. You should see groups and users managed by the default authentication system.

Note: A default superuser `admin` / `admin` has been created for convenience.
