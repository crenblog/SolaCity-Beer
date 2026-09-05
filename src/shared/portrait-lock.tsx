import { useEffect } from "react";
import { bindPortraitLock } from "@/shared/bind-portrait-lock";

export function PortraitLock() {
  useEffect(() => bindPortraitLock(), []);
  return null;
}
