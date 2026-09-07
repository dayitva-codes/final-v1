from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.cadet import Cadet
from app.models.college import College
from app.models.evaluation import Evaluation


def get_leaderboard(db: Session, battalion_id: int | None = None, limit: int = 10) -> list[dict]:
    """
    Ranking is computed at request time from live evaluation data — never stored.
    A stored 'rank' column goes stale the instant a new score comes in.
    """
    query = (
        db.query(
            Cadet.id,
            Cadet.full_name,
            Cadet.enrollment_number,
            College.name.label("college_name"),
            func.avg(Evaluation.score).label("avg_score"),
        )
        .join(Evaluation, Evaluation.cadet_id == Cadet.id)
        .join(College, College.id == Cadet.college_id)
    )

    if battalion_id:
        query = query.filter(College.battalion_id == battalion_id)

    rows = (
        query.group_by(Cadet.id)
        .order_by(func.avg(Evaluation.score).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "rank": i + 1,
            "cadet_id": r.id,
            "full_name": r.full_name,
            "enrollment_number": r.enrollment_number,
            "college_name": r.college_name,
            "average_score": round(r.avg_score, 2),
        }
        for i, r in enumerate(rows)
    ]
