use crate::utils::load_env;
use std::{
    sync::{Arc, Mutex},
    vec,
};

use axum::{
    http::{Method, HeaderValue},
    routing::{get, post},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

pub mod middleware;
pub mod models;
pub mod routes;
pub mod utils;

use crate::{
    middleware::auth::auth_middleware,
    routes::{auth, protected},
};

#[derive(Debug, Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub config: Arc<utils::Config>,
    pub users: Arc<Mutex<Vec<models::User>>>,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let db_pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&std::env::var("DATABASE_URL").unwrap())
        .await
        .expect("Failed to connect to DB");

    #[derive(OpenApi)]
    #[openapi(
        info(title = "Auth API", description = "A simple auth API"),
        paths(
            auth::login,
            protected::admin_route,
            protected::profile_route,
            auth::register,
            auth::refresh_token
        ),
        components(schemas(
            models::User,
            models::Role,
            models::LoginRequest,
            models::LoginResponse,
            models::user::RegisterRequest
        ))
    )]
    struct ApiDoc;

    let state = AppState {
        db: db_pool,
        config: Arc::new(load_env()),
        users: Arc::new(Mutex::new(vec![])),
    };

    // CORS configuration to handle preflight requests properly
    let cors = CorsLayer::new()
        // Allow specific origins
        .allow_origin([
            "https://auth-api-frontend.vercel.app".parse::<HeaderValue>().unwrap(),
            "http://localhost:3000".parse::<HeaderValue>().unwrap(),
            "http://localhost:5173".parse::<HeaderValue>().unwrap(),
            "http://127.0.0.1:3000".parse::<HeaderValue>().unwrap(),
            "http://127.0.0.1:5173".parse::<HeaderValue>().unwrap(),
        ])
        // Allow all necessary methods including OPTIONS for preflight
        .allow_methods([
            Method::GET, 
            Method::POST, 
            Method::PUT, 
            Method::DELETE, 
            Method::OPTIONS,
            Method::HEAD
        ])
        // Allow all necessary headers
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::ACCEPT,
            axum::http::header::CONTENT_TYPE,
            axum::http::header::ORIGIN,
            axum::http::header::ACCESS_CONTROL_REQUEST_METHOD,
            axum::http::header::ACCESS_CONTROL_REQUEST_HEADERS,
        ])
        // Allow credentials for authentication
        .allow_credentials(true);

    // Health check handler
    async fn health_check() -> &'static str {
        "OK"
    }

    // Public routes: no auth middleware
    let public_routes = Router::new()
        .route("/health", get(health_check))
        .route("/login", post(auth::login))
        .route("/register", post(auth::register))
        .route("/refresh-token", post(auth::refresh_token));

    // Protected routes: with auth middleware
    let protected_routes = Router::new()
        .route("/admin", get(protected::admin_route))
        .route("/profile", get(protected::profile_route))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    let app = Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .with_state(state)
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
