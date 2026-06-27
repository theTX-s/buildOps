import React from "react";
import { useSignInHandler } from "./signInHandler";
import styles from "./signInPage.module.css";

export default function SignInPage() {
  const { form, handleChange, handleLogIn } = useSignInHandler();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    handleLogIn();
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftColumn}>
        <div className={styles.decorativeCircle} />

        <div className={styles.logoWrapper}>
          <div className={styles.logoIcon}>
            <svg
              className={styles.logoSvg}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span>Build Ops</span>
        </div>

        <div className={styles.brandMainContent}>
          <h1>
            Lorem ipsum dolor sit <span>lorem ipsum</span>.
          </h1>
          <p>
            Minus doloribus autem, repellendus laborum inventore odio soluta
            sunt magnam sint aut?
          </p>
        </div>

        <div className={styles.footerCopy}>
          &copy; 2026 BuildOps Corp. All rights reserved.
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2>Welcome back</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.formGroup}>
            <div className={styles.inputControl}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className={styles.inputControl}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className={styles.actionsRow}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  name="checkbox"
                  checked={form.rememberMe}
                  onChange={handleChange}
                />
                {form.rememberMe && <span className={styles.customCheckmark} />}
                Remember for 30 days
              </label>
              <a href="#" className={styles.forgotLink}>
                Forgot password
              </a>
            </div>

            <button type="submit" className={styles.submitButton}>
              Sign In
            </button>
          </form>

          <div className={styles.formFooter}>
            Don't have an account?{" "}
            <a href="#" className={styles.signUpLink}>
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
