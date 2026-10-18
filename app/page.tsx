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
      <div className="ronin samurai-art" aria-hidden="true">
        <svg viewBox="0 0 320 560" role="presentation">
          <defs>
            <linearGradient id="armor" x1="0" x2="1"><stop stopColor="#050407"/><stop offset=".48" stopColor="#270811"/><stop offset="1" stopColor="#080609"/></linearGradient>
            <linearGradient id="steel" x1="0" x2="1"><stop stopColor="#8c9aa9"/><stop offset=".45" stopColor="#fff4f4"/><stop offset=".7" stopColor="#f51c3d"/><stop offset="1" stopColor="#5a0615"/></linearGradient>
          </defs>
          <g className="samurai-cloak">
            <path d="M132 145 L62 180 L20 310 L65 365 L99 280 L83 455 L38 535 L126 507 L160 450 L190 530 L280 548 L243 450 L252 290 L295 363 L315 300 L265 178 L192 145Z" fill="url(#armor)" stroke="#651023" strokeWidth="3"/>
            <path d="M90 196 L45 300 M235 194 L280 303 M92 380 L73 474 M231 380 L260 490" fill="none" stroke="#b20f2b" strokeWidth="3" opacity=".8"/>
          </g>
          <path d="M115 150 L98 220 L122 310 L197 310 L224 220 L203 150Z" fill="url(#armor)" stroke="#a10d28" strokeWidth="3"/>
          <path d="M122 174 L197 174 M114 204 L205 204 M120 236 L199 236 M130 268 L190 268" stroke="#751126" strokeWidth="7"/>
          <path d="M133 130 L121 92 L145 60 L184 60 L209 92 L197 132 L178 150 L148 147Z" fill="#09070a" stroke="#a70c28" strokeWidth="3"/>
          <path d="M112 88 L133 36 L174 17 L214 44 L225 86 L198 69 L148 69Z" fill="#080609" stroke="#a70c28" strokeWidth="4"/>
          <path d="M132 89 L203 89 L191 111 L143 111Z" fill="#ed1838" opacity=".9"/>
          <path d="M148 111 L184 111 L176 127 L153 127Z" fill="#030305"/>
          <path d="M119 158 L71 205 L95 230 L143 191Z M203 158 L247 203 L224 232 L184 192Z" fill="url(#armor)" stroke="#8f1025" strokeWidth="3"/>
          <path d="M235 219 L285 67" stroke="#070609" strokeWidth="15" strokeLinecap="round"/>
          <path d="M247 204 L303 28" stroke="#d5dbe5" strokeWidth="7" strokeLinecap="round"/>
          <path d="M252 189 L304 28" stroke="url(#steel)" strokeWidth="4" strokeLinecap="round"/>
          <path d="M224 222 L254 232" stroke="#caa36c" strokeWidth="9" strokeLinecap="round"/>
          <path d="M137 305 L132 433 L113 519 L151 519 L177 427 L184 305Z" fill="#080609" stroke="#711024" strokeWidth="3"/>
          <path d="M184 305 L205 426 L222 518 L261 518 L241 412 L231 305Z" fill="#10070b" stroke="#711024" strokeWidth="3"/>
          <path d="M107 526 L156 526 L160 545 L95 545Z M215 526 L263 526 L278 545 L211 545Z" fill="#050407" stroke="#8e1024" strokeWidth="3"/>
          <path d="M138 147 L160 166 L181 147" fill="none" stroke="#e01838" strokeWidth="3"/>
        </svg>
      </div>
      <div className="embers" aria-hidden="true" />

      <header className="samurai-header">
        <Link className="samurai-logo" href="/" aria-label="𝑻𝑬𝑨𝑴 ᵀᶠʸ home">
          <span>𝑻𝑬𝑨𝑴</span><strong>ᵀᶠʸ</strong>
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
