export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_collections: {
        Row: {
          user_id: string
          collected_items: string[] | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          collected_items?: string[] | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          collected_items?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      friend_posts: {
        Row: {
          id: string
          user_id: string
          username: string
          friend_code: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          friend_code: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          friend_code?: string
          message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
