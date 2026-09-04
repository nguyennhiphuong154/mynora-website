"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./login.module.css";

const ADMIN_EMAIL = "nguyennhiphuong154@gmail.com";

export default function LoginForm() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL) {
      setMessage("Email này chưa được cấp quyền quản trị.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    setPending(false);

    if (error) {
      if (error.code === "invalid_credentials") {
        setMessage("Email hoặc mật khẩu chưa đúng. Vui lòng kiểm tra lại.");
        return;
      }
      if (error.code === "email_not_confirmed") {
        setMessage("Email quản trị chưa được xác nhận trong Supabase.");
        return;
      }
      setMessage("Chưa thể đăng nhập. Vui lòng thử lại sau ít phút.");
      return;
    }

    window.location.assign("/admin");
  }

  return <form className={styles.form} onSubmit={submit}>
    <label htmlFor="admin-email">Email quản trị</label>
    <input
      id="admin-email"
      name="email"
      type="email"
      autoComplete="username"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      required
    />
    <label htmlFor="admin-password">Mật khẩu</label>
    <input
      id="admin-password"
      name="password"
      type="password"
      autoComplete="current-password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      minLength={6}
      required
    />
    <button type="submit" disabled={pending}>
      {pending ? "Đang đăng nhập…" : "Đăng nhập"}
    </button>
    {message && <p className={styles.message} aria-live="polite">{message}</p>}
  </form>;
}
