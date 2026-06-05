"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="mb-4 text-xl glow">Login</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Usuario"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          className="block mb-2 border p-2 w-full"
        />

        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="block mb-2 border p-2 w-full"
        />

        <button className="border px-4 py-2 w-full">
          Ingresar
        </button>
      </form>
    </div>
  );
}