from typing import Dict

from bespoke.db import models
from server.views.common.auth_util import get_claims_payload
from flask_jwt_extended import create_access_token
from sqlalchemy.orm.session import Session

def get_user_access_token(session: Session, user_id: str, company_id: str) -> str:
    user = session.query(models.User).get(user_id)
    claims = get_claims_payload(user, company_id)
    return create_access_token(claims)

def get_user_auth_headers(session: Session, user_id: str, company_id: str) -> Dict:
    access_token = get_user_access_token(session, user_id, company_id)
    return {"Authorization": f"Bearer {access_token}"}
