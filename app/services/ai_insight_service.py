import json
import os

from pydantic import BaseModel, ValidationError

from app.schemas.evaluation import CadetScoreSummary


class WeeklyTask(BaseModel):
    focus_area: str
    action: str


class PerformanceInsight(BaseModel):
    weak_areas: list[str]
    plan: list[WeeklyTask]
    summary: str


FALLBACK_INSIGHT = PerformanceInsight(
    weak_areas=["Not enough evaluation data yet"],
    plan=[WeeklyTask(focus_area="General", action="Complete more evaluations to unlock a personalized plan.")],
    summary="Once you have a few evaluations recorded, this insight will generate a tailored weekly plan.",
)


def _build_prompt(scores: list[CadetScoreSummary]) -> str:
    scores_text = "\n".join(
        f"- {s.criterion_name}: {s.average_score}/{s.max_score}" for s in scores
    )
    return f"""You are an NCC training mentor. Based on this cadet's average scores per criterion,
identify the weakest 2-3 areas and produce a short weekly improvement plan.

Scores:
{scores_text}

Respond ONLY with valid JSON matching exactly this shape, no other text:
{{
  "weak_areas": ["string", ...],
  "plan": [{{"focus_area": "string", "action": "string"}}, ...],
  "summary": "one encouraging paragraph"
}}"""


def _call_llm(prompt: str) -> str:
    """
    Isolated so the provider can be swapped (Anthropic <-> OpenAI) or mocked in tests
    without touching the calling code.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")

    import anthropic

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(block.text for block in response.content if hasattr(block, "text"))


def _parse_and_validate(raw: str) -> PerformanceInsight:
    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(cleaned)
    return PerformanceInsight(**data)


def generate_insight(scores: list[CadetScoreSummary]) -> PerformanceInsight:
    if not scores:
        return FALLBACK_INSIGHT

    prompt = _build_prompt(scores)
    try:
        raw = _call_llm(prompt)
        return _parse_and_validate(raw)
    except (RuntimeError, json.JSONDecodeError, ValidationError, Exception):
        # Retry once, then fall back safely rather than ever 500-ing to the client.
        try:
            raw = _call_llm(prompt)
            return _parse_and_validate(raw)
        except Exception:
            return FALLBACK_INSIGHT
