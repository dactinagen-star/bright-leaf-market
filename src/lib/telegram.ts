// Telegram WebApp SDK helpers — без серверної верифікації initData (MVP)
export type TgUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type TgWebApp = {
  initDataUnsafe?: { user?: TgUser };
  ready?: () => void;
  expand?: () => void;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
};

export function getTelegram(): TgWebApp | null {
  if (typeof window === "undefined") return null;
  // @ts-expect-error Telegram global
  return window.Telegram?.WebApp ?? null;
}

export function getTelegramUser(): TgUser | null {
  return getTelegram()?.initDataUnsafe?.user ?? null;
}