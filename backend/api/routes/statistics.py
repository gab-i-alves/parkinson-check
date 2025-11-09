from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.models.users import User
from core.security.security import get_patient_user
from core.services.statistics_service import get_comparative_statistics
from infra.db.connection import get_session

from ..schemas.statistics import ComparativeStatistics

router = APIRouter(prefix="/statistics", tags=["Statistics"])

CurrentPatient = Annotated[User, Depends(get_patient_user())]


@router.get("/comparative", response_model=ComparativeStatistics)
def get_patient_comparative_statistics(
    user: CurrentPatient, session: Session = Depends(get_session)
):
    """
    Retorna estatísticas comparativas do paciente em relação ao sistema.

    Compara o desempenho do paciente com:
    - Média global de todos os pacientes
    - Média da faixa etária do paciente
    - Média por gênero
    - Médias regionais (cidade, estado, país)
    - Percentil do paciente no sistema

    Apenas pacientes que optaram por compartilhar dados (share_data_for_statistics=True)
    são incluídos nos cálculos agregados.

    Requer autenticação de paciente.
    """
    return get_comparative_statistics(session, user)
