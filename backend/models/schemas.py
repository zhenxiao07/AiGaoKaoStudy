from pydantic import BaseModel
from typing import Optional

class UserInfo(BaseModel):
    province: str = "广东"
    score: Optional[int] = None
    subject_type: Optional[str] = None
    subject_selection: list[str] = []

class AssessmentAnswer(BaseModel):
    question_id: int
    selected_option: str  # "A" or "B"

class AssessmentSubmit(BaseModel):
    user_info: UserInfo
    answers: list[AssessmentAnswer]

class MajorCard(BaseModel):
    name: str
    score: float
    mbti_match: float
    holland_match: float
    employment_score: float
    avg_salary: str
    employment_rating: str  # "高" | "中" | "低"
    fit_reason: str
    caution: Optional[str] = None
    has_xuefeng: bool = False

class SchoolCard(BaseModel):
    university_id: str
    university_name: str
    city: str
    school_type: list[str]
    major_name: str
    probability: float
    tier: str  # "冲" | "稳" | "保"
    subject_ranking: str
    trend_ranks: list[int]
    is_volatile: bool
    has_xuefeng: bool = False

class AssessmentResult(BaseModel):
    mbti_type: str
    mbti_scores: dict
    holland_scores: dict
    holland_top2: list[str]
    mbti_desc: str
    recommended_majors: list[MajorCard]
    recommended_schools: dict  # {"冲": [...], "稳": [...], "保": [...]}

class SelfAssessSubmit(BaseModel):
    province: str = "广东"
    interests: list[str] = []
    personality: list[str] = []
    holland_scores: dict = {}
    mbti_scores: dict = {}

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    user_info: UserInfo
    mbti_type: str
    top_majors: list[str]
    top_school: str
    messages: list[ChatMessage]
    new_message: str
