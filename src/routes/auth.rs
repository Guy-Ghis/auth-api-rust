use axum::extract::State;
use axum::{http::StatusCode, response::IntoResponse, Json};
use bcrypt::hash_with_salt;
use jsonwebtoken::{encode, EncodingKey, Header};
use serde_json::json;
use utoipa::OpenApi;

use crate::middleware::auth::Claims;
use crate::models::user::RegisterRequest;
use crate::models::{LoginRequest, LoginResponse, Role};
use crate::AppState;

const JWT_SALT: &[u8; 16] = b"your-secure-salt"; // Use a secure salt in production

#[derive(OpenApi)]
#[openapi(paths(login), components(schemas(LoginRequest, LoginResponse)))]
pub struct AuthApi;

#[utoipa::path(
    post,
    path = "/register",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "User registered successfully"),
        (status = 400, description = "Bad request")
    )
)]

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    if payload.email.is_empty() || payload.password.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Username and password are required"})),
        )
            .into_response();
    }

    let hashed_password =
        hash_with_salt(payload.password.as_bytes(), bcrypt::DEFAULT_COST, *JWT_SALT).unwrap(); // Use a secure salt in production

    let mut users = state.users.lock().unwrap();

    let new_user = crate::models::User {
        id: users.len() as i32 + 1, // Simple ID generation
        email: payload.email,
        password: hashed_password.to_string(),
        first_name: payload.first_name,
        last_name: payload.last_name,
        role: Role::User,
    };

    users.push(new_user);

    // Simulate user registration
    (
        StatusCode::CREATED,
        Json(json!({"message": "User registered successfully"})),
    )
        .into_response()
}

#[utoipa::path(
    post,
    path = "/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = LoginResponse),
        (status = 401, description = "Invalid credentials")
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    let users = state.users.lock().unwrap();

    let user = users.iter().find(|u| u.email == payload.email);
    if user.is_none()
        || bcrypt::verify(payload.password.as_bytes(), &user.unwrap().password).ok() != Some(true)
    {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "Invalid credentials"})),
        )
            .into_response();
    }
    // In production, verify against a database
    let claims = Claims {
        sub: payload.email.clone(),
        role: user.unwrap().role.clone(),
        exp: (chrono::Utc::now() + chrono::Duration::hours(24)).timestamp() as usize,
    };

    let config = state.config.clone();

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_ref()),
    )
    .unwrap();

    return (StatusCode::OK, Json(LoginResponse { token })).into_response();
}
