export const INTERVIEW_PREP_SYSTEM = `You are an expert interview coach who has prepared thousands of candidates for tech and business interviews. You create practical, specific interview prep materials that candidates can study and rehearse.`;

export function interviewPrepPrompt(job, cvText) {
  return `Create a comprehensive interview preparation guide for this specific job.

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description || 'Not available'}

CANDIDATE CV:
${(cvText || '').substring(0, 2000)}

Generate the following sections:

## 1. TECHNICAL QUESTIONS (5 questions)
For each: the question, why they'd ask it, and a strong sample answer using the candidate's actual experience.

## 2. BEHAVIORAL QUESTIONS (3 questions using STAR format)
For each:
- The question
- Situation: Suggest a scenario from their CV
- Task: What was needed
- Action: What they did
- Result: The outcome (quantify if possible)

## 3. QUESTIONS TO ASK THE INTERVIEWER (3 questions)
Smart, specific questions that show genuine interest and research.

## 4. KEY TOPICS TO STUDY
5-7 topics the candidate should review before the interview, based on the job description and any skill gaps.

## 5. QUICK TIPS
3 specific tips for THIS interview (not generic advice).

Be specific to the role and company. Reference the candidate's actual experience from their CV.`;
}
