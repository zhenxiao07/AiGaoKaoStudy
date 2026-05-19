from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

from services.gaokao_service import (
    gaokao_provinces,
    gaokao_recommend,
    gaokao_search,
    gaokao_subjects,
)
from data.gaokao_db import db_ready

router = APIRouter(prefix="/gaokao", tags=["gaokao"])


class GaokaoRecommendRequest(BaseModel):
    province: str
    subject_type: str                  # "文科" | "理科"
    score: Optional[int] = None
    batches: list[str] = ["本科一批", "本科二批"]
    top_n: int = 30
    target_majors: list[str] = []      # 为空=只看学校线; 非空=过滤掉无法满足这些专业录取线的学校


@router.get("/status")
def get_status():
    return {"db_ready": db_ready()}


@router.get("/provinces")
def get_provinces():
    return {"provinces": gaokao_provinces()}


@router.get("/subjects")
def get_subjects(province: str = Query(...)):
    return {"subjects": gaokao_subjects(province)}


@router.post("/recommend")
def recommend(body: GaokaoRecommendRequest):
    results = gaokao_recommend(
        province=body.province,
        subject_type=body.subject_type,
        score=body.score,
        batches=body.batches,
        top_n=body.top_n,
        target_majors=body.target_majors,
    )
    return {
        "province": body.province,
        "subject_type": body.subject_type,
        "score": body.score,
        "results": results,
    }


@router.get("/search")
def search_schools(q: str = Query(..., min_length=1)):
    return {"schools": gaokao_search(q)}
