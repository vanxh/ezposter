import useSSR from "@/hooks/useSSR";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();

  const { isSSR } = useSSR();
  if (isSSR) return null;

  return (
    <button
      className="transition-all active:scale-95"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
}
