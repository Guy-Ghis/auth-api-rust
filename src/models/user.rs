use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema, Clone, sqlx::Type, PartialEq)]
#[sqlx(type_name = "role", rename_all = "lowercase")]
pub enum Role {
    Admin,
    User,
}


#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
pub struct User {
    pub id: i32,
    pub email: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub password: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct RegisterRequest {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
}

pub struct RegisterResponse {
    pub id: u32,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct LoginResponse {
    pub token: String,
}

impl From<String> for Role {
    fn from(value: String) -> Self {
        match value.to_lowercase().as_str() {
            "admin" => Role::Admin,
            _ => Role::User, // fallback/default
        }
    }
}
