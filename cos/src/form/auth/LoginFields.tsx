import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useLogin } from "../../hooks/useAuth";

export default function LoginFields() {
  const [form, setForm] = useState({ usr: "", phone: "" });
  const { mutate: login, isPending, error } = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // usr = email, pwd will be derived from phone inside loginUser
    login(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <Input
          name="usr"
          type="email"
          placeholder="you@example.com"
          value={form.usr}
          onChange={handleChange}
          required
        />
      </div> */}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Phone Number</label>
        <Input
          name="phone"
          type="tel"
          placeholder="+92 300 0000000"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-gray-400">
          Your phone number is used to verify your identity.
        </p>
      </div>

      {error && (
        <p className="px-3 py-2 text-sm text-center text-red-500 rounded-md bg-red-50">
          {(error as Error).message}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full mt-1 bg-[#FC7844] hover:bg-[#FC7844]/90 text-white">
        {isPending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}