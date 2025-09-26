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
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── .dockerignore          # Docker ignore file
└── README.md              # This file
```

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
