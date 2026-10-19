import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { homePathFor } from "@/lib/home";

export default async function Home() {
  const session = await getSession();
  redirect(session ? await homePathFor(session) : "/login");
}
