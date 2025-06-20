use dotenvy::dotenv;

pub struct Config {
    pub jwt_salt: String,
    pub jwt_secret: String,
    pub jwt_expiration: String,
}

pub fn load_env() -> Config {
    dotenv().ok();

    let jwt_salt = std::env::var("JWT_SALT").unwrap_or_else(|_| {
        panic!("JWT_SALT environment variable is not set");
    });

    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| {
        panic!("JWT_SECRET environment variable is not set");
    });

    let jwt_expiration = std::env::var("JWT_EXPIRATION").unwrap_or_else(|_| {
        panic!("JWT_EXPIRATION environment variable is not set");
    });

    return Config {
        jwt_salt,
        jwt_secret,
        jwt_expiration,
    };
}
