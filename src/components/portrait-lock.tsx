import { useEffect } from "react";
import { bindPortraitLock } from "@/lib/thin-path/portrait-lock";

export function PortraitLock() {
  useEffect(() => bindPortraitLock(), []);
  return null;
}
