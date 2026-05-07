export const JOB_GRADE_SYSTEM = `You are a strict, data-driven career coach. You grade job-candidate fit using precise metrics across 6 dimensions. Be honest — inflate nothing. Grade like an academic: A+ is exceptional, C is average, F is poor fit.`;

export function jobGradePrompt(cvAnalysis, cvText, jobs) {
  return `Grade each job against this candidate profile.

CANDIDATE PROFILE:
- Skills: ${JSON.stringify(cvAnalysis.skills)}
- Best-fit titles: ${JSON.stringify(cvAnalysis.jobTitles)}
- Years experience: ${cvAnalysis.yearsExperience}
- Seniority: ${cvAnalysis.seniority}
- Industry: ${cvAnalysis.industry}
- Strengths: ${JSON.stringify(cvAnalysis.topStrengths)}

CV EXCERPT (first 1500 chars):
${(cvText || '').substring(0, 1500)}

JOBS TO GRADE:
${JSON.stringify(jobs, null, 1)}

For EACH job, return a JSON object in an array:
[
  {
    "jobIndex": 0,
    "skillsMatch": 85,          // 0-100: % of required skills the candidate has
    "experienceFit": 90,        // 0-100: how well their experience level matches
    "salaryAlignment": 70,      // 0-100: salary fit (estimate if not stated)
    "industryRelevance": 80,    // 0-100: industry match
    "locationFit": 100,         // 0-100: location/remote match
    "growthPotential": 65,      // 0-100: career growth opportunity
    "overall": 82,              // 0-100: weighted average (skills 30%, exp 20%, salary 15%, industry 15%, location 10%, growth 10%)
    "grade": "A-",              // A+/A/A-/B+/B/B-/C+/C/C-/D/F
    "interviewChance": "✅ High", // "🔥 Hot" / "✅ High" / "⚠️ Medium" / "❌ Low"
    "whyGoodMatch": "Strong React skills match with 5+ years experience in SaaS",
    "missingSkills": ["Kubernetes", "GraphQL"],
    "redFlags": ["Salary below market for seniority level"]
  }
]

Rules:
- A+ = 90-100, A = 85-89, A- = 80-84, B+ = 75-79, B = 70-74, B- = 65-69
- C+ = 60-64, C = 55-59, C- = 50-54, D = 40-49, F = below 40
- 🔥 Hot = overall >= 85, ✅ High = 70-84, ⚠️ Medium = 55-69, ❌ Low = below 55
- Be realistic about missing skills — don't assume the candidate knows unlisted tech
- Red flags: unrealistic expectations, vague descriptions, very low pay, etc.`;
}
