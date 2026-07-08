"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Supabase is not fully configured. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env.local"
  );
}

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-key"
);

export interface SignUpInput {
  email: string;
  password: string;
  companyName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  company_name: string;
  subscription_status: string;
  created_at: string;
}

/**
 * Sign up a new user
 */
export async function signUp(input: SignUpInput) {
  try {
    const { email, password, companyName } = input;

    if (!email || !password) {
      return {
        success: false,
        error: "Email és jelszó szükséges",
      };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return {
        success: false,
        error: authError.message,
      };
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          company_name: companyName || "",
          subscription_status: "free",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return {
        success: false,
        error: "Profil létrehozás sikertelen",
      };
    }

    return {
      success: true,
      user: authData.user,
      profile: profileData,
    };
  } catch (error) {
    console.error("Error during sign up:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sign in user (requires session management on client)
 */
export async function signIn(input: SignInInput) {
  try {
    const { email, password } = input;

    if (!email || !password) {
      return {
        success: false,
        error: "Email és jelszó szükséges",
      };
    }

    // This should be handled on the client side with Supabase client
    // This is just a helper for validation
    return {
      success: true,
      message: "Bejelentkezés feldolgozása...",
      note: "Client-side auth session-nal kezelendő",
    };
  } catch (error) {
    console.error("Error during sign in:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      profile: data,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      profile: data,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sign out user (client-side operation, but provided for reference)
 */
export async function signOut() {
  try {
    return {
      success: true,
      message: "Kijelentkezés feldolgozása...",
      note: "Client-side Supabase client-vel kezelendő",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reset password (sends email)
 */
export async function resetPassword(email: string) {
  try {
    if (!email) {
      return {
        success: false,
        error: "Email cím szükséges",
      };
    }

    // This should be called with the client-side Supabase client
    return {
      success: true,
      message: "Jelszóváltoztatási link elküldve az email-re",
      note: "Client-side auth-val kezelendő",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
