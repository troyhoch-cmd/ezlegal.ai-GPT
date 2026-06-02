/*
  # Populate Prompt Subcategories

  1. Changes
    - Insert 131 predefined subcategories matching LegalBreeze structure
    - Each subcategory links to its parent category by category_id
    - Includes name, description, and display order

  2. Subcategories Added
    - Adult Guardianship (5 subcategories)
    - Consumer Protection (6 subcategories)
    - Criminal Matters (6 subcategories)
    - Dependency and Juvenile Court Matters (6 subcategories)
    - DUIs (5 subcategories)
    - Employment (4 subcategories)
    - Family Law (8 subcategories)
    - Healthcare, Medicare, and Medicaid (3 subcategories)
    - Housing (4 subcategories)
    - Immigration (5 subcategories)
    - Rights Restoration (4 subcategories)
    - Social Security (5 subcategories)
    - Traffic Tickets (4 subcategories)
    - Trusts and Wills (4 subcategories)
    - Business and Investment Agreements (8 subcategories)
    - Intellectual Property IP (3 subcategories)
    - Personal Injury (5 subcategories)
    - Tax and Business Law (2 subcategories)
    - Real Estate (7 subcategories)
    - Legal Research categories (multiple)
    - And many more specialized subcategories
*/

DELETE FROM prompt_subcategories;

INSERT INTO prompt_subcategories (id, category_id, name, description, display_order, is_active) VALUES
  (1, 1, 'Establishing Guardianship', 'How to become a legal guardian, file paperwork, and explore options without a lawyer.', 1, true),
  (2, 1, 'Court Process', 'Understanding guardianship hearings, legal criteria, and how to represent yourself in court.', 2, true),
  (3, 1, 'Responsibilities of a Guardian', 'Managing financial, legal, and personal care duties while helping maintain independence.', 3, true),
  (4, 1, 'Ending Guardianship', 'How to terminate or modify guardianship when circumstances change.', 4, true),
  (5, 1, 'Resources and Support', 'Document guides, cost-saving strategies, legal aid, and local support groups.', 5, true),
  (6, 2, 'Product Issues', 'Refunds, defective products, warranty disputes, and recalls', 6, true),
  (7, 2, 'Financial Disputes, Credit and Financial Issues', 'Unauthorized charges, billing disputes, debt collection, harassment and overcharging.', 7, true),
  (8, 2, 'Scams and Fraud', 'Online scams, identity theft, misleading advertising, and financial fraud.', 8, true),
  (9, 2, 'Contracts and Subscriptions', 'Canceling contracts, resolving subscription disputes, and handling unfair business practices.', 9, true),
  (10, 2, 'Reporting Violations', 'Filing consumer complaints, reporting misleading advertising, and escalating legal violations.', 10, true),
  (11, 2, 'Privacy and Data Protection', 'Protecting personal data, preventing identity theft, and stopping robocalls or unwanted marketing.', 11, true),
  (12, 3, 'Arrest and Charges', 'Rights during arrest, bail and pretrial release, plea bargains.', 12, true),
  (13, 3, 'Defenses and Legal Rights', 'Common defenses, self-defense laws, Interrogation rights and protecting your rights in a case.', 13, true),
  (14, 3, 'Court Process and Pretrial Matters', 'Filing motions, preparing for trial, and legal procedures.', 14, true),
  (15, 3, 'Sentencing, Penalties, and Post-Conviction', 'Probation, expungement, and reducing sentences', 15, true),
  (16, 3, 'Appeals and Post-Conviction', 'Appealing a conviction, rights restoration after conviction.', 16, true),
  (17, 3, 'Legal Representation', 'Getting a lawyer, public defenders, and legal fees.', 17, true),
  (18, 4, 'Child Custody and Foster Care', 'Reunification plans, visitation rights, terminating parental rights.', 18, true),
  (19, 4, 'Court Process', 'Dependency hearings, CPS investigations, court-appointed lawyers.', 19, true),
  (20, 4, 'Parental Rights', 'Proving fitness as a parent, challenging CPS recommendations, grandparents rights.', 20, true),
  (21, 4, 'Support Services', 'Reunification services, case plans, and court orders.', 21, true),
  (22, 4, 'Legal Representation', 'Getting a lawyer, court-appointed representation, and legal guidance.', 22, true),
  (23, 4, 'Emancipation and Legal Independence', 'Gaining legal independence as a minor.', 23, true),
  (24, 5, 'DUI Charges', 'Rights during a DUI stop, breathalyzer and blood tests, field sobriety tests.', 24, true),
  (25, 5, 'Penalties and Consequences', 'License suspension, ignition interlock devices, jail time alternatives', 25, true),
  (26, 5, 'Defenses', 'Challenging DUI evidence, prescription drug DUIs, reducing penalties.', 26, true),
  (27, 5, 'Long-Term Impact', 'DUI on criminal record, impact on employment and insurance.', 27, true),
  (28, 5, 'DUI Court Process', 'Hearings, legal representation.', 28, true),
  (29, 6, 'Employee Rights', 'Wrongful termination, workplace harassment, wage and hour laws, and workplace protections.', 29, true),
  (30, 6, 'Contracts and Agreements', 'Non-compete agreements, severance agreements, employment contracts, and independent contractor agreements.', 30, true),
  (31, 6, 'Workplace Policies', 'Family and medical leave, workplace safety, discrimination policies, and employee handbooks.', 31, true),
  (32, 6, 'Disputes and Complaints', 'Filing complaints for unsafe conditions, wage disputes, retaliation claims, and labor law violations.', 32, true),
  (33, 7, 'Divorce and Separation', 'Filing for divorce, property division, spousal support, and separation agreements', 33, true),
  (34, 7, 'Separation and Divorce Agreements', 'Legal agreements covering asset division, child custody, spousal support, and other terms of separation and divorce.', 34, true),
  (35, 7, 'Child Custody and Support', 'Custody arrangements, modifying child support, visitation rights', 35, true),
  (36, 7, 'Adoption and Guardianship', 'Adopting a stepchild, legal guardianship, termination of parental rights', 36, true),
  (37, 7, 'Domestic Violence and Protection Orders', 'Restraining orders, emergency custody, protection from abuse.', 37, true),
  (38, 7, 'Prenuptial and Postnuptial Agreements', 'Protecting assets and defining marital property rights.', 38, true),
  (39, 7, 'Paternity and Parental Rights', 'Establishing paternity, legal rights of fathers.', 39, true),
  (40, 7, 'MISC', 'Various legal topics not covered in other categories.', 40, true),
  (41, 8, 'Medicare', 'Enrollment and coverage, Medicare Advantage plans, appealing denied claims.', 41, true),
  (42, 8, 'Medicaid', 'Eligibility and income limits, long-term care coverage, reporting income changes.', 42, true),
  (43, 8, 'Healthcare Rights', 'Denial of medical services, mental health coverage, prescription drug coverage.', 43, true),
  (44, 9, 'Tenant Rights', 'Eviction notices, security deposit disputes, landlord-tenant disputes.', 44, true),
  (45, 9, 'Lease Agreements', 'Breaking a lease, rent increases, subleasing.', 45, true),
  (46, 9, 'Section 8 Housing', 'Qualifying for Section 8, transferring vouchers, landlord disputes.', 46, true),
  (47, 9, 'Maintenance and Repairs', 'Withholding rent for repairs, landlord responsibilities, filing complaints.', 47, true),
  (48, 10, 'Visas and Green Cards', 'Family-based immigration, employment-based visas, adjusting immigration status.', 48, true),
  (49, 10, 'Citizenship and Naturalization', 'Applying for citizenship, naturalization interview, denial of applications.', 49, true),
  (50, 10, 'Deportation and Asylum', 'Asylum applications, cancellation of removal, hardship waivers.', 50, true),
  (51, 10, 'General Visa and Immigration Status Questions', 'Checking visa status, work permits, responding to RFEs.', 51, true),
  (52, 10, 'Affidavit of Support', 'Sponsoring a relative, financial requirements.', 52, true),
  (53, 11, '(After Conviction) Voting and Civil Rights Restoration', 'Restoring voting rights, firearm rights, and other civil liberties after conviction.', 53, true),
  (54, 11, 'Expungement and Record Sealing', 'Clearing criminal records, eligibility for expungement, and legal effects.', 54, true),
  (55, 11, 'Employment and Housing', 'Rights after serving a sentence, public housing eligibility, professional license reinstatement.', 55, true),
  (56, 11, 'Legal Process and Assistance', 'Navigating the rights restoration process, legal help, and overcoming challenges.', 56, true),
  (57, 12, 'Benefits', 'Qualifying for Social Security, retirement benefits, disability benefits.', 57, true),
  (58, 12, 'Spousal, Dependent, and Survivor Benefits', 'Eligibility and application process for spouses, dependents, and survivors.', 58, true),
  (59, 12, 'Disability Benefits', 'Qualifying for Social Security disability benefits and application process.', 59, true),
  (60, 12, 'Appeals and Disputes', 'Appealing denied claims, reporting income changes, and benefits calculations.', 60, true),
  (61, 12, 'Managing and Updating Social Security Information', 'Updating Social Security records, replacing documents, and fraud prevention.', 61, true),
  (62, 13, 'Fighting Tickets', 'Contesting a ticket, traffic court hearings, reducing fines.', 62, true),
  (63, 13, 'Traffic Ticket Defenses and Legal Process', 'Exploring legal defenses, proving innocence, and handling legal procedures.', 63, true),
  (64, 13, 'Consequences of Traffic Violations', 'Points on your license, insurance rate increases, license suspension.', 64, true),
  (65, 13, 'Paying or Resolving a Traffic Ticket', 'Payment options, extensions, and checking outstanding tickets.', 65, true),
  (66, 14, 'Estate Planning & Trusts', 'Creating a trust, avoiding probate, protecting assets.', 66, true),
  (67, 14, 'Wills and Testament', 'Creating a will, distributing assets, ensuring final wishes are followed.', 67, true),
  (68, 14, 'Power of Attorney & Incapacity Planning', 'Assigning decision-making authority, planning for incapacitation.', 68, true),
  (69, 14, 'Probate and Estate Administration', 'Handling debts, executor responsibilities, contesting a will.', 69, true),
  (70, 15, 'Contracts & Business Agreements', 'Non-disclosure agreements, partnership agreements, licensing agreements, sales agreements, and shareholder agreements.', 70, true),
  (71, 15, 'Real Estate Agreements', 'Commercial lease agreements, property purchases, and investment agreements.', 71, true),
  (72, 15, 'Employment & Independent Contractor Agreements', 'Hiring employees, freelance work agreements, and consulting contracts.', 72, true),
  (73, 15, 'Financial and Loan Agreements', 'Legal terms for loans, repayments, and financial contracts.', 73, true),
  (74, 15, 'Liability and Protection Agreements', 'Risk management and legal protections.', 74, true),
  (75, 15, 'Sponsorship and Advertising Agreements', 'Brand partnerships and promotional contracts.', 75, true),
  (76, 15, 'Service Agreements', 'Contracts outlining service terms and expectations.', 76, true),
  (77, 16, 'Protection', 'Trademark registration, copyright protection, patent applications.', 77, true),
  (78, 16, 'Licensing and Agreements', 'Licensing IP to others, work-for-hire agreements, royalty agreements.', 78, true),
  (79, 16, 'Technology & Law', 'Legal aspects of tech, data, and digital rights.', 79, true),
  (80, 17, 'Claims, Settlements, and Compensation', 'Filing a personal injury claim, negotiating settlements, structured settlements, wrongful death claims, subrogation, and compensation-related agreements.', 80, true),
  (81, 17, 'Court Process and Legal Strategy', 'Handling lawsuits, motions, evidence challenges, discovery, and expert witnesses.', 81, true),
  (82, 17, 'Legal Representation and Trial Preparation', 'Hiring lawyers, contingency agreements, trial prep, jury selection, and legal fees.', 82, true),
  (83, 17, 'Proving Liability and Defending Claims', 'Negligence, liability, counterclaims, and mass tort lawsuits.', 83, true),
  (84, 17, 'Specialized Cases and Liability Protection', 'Medical malpractice, liability waivers, and specialized injury cases.', 84, true),
  (85, 18, 'Business Formation', 'LLC operating agreements, shareholder agreements, partnership agreements.', 85, true),
  (86, 18, 'Tax Disputes', 'Appealing tax decisions, tax liens and penalties, business tax compliance.', 86, true),
  (87, 19, 'Purchase and Sale Agreements', 'Buying, selling, and contract terms in real estate transactions.', 87, true),
  (88, 19, 'Lease and Rental Agreements', 'Commercial leases, rent-to-own, and property rental agreements.', 88, true),
  (89, 19, 'Financing and Real Estate Investment', 'Real estate financing, syndication, and investment partnerships.', 89, true),
  (90, 19, 'Development and Construction Agreements', 'Contracts and agreements related to real estate development and construction projects.', 90, true),
  (91, 19, 'Legal Documents and Disclosures', 'Real estate disclosures, confidentiality agreements, and legal paperwork.', 91, true),
  (92, 19, 'Brokerage and Commission Agreements', 'Working with real estate brokers, commission disputes, and marketing agreements.', 92, true),
  (93, 19, 'Disputes and Easement Agreements', 'Handling property disputes, boundary disagreements, and access rights.', 93, true),
  (94, 20, 'Legal Research on Laws and Regulations', 'Finding and understanding laws, regulations, and statutes.', 94, true),
  (95, 20, 'Case Law and Legal Precedents', 'Analyzing court rulings and how they shape legal interpretation.', 95, true),
  (96, 20, 'Comparative Legal Analysis', 'Comparing legal concepts, systems, and regulations across jurisdictions.', 96, true),
  (97, 20, 'Legal Procedures and Processes', 'Step-by-step guides to legal actions and judicial procedures.', 97, true),
  (98, 20, 'Legal Terms and Concepts', 'Understanding key legal definitions and principles.', 98, true),
  (99, 20, 'Public Policy and Social Impact of Law', 'Exploring the ethical and social consequences of legal decisions.', 99, true),
  (100, 21, 'Legal Research on Laws and Regulations', 'Finding and understanding laws, regulations, and statutes.', 100, true),
  (101, 21, 'Case Law and Legal Precedents', 'Analyzing court rulings and how they shape legal interpretation.', 101, true),
  (102, 21, 'Comparative Legal Analysis', 'Comparing legal concepts, systems, and regulations across jurisdictions.', 102, true),
  (103, 22, 'General Legal Procedures', 'Common legal processes, filings, and court procedures.', 103, true),
  (104, 23, 'Understanding Legal Terms and Concepts', 'Definitions and explanations of key legal terms and principles.', 104, true),
  (105, 24, 'Ethics and Social Impact', 'Legal ethics, social responsibility, and the impact of laws on society.', 105, true),
  (106, 25, 'Sponsorship Agreements', 'Legal terms for sponsorship deals, obligations, and rights.', 106, true),
  (107, 25, 'Service Agreements', 'Contracts outlining service terms, duties, and compensation.', 107, true),
  (108, 25, 'Advertising Agreements', 'Contracts governing ad placements, rights, and obligations.', 108, true),
  (109, 26, 'Affidavits', 'Sworn written statements used as legal evidence.', 109, true),
  (110, 26, 'Website Terms of Service', 'Rules and conditions for using a website.', 110, true),
  (111, 27, 'Family Care Plans', 'Legal arrangements for family support and caregiving.', 111, true),
  (112, 28, 'Surrogacy Agreements', 'Legal contracts outlining rights and responsibilities in surrogacy.', 112, true),
  (113, 29, 'Legal Name Changes', 'Process and requirements for legally changing a name.', 113, true),
  (114, 30, 'Conservatorship Agreements', 'Legal arrangements for managing another person''s affairs.', 114, true),
  (115, 31, 'Family Limited Partnerships', 'Structuring family-owned businesses for asset protection and tax benefits.', 115, true),
  (116, 32, 'QDROs', 'Legal orders for dividing retirement benefits in divorce settlements.', 116, true),
  (117, 33, 'Cohabitation Agreements', 'Legal agreements outlining the rights and responsibilities of unmarried couples living together.', 117, true),
  (118, 33, 'Domestic Partnership Agreements', 'Legal agreements outlining the rights and responsibilities of unmarried couples living together.', 118, true),
  (119, 34, 'Relinquishment of Rights', 'A legal document confirming the voluntary surrender of a person''s rights or claims', 119, true),
  (120, 35, 'Medication Agreements', 'Contracts between patients and healthcare providers outlining the proper use of prescribed medications', 120, true),
  (121, 36, 'Medical Malpractice Claims', 'Legal claims filed by patients seeking compensation for harm caused by medical negligence or errors', 121, true),
  (122, 37, 'Demand Letters', 'Formal written requests seeking payment or action to resolve a legal dispute before further steps are taken', 122, true),
  (123, 38, 'Premises Liability Claims', 'Legal claims arising from injuries caused by unsafe or hazardous conditions on someone else''s property.', 123, true),
  (124, 41, 'QA', 'difference b/w verification and validation', 124, true),
  (125, 39, 'Trademarks', 'Prepare draft federal trademark application sufficient for filing with USPTO', 125, true),
  (126, 39, 'Patents', 'Prepare provisional patent application sufficient for filing with USPTO', 126, true),
  (127, 39, 'Trade Secrets', 'Describe whatever a trade secret is and how to enforce trade secret rights', 127, true),
  (128, 39, 'AI', 'Prepare best in class AI data security and privacy policies', 128, true),
  (129, 40, 'Arizona Form of Commercial Purchase and Sale Agreement', 'Draft enforceable form of Arizona Commercial Real Estate Purchase and Sale Agreement - Complex Transaction Long Form', 129, true),
  (130, 26, 'Arizona Forms', 'Prepare enforceable form of Arizona Purchase Agreement for Complex Commercial Real Estate Transaction', 130, true),
  (131, 42, 'Deed of Trust', 'Review, analyze and revise attached Deed of Trust for customary Arizona law provisions', 131, true);

SELECT setval('prompt_subcategories_id_seq', 132, false);
