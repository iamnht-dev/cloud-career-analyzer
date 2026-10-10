# ☁️ Cloud Career Readiness Analyzer (Enterprise Edition)

> An Enterprise-grade, AI-powered web application that analyzes your CV and evaluates your readiness for Cloud/AWS career paths. Built with a highly decoupled, event-driven serverless architecture on AWS.

![AWS](https://img.shields.io/badge/AWS-Powered-orange?logo=amazonaws)
![Architecture](https://img.shields.io/badge/Architecture-Event--Driven-purple)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![IaC](https://img.shields.io/badge/IaC-AWS_SAM-red?logo=aws)

---

## 🎯 What is this?

Unlike generic CV analyzers, **Cloud Career Readiness Analyzer** focuses 100% on **Cloud & AWS career paths**. 

Upload your CV and get:
- 📊 **Readiness Score** — How ready are you for your target Cloud role?
- 🕳️ **Skill Gap Analysis** — What's missing compared to industry requirements?
- 🏅 **Certification Roadmap** — Which AWS certifications should you pursue next?

---

## 🏗️ Enterprise Architecture

This project simulates a production-ready, 4-person team scale architecture, utilizing advanced AWS services for Orchestration, Data Analytics, and Infrastructure as Code (IaC).

```
[Frontend & Auth]
[AWS Amplify] ← React UI
[Amazon Cognito] ← Authentication

[API & Event Routing]
[API Gateway] → [Lambda Proxy] → Trigger Orchestration

[Workflow Orchestration - Core Engine]
[AWS Step Functions] 
   ├── Step 1: [Amazon S3] (Store PDF)
   ├── Step 2: [Amazon Textract] (Extract Text async)
   ├── Step 3: [OpenAI API] (AI Analysis through the AnalyzeCV Lambda)
   └── Step 4: [Lambda] (Aggregate & Format Results)

[Storage & Delivery]
   ├── [Amazon DynamoDB] (Store Results)
   └── [Amazon SNS] (Email Notification)

[Data Analytics Pipeline (For Admin/Business Insights)]

[DynamoDB Streams] → [Kinesis Firehose] → [S3 Data Lake] → [Amazon Athena]
(Query aggregate data: e.g., "Most lacking AWS skills among applicants")

[Observability & IaC]
[Amazon CloudWatch] (Logs & Metrics)
[AWS SAM / CloudFormation] (Infrastructure as Code)
```

## OpenAI CV analysis setup

The `AnalyzeCVFunction` Lambda calls OpenAI's Responses API using `gpt-4.1-mini` by default. Set `OPENAI_API_KEY` in that Lambda's environment configuration in the AWS Console after deploying the stack. Keep the key out of the frontend, source control, and `samconfig.toml`. The function returns a clearly marked fallback result when the key is missing or the API call fails.

You can set `OPENAI_MODEL` on the Lambda to select another model enabled for your OpenAI API project. API usage is billed separately from ChatGPT subscriptions; check the API project's billing and limits before using it with real CVs. CV text is sent to OpenAI for analysis.

### 🌟 Key Enterprise Features
1. **AWS Step Functions Orchestration:** Replaces monolithic Lambda functions with a visual, stateful workflow, enabling easy retries, error handling, and parallel AI processing.
2. **Data Analytics Pipeline:** Uses Kinesis and Athena to create a serverless data lake, allowing business analytics without impacting the operational database.
3. **Infrastructure as Code (IaC):** The entire backend is deployed using AWS SAM (Serverless Application Model), ensuring reproducible and scalable environments.

---

## 🗂️ Project Structure

```
cloud-career-analyzer/
├── frontend/                  # React + TypeScript (Vite)
│   ├── src/
│   └── package.json
├── backend/                   # AWS SAM Infrastructure
│   ├── statemachine/          # Step Functions definition (ASL)
│   ├── functions/             # Lambda function handlers
│   │   ├── extract_text/
│   │   ├── analyze_bedrock/
│   │   └── save_results/
│   └── template.yaml          # AWS SAM Infrastructure Definition
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- AWS CLI configured
- AWS SAM CLI installed

### Run Locally (Frontend)
```bash
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Author

**iamnht-dev**
- GitHub: [@iamnht-dev](https://github.com/iamnht-dev)
- Program: AWS Challenger — FCAJ
