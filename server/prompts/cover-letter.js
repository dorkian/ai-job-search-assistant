export const COVER_LETTER_SYSTEM = `You are an expert cover letter writer who has helped thousands of candidates land interviews. You write compelling, personalized, and authentic cover letters that demonstrate genuine interest and specific value.

Rules:
- Never use clichés like "I am writing to express my interest"
- Open with something specific about the company or role
- Match the candidate's strongest skills to the job requirements
- Be confident but not arrogant
- Keep it concise: 3-4 paragraphs, under 350 words
- End with a strong call to action`;

export function coverLetterPrompt(job, cvText, language = 'English') {
  return `Write a professional cover letter for this job application.

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Type: ${job.job_type || 'Not specified'}
- Salary: ${job.salary || 'Not specified'}
- Description: ${job.description || 'Not available'}

CANDIDATE CV:
${(cvText || '').substring(0, 2500)}

Write the cover letter in: ${language}

Format as a ready-to-send letter with:
1. Opening: Hook the reader with something specific about the company/role
2. Value proposition: Match 2-3 of the candidate's strongest skills/experiences to the job
3. Cultural fit: Show understanding of the company's mission or culture
4. Closing: Confident call to action

Do NOT include placeholder brackets like [Your Name]. Use the candidate's actual information from the CV.`;
}
