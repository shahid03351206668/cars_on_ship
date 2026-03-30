import { useState } from "react";
import AuthForm from "@/form/auth/AuthForm";
import type { AuthType } from "@/form/auth/AuthForm";

import loginImg from "@/assets/auth/login.jpg";
import registerImg from "@/assets/auth/register.jpg";

export default function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AuthType>("login");

  return (
    <>
      {/* Trigger Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => { setType("login"); setOpen(true); }}
          className="border border-[#FC7844] text-[#FC7844] hover:bg-[#FC7844] hover:text-white text-xs h-8 px-4 rounded"
        >
          Login
        </button>

        <button
          onClick={() => { setType("register"); setOpen(true); }}
          className="bg-[#FC7844] hover:bg-[#e86a32] text-white text-xs h-8 px-4 rounded"
        >
          Register
        </button>
      </div>

      {/* Dialog Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          onClick={() => setOpen(false)} // close on overlay click
        >
          {/* Dialog Content */}
          <div
            className="relative grid w-full max-w-[900px] md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* LEFT IMAGE */}
            <div className="relative hidden md:block">
              <img
                src={type === "login" ? loginImg : registerImg}
                alt="auth"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute text-white bottom-6 left-6 right-6">
                <h3 className="text-xl font-semibold">
                  {type === "login" ? "Sign in to continue" : "Join us today"}
                </h3>
                <p className="mt-2 text-sm text-white/80">
                  {type === "login"
                    ? "Access your account securely"
                    : "Create your account in seconds"}
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="flex items-center justify-center p-8">
              <AuthForm type={type} />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute text-lg text-gray-400 top-4 right-4 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}