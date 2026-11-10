import { person } from "@/app/lib/content";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <p className="site-footer">
      Copyright © {year} {person.name}
    </p>
  );
}
