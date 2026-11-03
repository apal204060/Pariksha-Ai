import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState } from '../types/study';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
// Cache the access token strictly in memory (never in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get Google Drive access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface DriveBackupFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

const BACKUP_FILENAME = 'pariksha_ai_study_backup.json';

export async function listDriveBackupFiles(): Promise<DriveBackupFile[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }
  const query = encodeURIComponent(
    `name = '${BACKUP_FILENAME}' and trashed = false`
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive list failed (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return Array.isArray(data.files) ? data.files : [];
}

export async function saveBackupToGoogleDrive(
  state: AppState,
  existingFileId?: string
): Promise<DriveBackupFile> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const metadata = {
    name: BACKUP_FILENAME,
    mimeType: 'application/json',
    description: 'Pariksha AI Study Tracker, Uploaded Documents, and Test History Backup',
  };

  const fileContent = JSON.stringify(state, null, 2);
  const boundary = '-------pariksha_ai_drive_boundary_987654';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,modifiedTime,size`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size`;

  const method = existingFileId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive backup upload failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

export async function loadBackupFromGoogleDrive(fileId: string): Promise<AppState> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive restore failed (${res.status}): ${errText}`);
  }
  return await res.json();
}

export async function deleteBackupFromGoogleDrive(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive delete failed (${res.status}): ${errText}`);
  }
}
