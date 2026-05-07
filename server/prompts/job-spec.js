export const JOB_SPEC_SYSTEM = `You are a recruitment expert who helps candidates decode job specifications. You identify what really matters vs. fluff, spot red flags, and help candidates understand what success looks like in a role.`;

export function jobSpecPrompt(job) {
  return `Analyze and rewrite this job posting in a bold, structured format that highlights what actually matters.

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Type: ${job.job_type || 'Not specified'}
- Salary: ${job.salary || 'Not specified'}
- Description: ${job.description || 'Not available'}

Create a structured analysis with these sections:

## 🔑 KEY REQUIREMENTS (prioritized)
List the actual requirements in priority order. Bold the most critical ones. Separate hard requirements from nice-to-haves.

## ✅ MUST-HAVE vs NICE-TO-HAVE
Split requirements into two clear lists. Be honest about which are truly required vs. wish-list items.

## 💰 COMPENSATION SIGNALS
What the posting reveals about compensation (stated salary, equity mentions, benefits, level indicators).

## 🏢 COMPANY & CULTURE SIGNALS
What the description reveals about working culture, team structure, growth stage.

## 🚩 RED FLAGS (if any)
Unrealistic expectations, vague descriptions, concerning patterns, buzzword overload, etc. Be honest.

## 📊 WHAT SUCCESS LOOKS LIKE
Based on the description, what would a successful first 90 days look like in this role?

## 🎯 APPLICATION STRATEGY
2-3 specific tips for how to stand out when applying for this particular role.`;
}
