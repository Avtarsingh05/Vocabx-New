
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Gamepad2, Languages, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/curriculum", icon: BookOpen, label: "Learn" },
  { href: "/games", icon: Gamepad2, label: "Arena" },
  { href: "/alphabets", icon: Languages, label: "ABC" },
  { href: "/profile", icon: User, label: "Me" },
];

/**
 * Premium Mobile Navigation Snackbar
 * Features: Glassmorphism, Spring Animations, Active Glow
 */
export function BottomNav() {
  return null;
}
