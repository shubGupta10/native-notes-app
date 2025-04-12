import { Account, Avatars, Client, OAuthProvider, Databases, ID, Permission, Role, Query } from 'react-native-appwrite'
import * as Linking from 'expo-linking'
import { openAuthSessionAsync } from "expo-web-browser";

interface UpdatedField {
  title?: string;
  category?: string;
  content?: string;
}

export const config = {
  platform: "com.note.nest",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}

export const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL("auth-callback");


    // Step 1: Request OAuth2 URL from Appwrite
    const response = await account.createOAuth2Token(OAuthProvider.Google, redirectUri);

    if (!response) throw new Error("❌ Failed to get OAuth URL");

    // Step 2: Open web browser for authentication
    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );

    if (browserResult.type !== "success" || !browserResult.url) {
      throw new Error("❌ OAuth flow was cancelled or failed");
    }

    // Step 3: Parse the redirect URL to extract secrets
    const url = new URL(browserResult.url);

    const secret = url.searchParams.get('secret')?.toString();
    const userId = url.searchParams.get('userId')?.toString();

    if (!userId || !secret) {
      throw new Error("❌ Missing userId or secret in redirect URL");
    }

    // Step 4: Create a session with the extracted credentials
    const session = await account.createSession(userId, secret);

    if (!session) throw new Error("❌ Failed to create session");

    return session;

  } catch (error) {
    console.error("🚨 Login failed:", error);
    return false;
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getUser() {
  try {
    try {
      const session = await account.getSession('current');
      if (!session) {
        return null;
      }
    } catch (sessionError) {
      return null;
    }

    const response = await account.get();
    if (response.$id) {
      const userAvatar = avatar.getInitials(response.name);
      return {
        ...response,
        avatar: userAvatar.toString(),
      };
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function saveNote({
  title,
  category,
  content,
  userId
}: {
  title: string,
  category: string,
  content: string,
  userId: string
}) {
  try {
    const response = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      ID.unique(),
      {
        title,
        category,
        content,
        userId
      },
      [
        Permission.read(Role.user(userId)),   // Only the user can read
        Permission.update(Role.user(userId)), // Only the user can update
        Permission.delete(Role.user(userId)), // Only the user can delete
      ]
    );
    return response;
  } catch (error) {
    console.error("Error saving note:", error);
    throw error;
  }
}

export async function fetchNotesByUserId(userId: string) {
  try {
    const response = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      [
        Query.equal('userId', userId)
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Failed to save notes", error);
    return [];
  }
}

export async function fetchNoteById(documentId: string){
  try {
    const document = await databases.getDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      documentId
    )

    if(document.$id !== documentId){
      console.warn("Document does not exist")
    }

    return document;
  } catch (error) {
    console.error("Failed to fetch note by Id", error);
    return null;
  }
}

export async function deleteNoteByUserIdAndDocumentId(userId: string, documentId: string) {
  try {
    const document = await databases.getDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      documentId
    );

    if (document.userId !== userId) {
      console.warn("Unauthorized: userId does not match this document ❌");
      return;
    }

    await databases.deleteDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      documentId
    );

    console.log("Note deleted successfully ✅");
  } catch (error) {
    console.error("Delete Error:", error);
  }
}

export async function editNoteByUserIdAndDocumentId(
  userId: string,
  documentId: string,
  updatedField: UpdatedField
): Promise<any> {
  try {
    const document = await databases.getDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      documentId
    );

    if (document.userId !== userId) {
      console.warn("Unauthorized: userId does not match this document");
      return;
    }

    const updatedDoc = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
      documentId,
      updatedField
    );

    console.log("Note updated successfully");
    return updatedDoc;

  } catch (error) {
    console.error("Update Error:", error);
  }
}
