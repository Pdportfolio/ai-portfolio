import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "../lib/admin-auth";
import { getLiveProfile } from "../lib/profile";
import { AdminLogin } from "./AdminLogin";
import { AdminProfileForm } from "./AdminProfileForm";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const signedIn = await getAdminSession();
  const profile = signedIn ? await getLiveProfile() : null;

  return (
    <main className="admin">
      <Link className="admin-back" href="/">
        Back to site
      </Link>
      {signedIn && profile ? <AdminProfileForm initial={profile} /> : <AdminLogin />}
    </main>
  );
}
