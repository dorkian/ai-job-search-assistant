export const CV_ANALYZE_SYSTEM = `You are an expert career strategist and technical recruiter with 20 years of experience across multiple industries. You analyze CVs to extract actionable intelligence for job matching.`;

export function cvAnalyzePrompt(cvText) {
  return `Analyze the following CV and extract structured information for job matching.

CV:
---
${cvText}
---

Return a JSON object with these exact keys:
{
  "skills": ["skill1", "skill2", ...],          // All technical and soft skills found (max 25)
  "jobTitles": ["title1", "title2", ...],        // 5-8 job titles this person is best suited for
  "yearsExperience": 5,                          // Estimated total years of professional experience
  "seniority": "Senior",                         // Junior / Mid / Senior / Lead / Principal / C-Level
  "industry": "Technology",                      // Primary industry background
  "topStrengths": ["strength1", "strength2"],    // Top 3 competitive advantages
  "languages": ["English", "German"],            // Languages spoken
  "education": "BSc Computer Science",           // Highest relevant qualification
  "certifications": ["AWS", "PMP"]               // Professional certifications
}`;
}
