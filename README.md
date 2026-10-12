# Cloud Career Readiness Analyzer

A React web app that reads a PDF CV and evaluates it for a selected role. Users can also provide a job description or extra instructions, so the analysis is not limited to the built-in IT roles.

![AWS](https://img.shields.io/badge/AWS-SAM-orange?logo=amazonaws)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-React-blue?logo=typescript)

## What it does

- Accepts PDF files up to 5 MB.
- Uploads the PDF to an S3 bucket using a presigned URL.
- Extracts text in Lambda with `pdf-parse`.
- Evaluates the CV against a selected role and optional job description or custom instructions.
- Returns a score, summary, strengths, skill gaps, and recommended certifications.
- Saves analysis results to DynamoDB history for up to 90 days. CV text is not saved in the history table.

## Current architecture

```text
React + TypeScript app (Vite; email sign-up/sign-in with Amazon Cognito)
  └─ Cognito ID token ──> API Gateway Cognito authorizer protects API routes
  │
  ├─ GET /upload-url ──> Lambda creates a 5-minute S3 presigned URL
  │                         └─ Browser uploads PDF directly to S3
  ├─ POST /extract ─────> Lambda downloads PDF and extracts text with pdf-parse
  ├─ POST /analyze ─────> Lambda calls Groq, or OpenAI if no Groq key is set
  │                         └─ Uses a labeled mock result if no provider works
  └─ GET/POST /analysis-history ──> Lambda reads/writes result records in DynamoDB

AWS SAM / CloudFormation provisions the API Gateway, Lambda functions, S3 bucket,
and DynamoDB table. Lambda logs go to CloudWatch.
```

The deployed analysis Lambda currently prefers Groq when `GROQ_API_KEY` is set. It uses Groq's `openai/gpt-oss-20b` model by default. If no Groq key is present, it tries OpenAI with `gpt-4.1-mini` when `OPENAI_API_KEY` is set. Set `GROQ_MODEL` or `OPENAI_MODEL` to select another model supported by the selected provider. If the provider call fails, the API returns a clearly labeled mock result; it does not switch from a failed Groq request to OpenAI automatically.

## Data and current limitations

- CV text is sent to the selected model provider (Groq or OpenAI) for analysis. Use CVs only when you are comfortable sending their contents to that provider.
- Uploaded PDFs are stored in S3. The current SAM template has no S3 lifecycle rule to delete them automatically.
- Cognito email sign-up requires email confirmation. The public app client has no client secret; API requests use the user's Cognito ID token. Session tokens are stored in browser local storage.
- History is partitioned by the authenticated Cognito user ID (`sub`), and uploaded PDF object keys are scoped to that user. The extract endpoint checks ownership.
- The API allows requests from any origin through CORS. Restrict CORS to the deployed frontend origin before using this as a public production service.
- The preset role list contains Cloud Engineer, Frontend Developer, Backend Developer, Fullstack Developer, Data Analyst, and DevOps Engineer. The optional instructions field can specify another role or include a JD.
- The current deployment uses `pdf-parse` and Cognito User Pools; it does not use Amazon Textract, Step Functions, SNS, Kinesis, or Athena.

## Configure an AI provider

Set the provider key as an environment variable on the `AnalyzeCVFunction` Lambda in the AWS Console. For the current Groq setup, add `GROQ_API_KEY`. Do not put API keys in the frontend, source control, or `samconfig.toml`.

The key is currently configured manually in Lambda and is not managed by the SAM template. A later `sam deploy` can replace the Lambda environment variables, so re-add the key after deploying unless you move it to a managed secret configuration.

## Run locally

Prerequisites: Node.js, npm, and the deployed backend API URL. AWS CLI credentials are needed only when deploying the backend.

Copy `frontend/.env.example` to `frontend/.env`. Set the API URL and Cognito client ID from the SAM stack outputs:

```env
VITE_API_URL=https://your-api-id.execute-api.your-region.amazonaws.com/Prod/upload-url
VITE_COGNITO_REGION=ap-southeast-1
VITE_COGNITO_CLIENT_ID=your-user-pool-client-id
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Deploy the backend

Install the AWS CLI and AWS SAM CLI, configure AWS credentials, then run from `backend/`:

```bash
sam build
sam deploy
```

The stack is configured in `backend/samconfig.toml` and creates the Cognito User Pool, public app client, and API Gateway Cognito authorizer. After deployment, use `ApiEndpoint`, `CognitoRegion`, and `CognitoUserPoolClientId` outputs in `frontend/.env`. Reconfigure the provider key in the Lambda after each SAM deployment.

## Project structure

```text
cloud-career-analyzer/
├── frontend/                         # React, TypeScript, and Vite app
│   └── src/
│       └── App.tsx
├── backend/
│   ├── functions/
│   │   ├── get_upload_url/           # Creates the S3 presigned upload URL
│   │   ├── extract_text/             # Reads PDF text from S3
│   │   ├── analyze_cv/               # Groq/OpenAI analysis and mock fallback
│   │   └── analysis_history/         # DynamoDB analysis history
│   ├── template.yaml                 # SAM infrastructure definition
│   └── samconfig.toml                # SAM deployment settings
└── README.md
```

## Author

**iamnht-dev** · [GitHub](https://github.com/iamnht-dev)
