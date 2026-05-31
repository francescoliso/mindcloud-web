import { AuthForm } from "@/components/auth-form";
import { login } from "@/actions/auth";

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
