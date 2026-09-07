from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.evaluation import EvaluationCriterion
from app.models.user import RoleEnum, User

DEFAULT_CRITERIA = [
    "drill", "physical_fitness", "communication", "leadership",
    "ncc_knowledge", "discipline", "punctuality", "teamwork", "attendance",
]


def seed(db: Session) -> None:
    if db.query(EvaluationCriterion).count() == 0:
        for name in DEFAULT_CRITERIA:
            db.add(EvaluationCriterion(name=name, max_score=10))
        db.commit()

    if db.query(User).filter(User.role == RoleEnum.admin).count() == 0:
        admin = User(
            email="admin@ncc.local",
            hashed_password=hash_password("admin123"),
            role=RoleEnum.admin,
            is_verified=True,
        )
        db.add(admin)
        db.commit()
        print("Seeded admin login -> email: admin@ncc.local  password: admin123")
