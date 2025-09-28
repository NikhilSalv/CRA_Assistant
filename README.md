# CRA Assistant FastAPI

A FastAPI-based application for CRA (Clinical Research Associate) Assistant functionality, containerized with Docker for easy deployment.

## Features

- 🚀 FastAPI framework with automatic API documentation
- 🐳 Docker containerization for consistent deployment
- 🔄 Health check endpoints for monitoring
- 📝 Pydantic models for request/response validation
- 🌐 CORS middleware for cross-origin requests
- 🔒 Security best practices with non-root user in container

## API Endpoints

- `GET /` - Root endpoint with basic status
- `GET /health` - Health check endpoint
- `POST /cra/query` - Process CRA-related queries
- `GET /cra/status` - Get CRA system status

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd CRAassistant_FastAPI
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - API: http://localhost:8000
   - Interactive API docs: http://localhost:8000/docs
   - Alternative API docs: http://localhost:8000/redoc

### Option 2: Using Docker directly

1. **Build the Docker image:**
   ```bash
   docker build -t cra-assistant .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8000:8000 cra-assistant
   ```

### Option 3: Local Development

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Development

### Project Structure

```
CRAassistant_FastAPI/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── requirements-dev.txt    # Development dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── .dockerignore          # Docker ignore file
├── .github/workflows/     # GitHub Actions workflows
├── .flake8                # Flake8 configuration
├── pyproject.toml         # Project configuration
├── .pre-commit-config.yaml # Pre-commit hooks
└── README.md              # This file
```

### Code Quality

This project uses several tools to maintain code quality:

- **Black**: Code formatter
- **isort**: Import sorter
- **Flake8**: Linter
- **MyPy**: Type checker
- **Safety**: Security vulnerability checker

#### Running Linters Locally

1. **Install development dependencies:**
   ```bash
   pip install -r requirements-dev.txt
   ```

2. **Run individual linters:**
   ```bash
   # Format code
   black .
   
   # Sort imports
   isort .
   
   # Check linting
   flake8 .
   
   # Type checking
   mypy .
   
   # Security check
   safety check
   ```

3. **Set up pre-commit hooks:**
   ```bash
   pre-commit install
   ```

#### GitHub Actions

The project includes a GitHub Actions workflow that automatically runs all linters on:
- Push to main branch
- Pull requests to main branch

The workflow checks:
- Code formatting (Black)
- Import sorting (isort)
- Linting (Flake8)
- Type checking (MyPy)
- Security vulnerabilities (Safety)
- TODO/FIXME comments

### Adding New Endpoints

1. Define Pydantic models for request/response validation
2. Create route handlers in `main.py`
3. Update this README with new endpoint documentation

### Environment Variables

You can customize the application using environment variables:

- `ENVIRONMENT`: Set to `production` for production deployment
- `PYTHONPATH`: Python path (automatically set in Docker)

## Production Deployment

### Using Docker Compose with Nginx

1. **Run with production profile:**
   ```bash
   docker-compose --profile production up -d
   ```

2. **Create nginx.conf for reverse proxy (optional):**
   ```nginx
   events {
       worker_connections 1024;
   }
   
   http {
       upstream app {
           server cra-assistant:8000;
       }
   
       server {
           listen 80;
           server_name localhost;
   
           location / {
               proxy_pass http://app;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
           }
       }
   }
   ```

### Health Monitoring

The application includes health check endpoints:
- Container health check: Built into Dockerfile
- Application health check: `GET /health`

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 Bug Fixes & Solutions

This section documents critical issues encountered during development and their solutions.

### 1. 🐳 Docker Image Size Ballooning (7GB → 1.6GB)

**Problem:** While deploying to Heroku, the Docker image ballooned to 7GB, making deployment extremely slow and resource-intensive.

**Identification Process:**
- Checked Docker images using `docker images` command
- Identified the massive size increase during Heroku container deployment
- Analyzed the image layers to find the culprit

**Root Cause:** The `sentence-transformers` package automatically pulled in GPU-related dependencies:
- `torch` (PyTorch) - includes CUDA libraries
- `torchvision` - computer vision library with GPU support
- `torchaudio` - audio processing with GPU acceleration
- `transformers` - HuggingFace transformers with GPU dependencies
- `accelerate` - GPU acceleration utilities
- `datasets` - data loading with GPU support

These packages include heavy GPU binaries and CUDA libraries even when running on CPU-only environments.

**Solution:** Explicitly pinned CPU-only stable versions in `requirements.txt`:
```txt
# Force CPU-only PyTorch
torch==2.1.2
torchaudio==2.1.2
torchvision==0.16.2
numpy<2
-f https://download.pytorch.org/whl/cpu/torch_stable.html
```

**Result:** Image size reduced from 7GB back to ~1.6GB, significantly improving deployment speed.

### 2. 🏗️ Architecture Mismatch (ARM64 vs AMD64)

**Problem:** Deployment to Heroku failed with error:
```
unsupported: unsupported architecture arm64
```

**Root Cause:** 
- Local development on MacBook (M1/M2) builds Docker images in ARM64 architecture
- Heroku runs on x86_64 (AMD64) architecture
- Architecture mismatch prevented deployment

**Solution:** Rebuild image with correct platform flag:
```bash
docker build --platform linux/amd64 -t registry.heroku.com/gdpr-assistant-app/web .
```

**Result:** Successful deployment to Heroku infrastructure.

### 3. 🔌 Port Mapping Issue with Heroku

**Problem:** After deployment, application crashed with H10 errors:
```
H10 App crashed
```

**Identification Process:**
- Checked Heroku container logs using `heroku logs --tail`
- Identified that Heroku couldn't route requests to the application
- Discovered port binding issues in the logs

**Root Cause:** 
- Heroku dynamically assigns port via `$PORT` environment variable
- Dockerfile hardcoded port 8000
- Heroku expected the application to bind to the `$PORT` environment variable
- Application failed to start because it couldn't bind to the correct port

**Solution:** Modified Dockerfile to use Heroku-provided port:
```dockerfile
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

**Alternative Python solution:**
```python
import os
port = int(os.getenv("PORT", 8000))
uvicorn.run("main:app", host="0.0.0.0", port=port)
```

**Result:** Application works both locally (default 8000) and on Heroku (dynamic $PORT).

### 4. 📦 NumPy Compatibility Issue (To Be Fixed)

**Problem:** Application crashes with:
```
A module that was compiled using NumPy 1.x cannot be run in NumPy 2.3.3
```

**Root Cause:** 
- Some libraries (sentence-transformers, transformers, scikit-learn) compiled against NumPy 1.x
- Latest NumPy 2.x installed automatically by pip
- Version incompatibility causes runtime errors during import

**Affected Packages:**
- `sentence-transformers` - depends on NumPy 1.x
- `transformers` - compiled against NumPy 1.x
- `scikit-learn` - may have NumPy version conflicts
- `pandas` - often has NumPy version requirements
- `scipy` - scientific computing with NumPy dependencies

**Proposed Solution Approach:**

1. **Pin NumPy Version:**
   ```txt
   numpy>=1.21.0,<2.0.0
   ```

2. **Use Compatible Package Versions:**
   ```txt
   sentence-transformers>=2.2.0,<3.0.0
   transformers>=4.21.0,<5.0.0
   scikit-learn>=1.0.0,<2.0.0
   ```

3. **Alternative: Use NumPy 2.x Compatible Versions:**
   ```txt
   numpy>=2.0.0
   sentence-transformers>=2.7.0  # NumPy 2.x compatible
   transformers>=4.44.0          # NumPy 2.x compatible
   ```

4. **Docker Build Strategy:**
   ```dockerfile
   # Install NumPy first to avoid conflicts
   RUN pip install "numpy>=1.21.0,<2.0.0"
   RUN pip install -r requirements.txt
   ```

**Status:** 🔄 **In Progress** - Requires testing with different NumPy versions to find the most stable combination.

### 5. 🔄 LangChain Dependency Conflicts

**Problem:** Multiple deprecation warnings and import errors:
- `HuggingFaceEmbeddings` deprecation warnings
- `langchainhub` deprecation warnings
- PyTorch compatibility issues with transformers

**Solution:** Updated to use modern LangChain packages:
```txt
langchain-huggingface  # For HuggingFaceEmbeddings
langsmith             # Replaces langchainhub
```

**Result:** Eliminated deprecation warnings and improved compatibility.

---

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change port in docker-compose.yml or use different port
   docker-compose up -p 8001:8000
   ```

2. **Permission issues:**
   ```bash
   # Ensure Docker has proper permissions
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Build failures:**
   ```bash
   # Clean Docker cache and rebuild
   docker system prune -a
   docker-compose build --no-cache
   ```

### Logs

View application logs:
```bash
docker-compose logs -f cra-assistant
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

This project is licensed under the MIT License.
