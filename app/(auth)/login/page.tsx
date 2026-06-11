import { AuthForm } from "@/components/auth-form";
import { login } from "@/actions/auth";

// Always render fresh so a redeploy is reflected immediately (no ISR window).
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
