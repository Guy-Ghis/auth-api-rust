use axum::extract::State;
use axum::http::header::{COOKIE, SET_COOKIE};
use axum::{http::StatusCode, response::IntoResponse, Json};
use bcrypt::hash_with_salt;
use jsonwebtoken::{encode, EncodingKey, Header};
use rand::{distributions::Alphanumeric, Rng};
use serde_json::json;
use std::collections::HashMap;
use std::sync::Mutex;
use utoipa::OpenApi;

use crate::middleware::auth::Claims;
use crate::models::user::RegisterRequest;
use crate::models::{LoginRequest, LoginResponse, Role};
use crate::AppState;

const JWT_SALT: &[u8; 16] = b"your-secure-salt"; // Use a secure salt in production

static REFRESH_TOKENS: once_cell::sync::Lazy<Mutex<HashMap<String, String>>> =
    once_cell::sync::Lazy::new(|| Mutex::new(HashMap::new()));
const REFRESH_TOKEN_COOKIE: &str = "refresh_token";
const REFRESH_TOKEN_EXPIRY_SECS: i64 = 60 * 60 * 24 * 7; // 7 days

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
        exp: (chrono::Utc::now() + chrono::Duration::minutes(10)).timestamp() as usize,
    };

    let config = state.config.clone();

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_ref()),
    )
    .unwrap();

    // Generate refresh token
    let refresh_token: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(64)
        .map(char::from)
        .collect();
    // Store refresh token -> user email
    REFRESH_TOKENS
        .lock()
        .unwrap()
        .insert(refresh_token.clone(), payload.email.clone());
    let cookie = format!(
        "{}={}; HttpOnly; Path=/; Max-Age={}; SameSite=Lax",
        REFRESH_TOKEN_COOKIE, refresh_token, REFRESH_TOKEN_EXPIRY_SECS
    );

    let mut response = (StatusCode::OK, Json(LoginResponse { token })).into_response();
    response
        .headers_mut()
        .append(SET_COOKIE, cookie.parse().unwrap());
    response
}

#[utoipa::path(
    post,
    path = "/refresh-token",
    responses(
        (status = 200, description = "Token refreshed", body = LoginResponse),
        (status = 401, description = "Invalid refresh token")
    )
)]
pub async fn refresh_token(
    State(state): State<AppState>,
    req: axum::http::Request<axum::body::Body>,
) -> impl IntoResponse {
    let cookies = req
        .headers()
        .get(COOKIE)
        .and_then(|c| c.to_str().ok())
        .unwrap_or("");
    let refresh_token = cookies.split(';').find_map(|cookie| {
        let cookie = cookie.trim();
        if cookie.starts_with(REFRESH_TOKEN_COOKIE) {
            Some(cookie[REFRESH_TOKEN_COOKIE.len() + 1..].to_string())
        } else {
            None
        }
    });
    if let Some(refresh_token) = refresh_token {
        let mut store = REFRESH_TOKENS.lock().unwrap();
        if let Some(email) = store.remove(&refresh_token) {
            // Issue new tokens
            let users = state.users.lock().unwrap();
            if let Some(user) = users.iter().find(|u| u.email == email) {
                let claims = Claims {
                    sub: user.email.clone(),
                    role: user.role.clone(),
                    exp: (chrono::Utc::now() + chrono::Duration::minutes(10)).timestamp() as usize,
                };
                let config = state.config.clone();
                let token = encode(
                    &Header::default(),
                    &claims,
                    &EncodingKey::from_secret(config.jwt_secret.as_ref()),
                )
                .unwrap();
                // Rotate refresh token
                let new_refresh_token: String = rand::thread_rng()
                    .sample_iter(&Alphanumeric)
                    .take(64)
                    .map(char::from)
                    .collect();
                store.insert(new_refresh_token.clone(), email);
                let cookie = format!(
                    "{}={}; HttpOnly; Path=/; Max-Age={}; SameSite=Lax",
                    REFRESH_TOKEN_COOKIE, new_refresh_token, REFRESH_TOKEN_EXPIRY_SECS
                );
                let mut response = (StatusCode::OK, Json(LoginResponse { token })).into_response();
                response
                    .headers_mut()
                    .append(SET_COOKIE, cookie.parse().unwrap());
                return response;
            }
        }
    }
    (
        StatusCode::UNAUTHORIZED,
        Json(json!({"error": "Invalid refresh token"})),
    )
        .into_response()
}
