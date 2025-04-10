import { Alert, TouchableOpacity } from 'react-native'
import React from 'react'
import { deleteNoteByUserIdAndDocumentId } from '@/lib/appwrite'
import { Trash2 } from 'lucide-react-native'

type DeleteNoteProps = {
  userId: string;
  documentId: string;
  onDeleteSuccess?: () => void;
}

const DeleteNote = ({ userId, documentId, onDeleteSuccess }: DeleteNoteProps) => {
  const handleDelete = async () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNoteByUserIdAndDocumentId(userId, documentId);
              Alert.alert("Success", "Your note has been deleted");
              if (onDeleteSuccess) {
                onDeleteSuccess();
              }
            } catch (error) {
              console.error("Failed to delete note", error);
              Alert.alert("Failed", "Failed to delete your note. Please try again.")
            }
          }
        }
      ]
    );
  }
  
  return (
    <TouchableOpacity 
      onPress={handleDelete}
      className="p-2 rounded-full"
      activeOpacity={0.7}
    >
      <Trash2 size={20} color="#EF4444" />
    </TouchableOpacity>
  )
}

export default DeleteNote