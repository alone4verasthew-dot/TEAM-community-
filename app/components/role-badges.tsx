type RoleBadgesProps = { isBanner?: boolean; isAdmin?: boolean; compact?: boolean };

const designs = {
  member: { label: "TFY Member", tone: "member", symbol: "眼" },
  banner: { label: "Banner Member", tone: "banner", symbol: "⚔" },
  admin: { label: "Admin", tone: "admin", symbol: "✦" },
} as const;

export default function RoleBadges({ isBanner = false, isAdmin = false, compact = false }: RoleBadgesProps) {
  const badges = [designs.member, ...(isBanner ? [designs.banner] : []), ...(isAdmin ? [designs.admin] : [])];
  return (
    <div className={`tfy-role-badges${compact ? " tfy-role-badges-compact" : ""}`} aria-label="TFY roles">
      {badges.map((badge) => (
        <span className={`tfy-role-badge tfy-role-badge-${badge.tone}`} key={badge.tone} title={badge.label}>
          <span className="tfy-role-medallion" aria-hidden="true">{badge.symbol}</span>
          <span className="tfy-role-badge-label">{badge.label}</span>
        </span>
      ))}
    </div>
  );
}
