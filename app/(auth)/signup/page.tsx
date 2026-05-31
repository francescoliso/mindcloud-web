import { AuthForm } from "@/components/auth-form";
import { signup } from "@/actions/auth";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
