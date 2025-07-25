use axum::{extract::Extension, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use std::sync::Arc;
use utoipa::OpenApi;

use crate::models::{Role, User};

#[derive(OpenApi)]
#[openapi(paths(admin_route, profile_route), components(schemas(User)))]
pub struct ProtectedApi;

#[utoipa::path(
    get,
    path = "/admin",
    responses(
        (status = 200, description = "Admin access granted", body = User),
        (status = 403, description = "Forbidden")
    ),
    security(("api_key" = []))
)]
pub async fn admin_route(Extension(user): Extension<Arc<User>>) -> impl IntoResponse {
    let user_role = Role::from(user.role.clone());
    if user_role == Role::Admin {
        (StatusCode::OK, Json(user)).into_response()
    } else {
        (
            StatusCode::FORBIDDEN,
            Json(json!({"error": "Admin access required"})),
        )
            .into_response()
    }
}

#[utoipa::path(
    get,
    path = "/profile",
    responses(
        (status = 200, description = "Current user info", body = User),
        (status = 401, description = "Unauthorized")
    ),
    security(("api_key" = []))
)]
pub async fn profile_route(Extension(user): Extension<Arc<User>>) -> impl IntoResponse {
    (StatusCode::OK, Json(user))
}
