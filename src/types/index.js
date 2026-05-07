/**
 * @typedef {Object} CVAnalysis
 * @property {string[]} skills
 * @property {string[]} jobTitles
 * @property {number} yearsExperience
 * @property {string} seniority
 * @property {string} industry
 * @property {string[]} [topStrengths]
 * @property {string[]} [languages]
 * @property {string} [education]
 * @property {string[]} [certifications]
 */

/**
 * @typedef {Object} Settings
 * @property {string} country
 * @property {string} city
 * @property {string} language
 * @property {string[]} jobTypes
 * @property {string} experienceLevel
 * @property {string} salaryMin
 * @property {string} salaryMax
 * @property {string} currency
 * @property {string} industries
 * @property {string} excludeIndustries
 * @property {string[]} platforms
 * @property {string} freshness
 * @property {number} resultCount
 * @property {boolean} autoEnabled
 * @property {number} autoInterval
 */

/**
 * @typedef {Object} GradedJob
 * @property {string} id
 * @property {string} title
 * @property {string} company
 * @property {string} location
 * @property {string} platform
 * @property {string} url
 * @property {string} job_type
 * @property {string} salary
 * @property {string} description
 * @property {string} posted_date
 * @property {string} applicants
 * @property {string} grade - A+, A, A-, B+, B, B-, C+, C, C-, D, F
 * @property {number} overall_score - 0-100
 * @property {number} skills_match - 0-100
 * @property {number} experience_fit - 0-100
 * @property {number} salary_alignment - 0-100
 * @property {number} industry_relevance - 0-100
 * @property {number} location_fit - 0-100
 * @property {number} growth_potential - 0-100
 * @property {string} interview_chance - "🔥 Hot" | "✅ High" | "⚠️ Medium" | "❌ Low"
 * @property {string} why_match
 * @property {string[]} missing_skills
 * @property {string[]} red_flags
 * @property {string} search_id
 */

/**
 * @typedef {Object} Application
 * @property {number} id
 * @property {string} job_id
 * @property {string} status - Saved | Applied | Interview | Offer | Rejected
 * @property {string} notes
 * @property {string[]} tags
 * @property {string} follow_up_date
 * @property {string} cover_letter
 * @property {string} interview_prep
 * @property {string} job_spec
 * @property {string} cv_optimized
 * @property {string} title - from joined job
 * @property {string} company
 * @property {string} grade
 * @property {number} overall_score
 */

/**
 * @typedef {Object} MarketInsights
 * @property {{skill: string, count: number, trend: string}[]} topSkills
 * @property {{min: number, max: number, avg: number, currency: string}} salaryRange
 * @property {string[]} topCompanies
 * @property {string[]} topLocations
 * @property {string[]} hotJobTitles
 * @property {string} marketSummary
 * @property {string[]} hiringTrends
 */

/**
 * @typedef {Object} GapAnalysis
 * @property {{skill: string, frequency: number, priority: string, reason: string}[]} missingSkills
 * @property {string[]} topRecommendations
 * @property {{skill: string, course: string, platform: string, estimatedTime: string, priority: string}[]} courseSuggestions
 * @property {string[]} strengthsToLeverage
 * @property {string} careerPathSuggestion
 */

export {};
