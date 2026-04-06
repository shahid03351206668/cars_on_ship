import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useRegister } from "../../hooks/useAuth";
import type { RegisterPayload, UserRole } from "../../api/auth";

export default function RegisterFields() {
  const [form, setForm] = useState<RegisterPayload>({
    user_name: "",
    email: "",
    phone: "",
    role: "Buyer",
  });

  const { mutate: register, isPending, error, isSuccess } = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Name</label>
        <Input
          name="user_name"
          placeholder="Your username"
          value={form.user_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Phone</label>
        <Input
          name="phone"
          type="tel"
          placeholder="+92 300 0000000"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-gray-400">
          Your phone number will also serve as your password.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">User Type</label>
        <Select
          value={form.role}
          onValueChange={(val) =>
            setForm((p) => ({ ...p, role: val as UserRole }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Buyer">Buyer</SelectItem>
            <SelectItem value="Sales User">Sales User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="px-3 py-2 text-sm text-center text-red-500 rounded-md bg-red-50">
          {(error as Error).message}
        </p>
      )}

      {isSuccess && (
        <p className="px-3 py-2 text-sm text-center text-green-600 rounded-md bg-green-50">
          Account created! Redirecting to login…
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full mt-1 bg-[#FC7844] hover:bg-[#FC7844]/90 text-white">
        {isPending ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}