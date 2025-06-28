// Simple test to verify basic syntax
use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

fn main() {
    let cors = CorsLayer::very_permissive();
    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .layer(cors);
    println!("Basic syntax check passed");
}