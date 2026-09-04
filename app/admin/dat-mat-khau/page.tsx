import PasswordSetupForm from "./password-setup-form";
import styles from "../login/login.module.css";

export default function PasswordSetupPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p>MYNORA ADMIN</p>
        <h1>Đặt mật khẩu mới</h1>
        <p className={styles.intro}>
          Liên kết này chỉ dùng được một lần. Mật khẩu được gửi trực tiếp đến
          Supabase và không được lưu trong website MYNORA.
        </p>
        <PasswordSetupForm />
      </section>
    </main>
  );
}
