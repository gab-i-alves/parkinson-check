from datetime import datetime, timedelta, timezone

from api.schemas.token import TokenResponse
from infra.settings import Settings
from jwt import encode

def create_access_token(data: dict) -> TokenResponse:
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=Settings().ACCESS_TOKEN_EXPIRE_MINUTES)
    
    print(data)
    
    data.update({'exp': expire})
    
    encode_jwt = encode(
        data, (Settings()).SECRET_KEY, algorithm=(Settings()).ALGORITHM
    )
    
    return TokenResponse(access_token=encode_jwt, token_type="Bearer")