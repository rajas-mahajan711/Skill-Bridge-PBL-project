"""
Resume Skill Extractor Service
Rule-based NLP pipeline for detecting skill candidates in resume/portfolio text.
Marks all extracted items as unverified self-reported candidates.
"""

import re
from typing import List, Dict, Set
from app.schemas import (
    ResumeExtractRequest,
    ResumeExtractResponse,
    ExtractedSkillItem,
)

# Known technical skill taxonomy with synonyms and categories
SKILL_TAXONOMY: Dict[str, Dict[str, any]] = {
    "React": {"synonyms": [r"\breact\b", r"\breact\.js\b", r"\breactjs\b"], "category": "Frontend"},
    "TypeScript": {"synonyms": [r"\btypescript\b", r"\bts\b"], "category": "Languages"},
    "JavaScript": {"synonyms": [r"\bjavascript\b", r"\bjs\b", r"\bes6\b"], "category": "Languages"},
    "HTML5": {"synonyms": [r"\bhtml5?\b"], "category": "Frontend"},
    "CSS3": {"synonyms": [r"\bcss3?\b", r"\btailwind\b", r"\btailwindcss\b", r"\bsass\b"], "category": "Frontend"},
    "Node.js": {"synonyms": [r"\bnode\.?js\b", r"\bnodejs\b"], "category": "Backend"},
    "Express.js": {"synonyms": [r"\bexpress\.?js\b", r"\bexpress\b"], "category": "Backend"},
    "Python": {"synonyms": [r"\bpython\b", r"\bpython3\b"], "category": "Languages"},
    "FastAPI": {"synonyms": [r"\bfastapi\b"], "category": "Backend"},
    "Django": {"synonyms": [r"\bdjango\b"], "category": "Backend"},
    "Flask": {"synonyms": [r"\bflask\b"], "category": "Backend"},
    "MongoDB": {"synonyms": [r"\bmongodb\b", r"\bmongoose\b"], "category": "Database"},
    "PostgreSQL": {"synonyms": [r"\bpostgres\b", r"\bpostgresql\b"], "category": "Database"},
    "MySQL": {"synonyms": [r"\bmysql\b"], "category": "Database"},
    "SQL": {"synonyms": [r"\bsql\b", r"\brdbms\b"], "category": "Database"},
    "Git": {"synonyms": [r"\bgit\b", r"\bgithub\b", r"\bgitlab\b"], "category": "DevOps & Tools"},
    "Docker": {"synonyms": [r"\bdocker\b", r"\bcontainers?\b"], "category": "DevOps & Tools"},
    "Kubernetes": {"synonyms": [r"\bkubernetes\b", r"\bk8s\b"], "category": "DevOps & Tools"},
    "AWS": {"synonyms": [r"\baws\b", r"\bamazon web services\b"], "category": "Cloud"},
    "Azure": {"synonyms": [r"\bazure\b"], "category": "Cloud"},
    "GCP": {"synonyms": [r"\bgcp\b", r"\bgoogle cloud\b"], "category": "Cloud"},
    "REST APIs": {"synonyms": [r"\brest\s*apis?\b", r"\brestful\b"], "category": "Architecture"},
    "GraphQL": {"synonyms": [r"\bgraphql\b"], "category": "Architecture"},
    "Data Structures & Algorithms": {"synonyms": [r"\bdsa\b", r"\bdata structures\b", r"\balgorithms?\b"], "category": "CS Fundamentals"},
    "Machine Learning": {"synonyms": [r"\bmachine learning\b", r"\bml\b", r"\bdeep learning\b"], "category": "AI/Data"},
    "Pandas": {"synonyms": [r"\bpandas\b"], "category": "Data Analysis"},
    "NumPy": {"synonyms": [r"\bnumpy\b"], "category": "Data Analysis"},
    "Linux": {"synonyms": [r"\blinux\b", r"\bubuntu\b", r"\bbash\b"], "category": "Operating Systems"},
}


class ResumeExtractorService:
    @staticmethod
    def extract_skills(request: ResumeExtractRequest) -> ResumeExtractResponse:
        text = request.text_content
        extracted: List[ExtractedSkillItem] = []
        found_skills: Set[str] = set()

        for canonical_name, data in SKILL_TAXONOMY.items():
            category = data["category"]
            for pattern in data["synonyms"]:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    if canonical_name not in found_skills:
                        found_skills.add(canonical_name)
                        extracted.append(
                            ExtractedSkillItem(
                                skill_name=canonical_name,
                                confidence=0.45,  # Provisional text-match confidence
                                matched_term=match.group(0),
                                category=category,
                                source_type="resume_extraction",
                                verification_status="unverified",
                            )
                        )
                    break

        return ResumeExtractResponse(
            success=True,
            extracted_skills=extracted,
            total_extracted=len(extracted),
            notice=(
                "These candidate skills were parsed from resume/text content and remain unverified candidates. "
                "Per platform integrity policies, text extraction alone does not verify proficiency; "
                "independent project, coding platform, or assessment evidence is required."
            ),
        )
