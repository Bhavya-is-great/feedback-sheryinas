"use client";
import React, { useEffect, useState } from 'react';
import styles from '@/css/globals/Navbar.module.css';
import Image from 'next/image';
import Logo from '@/assets/./images/sheryians.svg';

const navItems = [
  { label: 'Home', altLabel: 'Start', href: '#' },
  { label: 'Feedback', altLabel: 'Reviews', href: '/feedback' },
  {
    label: 'WorkDir',
    altLabel: 'Learn',
    href: 'https://learn.sheryians.com/',
    external: true,
  },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <nav className={styles.nav}>
        <a href="#" className={styles.brand}>
          <div className={styles.logo}>
            <Image src={Logo} alt='Sheryians logo' className={styles.img} priority />
          </div>
        </a>

        <div className={styles.centerNav}>
          <ul className={styles.pages}>
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  className={styles.link}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                >
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
                </a>
              </li>
            ))}
          </ul>
        </div>

        <a href="#" className={styles.brandCopy}>
          <span className={styles.brandTitle}>
            <span className={`${styles.textSwap} ${styles.brandSwap}`}>
              <span className={styles.textTrack}>
                <span className={styles.swapItem}>Kodex</span>
                <span className={styles.swapItem}>BootCamp </span>
              </span>
            </span>
          </span>
          <span className={styles.brandTag}>Feedback board</span>
        </a>

        <button
          type="button"
          className={`${styles.hamburger} ${open ? styles.active : ''}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          <span className={styles.line}></span>
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </button>
      </nav>

      <div className={`${styles.mobilePanel} ${open ? styles.active : ''}`}>
        <ul className={styles.mobilePages}>
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                className={styles.mobileLink}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <span className={styles.mobileArrow}>/</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Navbar
