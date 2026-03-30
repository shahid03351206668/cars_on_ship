import LoginFields from "./LoginFields";
import RegisterFields from "./RegisterFields";

export type AuthType = "login" | "register";

interface Props {
  type: AuthType;
}

export default function AuthForm({ type }: Props) {
  return (
    <div className="w-full">
      <h2 className="mb-1 text-xl font-bold text-gray-900">
        {type === "login" ? "Welcome back" : "Create account"}
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        {type === "login"
          ? "Sign in to your account"
          : "Fill in your details to get started"}
      </p>

      {type === "login" ? <LoginFields /> : <RegisterFields />}
    </div>
  );
}