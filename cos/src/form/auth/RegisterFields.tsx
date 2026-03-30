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
    first_name: "",
    last_name: "",
    email: "",
    mobile_no: "",
    new_password: "",
    role: "Buyer",
  });

  const { mutate: register, isPending, error } = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input
            name="first_name"
            placeholder="John"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input
            name="last_name"
            placeholder="Doe"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>
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
        <label className="text-sm font-medium text-gray-700">Mobile Number</label>
        <Input
          name="mobile_no"
          type="tel"
          placeholder="+92 300 0000000"
          value={form.mobile_no}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <Input
          name="new_password"
          type="password"
          placeholder="Min. 8 characters"
          value={form.new_password}
          onChange={handleChange}
          required
          minLength={8}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">I want to…</label>
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
            <SelectItem value="Buyer">Buy a car</SelectItem>
            <SelectItem value="Sales User">Sell a car</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="px-3 py-2 text-sm text-center text-red-500 rounded-md bg-red-50">
          {(error as Error).message}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full mt-1">
        {isPending ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}