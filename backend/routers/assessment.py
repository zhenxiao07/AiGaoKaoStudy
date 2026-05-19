from fastapi import APIRouter
from data.questions import QUESTIONS
from models.schemas import AssessmentSubmit, SelfAssessSubmit, AssessmentResult
from services.assessment_service import score_assessment, recommend_majors, recommend_majors_from_self_assess
from services.recommendation_service import recommend_schools

router = APIRouter(prefix="/assessment", tags=["assessment"])


@router.get("/questions")
def get_questions():
    return {"questions": QUESTIONS, "total": len(QUESTIONS)}


@router.post("/submit", response_model=AssessmentResult)
def submit_assessment(body: AssessmentSubmit):
    result = score_assessment(body.answers)
    majors = recommend_majors(result["mbti_type"], result["holland_top2"])
    major_names = [m.name for m in majors[:5]]
    schools = recommend_schools(body.user_info, major_names)

    from data.mappings import MBTI_MAJOR_MAP
    mbti_info = MBTI_MAJOR_MAP.get(result["mbti_type"], {})

    return AssessmentResult(
        mbti_type=result["mbti_type"],
        mbti_scores=result["mbti_scores"],
        holland_scores=result["holland_scores"],
        holland_top2=result["holland_top2"],
        mbti_desc=mbti_info.get("desc", ""),
        recommended_majors=majors,
        recommended_schools={
            "冲": [s.model_dump() for s in schools.get("冲", [])],
            "稳": [s.model_dump() for s in schools.get("稳", [])],
            "保": [s.model_dump() for s in schools.get("保", [])],
        },
    )


@router.post("/self-submit", response_model=AssessmentResult)
def self_submit_assessment(body: SelfAssessSubmit):
    result = recommend_majors_from_self_assess(body.holland_scores, body.mbti_scores)

    from models.schemas import UserInfo
    user_info = UserInfo(province=body.province)
    major_names = [m.name for m in result["majors"][:5]]
    schools = recommend_schools(user_info, major_names)

    from data.mappings import MBTI_MAJOR_MAP
    mbti_type = result["mbti_type"]
    mbti_info = MBTI_MAJOR_MAP.get(mbti_type, {})

    return AssessmentResult(
        mbti_type=mbti_type,
        mbti_scores=body.mbti_scores,
        holland_scores=body.holland_scores,
        holland_top2=result["holland_top2"],
        mbti_desc=mbti_info.get("desc", ""),
        recommended_majors=result["majors"],
        recommended_schools={
            "冲": [s.model_dump() for s in schools.get("冲", [])],
            "稳": [s.model_dump() for s in schools.get("稳", [])],
            "保": [s.model_dump() for s in schools.get("保", [])],
        },
    )
