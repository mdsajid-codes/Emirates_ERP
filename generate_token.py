
import jwt
import datetime
import sys

secret = "h7Xq9LpZ3mRvB2nT6sWdC1yK0fGaU4oE"
payload = {
    "sub": "testadmin",
    "tenantId": "tata5",
    "roles": ["ADMIN", "USER", "WAREHOUSE_MANAGER"],
    "iat": datetime.datetime.utcnow(),
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
