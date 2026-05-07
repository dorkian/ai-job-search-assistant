export const CV_OPTIMIZE_SYSTEM = `You are a CV optimization expert specializing in ATS (Applicant Tracking System) optimization and recruiter psychology. You tailor CVs to specific jobs while keeping them authentic and truthful.`;

export function cvOptimizePrompt(job, cvText) {
  return `Optimize this candidate's CV for this specific job posting.

TARGET JOB:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description || 'Not available'}

CURRENT CV:
${(cvText || '').substring(0, 3000)}

Provide:

## 1. OPTIMIZED PROFESSIONAL SUMMARY
Rewrite the summary/headline (3-4 sentences) specifically tailored to this job. Include relevant keywords from the job description.

## 2. KEY SKILLS TO EMPHASIZE
List the 5-7 skills from their CV that best match this job. Suggest how to reword them to match the job posting's language.

## 3. EXPERIENCE BULLETS TO ADD OR MODIFY
Suggest 3-5 bullet points to add or reword from their experience section. Each should:
- Start with a strong action verb
- Include quantifiable results where possible
- Use keywords from the job description
- Be truthful to their actual experience

## 4. KEYWORDS TO ADD
10-15 ATS-friendly keywords from the job posting that should appear in the CV.

## 5. WHAT TO REMOVE OR DE-EMPHASIZE
Skills or experiences that aren't relevant to this role and could be moved lower or condensed.

## 6. FORMATTING TIPS
2-3 specific formatting suggestions for this particular application.

Important: Only suggest changes that are truthful based on their actual CV content. Never fabricate experience.`;
}
