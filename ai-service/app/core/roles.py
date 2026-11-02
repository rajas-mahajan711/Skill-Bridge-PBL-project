"""
SkillBridge AI Service — Benchmark Role Catalog
================================================
Defines standard college placement benchmark profiles.
All required skills are strictly canonical names from SKILLS_TAXONOMY.
"""

from typing import Dict, List
from app.core.taxonomy import SKILLS_TAXONOMY

# ── Curated benchmark placement roles ───────────────────────────────────────
# Every skill string strictly matches a canonical key in SKILLS_TAXONOMY
BENCHMARK_ROLES: Dict[str, List[str]] = {
    "Frontend Developer": [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
        "TypeScript",
        "Tailwind CSS",
    ],
    "Backend Developer": [
        "Python",
        "FastAPI",
        "PostgreSQL",
        "Docker",
        "REST API",
        "Git",
    ],
    "Full Stack Developer": [
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "JavaScript",
        "Git",
    ],
    "Data Scientist / ML Engineer": [
        "Python",
        "Machine Learning",
        "Data Structures",
        "SQL",
        "Deep Learning",
    ],
    "DevOps Engineer": [
        "Docker",
        "Linux",
        "AWS",
        "Git",
        "Python",
        "REST API",
    ],
}


def get_benchmark_roles() -> Dict[str, List[str]]:
    """Return a copy of all benchmark roles."""
    return {role: list(skills) for role, skills in BENCHMARK_ROLES.items()}


def get_benchmark_role_skills(role_name: str) -> List[str]:
    """Retrieve requirements for a standard benchmark role (case-insensitive)."""
    normalized = role_name.strip().lower()
    for name, reqs in BENCHMARK_ROLES.items():
        if name.lower() == normalized:
            return list(reqs)
    raise ValueError(
        f"Unknown benchmark role '{role_name}'. Available roles: {list(BENCHMARK_ROLES.keys())}"
    )


# Self-validation at import time to guarantee all skills exist in SKILLS_TAXONOMY
for _role, _skills in BENCHMARK_ROLES.items():
    for _skill in _skills:
        assert _skill in SKILLS_TAXONOMY, f"Benchmark skill '{_skill}' not found in SKILLS_TAXONOMY"

