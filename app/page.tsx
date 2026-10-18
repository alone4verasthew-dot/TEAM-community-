import Link from "next/link";
import CursorSwords from "./components/CursorSwords";

const kanji = ["仲間", "成長", "未来"];

export default function HomePage() {
  return (
    <main className="samurai-world">
      <CursorSwords />
      <div className="moon" aria-hidden="true" />
      <div className="mountain mountain-back" aria-hidden="true" />
      <div className="mountain mountain-front" aria-hidden="true" />
      <div className="torii" aria-hidden="true"><i /><b /><em /></div>
      <div className="pagoda" aria-hidden="true"><i /><b /><em /><strong /></div>
      <div className="mist mist-one" aria-hidden="true" />
      <div className="mist mist-two" aria-hidden="true" />
      <div className="petal-field" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => <span key={i} style={{ "--i": i } as React.CSSProperties} />)}
      </div>
      <div className="katana katana-one" aria-hidden="true"><i /></div>
      <div className="katana katana-two" aria-hidden="true"><i /></div>
      <div className="katana katana-three" aria-hidden="true"><i /></div>
      <div className="ronin" aria-hidden="true"><i /><b /><em /><strong /></div>
      <div className="embers" aria-hidden="true" />

      <header className="samurai-header">
        <Link className="samurai-logo" href="/" aria-label="TEAM TFY home">
          <span>TEAM</span><strong>ᵀᶠʸ</strong>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#home" className="active">HOME</a>
          <a href="#about">THE WAY</a>
          <a href="#community">COMMUNITY</a>
          <a href="#members">MEMBERS</a>
        </nav>
        <Link className="join-button" href="#join">JOIN THE TEAM <span>↗</span></Link>
      </header>

      <section className="samurai-hero" id="home">
        <div className="vertical-kanji" aria-hidden="true">{kanji.map((word) => <span key={word}>{word}</span>)}</div>
        <div className="hero-brand" id="about">
          <p className="hero-kicker"><span /> A PRIVATE CIRCLE • A SHARED PATH</p>
          <h1><span className="team-word">𝑻𝑬𝑨𝑴</span><span className="tfy-word">ᵀᶠʸ</span></h1>
          <div className="slogan"><span />TO FIND YOURSELF<span /></div>
          <p className="hero-subtitle">Walk your path. Find your people. Become more.</p>
          <div className="hero-buttons" id="join">
            <a className="join-button join-main" href="mailto:admin@tfy.community?subject=TFY%20invite%20request">REQUEST AN INVITE <span>↗</span></a>
            <a className="ghost-button" href="#community">ENTER THE WORLD <span>↓</span></a>
          </div>
          <div className="hero-footnote"><span className="red-dot" /> INVITE ONLY <i /> 80 MEMBERS MAX</div>
        </div>
        <div className="scroll-cue"><span className="mouse"><i /></span><span>SCROLL TO EXPLORE</span><b>⌄</b></div>
        <div className="side-index">01 <span /> THE AWAKENING</div>
      </section>

      <section className="samurai-lower" id="community">
        <p className="lower-eyebrow">ONE TEAM <span>•</span> ONE JOURNEY <span>•</span> TO FIND YOURSELF</p>
        <h2>Your path. <span>Your people.</span></h2>
        <p>A private place for your circle — built around trust, real conversations, and belonging.</p>
        <div className="lower-rule" />
      </section>
    </main>
  );
}
