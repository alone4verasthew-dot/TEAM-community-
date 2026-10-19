import Link from "next/link";
import CursorSwords from "./components/CursorSwords";
import GateWorld from "./components/GateWorld";

const kanji = ["仲間", "成長", "未来"];

export default function HomePage() {
  return (
    <main className="samurai-world">
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <defs>
          <symbol id="emb" viewBox="-62 -62 124 124">
            <circle r="52" fill="rgba(224,18,31,.14)" stroke="rgba(255,42,56,.55)" strokeWidth="1.2" />
            <g id="katana-emblem" transform="rotate(-38)" fill="#0b0204" stroke="#ff2a38" strokeWidth="1.1" strokeLinejoin="round">
              <path d="M10 -2.6Q38 -3.2 66 -11Q62 -4.4 57 -1.5Q34 1.6 10 2.6Z" />
              <path d="M12 1.6Q36 .6 58 -2" stroke="#fff" strokeWidth=".7" opacity=".85" fill="none" />
              <rect x="6" y="-3.4" width="4.5" height="6.8" />
              <ellipse cx="3.5" cy="0" rx="2.4" ry="8.2" />
              <rect x="-38" y="-3" width="40" height="6" rx="1.5" />
              <path d="M-35 -3l4 6M-29 -3l4 6M-23 -3l4 6M-17 -3l4 6M-11 -3l4 6M-5 -3l4 6" strokeWidth=".7" opacity=".8" />
              <rect x="-41.5" y="-3.5" width="3.5" height="7" rx="1" />
            </g>
            <use href="#katana-emblem" transform="scale(-1 1)" />
          </symbol>
          <filter id="goo" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <CursorSwords />
      <GateWorld />
      <div className="ronin samurai-art" aria-hidden="true">
        <svg viewBox="0 0 520 680" role="presentation" className="samurai-illustration">
          <defs>
            <linearGradient id="ronin-cloth" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#030407"/><stop offset=".48" stopColor="#17121a"/><stop offset=".76" stopColor="#270713"/><stop offset="1" stopColor="#050508"/></linearGradient>
            <linearGradient id="ronin-armor" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#34303a"/><stop offset=".28" stopColor="#111117"/><stop offset=".7" stopColor="#08080d"/><stop offset="1" stopColor="#4b101e"/></linearGradient>
            <linearGradient id="ronin-hat" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#27232b"/><stop offset=".55" stopColor="#0a090e"/><stop offset="1" stopColor="#030306"/></linearGradient>
            <linearGradient id="ronin-blade" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#68717d"/><stop offset=".38" stopColor="#fff"/><stop offset=".62" stopColor="#ef7c8c"/><stop offset=".82" stopColor="#fff"/><stop offset="1" stopColor="#530a1b"/></linearGradient>
            <filter id="ronin-red-glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g className="samurai-hair" fill="#050509" stroke="#5b1827" strokeWidth="2.5" strokeLinejoin="round">
            <path d="M204 180 Q158 150 142 91 Q174 122 193 122 Q161 78 178 48 Q197 91 226 101 Q215 62 237 34 Q248 83 273 99 Q291 64 314 59 Q296 105 315 132 L297 194Z"/>
            <path d="M211 143 Q172 157 151 137 Q177 174 205 169 L230 146 M276 126 Q309 104 316 85 Q318 126 293 154"/>
            <path d="M220 178 L203 222 L232 211 L250 183 M285 176 L309 216 L286 208 L270 184" fill="#09080e"/>
          </g>
          <g className="samurai-body">
            <path d="M207 229 Q163 242 128 291 L77 391 L45 477 L93 493 L151 404 L137 496 L83 629 L158 642 L228 526 L264 636 L346 646 L318 520 L333 405 L394 486 L438 458 L395 349 Q364 257 302 229Z" fill="url(#ronin-cloth)" stroke="#4b1423" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M191 257 L146 321 L93 451 M319 259 L369 334 L418 438 M152 420 L120 548 L108 614 M324 418 L342 548 L355 615" fill="none" stroke="#78172c" strokeWidth="3" opacity=".8"/>
            <path d="M149 307 L104 389 L122 414 L156 373 L145 446 L172 430 L192 344Z M339 309 L386 390 L369 414 L338 372 L348 447 L321 430 L303 344Z" fill="#09090e" stroke="#5b1425" strokeWidth="3"/>
            <path d="M203 223 L181 285 L204 377 L306 380 L337 287 L300 220Z" fill="url(#ronin-armor)" stroke="#71606a" strokeWidth="3"/>
            <path d="M191 258 L322 258 M187 284 L328 284 M195 310 L320 310 M204 337 L311 337" stroke="#08080d" strokeWidth="13"/>
            <path d="M193 257 L320 257 M190 284 L325 284 M197 311 L317 311" stroke="#7e2436" strokeWidth="2" opacity=".9"/>
            <path d="M201 229 L166 249 L190 289 L226 258 M301 229 L343 250 L319 290 L282 258" fill="#0b0a10" stroke="#6b1a2c" strokeWidth="4"/>
            <path d="M218 196 L207 163 L229 132 L278 132 L304 163 L291 201 L267 222 L239 217Z" fill="#08080d" stroke="#34232c" strokeWidth="3"/>
            <path d="M224 174 L242 169 L255 177 L268 170 L291 174 L283 192 L263 202 L240 198Z" fill="#030306"/>
            <path d="M229 177 L249 176 L241 182Z M267 176 L287 177 L276 182Z" fill="#ff2345" filter="url(#ronin-red-glow)"/>
            <path d="M244 191 L276 191 L266 205 L251 204Z" fill="#171016" stroke="#71182a" strokeWidth="2"/>
            <path d="M224 212 L260 231 L290 211 L281 242 L259 251 L236 240Z" fill="#0a090f" stroke="#6c182b" strokeWidth="3"/>
            <path d="M207 378 L189 417 L313 417 L300 378Z" fill="#07070b" stroke="#5e1728" strokeWidth="3"/>
            <path d="M208 390 L203 411 M235 390 L232 412 M264 390 L263 412 M291 390 L294 412" stroke="#92223a" strokeWidth="3"/>
            <path d="M179 410 L164 510 L133 621 L183 626 L222 521 L244 410Z" fill="#08080d" stroke="#4c1423" strokeWidth="4"/>
            <path d="M245 410 L273 519 L305 627 L352 629 L325 509 L302 410Z" fill="#100b12" stroke="#4c1423" strokeWidth="4"/>
            <path d="M130 620 L187 622 L199 650 L112 650Z M301 624 L353 623 L378 650 L294 650Z" fill="#050509" stroke="#6d1b2b" strokeWidth="4"/>
            <path d="M178 440 L211 464 L186 487 L163 469 M303 440 L274 464 L301 487 L322 468" fill="none" stroke="#7d1b30" strokeWidth="4"/>
          </g>
          <g className="samurai-cloak" fill="url(#ronin-cloth)" stroke="#541426" strokeWidth="3" strokeLinejoin="round">
            <path d="M191 251 Q143 274 113 335 L81 439 L111 451 L157 385 L146 498 L104 615 L147 624 L210 498 L224 376Z"/>
            <path d="M322 252 Q368 275 395 335 L430 437 L400 451 L354 383 L366 497 L405 613 L361 625 L302 498 L291 376Z"/>
            <path d="M104 615 L126 605 L138 624 L151 608 L161 627 L145 643 L106 637Z M359 626 L377 606 L387 626 L403 616 L410 640 L373 647Z" fill="#050508"/>
          </g>
          <g strokeLinecap="round" strokeLinejoin="round">
            <path d="M193 130 Q228 95 285 119 L322 139 L302 155 L215 151Z" fill="#08070c" stroke="#5a1728" strokeWidth="4"/>
            <path d="M260 126 Q250 99 257 76 Q267 102 277 113" fill="none" stroke="#8a1c32" strokeWidth="3"/>
            <path d="M169 147 Q257 126 347 151 Q313 174 261 174 Q206 171 169 147Z" fill="url(#ronin-hat)" stroke="#5b1729" strokeWidth="4"/>
            <path d="M176 146 Q257 130 339 149" fill="none" stroke="#a52b40" strokeWidth="2" opacity=".8"/>
            <path d="M191 142 Q253 117 322 142" fill="none" stroke="#3d323b" strokeWidth="3"/>
            <path d="M236 161 L286 161" stroke="#100a10" strokeWidth="5"/>
            <path d="M400 250 L488 49" stroke="#08080c" strokeWidth="19"/>
            <path d="M411 239 L501 28" stroke="#b5a58c" strokeWidth="10"/>
            <path d="M417 223 L511 9" stroke="url(#ronin-blade)" strokeWidth="7" filter="url(#ronin-red-glow)"/>
            <path d="M429 197 L507 24" stroke="#fff" strokeWidth="1.8" opacity=".95"/>
            <path d="M392 242 L424 256" stroke="#bba17d" strokeWidth="9"/>
            <path d="M382 249 L414 261" stroke="#171017" strokeWidth="5"/>
          </g>
          <g className="samurai-slash" fill="none" strokeLinecap="round">
            <path d="M24 480 Q175 405 350 468" stroke="#ff2447" strokeWidth="4" opacity=".78" filter="url(#ronin-red-glow)"/>
            <path d="M45 497 Q195 426 365 485" stroke="#f7e8eb" strokeWidth="2" opacity=".82"/>
          </g>
        </svg>
      </div>

      <header className="samurai-header">
        <Link className="samurai-logo" href="/" aria-label="么 𝑻𝑬𝑨𝑴 ᵀᶠʸ乂">
          <span className="brand-kanji">么</span>{" "}
          <span>𝑻𝑬𝑨𝑴</span>{" "}
          <strong>ᵀᶠʸ</strong><span className="brand-kanji">乂</span>
          <svg className="brand-emb" viewBox="-62 -62 124 124" aria-hidden="true"><use href="#emb" /></svg>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#home" className="active">HOME</a>
          <a href="#way">THE WAY</a>
          <a href="#community">COMMUNITY</a>
          <a href="#members">MEMBERS</a>
        </nav>
        <a className="join-button" href="mailto:admin@tfy.community?subject=TFY%20invite%20request">JOIN THE TEAM <span>↗</span></a>
      </header>

      <section className="samurai-hero" id="home">
        <div className="vertical-kanji" aria-hidden="true">{kanji.map((word) => <span key={word}>{word}</span>)}</div>
        <div className="hero-brand" id="about">
          <p className="hero-kicker"><span /> A PRIVATE CIRCLE • A SHARED PATH</p>
          <h1 className="tfy-logo-lockup" aria-label="么 𝑻𝑬𝑨𝑴 ᵀᶠʸ乂">
            <span className="brand-full-line">
              <span className="brand-kanji">么</span>{" "}
              <span className="team-word">𝑻𝑬𝑨𝑴</span>{" "}
              <span className="tfy-word">ᵀᶠʸ</span><span className="brand-kanji">乂</span>
              <svg className="brand-emb" viewBox="-62 -62 124 124" aria-hidden="true"><use href="#emb" /></svg>
            </span>
          </h1>
          <div className="slogan"><span />TO FIND YOURSELF<span /></div>
          <p className="hero-subtitle">Walk your path. Find your people. Become more.</p>
          <div className="hero-buttons" id="join">
            <a className="join-button join-main" href="mailto:admin@tfy.community?subject=TFY%20invite%20request">REQUEST AN INVITE <span>↗</span></a>
            <a className="ghost-button" href="#way">ENTER THE WORLD <span>↓</span></a>
          </div>
          <div className="hero-footnote"><span className="red-dot" /> INVITE ONLY <i /> 80 MEMBERS MAX</div>
        </div>
        <div className="scroll-cue"><span className="mouse"><i /></span><span>SCROLL TO EXPLORE</span><b>⌄</b></div>
        <div className="side-index">01 <span /> THE AWAKENING</div>
      </section>

      <section className="samurai-lower gate-panel" id="way">
        <p className="lower-eyebrow">THE WAY <span>•</span> TO FIND YOURSELF</p>
        <h2>Your path. <span>Your people.</span></h2>
        <div className="gate-steps">
          <article><b>01</b><h3>WALK YOUR PATH</h3><p>Every member begins alone, with a purpose of their own.</p></article>
          <article><b>02</b><h3>FIND YOUR PEOPLE</h3><p>A circle of up to 80, approved one by one.</p></article>
          <article><b>03</b><h3>BECOME MORE</h3><p>Grow together through messages, calls and shared goals.</p></article>
        </div>
        <div className="lower-rule" />
      </section>
      <section className="samurai-lower gate-panel" id="community">
        <p className="lower-eyebrow">ONE TEAM <span>•</span> ONE JOURNEY</p>
        <h2>THE <span>COMMUNITY</span></h2>
        <p>A private place for your circle — built around trust, real conversations, and belonging.</p>
        <div className="gate-steps">
          <article><h3>COMMUNITY ONE</h3><p>A place to connect and share the journey.</p></article>
          <article><h3>COMMUNITY TWO</h3><p>Build consistency with people who get it.</p></article>
          <article><h3>COMMUNITY THREE</h3><p>Keep growing together, one step at a time.</p></article>
        </div>
        <div className="lower-rule" />
      </section>
      <section className="samurai-lower gate-panel" id="members">
        <p className="lower-eyebrow">INVITE ONLY <span>•</span> LIMITED CIRCLE</p>
        <div className="member-limit">80</div>
        <h2>MEMBERS <span>MAXIMUM</span></h2>
        <p>Invite only, approved by an admin. Start by requesting an invite.</p>
        <a className="join-button join-main" href="mailto:admin@tfy.community?subject=TFY%20invite%20request">REQUEST AN INVITE <span>↗</span></a>
        <div className="lower-rule" />
      </section>
      <footer className="gate-footer">
        <span className="footer-brand" aria-label="么 𝑻𝑬𝑨𝑴 ᵀᶠʸ乂"><span className="brand-kanji">么</span>{" "}<span>𝑻𝑬𝑨𝑴</span>{" "}<strong>ᵀᶠʸ</strong><span className="brand-kanji">乂</span></span>
        <span>TO FIND YOURSELF</span>
      </footer>
    </main>
  );
}
