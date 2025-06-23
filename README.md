# auth-api-rust

A simple authentication API built with Rust and [Axum](https://github.com/tokio-rs/axum), supporting JWT-based authentication, user registration, and role-based access control. The API is documented with Swagger (OpenAPI) and is suitable for learning, prototyping, or as a starting point for more advanced authentication systems.

## Features

- **User Registration**: Register with a first name, last name, email, and password. All new users are assigned the `User` role.
- **User Login**: Obtain a JWT token by providing valid credentials.
- **Role-based Access**:
  - `/admin` route accessible only to users with the `Admin` role.
- **JWT Authentication**: All protected routes require a valid JWT in the `Authorization` header.
- **In-memory User Store**: Users are stored in memory (no persistent database).
- **Swagger UI**: Interactive API documentation available at `/swagger-ui`.

---

## Endpoints

### `POST /register`

Register a new user.

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Minimal Request Body (if only email and password are required):**

```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response:**

- `201 Created` on success
- `400 Bad Request` if required fields are missing

**Example curl command:**

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "yourpassword"
  }'
```

---

### `POST /login`

Authenticate a user and receive a JWT.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response:**

- `200 OK` with `{ "token": "..." }` on success
- `401 Unauthorized` on failure

**Example curl command:**

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "yourpassword"
  }'
```

---

### `GET /admin`

Accessible only to users with the `Admin` role.

**Headers:**

- `Authorization: Bearer <JWT>`

**Response:**

- `200 OK` with user info if authorized
- `403 Forbidden` if not an admin

**Example curl command:**

```bash
curl -X GET http://localhost:3000/admin \
  -H "Authorization: Bearer <your_token_here>"
```

---

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html)

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
JWT_SECRET=your-secret-key
JWT_SALT=your-salt-16bytes
JWT_EXPIRATION=86400
```

- `JWT_SECRET`: Secret key for signing JWTs.
- `JWT_SALT`: 16-byte salt for password hashing.
- `JWT_EXPIRATION`: Token expiration in seconds (e.g., `86400` for 24 hours).

### Running the Server

```bash
cargo run
```

The API will be available at `http://localhost:3000`.

### API Documentation

Visit [http://localhost:3000/swagger-ui](http://localhost:3000/swagger-ui) for interactive API docs.

---

## Notes

- **Persistence**: All users are stored in memory. Restarting the server will reset all users.
- **Admin User**: You may want to manually add an admin user in the code for testing the `/admin` route.
- **Production Use**: This project is for demonstration and learning. For production, use a persistent database, secure password handling, and proper JWT secret management.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
