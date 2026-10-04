import { DecisionAnalysis, RedTeamAnalysis, MindChangeAnalysis, SampleScenario } from './types';

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'hackathon-college',
    label: 'Hackathon vs. College Work',
    category: 'Academic & Career',
    prompt: 'Should I attend this weekend hackathon or stay home and finish my pending college coursework and assignments?',
    sampleMindChangePrompt: 'If I knew my professors would grant a 48-hour extension or that staying home would only net me 4 hours of real focus, I would reconsider skipping the hackathon.'
  },
  {
    id: 'internship-career',
    label: 'Internship Value Doubt',
    category: 'Career Strategy',
    prompt: 'I think this upcoming data internship won’t help my career because the company isn’t a famous tech brand, so I’m thinking of declining it to do self-study.',
    sampleMindChangePrompt: 'I would reconsider declining if I knew I would get meaningful analytics work using SQL and Python with a mentor rather than just cleaning spreadsheets.'
  },
  {
    id: 'startup-vs-bigtech',
    label: 'Seed Startup vs. Return Offer',
    category: 'Career Transition',
    prompt: 'Should I join an early-stage seed startup as the 4th engineer with lower base pay, or accept a stable software engineering return offer at a large tech company?',
    sampleMindChangePrompt: 'It would have to be true that the seed startup has at least 20 months of cash runway and a technical co-founder who actively mentors junior engineers.'
  },
  {
    id: 'pivot-project',
    label: 'Late Architecture Pivot',
    category: 'Product & Engineering',
    prompt: 'We are halfway through our sprint and realized our initial architecture is too complex. Should we scrap our progress and pivot to a simpler approach right now?',
    sampleMindChangePrompt: 'If we could reuse 60% of our existing UI components and isolate the complex bottleneck into a mocked service, I would reconsider scrapping the whole project.'
  }
];

export function generateFallbackAnalysis(decisionText: string, reason?: string): DecisionAnalysis {
  const normalized = decisionText.trim().toLowerCase();

  if (normalized.includes('internship')) {
    return {
      id: `bs-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      decisionInput: decisionText.trim(),
      isFallback: true,
      fallbackReason: reason,
      decisionSnapshot: {
        framing: 'You are evaluating this internship primarily through brand prestige rather than the concrete technical scope, mentorship quality, and market signal of shipped production work.',
        coreTension: 'Structured real-world team experience at a non-brand company versus unstructured, self-directed study with zero external accountability.',
        neutralityNote: 'BLIND SPOT does not recommend accepting or declining the internship. It surfaces what your current framing leaves unexamined.'
      },
      facts: [
        'You have an active internship decision on the table.',
        'The company is not a household big-tech brand.',
        'Your proposed alternative is independent self-study over the same time period.'
      ],
      assumptions: [
        {
          id: 'a1',
          statement: 'A non-famous company brand means the daily engineering or analytics work will be low-leverage.',
          fragility: 'High',
          whyItMatters: 'Mid-sized or non-tech companies often give interns end-to-end ownership of real databases and pipelines, whereas famous brands sometimes isolate interns on toy projects.'
        },
        {
          id: 'a2',
          statement: 'Self-study at home will yield stronger recruiter signal than verified work experience on a resume.',
          fragility: 'High',
          whyItMatters: 'Hiring managers and resume screens heavily weight production experience with stakeholders over unverified solo coursework.'
        },
        {
          id: 'a3',
          statement: 'Accepting the internship prevents you from doing any self-study or side projects.',
          fragility: 'Medium',
          whyItMatters: 'Treating the summer as mutually exclusive ignores the option of working 40 hours while dedicating evenings/weekends to targeted upskilling.'
        }
      ],
      unknowns: [
        'How recruiters in your target next-year recruiting cycle weigh any internship vs. zero internship.',
        'Whether your prospective manager has a track record of converting or mentoring interns.',
        'How disciplined your daily self-study output will remain across 10–12 unstructured weeks.'
      ],
      missingInformation: [
        {
          id: 'm1',
          item: 'Actual technical stack and project charter for the intern role',
          whyNeeded: 'You cannot judge career value without knowing if you will write production SQL/Python or do manual admin tasks.',
          howToFind: 'Email the hiring manager and ask for 2 examples of projects past interns shipped.'
        },
        {
          id: 'm2',
          item: 'Mentorship and code-review structure on the target team',
          whyNeeded: 'Learning velocity depends on who reviews your work, not the logo on the building.',
          howToFind: 'Ask for a 15-minute chat with a current team member before deciding.'
        },
        {
          id: 'm3',
          item: 'Concrete curriculum and accountability mechanism for your self-study alternative',
          whyNeeded: 'Without deliverables and deadlines, "self-study" frequently drifts into low-output browsing.',
          howToFind: 'Draft a week-by-week syllabus with verifiable public artifacts before treating self-study as a real plan.'
        }
      ],
      risks: [
        {
          id: 'r1',
          title: 'Resume Experience Gap Signal',
          severity: 'High',
          description: 'Declining formal experience can leave your resume without professional references or production stories during full-time interviews.'
        },
        {
          id: 'r2',
          title: 'Unstructured Time Drift',
          severity: 'High',
          description: 'Without external deadlines or teammates, solo study plans routinely suffer from motivation decay by week 3.'
        },
        {
          id: 'r3',
          title: 'Low-Scope Intern Work',
          severity: 'Medium',
          description: 'If the role genuinely lacks technical depth, you risk spending 40 hours a week on repetitive tasks.'
        }
      ],
      secondOrderEffects: [
        {
          id: 'so1',
          trigger: 'Working inside a real business domain',
          downstreamImpact: 'Even imperfect company data teaches you how messy production schemas and stakeholder requests actually work—giving you concrete behavioral interview stories.',
          timeframe: '3–9 Months'
        },
        {
          id: 'so2',
          trigger: 'Declining without a structured replacement cohort',
          downstreamImpact: 'Isolation from peers and mentors can increase anxiety and second-guessing throughout the term.',
          timeframe: '1–3 Months'
        }
      ],
      alternativeExplanations: [
        'Your hesitation may stem from status anxiety (comparing logos with peers) rather than an objective assessment of the role’s learning value.',
        'You might be underestimating how much freedom you have inside a non-famous company to propose and automate your own high-impact analytics project.',
        'You may be treating the decision as permanent rather than a 10-week stepping stone that funds and informs your next move.'
      ],
      questionsWorthAsking: [
        {
          id: 'q1',
          lens: 'Pre-Mortem',
          question: 'Imagine it is September and you chose solo self-study, but you feel behind and regretful. What went wrong during the summer?',
          purpose: 'Tests whether your self-study plan relies on idealized willpower.'
        },
        {
          id: 'q2',
          lens: 'Inversion',
          question: 'If you took this internship, how could you proactively engineer the role in week 1 so that you guarantee a strong resume bullet by week 10?',
          purpose: 'Shifts you from passive evaluation to active scope shaping.'
        },
        {
          id: 'q3',
          lens: '10/10/10 Rule',
          question: 'In 10 months during full-time interviews, which story is harder to defend: "Here is how I automated a pipeline at a mid-size firm" or "I studied on my own"?',
          purpose: 'Evaluates external market perception.'
        }
      ],
      keyConsiderationsSummary: [
        'Assumed that company brand prestige equals daily technical learning depth.',
        'Overlooked the high fragility of unstructured solo self-study over a 10-week horizon.',
        'Missing verified facts on the actual tools (SQL/Python/BI) and mentorship available in the role.',
        'Underweighted second-order value of real production stories in future behavioral interviews.'
      ]
    };
  }

  // Default comprehensive fallback (tailored for Hackathon vs College Work or any custom input)
  const isHackathon = normalized.includes('hackathon') || normalized.includes('college');
  const shortTitle = decisionText.trim().length > 85 ? `${decisionText.trim().slice(0, 82)}...` : decisionText.trim();

  return {
    id: `bs-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    decisionInput: decisionText.trim(),
    isFallback: true,
    fallbackReason: reason,
    decisionSnapshot: {
      framing: isHackathon
        ? 'You are framing this as an all-or-nothing collision between attending a high-energy weekend hackathon and fulfilling pending academic coursework.'
        : `You are evaluating "${shortTitle}" primarily through the most salient immediate trade-offs, compressing a multi-dimensional problem into a strict binary choice.`,
      coreTension: isHackathon
        ? 'Immediate academic compliance and deadline safety versus rapid experiential building, peer network compounding, and portfolio proof.'
        : 'Short-term certainty and resource preservation versus long-term optionality, experiential learning, and asymmetric upside.',
      neutralityNote: 'BLIND SPOT never decides for you or declares one option right. This audit exposes what your initial framing leaves out.'
    },
    facts: isHackathon
      ? [
          'The hackathon takes place over a fixed, finite time window.',
          'You have pending college coursework with upcoming academic due dates.',
          'Your total hours and cognitive energy between Friday and Monday are finite.'
        ]
      : [
          `You are actively weighing: "${shortTitle}"`,
          'Choosing either path commits finite time, attention, or capital.',
          'Your current framing presents the dilemma as mutually exclusive options.'
        ],
    assumptions: isHackathon
      ? [
          {
            id: 'a1',
            statement: 'Staying home guarantees 48 hours of high-focus, distraction-free academic completion.',
            fragility: 'High',
            whyItMatters: 'Parkinson’s Law often causes work to expand to fill available time. Without a hard constraint, staying home frequently results in low-density procrastinated effort.'
          },
          {
            id: 'a2',
            statement: 'Attending the hackathon requires sacrificing 100% of your weekend academic progress.',
            fragility: 'Medium',
            whyItMatters: 'You may be ignoring hybrid boundaries—such as knocking out the single highest-weight assignment before Friday evening or time-boxing your hackathon hours.'
          },
          {
            id: 'a3',
            statement: 'All pending college assignments carry equal long-term consequence.',
            fragility: 'Medium',
            whyItMatters: 'Lumping routine 1% homework sets together with major exams distorts the true academic risk profile.'
          }
        ]
      : [
          {
            id: 'a1',
            statement: 'The two options currently in view are the only viable ways to solve the underlying goal.',
            fragility: 'High',
            whyItMatters: 'Binary framing ("Should I do A or B?") locks out hybrid experiments, staged commitments, or scope negotiations.'
          },
          {
            id: 'a2',
            statement: 'Execution on the "safe" option will go smoothly according to your idealized plan.',
            fragility: 'High',
            whyItMatters: 'The Planning Fallacy leads us to compare a realistic risky option against an idealized, friction-free version of the default option.'
          },
          {
            id: 'a3',
            statement: 'Reversing or adjusting course later is harder than it actually is.',
            fragility: 'Medium',
            whyItMatters: 'Treating a two-way door decision as permanent creates unnecessary analysis paralysis.'
          }
        ],
    unknowns: isHackathon
      ? [
          'How much deep-focus coursework you will realistically finish per day if you stay home.',
          'How severely sleep loss at the hackathon will impact your Monday and Tuesday classes.',
          'What unexpected teammate connections or project breakthroughs might emerge at the event.'
        ]
      : [
          'How your energy, constraints, or priorities will shift 30–90 days after making this commitment.',
          'The actual base-rate outcome experienced by peers who faced this exact trade-off.',
          'Which hidden friction points will emerge only after you begin executing.'
        ],
    missingInformation: isHackathon
      ? [
          {
            id: 'm1',
            item: 'Exact syllabus weight and late-penalty policy of each pending assignment',
            whyNeeded: 'You cannot price academic downside without knowing if a delay costs 2% or a full letter grade.',
            howToFind: 'Audit your course syllabi or message the TA to rank assignments by strict grade impact.'
          },
          {
            id: 'm2',
            item: 'Hackathon team expectations around sleep and Sunday commitment',
            whyNeeded: 'A team sleeping 6 hours a night has a vastly lower Monday recovery cost than a 36-hour no-sleep sprint.',
            howToFind: 'Align explicitly with your teammates on schedule boundaries before kicking off.'
          },
          {
            id: 'm3',
            item: 'Your Monday–Wednesday exam and deliverable calendar',
            whyNeeded: 'The true cost of a weekend sprint is felt on Monday and Tuesday morning.',
            howToFind: 'Check next week’s calendar for hard assessments.'
          }
        ]
      : [
          {
            id: 'm1',
            item: 'Explicit kill-criteria or reversal threshold',
            whyNeeded: 'Without knowing in advance what evidence would prove your choice wrong, sunk-cost bias takes over.',
            howToFind: 'Define 2 concrete signals and a specific date on which you will re-evaluate.'
          },
          {
            id: 'm2',
            item: 'Outside-view baseline from someone who took this path recently',
            whyNeeded: 'Internal mental simulation misses mundane operational realities.',
            howToFind: 'Speak for 10 minutes with someone who made a similar choice in the past year.'
          },
          {
            id: 'm3',
            item: 'Minimum viable time/resource floor required for your non-negotiable obligations',
            whyNeeded: 'Prevents overcommitting bandwidth you do not actually possess.',
            howToFind: 'Audit your fixed weekly commitments in hours and dollars.'
          }
        ],
    risks: isHackathon
      ? [
          {
            id: 'r1',
            title: 'Unfocused Guilt-Procrastination at Home',
            severity: 'High',
            description: 'Staying home out of obligation without a time-blocked sprint plan can result in scrolling event updates and finishing neither.'
          },
          {
            id: 'r2',
            title: 'Acute Deadline Collision on Sunday Night',
            severity: 'High',
            description: 'Returning exhausted on Sunday evening with an unstarted high-weight assignment due Monday at 8:00 AM.'
          },
          {
            id: 'r3',
            title: 'Split-Attention Underperformance',
            severity: 'Medium',
            description: 'Attending the hackathon while mentally stressed about homework degrades both your build quality and your team experience.'
          }
        ]
      : [
          {
            id: 'r1',
            title: 'Half-Hearted Execution Drift',
            severity: 'High',
            description: 'Choosing one option while mentally dwelling on the unchosen path frequently produces mediocre results in both.'
          },
          {
            id: 'r2',
            title: 'Underestimated Switching & Coordination Costs',
            severity: 'Medium',
            description: 'Hidden setup time and context-switching overhead often exceed initial optimistic estimates.'
          },
          {
            id: 'r3',
            title: 'Opportunity Lock-In',
            severity: 'Medium',
            description: 'Committing 100% of your bandwidth leaves zero buffer for higher-leverage opportunities.'
          }
        ],
    secondOrderEffects: isHackathon
      ? [
          {
            id: 'so1',
            trigger: 'Pulling an all-nighter at the hackathon',
            downstreamImpact: 'Cognitive fatigue spills into Monday–Wednesday lectures, causing you to fall behind on next week’s material as well.',
            timeframe: 'Next 3–5 Days'
          },
          {
            id: 'so2',
            trigger: 'Shipping a working prototype under pressure with peers',
            downstreamImpact: 'Creates a tangible portfolio artifact and trusted builder relationships that compound across future internships.',
            timeframe: '6–18 Months'
          }
        ]
      : [
          {
            id: 'so1',
            trigger: 'Optimizing strictly for short-term comfort',
            downstreamImpact: 'Narrows your surface area for serendipitous feedback and skill expansion over the next quarter.',
            timeframe: '3–6 Months'
          },
          {
            id: 'so2',
            trigger: 'Over-extending without recovery buffers',
            downstreamImpact: 'Degrades decision quality and baseline energy on subsequent high-priority commitments.',
            timeframe: '1–4 Weeks'
          }
        ],
    alternativeExplanations: isHackathon
      ? [
          'The urgency to stay home may be driven by vague deadline anxiety rather than an itemized calculation of how many hours the homework actually requires.',
          'The pull toward the hackathon might be driven by FOMO rather than a specific learning goal—or conversely, skipping it might be avoidance of the discomfort of building under pressure.',
          'You may be treating a 48-hour scheduling problem as a binary choice instead of front-loading 60% of the coursework before Friday night.'
        ]
      : [
          'You may be anchoring on the first detail you noticed while ignoring quieter day-to-day maintenance realities.',
          'What feels like an external constraint may actually be a self-imposed assumption that hasn’t been negotiated.',
          'Both options might be solving a symptom rather than the root constraint of your schedule or priorities.'
        ],
    questionsWorthAsking: isHackathon
      ? [
          {
            id: 'q1',
            lens: 'Pre-Mortem',
            question: 'It is Sunday night at 10:00 PM. You stayed home all weekend, yet you feel unproductive and regretful. What happened?',
            purpose: 'Exposes whether your "stay home" plan relies on wishful discipline rather than time-blocked execution.'
          },
          {
            id: 'q2',
            lens: 'Inversion',
            question: 'What exact academic deliverable would you need to finish before Friday at 6:00 PM to attend the hackathon with zero guilt?',
            purpose: 'Turns a passive dilemma into an actionable pre-condition.'
          },
          {
            id: 'q3',
            lens: '10/10/10 Rule',
            question: 'How will you view this weekend’s trade-off in 10 days, 10 months, and 10 years?',
            purpose: 'Separates immediate deadline stress from long-term trajectory.'
          }
        ]
      : [
          {
            id: 'q1',
            lens: 'Pre-Mortem',
            question: 'Fast-forward 6 months: the option you are currently leaning toward turned out to be a mistake. What blind spot caused it?',
            purpose: 'Uses prospective hindsight to bypass optimism bias.'
          },
          {
            id: 'q2',
            lens: 'Inversion',
            question: 'What would a third option look like that captures 80% of the upside while capping the worst-case downside?',
            purpose: 'Breaks binary framing.'
          },
          {
            id: 'q3',
            lens: 'Opportunity Cost',
            question: 'What is the smallest 24-hour test you can run right now to gather real evidence before committing?',
            purpose: 'Replaces speculation with empirical data.'
          }
        ],
    keyConsiderationsSummary: isHackathon
      ? [
          'Assumed staying home automatically equals 48 hours of deep, distraction-free academic focus (Planning Fallacy).',
          'Framed the weekend as strictly binary ("100% Hackathon vs. 100% Coursework") without testing hybrid pre-work boundaries.',
          'Missing itemized grade weights and extension policies for the specific assignments due.',
          'Accounted for Saturday/Sunday time, but overlooked second-order Monday–Wednesday cognitive fatigue.'
        ]
      : [
          'Compressed a multi-variable trade-off into a rigid binary choice without exploring hybrid third-way options.',
          'Compared a realistic view of one option against an idealized, friction-free assumption of the alternative.',
          'Identified missing empirical data and unverified stakeholder constraints that can be checked in under 24 hours.',
          'Surfaced downstream second-order ripple effects beyond the immediate decision window.'
        ]
  };
}

export function generateFallbackRedTeam(decisionText: string): RedTeamAnalysis {
  const normalized = decisionText.trim().toLowerCase();
  const isHackathon = normalized.includes('hackathon') || normalized.includes('college');
  const isInternship = normalized.includes('internship');

  if (isInternship) {
    return {
      isFallback: true,
      strongestCounterargument:
        'Dismissing a paid, real-world analytics or engineering internship solely because the company lacks brand recognition trades guaranteed production experience and mentorship for an unverified solo study plan that carries zero institutional signal on a resume.',
      weakPointsInReasoning: [
        'Equating company brand fame with the complexity of its internal data or engineering problems.',
        'Overestimating your ability to maintain 40 hours/week of rigorous, structured self-study in isolation.',
        'Ignoring how automated resume screens filter candidates based on verified work history.'
      ],
      hiddenAssumptionsToChallenge: [
        '"Recruiters value solo online courses more than work at a non-famous company."',
        '"I already know what daily tasks this internship entails without asking the engineering manager."',
        '"Taking the internship means I cannot build portfolio projects on the side."'
      ],
      disprovingEvidence: [
        'The team uses modern SQL, Python, or BI tooling and allows interns to ship production dashboards.',
        'Job descriptions for your target next-year roles explicitly list "1+ prior internship or commercial work experience" as a baseline filter.',
        'Your past unstructured breaks resulted in fewer completed projects than planned.'
      ],
      difficultQuestions: [
        'Are you rejecting the role because of objective technical red flags, or because you feel embarrassed announcing a non-famous company name to peers?',
        'If a recruiter asks in October why you turned down real industry experience to study alone, what verifiable artifact will you show to prove that trade-off paid off?',
        'Have you actually asked the hiring manager if you can scope a high-impact analytics project during the internship?'
      ],
      whatWouldStrengthenReasoning: [
        'Get a written breakdown of the exact tools, dataset scale, and first-month deliverable from the hiring manager.',
        'Compare your decision against feedback from 2 industry mentors rather than peer impressions.',
        'If choosing self-study, establish an external accountability commitment with weekly public deliverables.'
      ]
    };
  }

  return {
    isFallback: true,
    strongestCounterargument: isHackathon
      ? 'You are treating "time at home" as equivalent to "productive work completed," while ignoring that an unconstrained weekend frequently leaks hours to procrastination—and simultaneously overlooking that attending the hackathon unprepared could wreck your Monday-Wednesday academic performance.'
      : 'Your current reasoning relies on a false binary—comparing the best-case scenario of your preferred option against the worst-case scenario of the alternative, without verifying the single biggest unknown variable.',
    weakPointsInReasoning: isHackathon
      ? [
          'Lumping all pending college work into a single undifferentiated block instead of triaging by grade weight and deadline.',
          'Assuming you cannot complete the highest-priority academic task before the hackathon begins.',
          'Ignoring post-event sleep debt and its impact on early-week exams or labs.'
        ]
      : [
          'Relying on internal intuition ("inside view") without checking base-rate outcomes from others.',
          'Treating soft, negotiable constraints as rigid laws of physics.',
          'No pre-defined kill criteria for what would cause you to reverse course.'
        ],
    hiddenAssumptionsToChallenge: isHackathon
      ? [
          '"If I stay home for 48 hours, I will work with high urgency and focus."',
          '"Attending a hackathon requires pulling two all-nighters and abandoning all boundaries."',
          '"My professors or TAs would never grant a brief extension if asked proactively on Thursday."'
        ]
      : [
          '"I must commit 100% to one path today before running a small test."',
          '"The downside of the unfamiliar option is permanent and irreversible."',
          '"My current emotional urgency accurately reflects 12-month impact."'
        ],
    disprovingEvidence: isHackathon
      ? [
          'An audit of your pending coursework shows the mandatory Monday deliverable only takes 3–4 focused hours.',
          'Your past weekend study logs show your productivity drops sharply after 5 hours without an external deadline.',
          'Conversely, your syllabus shows a heavy exam on Monday morning where sleep deprivation would cost more than 10% of your final grade.'
        ]
      : [
          'A 15-minute conversation with a stakeholder reveals a flexible hybrid option exists.',
          'Historical precedent shows the cost of switching back within 30 days is minimal.',
          'Quantifying the worst-case downside in numbers shows it is easily survivable.'
        ],
    difficultQuestions: isHackathon
      ? [
          'If you stay home and waste Saturday afternoon procrastinating, how will you justify having skipped both the hackathon and the deep work?',
          'If you go to the hackathon without finishing your top-priority assignment first, are you being ambitious or just avoiding hard coursework?',
          'Why haven’t you time-boxed a 3-hour sprint tonight to test how fast the coursework actually goes?'
        ]
      : [
          'What uncomfortable truth about this decision are you currently avoiding looking at directly?',
          'If a friend brought you this exact dilemma with the same unverified assumptions, what would you challenge them on first?',
          'Are you optimizing for avoiding short-term discomfort or building long-term leverage?'
        ],
    whatWouldStrengthenReasoning: isHackathon
      ? [
          'List every pending assignment with its exact due date, grade percentage, and realistic hour estimate.',
          'Commit to finishing the #1 mandatory deliverable before Friday evening as a prerequisite.',
          'Set a non-negotiable sleep floor (e.g., 6 hours/night) regardless of which option you choose.'
        ]
      : [
          'Convert vague worries into quantified probabilities and concrete hour/dollar numbers.',
          'Verify the top 2 missing pieces of information before making a final commitment.',
          'Design a hybrid or time-boxed trial option to stress-test your top assumption.'
        ]
  };
}

export function generateFallbackMindChange(decisionText: string, userInput: string): MindChangeAnalysis {
  const cleanUser = userInput.trim();
  const normalized = (decisionText + ' ' + cleanUser).toLowerCase();
  const isInternship = normalized.includes('internship') || normalized.includes('sql') || normalized.includes('analytics');

  if (isInternship) {
    return {
      isFallback: true,
      userThresholdInput: cleanUser,
      summaryObservation:
        'You have identified a concrete decision-changing threshold: whether this role provides substantive hands-on analytics engineering (SQL, Python, BI, and mentorship) rather than routine clerical work.',
      decisionChangingFactors: [
        'Direct ownership of an end-to-end analytics or data pipeline project with measurable business impact.',
        'Daily hands-on usage of production tools (SQL, Python, Power BI / Tableau) on real company datasets.',
        'Active technical mentorship and regular code/query reviews from a senior analyst or engineer.'
      ],
      evidenceToLookFor: [
        'Specific examples of deliverables or dashboards shipped by previous interns on this exact team.',
        'Confirmation of database access permissions and the data stack you will touch in weeks 1–2.',
        'The background and mentorship style of the direct supervisor assigned to you.'
      ],
      questionsToInvestigate: [
        'What specific project or business question will I be responsible for answering during my first 30 days?',
        'Will I be querying production databases with SQL/Python and building BI models, or primarily maintaining manual spreadsheets?',
        'Can I produce a sanitized, measurable project outcome to showcase in my portfolio and resume?',
        'Who will review my technical work each week and provide feedback?'
      ],
      informationCurrentlyMissing: [
        'The team’s actual data maturity and tech stack documentation.',
        'Whether past interns received return offers or strong referrals to top-tier roles afterward.',
        'How much autonomy you will have to automate repetitive workflows once onboarded.'
      ],
      assumptionsToTest: [
        'Test the assumption that "non-famous company = no modern tooling" by asking 3 direct stack questions before deciding.',
        'Test whether the manager is open to tailoring your internship scope around SQL/BI portfolio deliverables.',
        'Test whether your self-study alternative can realistically replicate production stakeholder feedback.'
      ]
    };
  }

  return {
    isFallback: true,
    userThresholdInput: cleanUser,
    summaryObservation: `You have surfaced a testable falsification threshold ("${cleanUser.length > 90 ? cleanUser.slice(0, 87) + '...' : cleanUser}"). Instead of guessing, you can convert this condition into an empirical checklist before deciding.`,
    decisionChangingFactors: [
      'Verified clarity on the true time, effort, or penalty cost of your non-negotiable obligations.',
      'Ability to negotiate a scoped boundary, extension, or hybrid arrangement that removes the all-or-nothing risk.',
      'Concrete proof of whether your baseline alternative will actually be executed with high focus.'
    ],
    evidenceToLookFor: [
      'Written confirmation of deadlines, grace periods, or scope flexibility from stakeholders (professors, managers, or teammates).',
      'Empirical time-tracking from a 2-hour work sprint today to measure your real completion velocity.',
      'Direct commitments from collaborators regarding schedule boundaries and expectations.'
    ],
    questionsToInvestigate: [
      'Which specific part of my current constraint is strictly immovable vs. negotiable with a 5-minute conversation?',
      'How many focused hours does my core obligation actually require if I eliminate all distractions right now?',
      'What concrete guardrail would prevent my worst-case downside scenario from happening?',
      'Can I secure the key condition I just named within the next 24 hours?'
    ],
    informationCurrentlyMissing: [
      'Hard numbers on the exact cost/penalty of a partial or delayed deliverable.',
      'Real velocity data on how fast you progress when working under a strict timer.',
      'Explicit alignment from the other people affected by your choice.'
    ],
    assumptionsToTest: [
      'Test the assumption that constraints are fixed by asking directly for the flexibility or clarity you need.',
      'Test your productivity assumption by running a timed 90-minute deep-work block before making your final call.',
      'Test whether a scoped hybrid approach satisfies both priorities.'
    ]
  };
}
