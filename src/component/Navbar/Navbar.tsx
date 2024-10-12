"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./index.module.css";
import { MdOutlineStackedLineChart } from "react-icons/md";
import { GiCrossedBones } from "react-icons/gi";

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };
  return (
    <>
      <header className={styles.container}>
        <div className={`${styles.innercontainer} maincontainer`}>
          <Link href="/" className={styles.imagecontainer}>
            <img src="/AK Converts.png" alt="" className={styles.logo} />
          </Link>
          {isMenuOpen ? (
            <GiCrossedBones
              size={30}
              className={`${styles.cross} `}
              onClick={toggleMenu}
            />
          ) : (
            <MdOutlineStackedLineChart
              size={30}
              className={styles.hamburger}
              onClick={toggleMenu}
            />
          )}
          <nav
            className={`${styles.links} ${
              isMenuOpen ? `${styles.menuOpen} ${styles.animationOpen}` : ""
            }`}
          >
            <Link href="/" className={styles.link}>
              Home
            </Link>
            <a
              href="https://kaushikankit.vercel.app/"
              className={styles.link}
              target="_blank"
            >
              About Me
            </a>
            <a
              href="https://github.com/DeveloperAnkitKaushik"
              className={styles.link}
              target="_blank"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <div className={styles.spacesupport}></div>
    </>
  );
};

export default Navbar;
