"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/images/sheryians.svg";
import styles from "@/css/globals/AuthNavbar.module.css";

export default function AuthNavbar({ user }) {
  const [open, setOpen] = useState(false);
  const navItems = [
    { label: "Home", altLabel: "Start", href: "/" },
    { label: "Feedback", altLabel: "Reviews", href: "/#feedbacks" },
    ...(user?.role === "admin"
      ? [{ label: "Admin", altLabel: "Control", href: "/admin" }]
      : []),
    { label: "Logout", altLabel: "Exit", href: "/logout" },
  ];

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}>
          <div className={styles.logo}>
            <Image src={Logo} alt="Sheryians logo" className={styles.img} priority />
          </div>
        </Link>

        <div className={styles.centerNav}>
          <ul className={styles.pages}>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link className={styles.link} href={item.href}>
                  {item.altLabel ? (
                    <span className={`${styles.textSwap} ${styles.navSwap}`}>
                      <span className={styles.textTrack}>
                        <span className={styles.swapItem}>{item.label}</span>
                        <span className={styles.swapItem}>{item.altLabel}</span>
                      </span>
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" className={styles.brandCopy}>
          <span className={styles.identityName}>
            <span className={`${styles.textSwap} ${styles.brandSwap}`}>
              <span className={styles.textTrack}>
                <span className={styles.swapItem}>{user?.name}</span>
                <span className={styles.swapItem}>{user?.role}</span>
              </span>
            </span>
          </span>
          <span className={styles.identityRole}>{user?.email}</span>
        </Link>

        <button
          type="button"
          className={`${styles.hamburger} ${open ? styles.active : ""}`}
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          <span className={styles.line}></span>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </button>
      </nav>

      <div className={`${styles.mobilePanel} ${open ? styles.active : ""}`}>
        <div className={styles.mobileIdentity}>
          <span>{user?.name}</span>
          <span>{user?.email}</span>
        </div>

        <ul className={styles.mobilePages}>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                className={styles.mobileLink}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <span className={styles.mobileArrow}>/</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
