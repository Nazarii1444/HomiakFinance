from fastapi.security import HTTPBearer

bearer_scheme = HTTPBearer(bearerFormat="JWT", scheme_name="AccessToken")
