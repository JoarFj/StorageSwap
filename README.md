# P2P Storage Space Marketplace

A peer-to-peer marketplace for renting out personal storage spaces, built with FastAPI and PostgreSQL.

## Project Overview

This application connects people who have unused storage space with those who need storage solutions. The platform facilitates browsing, booking, and managing storage spaces with these key features:

- User authentication and profile management
- Storage space listing creation and management
- Advanced search with filtering by location, price, and space type
- Booking and payment processing
- Ratings and reviews
- Messaging between hosts and renters
- Admin dashboard for platform management

## Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation and settings management
- **PostgreSQL**: Relational database
- **Alembic**: Database migration tool
- **JWT**: Token-based authentication

### DevOps & Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Container orchestration
- **GitHub Actions**: CI/CD pipeline
- **Prometheus**: Monitoring and metrics
- **Grafana**: Visualization dashboard

## Application Structure

```
app/
├── api/                  # API routes and endpoints
│   └── routes/           # Route handlers
│       ├── users.py
│       ├── listings.py
│       ├── bookings.py
│       ├── reviews.py
│       └── messages.py
├── core/                 # Core functionality
│   ├── config.py         # Application configuration
│   └── security.py       # Auth and security
├── crud/                 # CRUD operations
│   ├── users.py
│   ├── listings.py
│   ├── bookings.py
│   ├── reviews.py
│   └── messages.py
├── db/                   # Database related code
│   └── database.py       # Database connection
├── models/               # SQLAlchemy models
│   └── models.py         # Database models
├── schemas/              # Pydantic models
│   ├── users.py
│   ├── listings.py
│   ├── bookings.py
│   ├── reviews.py
│   └── messages.py
└── main.py               # Application entry point

migrations/               # Alembic migrations
Dockerfile                # Container configuration
docker-compose.yml        # Local Docker setup
k8s/                      # Kubernetes configuration
├── deployment.yaml
├── service.yaml
└── ingress.yaml
.github/workflows/        # CI/CD configuration
├── ci-cd.yml
```

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users` - User registration

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/{user_id}` - Get user by ID
- `PUT /api/users/{user_id}` - Update user

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/{listing_id}` - Get specific listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/{listing_id}` - Update listing
- `DELETE /api/listings/{listing_id}` - Delete listing

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/{booking_id}` - Get specific booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{booking_id}` - Update booking

### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review
- `GET /api/listings/{listing_id}/reviews` - Get listing reviews

## Development Setup

### Prerequisites
- Python 3.11+
- PostgreSQL
- Docker and Docker Compose (optional)

### Local Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/storage-space-api.git
cd storage-space-api
```

2. Set up virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -e .
```

4. Set up environment variables (create a `.env` file)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/storage_space
SECRET_KEY=your_secret_key_here
ENVIRONMENT=development
```

5. Run migrations
```bash
alembic upgrade head
```

6. Start the server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

## Docker Development

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- FastAPI application
- Prometheus for monitoring
- Grafana for visualization

## Deployment

### Docker Deployment

1. Build the Docker image
```bash
docker build -t storage-space-api:latest .
```

2. Run the container
```bash
docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL=your_database_url \
  -e SECRET_KEY=your_secret_key \
  -e ENVIRONMENT=production \
  --name storage-space-api \
  storage-space-api:latest
```

### Kubernetes Deployment

1. Create Kubernetes secrets
```bash
kubectl create secret generic storage-space-secrets \
  --from-literal=DATABASE_URL=your_database_url \
  --from-literal=SECRET_KEY=your_secret_key
```

2. Apply Kubernetes configurations
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### CI/CD Pipeline

The project includes a GitHub Actions workflow that:
1. Runs tests on each push and pull request
2. Builds and pushes Docker image on merges to main
3. Deploys to production environment on successful image build

## Monitoring

- Access the FastAPI Swagger docs: `http://localhost:5000/api/docs`
- Prometheus metrics: `http://localhost:5000/metrics`
- Grafana dashboard: `http://localhost:3000` (if using Docker Compose)

## License

This project is licensed under the MIT License - see the LICENSE file for details.