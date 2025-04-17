import {
  Account,
  Avatars,
  Client,
  OAuthProvider,
  Databases,
  ID,
  Permission,
  Role,
  Query,
  Models
} from 'react-native-appwrite'
import * as Linking from 'expo-linking'
import { openAuthSessionAsync } from "expo-web-browser";

interface StatsData {
  total: number;
  success: number;
  missed: number;
  successPercentage: number;
  missedPercentage: number;
}

interface StatsSuccess {
  success: true;
  data: StatsData;
}

interface StatsError {
  success: false;
  message: string;
}

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
export const databases = new Databases(client);

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL("*");


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

export async function createTracker(
    id: string,
    userId: string,
    name: string,
    createdAt: string
): Promise<Models.Document | { error: string }> {
  try {
    // Step 1: Check if tracker with the same name already exists for the user
    const existing = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID!,
        [
          Query.equal('userId', userId),
          Query.equal('name', name)
        ]
    );

    if (existing.total > 0) {
      return { error: 'Tracker name already exists. Please choose a new name.' };
    }

    // Step 2: Create new tracker
    const response = await databases.createDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID!,
        id,
        {
          id,
          userId,
          name,
          createdAt
        },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
    );

    return response;

  } catch (error) {
    console.error('Create Error:', error);
    throw error;
  }
}

export async function deleteTracker(id: string, userId: string)  {
  try {
    const existingTracker = await  databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID!,
        [
            Query.equal('userId', userId),
            Query.equal('id', id),
        ]
    );

    if(existingTracker.total === 0){
      return { success: false, message: 'Tracker not found or not authorized.' };
    }

    const documentId = existingTracker.documents[0].$id;

    await databases.deleteDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID!,
        documentId
    );

    return { success: true, message: 'Tracker deleted successfully.' };
  }catch (error){
    console.error('Delete Error:', error);
    return { success: false, message: 'Something went wrong while deleting the tracker.' };
  }
}

export async function editTracker(id: string, userId: string, name: string){
  try {
     const trackerFound = await databases.listDocuments(
         process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
         process.env.EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID!,
         [
             Query.equal('id', id),
             Query.equal('userId', userId)
         ]
     )
    if(!trackerFound){
      return { success: false, message: 'Tracker not found or not authorized.' };
    }

    const docId = trackerFound.documents[0].$id;
    const updatedTracker = await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID!,
        docId,
        {name}
    );
    return { success: true, message: "Tracker updated successfully.", data: updatedTracker };
  } catch (error: any) {
    console.error("Error editing tracker:", error);
    return { success: false, message: error?.message || "Something went wrong." };
  }
}

export async function fetchTracker(userId: string) {
  try {
    const trackers = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID!,
        [
          Query.equal('userId', userId),
        ],

    );

    return { success: true, trackers: trackers.documents };

  } catch (error) {
    console.error('Fetch Error:', error);
    return { success: false, message: 'An error occurred while fetching trackers.' };
  }
}

export async function fetchSingleTracker(id: string, userId: string) {
  try {
    const singleTracker = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_TRACKER_COLLECTION_ID!,
        [
            Query.equal('id', id),
            Query.equal('userId', userId),
        ]
    )
    return {success: true, tracker: singleTracker.documents}
  }catch (error){
    console.error('Fetch Error:', error);
  }
}

export async function createEntry(userId: string, trackerId: string, date: string, status: boolean) {
  try {
    const res = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_ENTRIES_COLLECTION_ID!,
        [
          Query.equal("userId", userId),
          Query.equal("trackerId", trackerId),
          Query.equal("date", date),
        ]
    )

    if (res.documents.length > 0) {
      // Entry exists, update it
      const existing = res.documents[0]
      const updated = await databases.updateDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_ENTRIES_COLLECTION_ID!,
          existing.$id,
          { status }
      )
      return updated
    } else {
      // Entry does not exist, create it
      const created = await databases.createDocument(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_ENTRIES_COLLECTION_ID!,
          ID.unique(),
          {
            userId,
            trackerId,
            date,
            status
          },
          [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
      )
      return created
    }
  } catch (error) {
    console.error("Upsert Entry Error:", error)
    return null
  }
}

export async function fetchStatus(userId: string, trackerId: string, date: string) {
  try {
    const res = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_ENTRIES_COLLECTION_ID!,
        [
          Query.equal("userId", userId),
          Query.equal("trackerId", trackerId),
          Query.equal("date", date),
        ]
    )

    if (res.documents.length > 0) {
      const entry = res.documents[0]
      return {
        status: entry.status,
        entryId: entry.$id,
        date: entry.date,
      }
    } else {
      return {
        status: false,
        entryId: null,
        date: null,
      }
    }
  } catch (error) {
    console.error("Fetch Status Error:", error)
    return {
      status: false,
      entryId: null,
      date: null,
    }
  }
}

export async function updateEntry(entryId: string, status: boolean, userId: string) {
  try {
    const result = await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_ENTRIES_COLLECTION_ID!,
        entryId,
        {
          status: status,
        }
    )

    return result
  } catch (error) {
    console.error('Update Entry Error:', error)
    return null
  }
}

export async function fetchStats(trackerId: string, selectedMonth: number): Promise<StatsSuccess | StatsError> {
  try {
    const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.EXPO_PUBLIC_APPWRITE_ENTRIES_COLLECTION_ID!,
        [Query.equal("trackerId", trackerId)]
    )

    const entries = response.documents;

    const filteredEntries = entries.filter((entry) => {
      const date = new Date(entry.$createdAt);
      return date.getMonth() === selectedMonth;
    })

    const successCount = filteredEntries.filter((e) => e.status === true).length;
    const missedCount = filteredEntries.filter((e) => e.status === false).length;

    // Avoid division by zero
    const total = filteredEntries.length;
    const successPercentage = total > 0 ? (successCount / total) * 100 : 0;
    const missedPercentage = total > 0 ? (missedCount / total) * 100 : 0;

    return {
      success: true,
      data: {
        total: total,
        success: successCount,
        missed: missedCount,
        successPercentage: successPercentage,
        missedPercentage: missedPercentage,
      }
    }
  } catch (error) {
    console.error('Fetch Stats Error:', error)
    return {
      success: false,
      message: "Failed to fetch stats."
    }
  }
}

