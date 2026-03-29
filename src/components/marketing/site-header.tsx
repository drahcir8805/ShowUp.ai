"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarButton,
  NavItems,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Why", link: "/#why" },
  { name: "Product", link: "/#features" },
  { name: "Trust", link: "/#trust" },
  { name: "How it works", link: "/#how" },
];

function Logo() {
  return (
    <Link
      href="/"
      className="relative z-20 flex shrink-0 items-center px-2 py-1 text-lg font-semibold tracking-tight text-[#4a4a4a]"
    >
      ShowUp<span className="text-[var(--accent)]">.ai</span>
    </Link>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Navbar className="bg-transparent">
      <NavBody>
        <Logo />
        <NavItems
          items={navItems}
          itemClassName="text-[#6a6a6a] hover:!text-[var(--accent)]"
          onItemClick={() => {}}
        />
        <div className="relative z-20 flex items-center gap-2">
          <NavbarButton
            as={Link}
            href="/betting"
            className="!border-0 !bg-[var(--accent)] !text-white shadow-none hover:!-translate-y-0 hover:!opacity-90"
          >
            Start Betting
          </NavbarButton>
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <Logo />
          <div className="z-50 lg:hidden">
            <MobileNavToggle
              isOpen={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            />
          </div>
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          className="border border-[var(--landing-border)]/40 bg-[var(--landing-base)] dark:bg-[var(--landing-base)]"
        >
          {navItems.map((item) => (
            <a
              key={item.link}
              href={item.link}
              className="w-full rounded-md px-2 py-2 text-[#4a4a4a] hover:bg-[var(--landing-warm)]/80"
              onClick={() => setMobileOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <Link
            href="/betting"
            className="w-full rounded-md px-2 py-2 font-semibold text-[var(--accent)] hover:bg-[var(--landing-warm)]/80"
            onClick={() => setMobileOpen(false)}
          >
            Start Betting
          </Link>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
