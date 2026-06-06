import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : null;
};
const sb = createClient(
  get("NEXT_PUBLIC_SUPABASE_URL"),
  get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
);

const NAMES = ["한별", "승리"];
const START = "2026-06-15";
const END = "2026-06-29";

const { data: members, error: me } = await sb
  .from("members")
  .select("id,name")
  .in("name", NAMES);
if (me) { console.error("members err", me); process.exit(1); }
const ids = members.map((m) => m.id);
console.log("target members:", members);

const { data: before } = await sb
  .from("overtime_availability")
  .select("member_id,date")
  .in("member_id", ids)
  .gte("date", START)
  .lte("date", END);
console.log(`rows in range ${START}~${END} before delete:`, before?.length ?? 0);

const { error: de } = await sb
  .from("overtime_availability")
  .delete()
  .in("member_id", ids)
  .gte("date", START)
  .lte("date", END);
if (de) { console.error("delete err", de); process.exit(1); }

const { data: after } = await sb
  .from("overtime_availability")
  .select("member_id,date")
  .in("member_id", ids)
  .gte("date", START)
  .lte("date", END);
console.log("rows remaining after delete:", after?.length ?? 0);
console.log("done.");
