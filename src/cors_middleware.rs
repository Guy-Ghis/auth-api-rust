use axum::{
    body::Body,
    http::{Request, Response, StatusCode, Method, HeaderValue},
    middleware::Next,
    response::IntoResponse,
};

pub async fn cors_middleware(
    request: Request<Body>,
    next: Next,
) -> impl IntoResponse {
    let method = request.method().clone();
    let origin = request.headers().get("origin").cloned();
    
    // Handle preflight requests
    if method == Method::OPTIONS {
        let mut response = Response::builder()
            .status(StatusCode::OK)
            .body(Body::empty())
            .unwrap();
            
        let headers = response.headers_mut();
        
        // Add CORS headers
        if let Some(origin) = origin {
            headers.insert("access-control-allow-origin", origin);
        } else {
            headers.insert("access-control-allow-origin", HeaderValue::from_static("*"));
        }
        
        headers.insert("access-control-allow-methods", HeaderValue::from_static("GET, POST, PUT, DELETE, OPTIONS"));
        headers.insert("access-control-allow-headers", HeaderValue::from_static("authorization, content-type, accept, origin"));
        headers.insert("access-control-allow-credentials", HeaderValue::from_static("true"));
        headers.insert("access-control-max-age", HeaderValue::from_static("86400"));
        
        return response;
    }
    
    // For non-preflight requests, continue to the next middleware/handler
    let mut response = next.run(request).await;
    
    // Add CORS headers to the response
    let headers = response.headers_mut();
    
    if let Some(origin) = origin {
        headers.insert("access-control-allow-origin", origin);
    } else {
        headers.insert("access-control-allow-origin", HeaderValue::from_static("*"));
    }
    
    headers.insert("access-control-allow-credentials", HeaderValue::from_static("true"));
    headers.insert("access-control-expose-headers", HeaderValue::from_static("*"));
    
    response
}