import { useEffect } from "react";
import { bindPortraitLock } from "@/app/portrait-lock";

export function PortraitLock() {
  useEffect(() => bindPortraitLock(), []);
  return null;
}
