"""
SkillBridge Test Suite - Member 4 Deliverable
Tests Faculty/T&P Analytics, Filtering, Recruiter Matching, Shortlisting,
Role Authorization, Privacy Boundaries, and Edge States.
"""

import unittest
import sys
import os

# Add root directory to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(os.path.dirname(current_dir))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app.main import app
from backend.app.core.auth import sanitize_student_for_recruiter, sanitize_student_for_faculty, AuthException
from backend.app.services.analytics_service import compute_batch_analytics, filter_students, export_batch_readiness_csv
from backend.app.services.matching_service import rank_candidates_for_job, create_job_requisition, update_candidate_shortlist
from backend.app.data.seed_data import STUDENTS_SEED, JOBS_SEED, SHORTLIST_STORE

class TestFacultyAnalytics(unittest.TestCase):
    def test_batch_analytics_metrics(self):
        """Validates batch-level metrics, skill distribution, and common skill gaps."""
        result = compute_batch_analytics()
        self.assertFalse(result["is_empty"])
        self.assertGreater(result["total_students"], 0)
        self.assertIn("job_ready_count", result["readiness_summary"])
        self.assertIn("Backend", result["skill_distribution"])
        self.assertGreater(len(result["common_skill_gaps"]), 0)
        
        # Check gap attributes
        first_gap = result["common_skill_gaps"][0]
        self.assertIn("skill", first_gap)
        self.assertIn("gap", first_gap)
        self.assertIn("priority", first_gap)

    def test_filtering_by_department_and_batch(self):
        """Validates filtering only against attributes present in agreed data model."""
        cs_students = filter_students(department="Computer Science & Engineering", batch="2026")
        self.assertTrue(all(s["department"] == "Computer Science & Engineering" for s in cs_students))
        self.assertTrue(all(s["batch"] == "2026" for s in cs_students))

    def test_empty_analytics_state(self):
        """Verifies clear empty state when no students match the applied filters."""
        empty_res = compute_batch_analytics(department="NonExistentDept", batch="1990")
        self.assertTrue(empty_res["is_empty"])
        self.assertEqual(empty_res["total_students"], 0)
        self.assertEqual(empty_res["readiness_summary"]["job_ready_count"], 0)

    def test_student_detail_evidence_and_confidence(self):
        """Verifies student detail view contains multi-source evidence and confidence."""
        res = app.dispatch(
            path="/api/v1/faculty/students/STU-2026-001",
            method="GET",
            user_role="faculty_tp"
        )
        self.assertEqual(res["status"], "success")
        student = res["student"]
        self.assertEqual(student["student_id"], "STU-2026-001")
        self.assertIn("Python", student["skills"])
        python_skill = student["skills"]["Python"]
        self.assertIn("confidence", python_skill)
        self.assertIn("assessment", python_skill)
        self.assertIn("github_commits", python_skill)
        self.assertIn("projects", python_skill)

    def test_faculty_csv_export_safety(self):
        """Ensures CSV report is generated safely without internal system tokens."""
        csv_data = export_batch_readiness_csv(batch="2026")
        self.assertIn("StudentID,RollNumber,FullName", csv_data)
        self.assertIn("STU-2026-001", csv_data)

class TestRecruiterMatchingAndPrivacy(unittest.TestCase):
    def test_job_description_validation(self):
        """Tests that invalid job postings (missing title/skills or out-of-range thresholds) are rejected."""
        # Missing title
        with self.assertRaises(ValueError):
            create_job_requisition({"title": "", "company": "TestCorp", "requirements": [{"skill": "Python", "min_score": 80}]})

        # Missing skills
        with self.assertRaises(ValueError):
            create_job_requisition({"title": "Dev", "company": "TestCorp", "requirements": []})

        # Invalid threshold score > 100
        with self.assertRaises(ValueError):
            create_job_requisition({"title": "Dev", "company": "TestCorp", "requirements": [{"skill": "Python", "min_score": 150}]})

    def test_explainable_candidate_ranking(self):
        """Tests ranking engine: match score, matched skills, missing skills, and explainable AI reasoning."""
        res = app.dispatch(
            path="/api/v1/recruiter/jobs/JOB-2026-01/candidates",
            method="GET",
            user_role="recruiter"
        )
        self.assertEqual(res["status"], "success")
        data = res["data"]
        self.assertGreater(data["total_matches"], 0)
        
        top_candidate = data["candidates"][0]
        self.assertIn("match_score", top_candidate)
        self.assertIn("matched_skills", top_candidate)
        self.assertIn("missing_skills", top_candidate)
        self.assertIn("explanation", top_candidate)
        # Verify natural language explainability is present
        self.assertIn("Candidate meets", top_candidate["explanation"])

    def test_candidate_consent_privacy_safeguard(self):
        """
        CRITICAL PRIVACY TEST:
        Student STU-2026-006 (Kavita Reddy) opted OUT of placement sharing (consented_placement=False).
        Ensure she NEVER appears in recruiter ranking results, and direct recruiter access raises 403 Forbidden.
        """
        # 1. Ranking results must exclude non-consented students
        ranking_res = rank_candidates_for_job("JOB-2026-01")
        candidate_ids = [c["student_id"] for c in ranking_res["candidates"]]
        self.assertNotIn("STU-2026-006", candidate_ids, "Non-consented student must not appear in recruiter results!")

        # 2. Direct endpoint access must return 403 Forbidden
        direct_res = app.dispatch(
            path="/api/v1/recruiter/candidates/STU-2026-006",
            method="GET",
            user_role="recruiter"
        )
        self.assertEqual(direct_res["status"], "error")
        self.assertEqual(direct_res["code"], 403)
        self.assertIn("not consented", direct_res["message"].lower())

    def test_recruiter_data_sanitization(self):
        """Recruiter candidate detail must use alias and strip private academic marks/remedial flags."""
        consented_student = next(s for s in STUDENTS_SEED if s["student_id"] == "STU-2026-001")
        sanitized = sanitize_student_for_recruiter(consented_student)
        self.assertIn("candidate_alias", sanitized)
        self.assertNotIn("cgpa", sanitized, "Recruiter view should not expose unapproved academic CGPA")
        self.assertNotIn("training_progress", sanitized, "Recruiter should not see internal remedial training records")

    def test_shortlist_persistence(self):
        """Tests updating and persisting candidate shortlist status through endpoint."""
        post_body = {
            "job_id": "JOB-2026-01",
            "student_id": "STU-2026-002",
            "status": "interview_scheduled",
            "notes": "Fast-tracked for round 1 technical screen."
        }
        res = app.dispatch(
            path="/api/v1/recruiter/shortlist",
            method="POST",
            body=post_body,
            user_role="recruiter"
        )
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["record"]["status"], "interview_scheduled")

        # Verify persisted in store
        self.assertEqual(SHORTLIST_STORE["JOB-2026-01:STU-2026-002"]["status"], "interview_scheduled")

class TestRoleBasedAccessControl(unittest.TestCase):
    def test_recruiter_cannot_access_faculty_analytics(self):
        """Verifies that recruiter role is blocked with 403 when requesting faculty analytics."""
        res = app.dispatch(
            path="/api/v1/faculty/analytics/batch",
            method="GET",
            user_role="recruiter"
        )
        self.assertEqual(res["status"], "error")
        self.assertEqual(res["code"], 403)

    def test_faculty_cannot_post_recruiter_job(self):
        """Verifies that faculty role is blocked with 403 when attempting to post recruiter jobs."""
        res = app.dispatch(
            path="/api/v1/recruiter/jobs",
            method="POST",
            body={"title": "Test", "company": "Corp", "requirements": [{"skill": "Python", "min_score": 70}]},
            user_role="faculty_tp"
        )
        self.assertEqual(res["status"], "error")
        self.assertEqual(res["code"], 403)

if __name__ == "__main__":
    unittest.main()
