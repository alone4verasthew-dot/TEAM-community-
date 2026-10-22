import Link from "next/link";
import CursorSwords from "./components/CursorSwords";
import GateWorld from "./components/GateWorld";
import { enterCommunityAction } from "./community/actions";
import { createClient } from "@/lib/supabase/server";

// The homepage contains role-specific community cards; never share/cache its HTML across users.
export const dynamic = "force-dynamic";

const kanji = ["仲間", "成長", "未来"];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;
  let role: string | null = null;
  let isBannerMember = false;

  if (typeof userId === "string") {
    const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", userId).maybeSingle();
    if (profile?.status === "approved") {
      role = profile.role;
      if (role !== "admin") {
        const { data: bannerCommunity } = await supabase.from("communities").select("id").eq("slug", "community-three").maybeSingle();
        if (bannerCommunity) {
          const { data: bannerMembership } = await supabase.from("memberships").select("community_id").eq("community_id", bannerCommunity.id).eq("profile_id", userId).maybeSingle();
          isBannerMember = Boolean(bannerMembership);
        }
      }
    }
  }

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
          <Link href="/login" aria-label="Member login">MEMBER LOGIN</Link>
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
          <p className="member-login-hint">Already a member? <Link href="/login">MEMBER LOGIN ↗</Link></p>
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
      {role ? (
      <section className="samurai-lower gate-panel" id="community">
        <p className="lower-eyebrow">ONE TEAM <span>•</span> ONE JOURNEY</p>
        <h2>THE <span>COMMUNITY</span></h2>
        <p>A private place for your circle — built around trust, real conversations, and belonging.</p>
        <div className="gate-steps community-cards">
          <article className="community-card-eagle">
            <span className="community-card-symbol" aria-hidden="true">🦅</span>
            <p className="community-card-kicker">THE MAIN CIRCLE · 01</p>
            <h3>🦅:𝘛𝘌𝘈𝘔 (;™🕷️∆)𝘛 𝘍 𝘠🍁</h3>
            <p>One circle. One path. One TFY family.</p>
            <form action={enterCommunityAction}><input type="hidden" name="slug" value="community-one" /><button className="community-enter-button" type="submit">ENTER COMMUNITY <span>↗</span></button></form>
          </article>
          {role === "admin" ? <article className="community-card-admins">
            <span className="community-card-symbol" aria-hidden="true">🛡</span>
            <p className="community-card-kicker">THE COMMAND ROOM · 02</p>
            <h3>ᥲᦔꪑ꠸ꪀડ ᥆ᠻ 𝘛𝘍𝘠</h3>
            <p>Coordinate, plan and keep the TFY community moving forward.</p>
            <form action={enterCommunityAction}><input type="hidden" name="slug" value="community-two" /><button className="community-enter-button" type="submit">ENTER COMMUNITY <span>↗</span></button></form>
          </article> : null}
          {role === "admin" || isBannerMember ? <article className="community-card-banners">
            <span className="community-card-symbol" aria-hidden="true">旗</span>
            <p className="community-card-kicker">THE CREATIVE CORNER · 03</p>
            <h3>᥇ꪖ​ꪀꪀꫀ𝘳𝘴</h3>
            <p>Share banners, visuals and creative designs for the TFY circle.</p>
            <form action={enterCommunityAction}><input type="hidden" name="slug" value="community-three" /><button className="community-enter-button" type="submit">ENTER COMMUNITY <span>↗</span></button></form>
          </article> : null}
        </div>
        <div className="lower-rule" />
      </section>
      ) : null}
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
