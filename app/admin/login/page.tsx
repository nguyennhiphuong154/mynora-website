import LoginForm from "./login-form";
import styles from "./login.module.css";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className={styles.page}><section className={styles.card}>
    <p>MYNORA ADMIN</p>
    <h1>Đăng nhập quản trị</h1>
    <p className={styles.intro}>Đăng nhập bằng email và mật khẩu quản trị đã được thiết lập trong Supabase.</p>
    {error === "not_authorized" && <p className={styles.error}>Tài khoản này chưa có quyền quản trị MYNORA.</p>}
    <LoginForm />
  </section></main>;
}
