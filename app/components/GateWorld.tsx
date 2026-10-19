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

      </svg>
      <div className="gate-walker" aria-hidden="true">
        <svg viewBox="0 0 180 300" role="presentation">
          <defs>
            <linearGradient id="walker-shadow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#10080c" />
              <stop offset=".6" stopColor="#030204" />
              <stop offset="1" stopColor="#27040b" />
            </linearGradient>
            <filter id="walker-blur" x="-30%" y="-20%" width="160%" height="150%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
          </defs>
          <ellipse cx="90" cy="285" rx="58" ry="8" fill="#ff172d" opacity=".13" filter="url(#walker-blur)" />
          <g className="walker-cloak" fill="url(#walker-shadow)" stroke="#5b0b19" strokeOpacity=".45" strokeWidth="1.4" strokeLinejoin="round">
            <path d="M67 75 47 88 32 131 24 184 36 191 54 145 49 198 32 269 56 276 80 209 93 156Z" />
            <path d="M98 75 119 90 139 132 143 179 132 190 116 146 120 205 145 268 120 276 94 207 83 157Z" />
          </g>
          <g transform="translate(70 146)">
            <g className="walker-leg-left" fill="url(#walker-shadow)" stroke="#3b080f" strokeWidth="1">
            <path d="M-10 0 11 0 8 48 -5 83 -17 126 -34 126 -27 80 -18 44Z" />
            <path d="M-34 121 -12 121 -2 134 -37 134Z" />
            </g>
          </g>
          <g transform="translate(96 146)">
            <g className="walker-leg-right" fill="url(#walker-shadow)" stroke="#3b080f" strokeWidth="1">
            <path d="M-10 0 11 0 15 46 25 83 36 125 19 131 0 87 -8 49Z" />
            <path d="M18 124 38 119 48 132 17 137Z" />
            </g>
          </g>
          <g className="walker-torso" fill="url(#walker-shadow)" stroke="#5b0b19" strokeOpacity=".45" strokeWidth="1.4" strokeLinejoin="round">
            <path d="M65 72Q88 63 106 75L119 119 108 157 55 157 42 119Z" />
            <path d="M64 83 77 110 91 136 104 112 111 91 120 124 100 164 76 164 47 125Z" />
            <path d="M50 107 69 119 85 150 76 164 57 142 42 123Z" fill="#050306" />
            <path d="M103 106 91 124 84 149 100 163 118 132 120 117Z" fill="#050306" />
          </g>
          <g transform="translate(52 88)">
            <g className="walker-arm-left" fill="url(#walker-shadow)" stroke="#4e0916" strokeWidth="1.3">
            <path d="M0 0 -13 15 -19 53 -6 72 4 66 -4 48 11 22Z" />
            <path d="M-7 67 3 62 9 73 0 83 -8 80Z" fill="#030204" />
            </g>
          </g>
          <g transform="translate(113 88)">
            <g className="walker-arm-right" fill="url(#walker-shadow)" stroke="#4e0916" strokeWidth="1.3">
            <path d="M0 0 13 16 22 48 11 71 0 65 8 45 -9 23Z" />
            <path d="M10 65 1 62 -5 73 4 83 12 78Z" fill="#030204" />
            </g>
          </g>
          <g className="walker-head" fill="#030204" stroke="#4e0916" strokeWidth="1.3" strokeLinejoin="round">
            <path d="M62 45Q52 24 72 17L92 15Q112 25 104 47L97 65 71 65Z" />
            <path d="M44 35Q51 10 83 9Q114 10 124 34L114 39 55 40Z" />
            <path d="M62 23 50 8 66 16M103 22 116 8 112 25" fill="#090307" />
            <path d="M56 37Q84 30 114 37L107 43H63Z" fill="#070306" />
          </g>
          <g className="walker-sword" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M119 88 141 53 145 55 124 94Z" stroke="#12070b" strokeWidth="8" />
            <path d="M124 85 147 48" stroke="#a9a1a3" strokeOpacity=".42" strokeWidth="2.2" />
            <path d="M116 91 130 99" stroke="#6d1221" strokeWidth="5" />
            <path d="M113 90 128 99" stroke="#10060a" strokeWidth="2" />
          </g>
        </svg>
      </div>
      <div className="fog f2" />
      <div className="mist" />
      <div className="fog f1" />
      <div id="shade" />
      <div id="fl" />
    </div>
  );
}
