type CognitoSession = {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const STORAGE_KEY = 'cloud-career-analyzer-auth';
const REGION = import.meta.env.VITE_COGNITO_REGION;
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;

function requireConfig() {
  if (!REGION || !CLIENT_ID) {
    throw new Error('Cognito chưa được cấu hình. Hãy thiết lập VITE_COGNITO_REGION và VITE_COGNITO_CLIENT_ID.');
  }
}

function readSession(): CognitoSession | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(session: CognitoSession | null) {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('cognito-session-change'));
}

async function cognitoRequest<T>(target: string, body: object): Promise<T> {
  requireConfig();
  const response = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Yêu cầu xác thực thất bại.');
  return data as T;
}

type AuthResult = { IdToken: string; AccessToken: string; RefreshToken?: string; ExpiresIn: number };

function acceptTokens(tokens: AuthResult, previous?: CognitoSession) {
  const session = {
    idToken: tokens.IdToken,
    accessToken: tokens.AccessToken,
    refreshToken: tokens.RefreshToken || previous?.refreshToken || '',
    expiresAt: Date.now() + tokens.ExpiresIn * 1000,
  };
  saveSession(session);
  return session;
}

export async function signIn(email: string, password: string) {
  const result = await cognitoRequest<{ AuthenticationResult?: AuthResult; ChallengeName?: string }>('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email.trim().toLowerCase(), PASSWORD: password },
  });
  if (!result.AuthenticationResult) throw new Error(`Cognito yêu cầu bước xác thực bổ sung (${result.ChallengeName || 'challenge'}).`);
  acceptTokens(result.AuthenticationResult);
}

export async function signUp(email: string, password: string) {
  return cognitoRequest('SignUp', {
    ClientId: CLIENT_ID,
    Username: email.trim().toLowerCase(),
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email.trim().toLowerCase() }],
  });
}

export async function confirmSignUp(email: string, code: string) {
  await cognitoRequest('ConfirmSignUp', { ClientId: CLIENT_ID, Username: email.trim().toLowerCase(), ConfirmationCode: code.trim() });
}

export async function resendConfirmationCode(email: string) {
  await cognitoRequest('ResendConfirmationCode', { ClientId: CLIENT_ID, Username: email.trim().toLowerCase() });
}

export async function getIdToken(): Promise<string | null> {
  let session = readSession();
  if (!session) return null;
  if (session.expiresAt > Date.now() + 60_000) return session.idToken;
  if (!session.refreshToken) {
    saveSession(null);
    return null;
  }
  try {
    const result = await cognitoRequest<{ AuthenticationResult: AuthResult }>('InitiateAuth', {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: { REFRESH_TOKEN: session.refreshToken },
    });
    session = acceptTokens(result.AuthenticationResult, session);
    return session.idToken;
  } catch {
    saveSession(null);
    return null;
  }
}

export async function signOut() {
  const session = readSession();
  if (session?.accessToken) {
    try {
      await cognitoRequest('GlobalSignOut', { AccessToken: session.accessToken });
    } catch {
      // Clear the local session even if the access token has already expired.
    }
  }
  saveSession(null);
}

export function currentUserEmail() {
  return readTokenClaim('email');
}

export function currentUserSub() {
  return readTokenClaim('sub');
}

function readTokenClaim(name: string) {
  const token = readSession()?.idToken;
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return String(payload[name] || '');
  } catch {
    return '';
  }
}
