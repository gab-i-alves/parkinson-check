from fastapi import APIRouter
from core.services import user_service
router = APIRouter(prefix="/user", tags=["User"])
    
@router.get("/{id}")
def get_user_by_id(id: int):
    return user_service.get_user_by_id()

@router.put("/{id}")
def update_user(id: int):
    return user_service.update_user()

#TODO: Verificar se é apenas deleção lógica
@router.delete("/{id}")
def delete_user(id: int):
    return user_service.delete_user()