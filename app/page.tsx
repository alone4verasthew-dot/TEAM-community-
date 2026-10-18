import Link from "next/link";

const highlights = [
  {
    number: "01",
    title: "A space that feels like yours",
    description:
      "Share thoughts, stories, and everyday moments with people who belong here.",
  },
  {
    number: "02",
    title: "Closer, even from far away",
    description:
      "Private conversations and calls help your circle stay connected.",
  },
  {
    number: "03",
    title: "Small by design",
    description:
      "A community capped at 80 approved members keeps the space personal.",
  },
];

const rules = [
  "Invite-only membership",
  "Member approval when enabled",
  "Private conversations stay private",
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <Link className="brand" href="/" aria-label="TFY home">
          <span className="brand-mark">t</span>
          <span>tfy<span className="brand-period">.</span></span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#why-tfy">Why TFY</a>
          <a href="#privacy">Privacy</a>
        </nav>

        <Link className="button button-quiet button-small" href="#member-access">
          Member login <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            YOUR CIRCLE. YOUR SPACE.
          </div>

          <h1 id="hero-title">
            Good people.
            <br />
            <span className="gradient-text">Closer together.</span>
          </h1>

          <p className="hero-description">
            A private little corner of the internet for your people. Share
            moments, have real conversations, and feel a little closer — wherever
            life takes you.
          </p>

          <div className="hero-actions" id="member-access">
            <a className="button button-primary" href="mailto:admin@tfy.community?subject=TFY%20invite%20request">
              Request an invite <span aria-hidden="true">→</span>
            </a>
            <a className="button button-outline" href="#how-it-works">
              Explore TFY <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="member-note">
            <div className="avatar-stack" aria-hidden="true">
              <span className="avatar avatar-peach">S</span>
              <span className="avatar avatar-lilac">R</span>
              <span className="avatar avatar-mint">A</span>
              <span className="avatar avatar-blue">K</span>
            </div>
            <p><strong>Intentionally small.</strong> Built for up to 80 approved members.</p>
          </div>
        </div>

        <div className="hero-visual" aria-label="Preview of the TFY private community">
          <div className="orbit orbit-large" />
          <div className="orbit orbit-small" />
          <div className="preview-card">
            <div className="preview-topline">
              <div className="preview-brand">
                <span className="mini-mark">t</span>
                <span>your circle</span>
              </div>
              <span className="online-label"><span className="status-dot" /> private space</span>
            </div>

            <div className="preview-welcome">
              <span className="tiny-label">MONDAY, TOGETHER</span>
              <h2>Hey, good to<br />have you here <span>✳</span></h2>
              <p>A little space for the people who matter.</p>
            </div>

            <div className="preview-section-heading">
              <span>Your community</span>
              <span className="muted-count">04 spaces</span>
            </div>

            <div className="community-row">
              <span className="community-icon icon-sun">✳</span>
              <span className="community-copy"><strong>The inner circle</strong><small>Stories, updates & everyday life</small></span>
              <span className="row-arrow">↗</span>
            </div>
            <div className="community-row">
              <span className="community-icon icon-moon">☾</span>
              <span className="community-copy"><strong>Late night thoughts</strong><small>For the after-hours conversations</small></span>
              <span className="row-arrow">↗</span>
            </div>
            <div className="community-row">
              <span className="community-icon icon-leaf">⌁</span>
              <span className="community-copy"><strong>Little wins</strong><small>Good news, big or small</small></span>
              <span className="row-arrow">↗</span>
            </div>

            <div className="preview-footer">
              <span className="footer-lock">⌑</span>
              <span>Only invited members can join</span>
              <span className="footer-sparkle">✦</span>
            </div>
          </div>
          <div className="floating-pill pill-top"><span className="pill-icon">✦</span> Your people, always</div>
          <div className="floating-pill pill-bottom"><span className="pill-live" /> A quieter kind of social</div>
        </div>
      </section>

      <section className="trust-strip" id="privacy" aria-label="TFY principles">
        {rules.map((rule, index) => (
          <div className="trust-item" key={rule}>
            <span className="trust-check">{index === 0 ? "↗" : "✓"}</span>
            <span>{rule}</span>
          </div>
        ))}
      </section>

      <section className="features-section" id="why-tfy">
        <div className="section-intro" id="how-it-works">
          <span className="eyebrow">MADE FOR MEANINGFUL CONNECTION</span>
          <h2>Less noise.<br /><span className="gradient-text">More belonging.</span></h2>
          <p>Not another feed to keep up with. Just a thoughtful space to stay in touch with your people.</p>
        </div>

        <div className="feature-grid">
          {highlights.map((item) => (
            <article className="feature-card" key={item.number}>
              <span className="feature-number">{item.number}</span>
              <div className="feature-decoration" aria-hidden="true">
                {item.number === "01" ? "✳" : item.number === "02" ? "↗" : "∞"}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-cta">
        <div>
          <span className="eyebrow">GOOD THINGS ARE BETTER SHARED</span>
          <h2>Your people are<br />already here.</h2>
          <p>TFY is a private community. Membership starts with an invitation.</p>
        </div>
        <a className="button button-primary" href="mailto:admin@tfy.community?subject=TFY%20invite%20request">
          Get in touch <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className="footer">
        <Link className="brand footer-brand" href="/" aria-label="TFY home">
          <span className="brand-mark">t</span>
          <span>tfy<span className="brand-period">.</span></span>
        </Link>
        <p>A small space for your people.</p>
        <span className="copyright">© {new Date().getFullYear()} TFY Community</span>
      </footer>
    </main>
  );
}
