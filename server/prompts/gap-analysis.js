export const GAP_ANALYSIS_SYSTEM = `You are a career development strategist. You identify skill gaps between a candidate's current abilities and market demands, then create actionable learning plans.`;

export function gapAnalysisPrompt(cvSkills, jobs) {
  return `Identify skill gaps between this candidate and the job market.

CANDIDATE'S CURRENT SKILLS:
${JSON.stringify(cvSkills)}

SKILLS DEMANDED BY JOBS (from ${jobs.length} postings):
${JSON.stringify(jobs.map(j => j.missing_skills || []).flat())}

JOB TITLES FOUND:
${JSON.stringify([...new Set(jobs.map(j => j.title))])}

Return a JSON object:
{
  "missingSkills": [
    {
      "skill": "Kubernetes",
      "frequency": 7,
      "priority": "high",
      "reason": "Required by 7 of 12 matched jobs"
    }
  ],
  "topRecommendations": [
    "Learn Kubernetes — it appears in 60% of your matched jobs and is a key gap",
    "Get AWS Solutions Architect certification to unlock cloud-focused roles"
  ],
  "courseSuggestions": [
    {
      "skill": "Kubernetes",
      "course": "CKA: Certified Kubernetes Administrator",
      "platform": "Udemy / Linux Foundation",
      "estimatedTime": "40-60 hours",
      "priority": "high"
    }
  ],
  "strengthsToLeverage": [
    "Your React expertise is in high demand — 80% of matched roles require it"
  ],
  "careerPathSuggestion": "Brief 2-sentence career direction advice based on gaps and strengths"
}`;
}
