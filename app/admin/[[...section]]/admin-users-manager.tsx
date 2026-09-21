"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminRole, AdminUser } from "../../../lib/supabase/admin";
import styles from "./admin.module.css";

const roleLabels: Record<AdminRole, string> = { owner: "Chủ sở hữu", technical_admin: "Admin kỹ thuật" };

export default function AdminUsersManager({ admins, canManage }: { admins: AdminUser[]; canManage: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function send(url: string, init: RequestInit) {
    setSaving(true); setMessage("");
    const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init.headers } });
    const result = await response.json().catch(() => ({})) as { message?: string };
    setSaving(false); setMessage(response.ok ? "Đã cập nhật phân quyền." : result.message ?? "Không thể cập nhật phân quyền.");
    if (response.ok) router.refresh();
  }
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await send("/api/admin/users", { method: "POST", body: JSON.stringify({ email: data.get("email"), displayName: data.get("displayName"), role: data.get("role") }) });
    if (!saving) event.currentTarget.reset();
  }
  return <section className={styles.panel}>
    <div className={styles.panelHeading}><div><p>ADMINISTRATION</p><h2>Quản trị viên MYNORA</h2></div></div>
    <div className={styles.adminUserList}>{admins.map(admin => <article key={admin.id}>
      <div><strong>{admin.display_name ?? admin.email}</strong><span>{admin.email}</span><small>{roleLabels[admin.role]} · {admin.is_active ? "Đang hoạt động" : "Đã khóa"}</small></div>
      {canManage ? <div className={styles.adminUserActions}>
        <select aria-label={`Vai trò của ${admin.email}`} value={admin.role} disabled={saving} onChange={event => send("/api/admin/users", { method: "PATCH", body: JSON.stringify({ id: admin.id, role: event.target.value, isActive: admin.is_active }) })}><option value="owner">Chủ sở hữu</option><option value="technical_admin">Admin kỹ thuật</option></select>
        <button type="button" disabled={saving} onClick={() => send("/api/admin/users", { method: "PATCH", body: JSON.stringify({ id: admin.id, role: admin.role, isActive: !admin.is_active }) })}>{admin.is_active ? "Khóa" : "Kích hoạt"}</button>
      </div> : null}
    </article>)}</div>
    {canManage ? <form className={styles.adminInviteForm} onSubmit={add}><label><span>Tên hiển thị</span><input name="displayName" maxLength={120} /></label><label><span>Email</span><input name="email" type="email" required /></label><label><span>Vai trò</span><select name="role" defaultValue="technical_admin"><option value="technical_admin">Admin kỹ thuật</option><option value="owner">Chủ sở hữu</option></select></label><button className={styles.primaryAction} type="submit" disabled={saving}>Thêm quản trị viên</button></form> : <p className={styles.permissionNote}>Bạn có thể xem danh sách quản trị viên. Chỉ Chủ sở hữu được thay đổi vai trò hoặc trạng thái tài khoản.</p>}
    {message ? <p className={styles.formMessage} role="status">{message}</p> : null}
  </section>;
}
