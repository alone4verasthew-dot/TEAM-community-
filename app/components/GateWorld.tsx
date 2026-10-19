export default function GateWorld() {
  return (
    <div id="world" aria-hidden="true">
      <svg className="ly" id="sky" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="bloodMoon" cx="40%" cy="35%">
            <stop offset="0" stopColor="#ff9b83" />
            <stop offset=".42" stopColor="#f3343a" />
            <stop offset=".78" stopColor="#a50d20" />
            <stop offset="1" stopColor="#50040d" />
          </radialGradient>
          <radialGradient id="moonGlow">
            <stop offset="0" stopColor="#ff142f" stopOpacity=".5" />
            <stop offset="1" stopColor="#ff142f" stopOpacity="0" />
          </radialGradient>
          <filter id="moonBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="38" />
          </filter>
        </defs>
        <circle cx="1060" cy="320" r="370" fill="url(#moonGlow)" filter="url(#moonBlur)" />
        <circle cx="1060" cy="320" r="244" fill="url(#bloodMoon)" />
        <g fill="#6b0718" opacity=".36">
          <ellipse cx="1000" cy="248" rx="52" ry="35" />
          <ellipse cx="1120" cy="356" rx="66" ry="48" />
          <ellipse cx="1010" cy="408" rx="32" ry="26" />
          <ellipse cx="1155" cy="206" rx="27" ry="42" />
          <ellipse cx="936" cy="328" rx="19" ry="38" />
        </g>
        <g fill="none" stroke="#ffb2a4" strokeOpacity=".14">
          <circle cx="1000" cy="248" r="59" />
          <circle cx="1120" cy="356" r="74" />
          <circle cx="1010" cy="408" r="38" />
          <circle cx="1155" cy="206" r="49" />
        </g>
      </svg>

      <svg className="ly" id="far" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <g fill="#100309" stroke="#ff2639" strokeOpacity=".23" strokeWidth="1.4">
          <path d="M-80 690 115 535 255 625 420 465 595 625 760 525 920 652 1100 510 1275 640 1450 455 1685 640V900H-80Z" />
          <path d="M-40 760 150 640 300 712 460 612 650 748 825 620 980 754 1195 625 1370 735 1550 610 1680 708V900H-40Z" fill="#080307" strokeOpacity=".12" />
        </g>
        <g fill="#16040b" stroke="#78111f" strokeWidth="2" strokeOpacity=".55">
          <path d="M115 652 132 652 132 545 115 545Z" />
          <path d="M78 550Q123 510 168 550L157 558H89Z" />
          <path d="M91 522Q123 486 155 522L147 530H99Z" />
          <path d="M101 496Q123 470 145 496L140 503H106Z" />
          <path d="M1390 652 1408 652 1408 520 1390 520Z" />
          <path d="M1348 528Q1399 481 1450 528L1437 537H1361Z" />
          <path d="M1362 496Q1399 458 1436 496L1426 505H1372Z" />
          <path d="M1377 466Q1399 439 1421 466L1415 474H1383Z" />
          <path d="M270 690 282 690 282 602 270 602Z" />
          <path d="M239 606Q276 571 313 606L303 613H249Z" />
          <path d="M252 580Q276 551 300 580L294 587H258Z" />
        </g>
        <g fill="#ff3442" opacity=".48">
          {Array.from({ length: 20 }, (_, i) => (
            <circle key={i} cx={70 + ((i * 137) % 1450)} cy={510 + ((i * 67) % 180)} r={1.4 + (i % 3)} />
          ))}
        </g>
        <g id="fg" />
      </svg>

      <svg className="ly" id="gate" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="toriiWood" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#100208" />
            <stop offset=".52" stopColor="#390610" />
            <stop offset="1" stopColor="#0c0206" />
          </linearGradient>
          <filter id="gateGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g fill="url(#toriiWood)" stroke="#e71b32" strokeOpacity=".62" strokeWidth="2">
          <path d="M850 395 862 790H900L892 395Z" />
          <path d="M1108 395 1100 790H1138L1150 395Z" />
          <path d="M718 377Q737 342 1000 337Q1263 342 1282 377L1262 397H738Z" />
          <rect x="770" y="397" width="460" height="14" />
          <rect x="800" y="456" width="400" height="22" />
          <rect x="838" y="770" width="72" height="24" />
          <rect x="1090" y="770" width="72" height="24" />
        </g>
        <path d="M720 378Q1000 335 1280 378" stroke="#ff5967" strokeWidth="3" fill="none" opacity=".75" filter="url(#gateGlow)" />
        <path d="M880 491Q1000 536 1120 491" stroke="#a26e40" strokeWidth="5" strokeDasharray="6 4" fill="none" />
        <g fill="#d8c6b3" stroke="#ff4958" strokeWidth="1" strokeOpacity=".7">
          <path d="M908 506 922 510 919 539 913 545 907 538Z" />
          <path d="M960 520 974 523 972 549 966 555 959 548Z" />
          <path d="M1025 520 1039 517 1043 543 1037 551 1029 544Z" />
          <path d="M1073 506 1087 501 1092 529 1086 537 1077 530Z" />
        </g>
        <g fill="none" stroke="#ff263c" strokeOpacity=".52" strokeWidth="1.3">
          <path d="M862 405V778M888 405V778M1109 405V778M1135 405V778" />
          <path d="M760 382Q1000 352 1240 382" />
        </g>
        <g id="shd" />
      </svg>

      <svg className="ly" id="near" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="roninRim">
            <stop offset="0" stopColor="#ff263d" stopOpacity=".42" />
            <stop offset="1" stopColor="#ff263d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M-90 804 95 670 252 738 440 642 637 760 638 920H-90Z" fill="#090106" />
        <path d="M1215 900 1268 788 1388 706 1464 734 1600 656 1710 736V930Z" fill="#090106" />
        <path d="M0 822Q270 782 530 832T1040 824T1600 810V930H0Z" fill="#050103" />
        <g id="smr" transform="translate(1450 708) scale(-1.35 1.35)">
          <ellipse cx="10" cy="-110" rx="110" ry="150" fill="url(#roninRim)" />
          <g className="br2" fill="#050102" stroke="rgba(255,42,56,.72)" strokeWidth="1.4" strokeLinejoin="round">
            <line x1="-14" y1="-128" x2="-20" y2="-236" stroke="#2a0a10" strokeWidth="2.6" />
            <g className="flag2"><path d="M-20 -234L-66 -224L-60 -184L-18 -198Z" fill="#8f0c18" stroke="#ff4a55" /><circle cx="-41" cy="-208" r="9" fill="none" stroke="#ff8a94" strokeWidth="2" /></g>
            <path d="M-6 -86 -30 -46 -50 -6" stroke="#a10d25" strokeWidth="20" strokeLinecap="round" fill="none" />
            <path d="M-6 -86 -30 -46 -50 -6" stroke="#050102" strokeWidth="17" strokeLinecap="round" fill="none" />
            <path d="M10 -86 40 -56 44 -8" stroke="#a10d25" strokeWidth="20" strokeLinecap="round" fill="none" />
            <path d="M10 -86 40 -56 44 -8" stroke="#050102" strokeWidth="17" strokeLinecap="round" fill="none" />
            <path className="hk" d="M-20 -96 24 -96 60 -52 56 -20 38 -14 10 -44 -8 -20 -48 -16 -46 -50Z" />
            <path d="M32 -8 64 -8 70 0 28 3ZM-62 -6 -36 -6 -30 2 -66 3Z" />
            <path d="M-20 -102 22 -102 28 -66 -26 -66Z" />
            <path d="M-14 -102V-66M-4 -102V-66M6 -102V-66M16 -102V-66M-24 -82H26" stroke="rgba(255,42,56,.65)" fill="none" />
            <path d="M-18 -154 18 -154 24 -104 -22 -104Z" />
            <path d="M-20 -142H22M-21 -130H23M-22 -118H23" stroke="rgba(255,42,56,.6)" fill="none" />
            <path d="M10 -146 32 -124 62 -136" stroke="#a10d25" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M10 -146 32 -124 62 -136" stroke="#050102" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M2 -158 32 -152 34 -142 2 -148ZM2 -148 34 -142 35 -130 3 -136ZM3 -136 35 -130 34 -119 4 -125Z" />
            <rect x="-2" y="-162" width="10" height="12" /><circle cx="6" cy="-171" r="10" />
            <path d="M-9 -173Q6 -197 23 -175L25 -170L-11 -170Z" />
            <path d="M4 -190Q-14 -206 -10 -236Q3 -216 10 -194Z" /><path d="M12 -190Q32 -204 36 -232Q19 -214 10 -194Z" />
          </g>
          <g className="kt">
            <path d="M40 -122 64 -141 67 -137 43 -117Z" fill="#150408" stroke="rgba(255,42,56,.62)" strokeWidth="1.2" />
            <ellipse cx="64" cy="-139" rx="3" ry="8.5" transform="rotate(-38 64 -139)" fill="#1b0a0e" stroke="#c9a23a" strokeWidth="1" />
            <path d="M62 -140Q110 -176 156 -218L160 -214Q114 -170 66 -134Z" fill="#eef1f8" stroke="#fff" strokeWidth=".6" />
            <path className="gl2" d="M68 -140Q112 -172 154 -212" fill="none" />
          </g>
        </g>
      </svg>
      <div className="fog f2" />
      <div className="mist" />
      <div className="fog f1" />
      <div id="shade" />
      <div id="fl" />
    </div>
  );
}
