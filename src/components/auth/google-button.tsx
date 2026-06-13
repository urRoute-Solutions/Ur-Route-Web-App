"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * "Continue with Google" button. Renders nothing when the public client id is
 * absent so the page degrades gracefully in environments without Google auth.
 */
export function GoogleButton({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) return null;

  async function handleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) return;
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: credentialResponse.credential }),
    });
    if (res.ok) {
      const json = await res.json();
      const role: string = json.data?.user?.role ?? "TRAVELER";
      if (role === "ADMIN") router.push("/admin");
      else if (role === "OPERATOR") router.push("/operator/dashboard");
      else router.push(redirectTo);
    } else {
      toast.error("Google sign-in failed. Please try again.");
    }
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error("Google sign-in failed")}
          useOneTap={false}
          shape="rectangular"
          size="large"
          width="100%"
          text="continue_with"
          theme="outline"
        />
      </div>
    </GoogleOAuthProvider>
  );
}
