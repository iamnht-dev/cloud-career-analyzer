# Cloud Career Readiness Analyzer

A React and TypeScript app that analyzes a PDF CV against a selected role, job description, or custom instructions. Users can create an account, analyze CVs, and view their own analysis history.

## Features

- Email registration, verification, sign-in, and token refresh with Amazon Cognito.
- PDF upload up to 5 MB through a short-lived Amazon S3 presigned URL.
- CV text extraction in AWS Lambda with `pdf-parse`.
- AI feedback with a score, summary, strengths, skill gaps, and suggested certifications.
- Per-user analysis history in DynamoDB, automatically expired after 90 days.
- Uploaded PDFs are scoped to the owner and stored in S3. Configure an S3 lifecycle policy if automatic cleanup is needed.

## Architecture

```text
React + TypeScript (Vite)
  | Cognito ID token
API Gateway + Cognito User Pool authorizer
  |-- GET /upload-url -> Lambda -> S3 presigned upload (user-scoped key)
  |-- POST /extract -> Lambda -> S3 PDF ownership check -> pdf-parse
  |-- POST /analyze -> Lambda -> Groq / OpenAI / mock fallback
  `-- GET,POST /analysis-history -> Lambda -> DynamoDB (partitioned by Cognito sub)

AWS SAM / CloudFormation provisions Cognito, API Gateway, Lambda, S3, and DynamoDB.
CloudWatch stores Lambda logs.
```

The analyzer uses Groq first when its SecureString is available in Systems Manager Parameter Store. It uses OpenAI if its optional SecureString is available and Groq is unavailable. If an AI provider call fails, the API returns a labeled mock result.

## Data and limitations

- CV text is sent to the selected AI provider for analysis. Avoid uploading CVs unless you are comfortable sharing their contents with that provider.
- Analysis history stores feedback and scores, not CV text, and expires after 90 days.
- Uploaded PDF files remain in S3 until deleted or an S3 lifecycle policy is configured.
- Cognito tokens are stored in browser local storage. Keep the frontend free from provider API keys.
- API CORS currently allows all origins. Restrict it to the hosted frontend domain before public production use.
- The current architecture does not use Textract, Step Functions, SNS, Kinesis, or Athena.

## Requirements

- Node.js 24 and npm
- AWS CLI and AWS SAM CLI
- AWS credentials with permission to deploy the SAM stack
- A Groq API key (optional OpenAI API key fallback)

## Configure the AI key

Store the Groq key as an AWS Systems Manager Parameter Store `SecureString` named `/cloud-career-analyzer/GROQ_API_KEY`. To enable the optional OpenAI fallback, store its key as `/cloud-career-analyzer/OPENAI_API_KEY`, also as a `SecureString`. The Lambda reads these through the AWS Parameters and Secrets Lambda Extension; SAM grants access to the two parameters. Do not put keys in source control, frontend variables, or `samconfig.toml`.

If a provider key is currently configured directly on the deployed Lambda, migrate it to the matching SecureString parameter before deploying this template. The migration should read the current value through the AWS CLI without printing it. Keep keys out of terminal logs and chat.

## Deploy the backend

Use an AWS CLI profile with permission to deploy the stack, then build and deploy from `backend/`:

```powershell
cd backend
sam build
sam deploy --profile default --no-confirm-changeset
```

The SAM stack name and region are set in `backend/samconfig.toml` (`cloud-career-analyzer`, `ap-southeast-1`). Deployment creates the Cognito User Pool, app client, and API authorizer. The stack outputs include `ApiEndpoint`, `CognitoRegion`, and `CognitoUserPoolClientId`.

## Run the frontend

Copy `frontend/.env.example` to `frontend/.env` and fill in the deployed stack outputs:

```env
VITE_API_URL=https://your-api-id.execute-api.ap-southeast-1.amazonaws.com/Prod/upload-url
VITE_COGNITO_REGION=ap-southeast-1
VITE_COGNITO_CLIENT_ID=your-user-pool-client-id
```

Then run:

```powershell
cd frontend
npm install
npm run dev
```

For a hosted frontend, configure the same three `VITE_` variables in its build settings and publish a fresh build after backend deployment.

## Project structure

```text
cloud-career-analyzer/
|-- frontend/                         # React, TypeScript, and Vite
|   `-- src/
|       |-- App.tsx
|       `-- cognito.ts                # Cognito sign-up/sign-in and token management
|-- backend/
|   |-- functions/
|   |   |-- get_upload_url/           # Creates a user-scoped S3 upload URL
|   |   |-- extract_text/              # Reads and extracts PDF text
|   |   |-- analyze_cv/                # Groq/OpenAI analysis and fallback
|   |   `-- analysis_history/          # Per-user DynamoDB history
|   |-- template.yaml                 # SAM infrastructure definition
|   `-- samconfig.toml                # Deployment settings
`-- README.md
```

## Author

**iamnht-dev** · [GitHub](https://github.com/iamnht-dev)
