/*
  # Populate Housing Law Articles

  1. Data Population
    - Inserts 14 comprehensive Housing Law articles
    - Each article includes full HTML content
    - Articles cover tenant rights, eviction, security deposits, and more

  2. Content Details
    - Articles are written in plain English for non-lawyers
    - Each includes practical advice and legal information
    - Content is formatted with proper HTML headings, lists, and blockquotes
*/

INSERT INTO ezreads_articles (slug, title, excerpt, content, category, read_time, image_url, is_featured, published_at)
VALUES
(
  'tenant-protection-laws',
  'Understanding Your Rights: A Complete Guide to Tenant Protection Laws',
  'Learn about your rights as a tenant, from security deposits to eviction protection. This comprehensive guide breaks down complex housing laws into plain English.',
  '<p class="text-lg font-medium text-slate-800 mb-6">As a tenant, you have significant legal protections that many landlords hope you never discover. This guide breaks down your fundamental rights in plain English.</p>

<h2>Your Core Tenant Rights</h2>
<p>Every tenant in the United States has certain baseline rights, though specific protections vary by state and city. Here are the rights that apply almost everywhere:</p>

<ul>
<li><strong>Right to a habitable dwelling</strong> - Your landlord must provide a safe, livable home with working plumbing, heating, and electricity</li>
<li><strong>Right to privacy</strong> - Landlords cannot enter your home without proper notice (usually 24-48 hours) except in emergencies</li>
<li><strong>Right to security deposit return</strong> - You are entitled to get your deposit back, minus legitimate deductions, within a specific timeframe</li>
<li><strong>Protection from retaliation</strong> - Your landlord cannot punish you for exercising your legal rights</li>
<li><strong>Protection from discrimination</strong> - The Fair Housing Act prohibits discrimination based on race, color, religion, sex, national origin, disability, or family status</li>
</ul>

<h2>The Warranty of Habitability</h2>
<p>This is perhaps your most powerful protection. The warranty of habitability requires landlords to maintain rental properties in a condition fit for human habitation. This includes:</p>

<ul>
<li>Structural integrity (roof, walls, floors)</li>
<li>Working plumbing and hot water</li>
<li>Adequate heating (and cooling in some states)</li>
<li>Freedom from pest infestations</li>
<li>Working smoke and carbon monoxide detectors</li>
<li>Safe electrical systems</li>
<li>Proper garbage disposal facilities</li>
</ul>

<blockquote>
<strong>Important:</strong> If your landlord fails to maintain habitability, you may have the right to withhold rent, repair and deduct, or even break your lease without penalty. However, these remedies have specific requirements - document everything and consider consulting with a tenant rights organization first.
</blockquote>

<h2>Rent Control and Stabilization</h2>
<p>Some cities and states have rent control or rent stabilization laws that limit how much your landlord can increase rent each year. If you live in a rent-controlled unit, you have additional protections:</p>

<ul>
<li>Limits on annual rent increases (often tied to inflation)</li>
<li>Restrictions on when and how landlords can evict you</li>
<li>Right to renew your lease in most circumstances</li>
</ul>

<h2>What to Do When Your Rights Are Violated</h2>
<p>If you believe your landlord has violated your rights, follow these steps:</p>

<ol>
<li><strong>Document everything</strong> - Take photos, save emails and texts, and keep a written log of all incidents</li>
<li><strong>Send written notice</strong> - Many states require you to notify your landlord in writing before taking other action</li>
<li><strong>Know your deadlines</strong> - Landlords typically have a specific number of days to respond to repair requests</li>
<li><strong>Contact local resources</strong> - Many cities have tenant rights hotlines and legal aid organizations</li>
<li><strong>File complaints when appropriate</strong> - Health code violations can be reported to local housing authorities</li>
</ol>

<h2>Resources for Tenants</h2>
<p>If you need help understanding or enforcing your rights:</p>
<ul>
<li>Contact your local housing authority or tenant rights organization</li>
<li>Many law schools offer free legal clinics for housing issues</li>
<li>Legal aid organizations provide free representation for qualifying tenants</li>
<li>Our AI assistant can help you understand how these laws apply to your specific situation</li>
</ul>',
  'Housing Law',
  '12 min read',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  '2025-01-10'
),
(
  'security-deposit-rights',
  'Security Deposits: What Landlords Can and Cannot Deduct',
  'Understand the rules around security deposits, including legal limits, what can be deducted, and how to get your full deposit back when you move out.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Security deposits are one of the most common sources of landlord-tenant disputes. Know the rules to protect your money.</p>

<h2>State Limits on Security Deposits</h2>
<p>Most states limit how much a landlord can charge as a security deposit. Common limits include:</p>
<ul>
<li>One month''s rent</li>
<li>One and a half months'' rent</li>
<li>Two months'' rent</li>
<li>No limit (some states)</li>
</ul>

<h2>What Landlords CAN Deduct</h2>
<ul>
<li>Unpaid rent</li>
<li>Damage beyond normal wear and tear</li>
<li>Cleaning costs if the unit is left excessively dirty</li>
<li>Costs to replace missing items (keys, remotes)</li>
</ul>

<h2>What Landlords CANNOT Deduct</h2>
<ul>
<li>Normal wear and tear (faded paint, worn carpet)</li>
<li>Pre-existing damage documented at move-in</li>
<li>Routine cleaning and maintenance</li>
<li>Repairs needed due to age or normal use</li>
</ul>

<blockquote>
<strong>Pro tip:</strong> Always do a thorough move-in inspection with photos and get a signed copy from your landlord. This documentation is your best protection when you move out.
</blockquote>

<h2>Return Deadlines</h2>
<p>Landlords must return your deposit within a specific timeframe, typically 14-30 days after you move out. They must also provide an itemized list of any deductions.</p>

<h2>Fighting Unfair Deductions</h2>
<ol>
<li>Review the itemized statement carefully</li>
<li>Compare to your move-in inspection report</li>
<li>Send a written dispute letter if deductions seem unfair</li>
<li>Consider small claims court for amounts your landlord refuses to return</li>
</ol>',
  'Housing Law',
  '8 min read',
  'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2025-01-08'
),
(
  'eviction-process-guide',
  'Eviction Process Explained: Know Your Rights and Timeline',
  'A step-by-step guide to the eviction process, including required notices, court procedures, and how to respond if you receive an eviction notice.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Facing eviction is stressful, but understanding the process and your rights can help you navigate this difficult situation.</p>

<h2>The Eviction Process: Step by Step</h2>

<h3>Step 1: Notice</h3>
<p>Before filing for eviction, landlords must provide written notice. The type of notice depends on the reason:</p>
<ul>
<li><strong>Pay or Quit</strong> - Gives you a set number of days to pay overdue rent</li>
<li><strong>Cure or Quit</strong> - Gives you time to fix a lease violation</li>
<li><strong>Unconditional Quit</strong> - Requires you to leave with no option to fix the issue (rare)</li>
</ul>

<h3>Step 2: Court Filing</h3>
<p>If you don''t comply with the notice, the landlord must file an eviction lawsuit (often called "unlawful detainer"). You will receive:</p>
<ul>
<li>A summons notifying you of the lawsuit</li>
<li>A complaint explaining why you''re being evicted</li>
<li>Information about your court date</li>
</ul>

<h3>Step 3: Court Hearing</h3>
<p>You have the right to appear in court and present your defense. Possible defenses include:</p>
<ul>
<li>You paid the rent</li>
<li>The landlord didn''t follow proper procedures</li>
<li>The eviction is retaliatory or discriminatory</li>
<li>The unit was uninhabitable</li>
</ul>

<h3>Step 4: Judgment</h3>
<p>If the landlord wins, the court will issue a judgment giving you a specific number of days to move out.</p>

<h3>Step 5: Removal</h3>
<p>If you don''t leave by the deadline, the landlord can have the sheriff physically remove you. Only law enforcement can carry out this step - landlords cannot forcibly remove you themselves.</p>

<blockquote>
<strong>Important:</strong> Never ignore eviction papers. Even if you plan to move, appearing in court can help you negotiate more time or prevent negative marks on your record.
</blockquote>

<h2>Illegal Eviction Tactics</h2>
<p>Landlords CANNOT:</p>
<ul>
<li>Change your locks without a court order</li>
<li>Turn off utilities</li>
<li>Remove your belongings</li>
<li>Harass or threaten you into leaving</li>
</ul>

<h2>Getting Help</h2>
<p>Many areas have free legal aid for tenants facing eviction. Emergency rental assistance programs may also be available.</p>',
  'Housing Law',
  '15 min read',
  'https://images.pexels.com/photos/7578901/pexels-photo-7578901.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2025-01-05'
),
(
  'landlord-repair-duties',
  'Landlord Repair Responsibilities: When They Must Fix Problems',
  'Learn what repairs your landlord is legally required to make, timeframes for repairs, and what to do when your landlord refuses to fix issues.',
  '<p class="text-lg font-medium text-slate-800 mb-6">When something breaks in your rental, who pays? Understanding landlord repair obligations helps you get problems fixed quickly.</p>

<h2>What Landlords Must Repair</h2>
<p>Landlords are generally responsible for:</p>
<ul>
<li>Structural components (roof, walls, foundation)</li>
<li>Plumbing systems and fixtures</li>
<li>Electrical systems</li>
<li>Heating and air conditioning (where provided)</li>
<li>Common areas</li>
<li>Appliances provided in the lease</li>
</ul>

<h2>What Tenants Are Responsible For</h2>
<ul>
<li>Damage you or your guests cause</li>
<li>Minor maintenance (changing light bulbs, batteries)</li>
<li>Keeping the unit reasonably clean</li>
<li>Proper use of fixtures and appliances</li>
</ul>

<h2>How to Request Repairs</h2>
<ol>
<li><strong>Submit in writing</strong> - Email or certified letter creates a paper trail</li>
<li><strong>Be specific</strong> - Describe the problem clearly</li>
<li><strong>Set a deadline</strong> - State law often gives landlords 14-30 days for non-emergency repairs</li>
<li><strong>Follow up</strong> - Send reminders if no response</li>
</ol>

<h2>When Landlords Refuse</h2>
<p>If your landlord ignores repair requests, you may have options:</p>
<ul>
<li><strong>Repair and deduct</strong> - Pay for repairs yourself and deduct from rent (check state laws first)</li>
<li><strong>Withhold rent</strong> - Some states allow this for serious habitability issues</li>
<li><strong>Report code violations</strong> - Contact local housing inspectors</li>
<li><strong>Break the lease</strong> - Serious violations may justify moving out</li>
</ul>

<blockquote>
<strong>Warning:</strong> Never withhold rent without understanding your state''s specific requirements. Done incorrectly, this can lead to eviction.
</blockquote>',
  'Housing Law',
  '10 min read',
  'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2025-01-03'
),
(
  'breaking-lease-early',
  'Breaking Your Lease Early: Legal Options and Consequences',
  'Explore your options for ending a lease early, including legal reasons to break a lease, negotiation strategies, and potential financial penalties.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Life changes sometimes require moving before your lease ends. Here''s how to minimize the financial and legal consequences.</p>

<h2>Legal Reasons to Break a Lease</h2>
<p>In these situations, you may be able to break your lease without penalty:</p>
<ul>
<li><strong>Uninhabitable conditions</strong> - Serious health or safety issues the landlord won''t fix</li>
<li><strong>Landlord harassment</strong> - Repeated illegal entry, threats, or interference</li>
<li><strong>Military deployment</strong> - Protected under the Servicemembers Civil Relief Act</li>
<li><strong>Domestic violence</strong> - Many states have specific protections</li>
<li><strong>Illegal unit</strong> - The rental violates housing codes or wasn''t legal to rent</li>
</ul>

<h2>Negotiating an Early Exit</h2>
<ol>
<li><strong>Talk to your landlord first</strong> - Many will agree to let you go early</li>
<li><strong>Offer to help find a replacement</strong> - This reduces the landlord''s burden</li>
<li><strong>Propose a buyout</strong> - One or two months'' rent to end the lease cleanly</li>
<li><strong>Get everything in writing</strong> - Any agreement should be documented</li>
</ol>

<h2>Consequences of Breaking a Lease</h2>
<ul>
<li>Loss of security deposit</li>
<li>Liability for rent until a new tenant is found</li>
<li>Early termination fees (if in your lease)</li>
<li>Negative reference for future rentals</li>
<li>Potential lawsuit for unpaid rent</li>
</ul>

<h2>Landlord''s Duty to Mitigate</h2>
<p>In most states, landlords must make reasonable efforts to re-rent the unit. They can''t simply leave it empty and charge you for the full remaining lease term.</p>

<blockquote>
<strong>Tip:</strong> Before breaking your lease, calculate the total cost of staying vs. leaving. Sometimes paying to break a lease is cheaper than staying in a bad situation.
</blockquote>',
  'Housing Law',
  '11 min read',
  'https://images.pexels.com/photos/4491461/pexels-photo-4491461.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-28'
),
(
  'rent-increase-laws',
  'Rent Increases: What is Legal and How to Respond',
  'Understand the rules around rent increases, including notice requirements, rent control laws, and how to negotiate or challenge an unfair increase.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Landlords generally have the right to raise rent, but there are rules they must follow. Know your rights to protect yourself from unfair increases.</p>

<h2>When Can Rent Be Increased?</h2>
<ul>
<li><strong>Month-to-month leases</strong> - Usually with 30-60 days written notice</li>
<li><strong>Fixed-term leases</strong> - Generally only at renewal time</li>
<li><strong>Rent-controlled units</strong> - Subject to local regulations</li>
</ul>

<h2>Notice Requirements</h2>
<p>Most states require written notice before a rent increase:</p>
<ul>
<li>30 days for increases under 10%</li>
<li>60-90 days for larger increases</li>
<li>Specific form requirements in some areas</li>
</ul>

<h2>Rent Control and Stabilization</h2>
<p>If you live in a rent-controlled area, increases are limited:</p>
<ul>
<li>Annual caps (often 3-10%)</li>
<li>Tied to inflation indices</li>
<li>Additional limits on pass-through costs</li>
</ul>

<h2>Challenging a Rent Increase</h2>
<ol>
<li><strong>Check the math</strong> - Ensure the increase complies with local laws</li>
<li><strong>Verify proper notice</strong> - Improper notice may invalidate the increase</li>
<li><strong>Research comparable rents</strong> - Know the market rate</li>
<li><strong>Negotiate</strong> - Ask for a smaller increase or gradual phase-in</li>
<li><strong>File a complaint</strong> - If you''re in a rent-controlled area</li>
</ol>

<blockquote>
<strong>Note:</strong> Rent increases cannot be retaliatory. If your rent goes up after you complained about repairs or filed a housing complaint, you may have legal recourse.
</blockquote>',
  'Housing Law',
  '9 min read',
  'https://images.pexels.com/photos/4386372/pexels-photo-4386372.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-25'
),
(
  'housing-discrimination-rights',
  'Housing Discrimination: Recognizing and Reporting Violations',
  'Learn about fair housing laws, protected classes, common forms of discrimination, and how to file a complaint if your rights are violated.',
  '<p class="text-lg font-medium text-slate-800 mb-6">The Fair Housing Act protects you from discrimination in housing. Understanding these protections helps you recognize and fight back against illegal treatment.</p>

<h2>Protected Classes Under Federal Law</h2>
<p>Landlords cannot discriminate based on:</p>
<ul>
<li>Race or color</li>
<li>National origin</li>
<li>Religion</li>
<li>Sex (including gender identity and sexual orientation)</li>
<li>Familial status (having children)</li>
<li>Disability</li>
</ul>

<p>Many states and cities add additional protections for:</p>
<ul>
<li>Source of income (Section 8 vouchers)</li>
<li>Age</li>
<li>Marital status</li>
<li>Military/veteran status</li>
</ul>

<h2>Common Forms of Discrimination</h2>
<ul>
<li>Refusing to rent to you</li>
<li>Quoting different terms or prices</li>
<li>Falsely claiming no units are available</li>
<li>Steering you to certain neighborhoods</li>
<li>Harassing or intimidating you</li>
<li>Refusing reasonable disability accommodations</li>
</ul>

<h2>Disability Rights</h2>
<p>Landlords must:</p>
<ul>
<li>Allow reasonable modifications (you may have to pay)</li>
<li>Make reasonable policy accommodations</li>
<li>Allow service animals and emotional support animals</li>
<li>Not ask about the nature of your disability</li>
</ul>

<h2>Filing a Complaint</h2>
<ol>
<li><strong>Document everything</strong> - Save communications, take notes on conversations</li>
<li><strong>File with HUD</strong> - You have one year from the discrimination</li>
<li><strong>Contact local fair housing agencies</strong> - They may offer faster resolution</li>
<li><strong>Consider a lawsuit</strong> - You have two years to file in federal court</li>
</ol>

<blockquote>
<strong>Remember:</strong> You don''t need to prove the landlord intended to discriminate. Policies that disproportionately affect protected groups can also be illegal.
</blockquote>',
  'Housing Law',
  '13 min read',
  'https://images.pexels.com/photos/7578939/pexels-photo-7578939.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-22'
),
(
  'roommate-legal-rights',
  'Roommate Disputes: Legal Rights and Responsibilities',
  'Navigate roommate conflicts with this guide covering lease obligations, splitting costs, subletting rules, and what happens when a roommate leaves.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Living with roommates can be complicated when things go wrong. Understanding the legal framework helps resolve disputes fairly.</p>

<h2>Types of Roommate Arrangements</h2>
<ul>
<li><strong>Co-tenants</strong> - All names on the lease, all equally responsible</li>
<li><strong>Tenant and subtenant</strong> - You''re renting from another tenant</li>
<li><strong>Roommate of tenant</strong> - Living with the leaseholder informally</li>
</ul>

<h2>Responsibilities When You''re All on the Lease</h2>
<p>If everyone signed the lease:</p>
<ul>
<li>Each person is responsible for the entire rent (joint and several liability)</li>
<li>The landlord can pursue any of you for unpaid rent</li>
<li>All must agree to renew or terminate the lease</li>
<li>Damage deposits are typically shared</li>
</ul>

<h2>When a Roommate Doesn''t Pay</h2>
<ol>
<li><strong>Communicate</strong> - Try to work out a payment plan</li>
<li><strong>Document</strong> - Keep records of all payments and agreements</li>
<li><strong>Pay to avoid eviction</strong> - You may need to cover their share temporarily</li>
<li><strong>Sue for reimbursement</strong> - Small claims court is an option</li>
</ol>

<h2>Removing a Roommate</h2>
<p>Your options depend on the arrangement:</p>
<ul>
<li><strong>Subtenant</strong> - You may be able to give notice and end their tenancy</li>
<li><strong>Co-tenant</strong> - You cannot force them out; only the landlord can evict</li>
<li><strong>Negotiate</strong> - Offer incentives for them to leave voluntarily</li>
</ul>

<h2>Protecting Yourself</h2>
<ul>
<li>Create a written roommate agreement covering bills, guests, and disputes</li>
<li>Keep separate records of your rent payments</li>
<li>Get renters insurance (your roommate''s policy doesn''t cover you)</li>
</ul>

<blockquote>
<strong>Tip:</strong> If you''re subletting, make sure you have your landlord''s written permission. Unauthorized subletting can lead to eviction.
</blockquote>',
  'Housing Law',
  '8 min read',
  'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-18'
),
(
  'landlord-entry-rights',
  'Landlord Entry Rights: When Can They Enter Your Home?',
  'Know your privacy rights as a tenant, including required notice periods, legitimate reasons for entry, and what to do about unauthorized access.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Your rental is your home, and you have a right to privacy. But landlords also have legitimate reasons to access the property. Here''s where the line is drawn.</p>

<h2>When Landlords Can Enter</h2>
<p>Landlords typically can enter for:</p>
<ul>
<li>Repairs and maintenance</li>
<li>Inspections (move-in, move-out, periodic)</li>
<li>Showing the unit to prospective tenants or buyers</li>
<li>Emergencies (fire, flood, gas leak)</li>
</ul>

<h2>Notice Requirements</h2>
<p>Except in emergencies, landlords must provide advance notice:</p>
<ul>
<li><strong>24 hours</strong> - Most common requirement</li>
<li><strong>48 hours</strong> - Some states require more notice</li>
<li><strong>Reasonable hours</strong> - Usually 8am-6pm on weekdays</li>
</ul>

<h2>Your Right to Be Present</h2>
<p>You generally have the right to be present during landlord entry. If the proposed time doesn''t work, suggest an alternative within a reasonable timeframe.</p>

<h2>What Constitutes an Emergency</h2>
<p>True emergencies allowing immediate entry:</p>
<ul>
<li>Fire or smoke</li>
<li>Flooding or water damage</li>
<li>Gas leaks</li>
<li>Medical emergencies</li>
<li>Suspected criminal activity</li>
</ul>

<h2>Dealing with Unauthorized Entry</h2>
<ol>
<li><strong>Document each incident</strong> - Date, time, circumstances</li>
<li><strong>Send written notice</strong> - Cite the law and request compliance</li>
<li><strong>Contact local authorities</strong> - Repeated violations may be illegal</li>
<li><strong>Consider legal action</strong> - You may have grounds to break your lease</li>
</ol>

<blockquote>
<strong>Important:</strong> Changing locks without permission is usually a lease violation. If you feel unsafe, work with your landlord or consult with a tenant rights organization.
</blockquote>',
  'Housing Law',
  '7 min read',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-15'
),
(
  'habitability-standards',
  'Mold, Pests, and Habitability: What Landlords Must Provide',
  'Understand habitability standards and your rights when dealing with mold, pest infestations, lack of heat, or other conditions making your home unsafe.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Every tenant has the right to a safe, livable home. When conditions fall below habitability standards, you have powerful legal remedies.</p>

<h2>What is Habitability?</h2>
<p>A habitable dwelling must have:</p>
<ul>
<li>Weatherproofing (roof, walls, windows, doors)</li>
<li>Working plumbing with hot and cold water</li>
<li>Adequate heating (and cooling in some areas)</li>
<li>Functional electrical systems</li>
<li>Clean, sanitary conditions</li>
<li>Freedom from pests and vermin</li>
<li>Working smoke detectors</li>
</ul>

<h2>Common Habitability Issues</h2>

<h3>Mold</h3>
<p>Landlords must address mold caused by building defects. Document with photos, report in writing, and request remediation. Severe mold may justify withholding rent or breaking the lease.</p>

<h3>Pest Infestations</h3>
<p>Cockroaches, mice, bedbugs, and other pests are the landlord''s responsibility if they result from building conditions. If you caused the infestation, you may be responsible.</p>

<h3>No Heat or Hot Water</h3>
<p>Lack of heating in winter or hot water at any time is a serious habitability violation. Landlords must fix these issues immediately.</p>

<h2>Your Remedies</h2>
<ul>
<li><strong>Repair and deduct</strong> - Fix it yourself and subtract from rent</li>
<li><strong>Withhold rent</strong> - Stop paying until repairs are made (know your state''s rules)</li>
<li><strong>Call inspectors</strong> - Report code violations to local housing authority</li>
<li><strong>Break your lease</strong> - Severe violations may justify moving out</li>
<li><strong>Sue for damages</strong> - Recover money spent dealing with the problem</li>
</ul>

<blockquote>
<strong>Warning:</strong> Always document problems and notify your landlord in writing before using remedies like rent withholding. Skipping steps can backfire.
</blockquote>',
  'Housing Law',
  '10 min read',
  'https://images.pexels.com/photos/6782351/pexels-photo-6782351.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-12'
),
(
  'renters-insurance-guide',
  'Renters Insurance: What It Covers and Why You Need It',
  'A complete guide to renters insurance, including what is covered, how much coverage you need, and how to file a claim after loss or damage.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Renters insurance is affordable protection that every tenant should have. Here''s everything you need to know.</p>

<h2>What Renters Insurance Covers</h2>

<h3>Personal Property</h3>
<p>Your belongings are covered against:</p>
<ul>
<li>Fire and smoke damage</li>
<li>Theft</li>
<li>Vandalism</li>
<li>Water damage (from burst pipes, not floods)</li>
<li>Lightning and wind damage</li>
</ul>

<h3>Liability Protection</h3>
<p>If someone is injured in your home or you accidentally damage others'' property:</p>
<ul>
<li>Medical payments for injured guests</li>
<li>Legal defense costs</li>
<li>Settlements or judgments against you</li>
</ul>

<h3>Additional Living Expenses</h3>
<p>If your rental becomes uninhabitable due to a covered event:</p>
<ul>
<li>Hotel costs</li>
<li>Restaurant meals</li>
<li>Temporary housing</li>
</ul>

<h2>What''s NOT Covered</h2>
<ul>
<li>Flood damage (requires separate policy)</li>
<li>Earthquake damage (requires separate rider)</li>
<li>Your roommate''s belongings (they need their own policy)</li>
<li>Damage from lack of maintenance</li>
<li>High-value items over certain limits (jewelry, electronics)</li>
</ul>

<h2>How Much Coverage Do You Need?</h2>
<ol>
<li>Create a home inventory with photos and receipts</li>
<li>Estimate the total value of your belongings</li>
<li>Add 20-30% buffer for things you forgot</li>
<li>Choose replacement cost coverage, not actual cash value</li>
</ol>

<h2>Filing a Claim</h2>
<ol>
<li>Document the damage immediately with photos/video</li>
<li>Contact your insurance company promptly</li>
<li>Get a police report if theft was involved</li>
<li>Keep receipts for any emergency expenses</li>
<li>Don''t throw away damaged items until the adjuster sees them</li>
</ol>

<blockquote>
<strong>Cost:</strong> Renters insurance typically costs $15-30 per month. Given the protection it provides, it''s one of the best values in insurance.
</blockquote>',
  'Housing Law',
  '9 min read',
  'https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-08'
),
(
  'lease-red-flags',
  'Lease Agreement Red Flags: What to Watch Before Signing',
  'Protect yourself by knowing what to look for in a lease, including illegal clauses, hidden fees, and terms that could cost you later.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Your lease is a binding contract. Before you sign, make sure you understand every clause and watch for these warning signs.</p>

<h2>Illegal Lease Clauses</h2>
<p>These clauses are unenforceable in most states:</p>
<ul>
<li><strong>Waiver of habitability</strong> - You cannot sign away your right to a livable home</li>
<li><strong>No-pet clauses for service animals</strong> - Landlords must allow service and assistance animals</li>
<li><strong>Excessive late fees</strong> - Fees must be reasonable, not punitive</li>
<li><strong>Waiver of jury trial</strong> - May be unenforceable</li>
<li><strong>Automatic lease renewal without notice</strong> - Many states prohibit this</li>
</ul>

<h2>Red Flag Clauses</h2>
<ul>
<li><strong>Unlimited access</strong> - Landlord entry should require notice</li>
<li><strong>All repairs tenant responsibility</strong> - Landlords must maintain habitability</li>
<li><strong>No guests allowed</strong> - Overly restrictive guest policies</li>
<li><strong>Massive early termination fees</strong> - Should be reasonable</li>
<li><strong>Automatic rent increases</strong> - Know exactly how much and when</li>
</ul>

<h2>Hidden Fees to Watch For</h2>
<ul>
<li>Application fees</li>
<li>Move-in/move-out fees</li>
<li>Pet fees AND pet deposits</li>
<li>Parking fees</li>
<li>Utility fees</li>
<li>Trash/recycling fees</li>
<li>Maintenance fees</li>
</ul>

<h2>Before You Sign</h2>
<ol>
<li>Read the entire lease carefully (yes, all of it)</li>
<li>Ask questions about anything unclear</li>
<li>Get modifications in writing</li>
<li>Do a thorough move-in inspection</li>
<li>Keep a copy of everything you sign</li>
</ol>

<blockquote>
<strong>Remember:</strong> Everything is negotiable before you sign. Once you sign, you''re bound by those terms.
</blockquote>',
  'Housing Law',
  '11 min read',
  'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-05'
),
(
  'section-8-guide',
  'Section 8 and Housing Vouchers: A Guide for Tenants',
  'Navigate the Section 8 housing voucher program, from application to maintaining your voucher, and know your rights as a voucher holder.',
  '<p class="text-lg font-medium text-slate-800 mb-6">The Section 8 Housing Choice Voucher program helps millions of families afford decent housing. Here''s how to navigate the program successfully.</p>

<h2>How Section 8 Works</h2>
<p>The program helps low-income families pay rent:</p>
<ul>
<li>You pay about 30% of your income toward rent</li>
<li>The voucher covers the difference up to a payment standard</li>
<li>You choose your own housing (within program limits)</li>
<li>Landlord participation is voluntary in most areas</li>
</ul>

<h2>Applying for a Voucher</h2>
<ol>
<li><strong>Contact your local housing authority</strong> - Find them at hud.gov</li>
<li><strong>Complete the application</strong> - Provide income and household information</li>
<li><strong>Get on the waiting list</strong> - Lists are often long; apply to multiple authorities</li>
<li><strong>Attend your briefing</strong> - When your name comes up, attend mandatory orientation</li>
<li><strong>Start your housing search</strong> - You have a limited time to find a unit</li>
</ol>

<h2>Your Rights as a Voucher Holder</h2>
<ul>
<li><strong>Protection from discrimination</strong> - In many states, landlords cannot reject you solely for having a voucher</li>
<li><strong>Right to choose</strong> - Pick any unit that meets program requirements</li>
<li><strong>Right to move</strong> - You can take your voucher with you if you relocate</li>
<li><strong>Due process</strong> - You have the right to appeal if your voucher is terminated</li>
</ul>

<h2>Maintaining Your Voucher</h2>
<ul>
<li>Report income changes promptly</li>
<li>Pass annual inspections</li>
<li>Don''t violate your lease</li>
<li>Attend required recertification appointments</li>
<li>Pay your portion of rent on time</li>
</ul>

<h2>Common Reasons for Termination</h2>
<ul>
<li>Fraud or misrepresentation</li>
<li>Failure to report income changes</li>
<li>Drug-related or violent criminal activity</li>
<li>Eviction from assisted housing</li>
<li>Failure to comply with program requirements</li>
</ul>

<blockquote>
<strong>Tip:</strong> Keep copies of all documents you submit to the housing authority. This protects you if there are disputes about what you reported.
</blockquote>',
  'Housing Law',
  '14 min read',
  'https://images.pexels.com/photos/8292795/pexels-photo-8292795.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-12-01'
),
(
  'moving-out-checklist',
  'Moving Out Checklist: Protecting Your Security Deposit',
  'Follow this comprehensive checklist to ensure you get your security deposit back, including documentation tips and proper notice procedures.',
  '<p class="text-lg font-medium text-slate-800 mb-6">Protect your security deposit with careful preparation and thorough documentation when you move out.</p>

<h2>Before You Give Notice</h2>
<ul>
<li>Review your lease for notice requirements (usually 30-60 days)</li>
<li>Check if notice must be given on a specific day</li>
<li>Confirm the proper notice delivery method</li>
<li>Calculate your exact move-out date</li>
</ul>

<h2>30 Days Before Moving</h2>
<ul>
<li>Give written notice to your landlord</li>
<li>Request a pre-move-out inspection (if available in your state)</li>
<li>Start documenting the condition of the unit with photos/video</li>
<li>Begin cleaning and repairs</li>
</ul>

<h2>One Week Before Moving</h2>
<ul>
<li>Patch small nail holes</li>
<li>Touch up paint if needed</li>
<li>Deep clean all rooms</li>
<li>Clean inside appliances (oven, refrigerator, dishwasher)</li>
<li>Clean windows and window tracks</li>
</ul>

<h2>Moving Day</h2>
<ul>
<li>Do a final cleaning sweep</li>
<li>Take date-stamped photos of every room</li>
<li>Check all closets and storage areas</li>
<li>Return all keys and remotes</li>
<li>Get a written receipt for returned keys</li>
<li>Note final utility meter readings</li>
</ul>

<h2>After Moving</h2>
<ul>
<li>Transfer or cancel utilities</li>
<li>Forward your mail</li>
<li>Provide your new address for deposit return</li>
<li>Review itemized deductions when received</li>
<li>Dispute unfair charges in writing</li>
</ul>

<h2>If Your Deposit Isn''t Returned</h2>
<ol>
<li>Send a demand letter via certified mail</li>
<li>Reference state laws and deadlines</li>
<li>Include copies of your move-in and move-out documentation</li>
<li>File in small claims court if necessary</li>
</ol>

<blockquote>
<strong>Pro tip:</strong> Many states have penalties for landlords who wrongfully withhold deposits, sometimes double or triple the amount owed.
</blockquote>',
  'Housing Law',
  '8 min read',
  'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=800',
  false,
  '2024-11-28'
)
ON CONFLICT (slug) DO NOTHING;