use crate::utils::load_env;
use std::{
    sync::{Arc, Mutex},
    vec,
};

use axum::{
    middleware as axum_middleware,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use sqlx::postgres::PgPoolOptions;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use tracing::info;

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
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    info!("Starting Auth API server...");
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

    // CORS configuration - SIMPLIFIED for immediate fix  
    info!("Configuring CORS with very permissive settings...");
    let cors = CorsLayer::very_permissive();
    info!("CORS configured with very permissive settings");

    // Health check handler
    async fn health_check() -> &'static str {
        "OK"
    }
    
    // Debug endpoint for CORS configuration
    async fn debug_cors() -> Json<serde_json::Value> {
        let is_railway = std::env::var("RAILWAY_ENVIRONMENT").is_ok();
        let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
        Json(json!({
            "status": "CORS debug endpoint working",
            "railway_environment": is_railway,
            "port": port,
            "cors_config": {
                "allowed_origin": "*",
                "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allowed_headers": ["authorization", "content-type", "accept", "origin"],
                "credentials": true
            },
            "timestamp": chrono::Utc::now().to_rfc3339()
        }))
    }
    
    // Fallback handler for debugging
    async fn fallback_handler(uri: axum::http::Uri) -> String {
        info!("Unmatched route: {}", uri);
        format!("No route found for: {}", uri)
    }

    // Public routes: no auth middleware
    let public_routes = Router::new()
        .route("/health", get(health_check))
        .route("/debug/cors", get(debug_cors))
        .route("/login", post(auth::login))
        .route("/register", post(auth::register))
        .route("/refresh-token", post(auth::refresh_token));

    // Protected routes: with auth middleware
    let protected_routes = Router::new()
        .route("/admin", get(protected::admin_route))
        .route("/profile", get(protected::profile_route))
        .layer(axum_middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    let app = Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .fallback(fallback_handler)  // Add fallback for debugging
        .with_state(state)
        .layer(TraceLayer::new_for_http())  // Add request tracing
        .layer(cors);  // CORS layer
    
    info!("Application configured successfully");

    // Use Railway's PORT environment variable or default to 3000
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let bind_address = format!("0.0.0.0:{}", port);
    
    let listener = tokio::net::TcpListener::bind(&bind_address).await.unwrap();
    info!("Server starting on {}", bind_address);
    axum::serve(listener, app).await.unwrap();
}