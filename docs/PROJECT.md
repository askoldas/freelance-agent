# Product Definition

## Product name

Working name: **Freelance Agent**.

## Problem

Freelance opportunities are fragmented across marketplaces, public job boards, communities, agencies, company sites, email alerts, and direct referrals. Manually reviewing them is repetitive, while generic AI matching tends to overrate weak opportunities and produce impersonal proposals.

The product should reduce search and evaluation time while keeping the owner in control of every application and outbound message.

## Product objective

Build a personal project-acquisition system that:

- accepts opportunities manually and later discovers them automatically;
- understands the requested business outcome, not only keywords;
- evaluates whether the owner can responsibly deliver the project;
- identifies direct, adjacent, learnable, and risky requirements;
- recommends plausible technical approaches;
- creates honest, tailored proposals;
- tracks applications and follow-ups;
- learns from user decisions without silently changing critical rules.

## Target opportunity types

### Web products

- business and multilingual websites
- web applications
- customer portals and account areas
- directories, marketplaces, calculators, and membership products
- dashboards and internal tools
- booking, payment, and content-driven systems

### Existing systems

- finishing incomplete projects
- repairing authentication, deployment, integrations, or data flow
- extending React/Next.js or adjacent applications
- refactoring maintainability problems
- localization and multilingual implementation
- performance and reliability improvements

### CMS work

- Payload CMS
- WordPress
- headless CMS platforms
- custom administration areas
- content migrations and structured editorial workflows

### Automation and AI

- n8n or custom workflow automation
- lead research and qualification
- email and follow-up workflows
- Telegram bots
- CRM, spreadsheet, Gmail, Outlook, and API integrations
- document processing and report generation
- internal knowledge assistants
- AI agents and human-in-the-loop workflows
- non-AI business-process automation

### Consulting

- MVP planning
- architecture and stack selection
- implementation estimates
- automation feasibility
- migration planning
- review of an existing codebase or workflow

## Search philosophy

Search by business problem and desired outcome as well as by technology.

Examples of broad searches:

- build or finish a customer portal
- automate a sales or research workflow
- replace a manual spreadsheet process
- connect a CRM, email, and reporting system
- build a multilingual service platform
- create an admin panel or CMS-driven site
- repair or complete an existing application

Technology-specific searches remain useful, but they are only one search track.

## Fit levels

### Direct fit

The owner already has strong, relevant delivery experience.

### Adjacent fit

The exact product or tool differs, but the underlying architecture and work are familiar.

### Learnable fit

Some components are new, but the scope is controlled, documentation is available, and learning can occur without endangering delivery.

### Risky fit

The project depends on deep specialist knowledge, regulation, security, scale, or technology that cannot responsibly be acquired during delivery.

The agent may recommend the first three levels with suitable caveats. It should normally reject or strongly warn about risky-fit work.

## Evaluation output

Each evaluation should provide:

- total score from 0 to 100;
- primary and secondary categories;
- fit level;
- concise project summary;
- strong-match reasons;
- missing or uncertain requirements;
- delivery risks;
- learning effort;
- credibility and budget observations;
- one or more possible solution approaches;
- suggested questions for the client;
- recommendation: `priority`, `apply`, `review`, `skip`, or `reject`.

## Proposal rules

A generated proposal must:

- begin with the actual client problem;
- be tailored to the listing;
- mention only verified skills and experience;
- explain a practical next step or likely approach;
- avoid excessive stack dumping;
- include one useful clarification question;
- remain concise unless the opportunity requires a detailed response;
- never be sent automatically.

## Human control

The owner must explicitly approve:

- proposal generation where paid model usage is significant;
- any outbound email or platform message;
- application submission;
- follow-up sending;
- changes to professional claims or portfolio data.

## Initial non-goals

- automatic marketplace login
- CAPTCHA bypass
- prohibited scraping
- fully autonomous applications
- bulk cold outreach
- automatic pricing commitments
- a multi-user SaaS product
- a complex analytics dashboard

## Success criteria for the first milestone

The first milestone is successful when the owner can send a real project description to Telegram and receive a stored, useful, honest evaluation plus a reviewable tailored proposal.
