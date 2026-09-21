"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseConfig } from "../../../lib/supabase/config";
import { createClient } from "../../../lib/supabase/client";
import styles from "../login/login.module.css";

export default function PasswordSetupForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("token") ?? "";
    const accessToken = hash.get("access_token") ?? "";
    const refreshToken = hash.get("refresh_token") ?? "";

    if (!token && (!accessToken || !refreshToken)) {
      setMessage("Liên kết đặt mật khẩu không hợp lệ.");
      return;
    }
    if (password.length < 12) {
      setMessage("Mật khẩu cần có ít nhất 12 ký tự.");
      return;
    }
    if (password !== confirmation) {
      setMessage("Hai lần nhập mật khẩu chưa giống nhau.");
      return;
    }

    setPending(true);
    try {
      if (accessToken && refreshToken) {
        const supabase = createClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setMessage("Liên kết đã hết hạn hoặc đã được sử dụng.");
          return;
        }
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
          setMessage("Chưa thể cập nhật mật khẩu. Vui lòng thử lại.");
          return;
        }
        await supabase.auth.signOut({ scope: "local" });
      } else {
        const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
        const response = await fetch(
          `${supabaseUrl}/functions/v1/mynora-set-admin-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabasePublishableKey,
            },
            body: JSON.stringify({ token, password }),
          },
        );
        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!response.ok) {
          setMessage(result.error ?? "Chưa thể đặt mật khẩu. Vui lòng thử lại.");
          return;
        }
      }

      window.history.replaceState(null, "", window.location.pathname);
      setComplete(true);
      setPassword("");
      setConfirmation("");
      setMessage("Mật khẩu đã được đặt thành công.");
    } catch {
      setMessage("Không thể kết nối Supabase. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  if (complete) {
    return (
      <div className={styles.form}>
        <p className={styles.message} aria-live="polite">{message}</p>
        <Link className={styles.actionLink} href="/admin/login">Đăng nhập quản trị</Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="new-password">Mật khẩu mới</label>
      <input
        id="new-password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={12}
        required
      />
      <label htmlFor="confirm-password">Nhập lại mật khẩu</label>
      <input
        id="confirm-password"
        name="password-confirmation"
        type="password"
        autoComplete="new-password"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        minLength={12}
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "Đang đặt mật khẩu…" : "Đặt mật khẩu mới"}
      </button>
      {message && <p className={styles.message} aria-live="polite">{message}</p>}
    </form>
  );
}
