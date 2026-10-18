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
        <svg viewBox="0 0 520 680" role="presentation" className="samurai-illustration">
          <defs>
            <linearGradient id="armor" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#09070b"/><stop offset=".45" stopColor="#211018"/><stop offset=".72" stopColor="#08070a"/><stop offset="1" stopColor="#3b0918"/></linearGradient>
            <linearGradient id="blade" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#aebbc9"/><stop offset=".38" stopColor="#fff"/><stop offset=".58" stopColor="#ff536a"/><stop offset=".78" stopColor="#fff"/><stop offset="1" stopColor="#790c20"/></linearGradient>
            <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#050508"/><stop offset=".55" stopColor="#270812"/><stop offset="1" stopColor="#080609"/></linearGradient>
            <filter id="red-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g className="samurai-hair" fill="#050407" stroke="#8c1027" strokeWidth="2">
            <path d="M205 174 Q140 125 119 69 Q164 112 183 109 Q144 68 157 31 Q181 82 220 88 Q206 45 225 12 Q238 70 269 82 Q282 40 303 30 Q288 91 313 112 L291 176Z"/>
            <path d="M207 135 Q157 141 117 118 Q159 163 188 163 M229 115 Q192 84 191 52 Q224 86 242 91"/>
          </g>
          <g className="samurai-body">
            <path d="M209 222 Q143 241 101 321 L42 426 L105 452 L166 362 L149 489 L85 632 L169 642 L235 518 L277 637 L370 649 L326 517 L350 367 L404 447 L454 412 L385 291 Q352 233 297 218Z" fill="url(#cloth)" stroke="#8f1028" strokeWidth="4"/>
            <path d="M176 260 L113 327 L74 418 M330 266 L389 352 L424 409 M169 389 L126 534 L111 608 M320 391 L344 532 L361 614" fill="none" stroke="#d31738" strokeWidth="3" opacity=".9"/>
            <path d="M206 208 L179 289 L206 376 L304 379 L335 288 L300 211Z" fill="url(#armor)" stroke="#b31231" strokeWidth="4"/>
            <path d="M193 250 L320 250 M186 278 L328 278 M194 308 L320 308 M204 339 L310 339" stroke="#610d22" strokeWidth="13"/>
            <path d="M200 250 L317 250 M193 279 L323 279 M201 309 L315 309" stroke="#e02a45" strokeWidth="2" opacity=".75"/>
            <path d="M201 208 L169 242 L195 278 L227 242 M303 210 L341 239 L319 278 L283 242" fill="#0a080c" stroke="#a8112b" strokeWidth="4"/>
            <path d="M224 194 L211 156 L233 123 L276 122 L302 154 L291 196 L267 216 L240 211Z" fill="#0a080c" stroke="#c31938" strokeWidth="4"/>
            <path d="M208 154 L219 103 L259 82 L298 105 L314 151 L282 135 L231 139Z" fill="#050407" stroke="#8e1028" strokeWidth="5"/>
            <path d="M218 145 L299 143 L287 160 L229 162Z" fill="#ed1739" filter="url(#red-glow)"/>
            <path d="M236 169 L277 168 L267 190 L242 190Z" fill="#030305"/>
            <path d="M238 214 L261 231 L282 212" fill="none" stroke="#ff2545" strokeWidth="4"/>
            <path d="M206 373 L191 414 L315 414 L301 374Z" fill="#09070a" stroke="#b5102c" strokeWidth="3"/>
            <path d="M210 385 L205 407 M236 385 L233 409 M263 385 L262 409 M290 385 L292 409" stroke="#dc1b3c" strokeWidth="3"/>
            <path d="M168 278 Q125 270 95 242 L75 261 L121 309 L182 326Z" fill="url(#armor)" stroke="#8e1028" strokeWidth="4"/>
            <path d="M333 276 Q371 264 395 239 L416 260 L373 311 L326 326Z" fill="url(#armor)" stroke="#8e1028" strokeWidth="4"/>
            <path d="M83 246 L49 228" stroke="#080609" strokeWidth="25" strokeLinecap="round"/>
            <path d="M399 245 L430 216" stroke="#080609" strokeWidth="25" strokeLinecap="round"/>
            <path d="M423 221 L490 45" stroke="#080609" strokeWidth="18" strokeLinecap="round"/>
            <path d="M432 213 L504 28" stroke="#caa779" strokeWidth="11" strokeLinecap="round"/>
            <path d="M438 198 L513 10" stroke="url(#blade)" strokeWidth="8" strokeLinecap="round" filter="url(#red-glow)"/>
            <path d="M447 170 L507 22" stroke="#fff" strokeWidth="2" opacity=".95"/>
            <path d="M415 214 L448 227" stroke="#d9b77d" strokeWidth="9" strokeLinecap="round"/>
            <path d="M179 410 L169 516 L136 624 L186 627 L224 520 L244 410Z" fill="#080609" stroke="#9b1027" strokeWidth="4"/>
            <path d="M244 410 L271 517 L302 629 L352 630 L323 509 L302 410Z" fill="#10070c" stroke="#9b1027" strokeWidth="4"/>
            <path d="M129 623 L190 623 L199 650 L113 650Z M297 625 L354 625 L378 650 L293 650Z" fill="#050407" stroke="#bd1734" strokeWidth="4"/>
            <path d="M178 439 L213 463 L187 485 L164 470 M302 438 L273 462 L302 486 L322 468" fill="none" stroke="#b71934" strokeWidth="4"/>
          </g>
          <g className="samurai-slash" fill="none" strokeLinecap="round">
            <path d="M25 478 Q175 405 350 467" stroke="#ff2447" strokeWidth="4" opacity=".8" filter="url(#red-glow)"/>
            <path d="M45 496 Q195 425 365 484" stroke="#fff1f2" strokeWidth="2" opacity=".9"/>
          </g>
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
          <h1 className="tfy-logo-lockup"><span className="team-word">𝑻𝑬𝑨𝑴</span><span className="tfy-word">ᵀᶠʸ</span></h1>
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
