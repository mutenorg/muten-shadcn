// @muten/shadcn · kit core. The reference artifact's own runtime, as one ES module the plugin's Customs share:
// the atoms (ui.*), the icon sprite, floating panels (place/show/hide), the tooltip, the island, the ONE adaptive
// modal (openModal/closeModal + CONTENT), the wheels, and the system kit (kit.* : calendar, agenda, messaging,
// chatbot, stat, charts, settings, plans, team, extras, skeletons…). Edit the artifact first, then regenerate this.
// A Custom loads it with `import("@muten/shadcn/registry/kit/core.js")` (a Custom is inlined, so no top-level import).

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

// ── the layer floating panels, the tooltip, the island and the modal live in (themed by the page's skin) ──
const lib = document.createElement('div'); lib.className = 'cx-kit-layer'; document.body.appendChild(lib);
const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sprite.setAttribute('aria-hidden', 'true'); sprite.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
sprite.innerHTML = `<defs><symbol id="b-whatsapp" viewBox="0 0 24 24"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></symbol><symbol id="b-instagram" viewBox="0 0 24 24"><path fill="currentColor" d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></symbol><symbol id="b-facebook" viewBox="0 0 24 24"><path fill="currentColor" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></symbol><symbol id="b-x" viewBox="0 0 24 24"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></symbol><symbol id="b-telegram" viewBox="0 0 24 24"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></symbol><symbol id="b-gmail" viewBox="0 0 24 24"><path fill="currentColor" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></symbol><symbol id="b-tiktok" viewBox="0 0 24 24"><path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></symbol><symbol id="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></symbol><symbol id="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></symbol><symbol id="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></symbol><symbol id="chevup" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></symbol><symbol id="updown" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></symbol><symbol id="right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></symbol><symbol id="left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></symbol><symbol id="arrowup" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7M12 19V5"/></symbol><symbol id="arrowleft" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></symbol><symbol id="more" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></symbol><symbol id="search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol><symbol id="okc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></symbol><symbol id="info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></symbol><symbol id="folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></symbol><symbol id="cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></symbol><symbol id="smile" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></symbol><symbol id="calc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M16 14v4M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/></symbol><symbol id="user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol><symbol id="card" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></symbol><symbol id="gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></symbol><symbol id="loader" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></symbol><symbol id="bold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></symbol><symbol id="italic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 4h-9M14 20H5M15 4 9 20"/></symbol><symbol id="under" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/></symbol><symbol id="bookmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></symbol><symbol id="ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10M7 17 17 7"/></symbol><symbol id="badgecheck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></symbol><symbol id="plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></symbol><symbol id="grip" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></symbol><symbol id="scissors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></symbol><symbol id="store" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18l-1.5-5h-15z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></symbol><symbol id="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol><symbol id="pencil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></symbol><symbol id="trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></symbol><symbol id="caloff" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9.5 14.5l5 5M14.5 14.5l-5 5"/></symbol><symbol id="copyi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></symbol><symbol id="mappin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></symbol><symbol id="quote" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol><symbol id="truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></symbol><symbol id="call" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></symbol><symbol id="pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></symbol><symbol id="play" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></symbol><symbol id="filter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18M6 12h12M10 19h4"/></symbol><symbol id="upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></symbol><symbol id="image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></symbol><symbol id="sort" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></symbol><symbol id="arrowdown" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></symbol><symbol id="share" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></symbol><symbol id="home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></symbol><symbol id="bag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></symbol><symbol id="menu-lines" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></symbol><symbol id="mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></symbol><symbol id="link" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></symbol><symbol id="qrc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></symbol><symbol id="i-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/></symbol><symbol id="i-clip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></symbol><symbol id="i-send" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></symbol><symbol id="i-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></symbol><symbol id="i-eyeoff" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6M2 2l20 20M14.1 14.1a3 3 0 0 1-4.2-4.2"/></symbol><symbol id="i-gift" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></symbol><symbol id="i-doc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></symbol><symbol id="i-ticks" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5M22 10l-7.5 7.5L13 16"/></symbol><symbol id="i-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></symbol><symbol id="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></symbol><symbol id="i-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></symbol><symbol id="i-archive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/></symbol><symbol id="i-bot" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></symbol><symbol id="i-hand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></symbol><symbol id="i-inbox" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></symbol><symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></symbol><symbol id="i-panel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/></symbol><symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></symbol></defs>`; document.body.prepend(sprite);
// follow the page's skin: the layer sits outside the app, so it copies data-skin from the nearest skinned element
// (only when it differs: writing the same value is still a mutation, and the observer would feed itself forever)
const skinSync = () => { const s = document.querySelector('[data-skin]:not(.cx-kit-layer)')?.dataset.skin || ''; if ((lib.dataset.skin || '') === s) return; if (s) lib.dataset.skin = s; else delete lib.dataset.skin; };
new MutationObserver((records) => { if (records.some((r) => r.target !== lib)) skinSync(); }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-skin'] }); skinSync();

// ── dates, money, text ──
  const DAY = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const MON = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DAYLONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const hue = (name) => { let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const ini = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const groupThousands = (digits, sep) => digits.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const fold = (s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  const reformat = (input, format, sig) => {
    const caret = input.selectionStart ?? input.value.length;
    const keep = [...input.value.slice(0, caret)].filter((ch) => sig.test(ch)).length;
    const next = format(input.value);
    if (next === input.value) return;
    input.value = next;
    if (document.activeElement !== input) return;
    let pos = 0, seen = 0;
    while (pos < next.length && seen < keep) { if (sig.test(next[pos])) seen++; pos++; }
    input.setSelectionRange(pos, pos);
  };
  const money0 = (n) => '$' + groupThousands(String(n), '.');

// ── floating panels ──
  const show = (el) => { el.hidden = false; requestAnimationFrame(() => { el.dataset.state = 'open'; }); };
  // exit: the panel holds its last frame (fill-mode forwards in CSS) and is hidden only once its animation really ends, never by a guessed timer
  const hide = (el, ms = 160) => {
    if (el.dataset.state !== 'open') return; el.dataset.state = 'closed';
    const done = () => { if (el.dataset.state === 'closed') el.hidden = true; };
    requestAnimationFrame(() => { const runs = el.getAnimations(); if (!runs.length) return done(); Promise.all(runs.map((a) => a.finished.catch(() => {}))).then(done); });
    setTimeout(done, ms + 400); // safety net if an animation never reports back
  };
  // floating panel: `gap` px from the anchor, aligned to its start/center/end, flips up when it does not fit below
  const place = (el, anchor, align = 'center', gap = 4, width = null) => {
    const r = anchor.getBoundingClientRect();
    if (width) el.style.width = width + 'px';
    const w = el.offsetWidth, h = el.offsetHeight;
    let x = align === 'start' ? r.left : align === 'end' ? r.right - w : r.left + r.width / 2 - w / 2;
    x = Math.max(8, Math.min(x, innerWidth - w - 8));
    const up = r.bottom + gap + h > innerHeight - 8 && r.top - gap - h > 8;
    el.dataset.side = up ? 'top' : 'bottom';
    el.style.left = x + 'px'; el.style.top = (up ? r.top - gap - h : r.bottom + gap) + 'px';
    el.style.transformOrigin = `${align === 'end' ? w + 'px' : align === 'start' ? '0px' : '50%'} ${up ? h + 'px' : '0px'}`;
  };

// ── tabs with a sliding indicator (for panels a Custom builds) ──
  const initTabs = (list) => {
    const tabs = $$('.cx-tab', list);
    const ind = document.createElement('span'); ind.className = 'cx-tab-ind'; list.prepend(ind);
    const place = (animate) => {
      const cur = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
      if (!animate) ind.style.transition = 'none';
      ind.style.left = cur.offsetLeft + 'px'; ind.style.width = cur.offsetWidth + 'px';
      if (!animate) { ind.offsetWidth; ind.style.transition = ''; }
    };
    const pick = (tab, focus) => {
      tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      place(true);
      list.dispatchEvent(new CustomEvent('pick', { detail: tabs.indexOf(tab) }));
    };
    tabs.forEach((t) => { t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1; t.onclick = () => pick(t); });
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement); if (i < 0) return;
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return; e.preventDefault(); pick(tabs[(to + tabs.length) % tabs.length], true);
    });
    new ResizeObserver(() => place(false)).observe(list);
    place(false);
    return pick;
  };

// ── tooltip on any [data-name] ──
  const tip = document.createElement('div'); tip.className = 'cx-tip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true; lib.appendChild(tip);
  const tipOn = (e) => { const w = e.target.closest?.('[data-name]'); if (!w) return; tip.textContent = w.dataset.name; tip.hidden = false; const r = w.getBoundingClientRect(); if (w.closest('[data-slot="sidebar"]')) { tip.style.left = (r.right + 8) + 'px'; tip.style.top = (r.top + r.height / 2 - tip.offsetHeight / 2) + 'px'; } else { place(tip, w, 'center', 6); tip.style.top = (r.top - tip.offsetHeight - 6) + 'px'; } requestAnimationFrame(() => tip.dataset.state = 'open'); };
  const tipOff = (e) => { if (e.target.closest?.('[data-name]')) { tip.dataset.state = 'closed'; tip.hidden = true; } };
  ['pointerover', 'focusin'].forEach((t) => document.addEventListener(t, tipOn)); ['pointerout', 'focusout'].forEach((t) => document.addEventListener(t, tipOff));

// ── island: one floating notice for the whole app; never stacks, morphs its width to the next text ──
const isl = document.createElement('div'); isl.className = 'cx-island cx-island-app'; isl.setAttribute('aria-live', 'polite'); isl.dataset.state = 'hidden';
isl.innerHTML = '<span class="cx-island-icon"></span><span class="cx-island-text"></span>'; lib.appendChild(isl);
const islText = $('.cx-island-text', isl), islIcon = $('.cx-island-icon', isl);
  const ICONS = { say: '<svg class="animate-spin"><use href="#loader"/></svg>', done: '<svg><use href="#check"/></svg>', error: '<svg><use href="#x"/></svg>', info: '<svg><use href="#info"/></svg>' };
  let islTimer = 0;
  const island = (tone, text, ms) => {
    clearTimeout(islTimer);
    const wasHidden = isl.dataset.state === 'hidden';
    const from = isl.offsetWidth;
    islText.textContent = text; islIcon.innerHTML = ICONS[tone]; isl.dataset.tone = tone;
    isl.style.width = 'auto'; const to = isl.offsetWidth;
    if (!wasHidden) { isl.style.width = from + 'px'; isl.offsetWidth; islText.classList.add('swap'); requestAnimationFrame(() => { islText.classList.remove('swap'); }); }
    isl.style.width = to + 'px';
    if (tone === 'error') { isl.style.animation = 'none'; isl.offsetWidth; isl.style.animation = ''; }
    isl.dataset.state = 'shown';
    if (ms) islTimer = setTimeout(() => { isl.dataset.state = 'hidden'; }, ms);
  };

// ── height easing ──
  const easeHeight = (el, change) => { // FLIP on height: measure, change, measure, animate between
    const from = el.offsetHeight; change(); const to = el.offsetHeight;
    if (from === to || !from) return;   // from 0 = the element was empty or not laid out yet: its first content just appears
    el.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 200, easing: 'cubic-bezier(.22, 1, .36, 1)' });
  };

// ── atoms ──
  const ui = {
    button: ({ label = '', icon = '', variant = 'outline', size = 'sm', tone = '', attrs = '', cls = '' }) =>
      `<button data-slot="button" class="cn-button cn-button-variant-${variant} cn-button-size-${size} group/button ${tone ? 'cx-tonal' : ''} ${cls}" ${tone ? `data-tone="${tone}"` : ''} ${attrs}>${icon ? `<svg><use href="#${icon}"/></svg>` : ''}${label}</button>`,
    badge: (label, { tone = '', variant = 'status' } = {}) =>
      `<span data-slot="badge" class="cn-badge cn-badge-variant-${variant === 'status' ? 'ghost' : variant} group/badge" ${variant === 'status' ? `data-variant="status" data-tone="${tone}"` : ''}>${label}</span>`,
    indicator: (tone) => `<span data-slot="indicator" class="cx-indicator" data-tone="${tone}" aria-hidden="true"></span>`,
    avatar: (name, { size = 'default', shape = '', bg = '' } = {}) =>
      `<span data-slot="avatar" data-size="${size}" ${shape ? `data-shape="${shape}"` : ''} class="cn-avatar group/avatar cx-av" style="--h:${hue(name)}">${bg ? `<span data-slot="avatar-image" class="cn-avatar-image" style="background:${bg}" role="img" aria-label="${name}"></span>` : `<span data-slot="avatar-fallback" class="cn-avatar-fallback">${ini(name)}</span>`}</span>`,
    itemMedia: (inner, variant = 'icon') => `<div data-slot="item-media" class="cn-item-media cn-item-media-variant-${variant}">${inner}</div>`,
    item: ({ media = '', title = '', description = '', actions = '', footer = '', size = 'sm' }) =>
      `<div data-slot="item" data-size="${size}" class="cn-item cn-item-variant-default cn-item-size-${size} group/item">${media}<div data-slot="item-content" class="cn-item-content">${title ? `<div data-slot="item-title" class="cn-item-title">${title}</div>` : ''}${description ? `<p data-slot="item-description" class="cn-item-description">${description}</p>` : ''}</div>${actions ? `<div data-slot="item-actions" class="cn-item-actions">${actions}</div>` : ''}${footer ? `<div data-slot="item-footer" class="cn-item-footer">${footer}</div>` : ''}</div>`,
    itemSeparator: () => '<div data-slot="item-separator" role="separator" class="cn-separator cn-separator-horizontal cn-item-separator"></div>',
    progress: (pct, label) => `<div data-slot="progress" class="cn-progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><div data-slot="progress-indicator" class="cn-progress-indicator" style="transform:translateX(-${100 - pct}%)"></div></div>`,
    icon: (id) => `<svg><use href="#${id}"/></svg>`,
  };
  const CB_CHECK = '<path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
  const CB_MIXED = '<path d="M6 12h12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>';
  const setCheck = (cb, state) => { // state: true | false | 'mixed'
    cb.setAttribute('aria-checked', state); cb.dataset.state = state === false ? 'unchecked' : 'checked';
    $('svg', cb).innerHTML = state === 'mixed' ? CB_MIXED : CB_CHECK;
  };
  const PH = (g) => `linear-gradient(135deg,${g})`;
  const GR = { pomada: '#c79a6b,#6b4a2e', aceite: '#d6c08f,#8a6b2f', kit: '#9fb3c8,#3d4f63', peine: '#caa27a,#7a5230', shampoo: '#b8d4c0,#4d7a5c', balsamo: '#e2c6a6,#a07850', cera: '#a8a8b8,#4a4a5e' };
  const TONE = { ok: 'ok', wait: 'wait', new: 'info', bad: 'bad', info: 'info', muted: 'muted' };
  // ═════ atoms: Text and Stepper ═════
  // Text: every piece of copy is one of these variants, never an ad-hoc font size.
  ui.text = (content, variant = 'body', tag = 'span', attrs = '') => `<${tag} data-slot="text" data-variant="${variant}" class="cx-text" ${attrs}>${content}</${tag}>`;
  // Stepper: one Progress atom per step, plus the step's name as Text.
  ui.stepper = (steps, at) => `<div data-slot="stepper" class="cx-stepper" style="--n:${steps.length}" role="list" aria-label="Paso ${at + 1} de ${steps.length}: ${steps[at]}">${steps.map((name, i) => `<div role="listitem" class="cx-step" ${i < at ? 'data-done' : i === at ? 'data-now aria-current="step"' : ''}>${ui.progress(i <= at ? 100 : 0, name)}${ui.text(name, i === at ? 'label' : 'caption')}</div>`).join('')}</div>`;
  ui.field = ({ id, label, control, description = '' }) => `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><label data-slot="label" class="cn-label" for="${id}">${label}</label>${control}${description ? `<p data-slot="field-description" class="cn-field-description">${description}</p>` : ''}</div>`;
  ui.input = ({ id, value = '', placeholder = '', type = 'text', attrs = '' }) => `<input data-slot="input" class="cn-input" id="${id}" type="${type}" value="${value}" placeholder="${placeholder}" ${attrs}>`;
  ui.choice = ({ media = '', title, description = '', aside = '', checked = false, attrs = '' }) => `<div role="radio" aria-checked="${checked}" tabindex="${checked ? 0 : -1}" data-slot="item" class="cn-item cn-item-variant-outline cn-item-size-sm group/item cx-choice" ${attrs}>${media}<div class="cn-item-content"><div class="cn-item-title">${title}</div>${description ? `<p class="cn-item-description">${description}</p>` : ''}</div>${aside ? `<div class="cn-item-actions">${aside}</div>` : ''}</div>`;


// ── the ONE adaptive modal: Dialog on a wide screen, Drawer on a phone ──
const ov = document.createElement('div'); ov.className = 'cx-overlay'; ov.hidden = true; ov.dataset.closes = '';
const mdl = document.createElement('div'); mdl.className = 'cx-modal'; mdl.hidden = true; mdl.setAttribute('role', 'dialog'); mdl.setAttribute('aria-modal', 'true'); mdl.setAttribute('aria-labelledby', 'mdl-title'); mdl.tabIndex = -1;
mdl.innerHTML = '<div class="cx-handle" aria-hidden="true"></div><div class="cx-modal-head" data-drag><b id="mdl-title"></b><span id="mdl-desc"></span></div><button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-icon-sm group/button cx-modal-x" aria-label="Cerrar" title="Cerrar" data-dismiss><svg><use href="#x"/></svg></button><div class="cx-modal-body" id="mdl-body"></div><div class="cx-modal-foot" id="mdl-foot"></div>';
lib.append(ov, mdl);
const body = $('#mdl-body', mdl), foot = $('#mdl-foot', mdl);
const phone = matchMedia('(max-width: 640px)');
let open = false, lastFocus = null, pushed = false;
const CONTENT = {};
const focusables = () => $$('button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])', mdl).filter((x) => x.offsetParent !== null || x === mdl);
  function openModal(kind, mode) {
    if (open) return;
    CONTENT[kind]();
    if (kind === 'list') mdl.dataset.size = 'tall'; else delete mdl.dataset.size;
    mdl.dataset.mode = mode === 'auto' ? (phone.matches ? 'drawer' : 'dialog') : mode;
    lastFocus = document.activeElement; open = true;
    ov.hidden = false; mdl.hidden = false; mdl.style.transform = ''; ov.style.opacity = '';
    root.classList.add('cx-locked');
    requestAnimationFrame(() => requestAnimationFrame(() => { ov.dataset.state = 'open'; mdl.dataset.state = 'open'; }));
    // on the phone, focusing a field would throw the keyboard over the sheet: focus the sheet itself
    ((mdl.dataset.mode === 'dialog' && kind !== 'filters' && focusables().find((x) => x.matches('input, textarea'))) || mdl).focus({ preventScroll: true });
    history.pushState({ cxModal: 1 }, ''); pushed = true; // the phone's back button closes it
  }
  function closeModal(fromBack) {
    if (!open) return; open = false;
    ov.dataset.state = 'closed'; mdl.dataset.state = 'closed'; mdl.style.transform = ''; ov.style.opacity = '';
    root.classList.remove('cx-locked');
    const done = () => { if (open) return; ov.hidden = true; mdl.hidden = true; };
    setTimeout(done, mdl.dataset.mode === 'drawer' ? 460 : 180);
    lastFocus?.focus({ preventScroll: true });
    if (pushed && !fromBack) { pushed = false; history.back(); } else pushed = false;
  }
  addEventListener('popstate', () => { if (open) closeModal(true); });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-dismiss]')) closeModal();
    const sv = e.target.closest('[data-save]');
    if (sv && !sv.disabled) { sv.disabled = true; sv.innerHTML = '<svg class="animate-spin"><use href="#loader"/></svg>Guardando…'; setTimeout(() => { sv.innerHTML = '<svg><use href="#check"/></svg>Guardado'; setTimeout(() => closeModal(), 500); }, 800); }
  });
  ov.addEventListener('pointerdown', () => closeModal());
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
    if (e.key === 'Tab') { // focus trap
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // drawer: drag the handle or the header down; closes past 30 % or on a flick, rubber-bands upward
  let drag = null;
  mdl.addEventListener('pointerdown', (e) => {
    if (mdl.dataset.mode !== 'drawer' || !e.target.closest('.cx-handle, [data-drag]')) return;
    drag = { y: e.clientY, t: performance.now(), dy: 0, live: false, id: e.pointerId };
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.y;
    if (!drag.live && Math.abs(dy) < 5) return;
    if (!drag.live) { drag.live = true; mdl.classList.add('dragging'); ov.classList.add('dragging'); }
    drag.dy = dy;
    const y = dy > 0 ? dy : -Math.sqrt(-dy) * 2;
    mdl.style.transform = `translateY(${y}px)`;
    ov.style.opacity = String(Math.max(0, 1 - Math.max(0, dy) / mdl.offsetHeight));
  });
  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.live) return;
    mdl.classList.remove('dragging'); ov.classList.remove('dragging');
    const v = d.dy / (performance.now() - d.t);
    if (d.dy > mdl.offsetHeight * 0.3 || v > 0.5) closeModal(); else { mdl.style.transform = ''; ov.style.opacity = ''; }
  };
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);


// ── wheels (date and time) ──
  const MONTHS = MON.map((m) => m[0].toUpperCase() + m.slice(1));
  const IT = 40;
  const makeWheel = (col, labels, index, onChange, label) => {
    col.setAttribute('role', 'spinbutton'); col.tabIndex = 0; col.setAttribute('aria-label', label);
    let cur = index, items = labels, lastWheel = 0;
    const paint = () => { col.innerHTML = items.map((l, i) => `<div class="cx-wheel-it" data-i="${i}">${l}</div>`).join(''); mark(); };
    const mark = () => { [...col.children].forEach((c, i) => c.toggleAttribute('data-on', i === cur)); col.setAttribute('aria-valuenow', cur); col.setAttribute('aria-valuetext', items[cur]); };
    const clamp = (i) => Math.max(0, Math.min(items.length - 1, i));
    const go = (i, smooth = true) => { cur = clamp(i); col.scrollTo({ top: cur * IT, behavior: smooth ? 'smooth' : 'auto' }); mark(); onChange(cur); };
    col.addEventListener('scroll', () => { const i = clamp(Math.round(col.scrollTop / IT)); if (i !== cur) { cur = i; mark(); onChange(cur); } }, { passive: true });
    // drag with mouse or finger: the column follows the pointer, a flick carries on, then it settles on a value
    let drag = null, settle = 0;
    const freeScroll = (on) => { col.style.scrollSnapType = on ? 'none' : ''; };
    col.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      clearTimeout(settle); freeScroll(true);
      drag = { y: e.clientY, top: col.scrollTop, lastY: e.clientY, lastT: performance.now(), v: 0, moved: false };
      col.setPointerCapture(e.pointerId); col.focus({ preventScroll: true });
    });
    col.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dy = e.clientY - drag.y; if (Math.abs(dy) > 3) drag.moved = true;
      col.scrollTop = drag.top - dy;
      const now = performance.now(), dt = Math.max(1, now - drag.lastT);
      drag.v = 0.7 * drag.v + 0.3 * ((drag.lastY - e.clientY) / dt); drag.lastY = e.clientY; drag.lastT = now;
    });
    const release = (e) => {
      if (!drag) return; const d = drag; drag = null;
      let target;
      if (!d.moved) { const r = col.getBoundingClientRect(); target = cur + Math.round((e.clientY - (r.top + r.height / 2)) / IT); } // a tap centres what was tapped
      else target = Math.round((col.scrollTop + d.v * 220) / IT); // a flick travels a little further
      go(target);
      settle = setTimeout(() => freeScroll(false), 420);
    };
    col.addEventListener('pointerup', release); col.addEventListener('pointercancel', release);
    col.addEventListener('keydown', (e) => { const d = { ArrowDown: 1, ArrowUp: -1, PageDown: 5, PageUp: -5 }[e.key]; if (d) { e.preventDefault(); go(cur + d); } });
    col.addEventListener('wheel', (e) => { e.preventDefault(); const now = performance.now(); if (now - lastWheel < 60) return; lastWheel = now; go(cur + Math.sign(e.deltaY)); }, { passive: false });
    paint();
    return { place: () => col.scrollTo({ top: cur * IT }), relabel: (next) => { items = next; cur = clamp(cur); paint(); col.scrollTo({ top: cur * IT }); }, get: () => cur, offs: (fn) => [...col.children].forEach((c, i) => c.toggleAttribute('data-off', fn(i))) };
  };
let wheelsNow = [];

// ═════ the system kit ═════
  const kit = {};
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const fmtDay = (d) => `${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}`;
  // ═════ shared pickers: reuse the wheels and the menu instead of native <select> ═════
  // kit.pickTime({ value, label, from, to, step }) → Promise<'HH:MM' | null>, in the adaptive modal with wheels
  let tpCb = null, tpState = null, tpBack = null;
  const tpSettle = () => requestAnimationFrame(() => requestAnimationFrame(() => { wheelsNow.forEach((w) => w.place()); $('.cx-wheel', body)?.focus({ preventScroll: true }); }));
  kit.pickTime = ({ value = '09:00', label = 'Hora', from = 6, to = 22, step = 15 } = {}) => new Promise((resolve) => {
    tpCb?.(null); tpState = { value, label, from, to, step }; tpCb = resolve;
    if (!open) { tpBack = null; openModal('timeWheel', 'auto'); return tpSettle(); }
    // a modal is already open: the wheels become a step of it, and «Listo» brings the form back untouched
    const kept = { body: [...body.childNodes], foot: [...foot.childNodes], title: $('#mdl-title').textContent, desc: $('#mdl-desc').textContent, focus: document.activeElement };
    tpBack = () => { body.replaceChildren(...kept.body); foot.replaceChildren(...kept.foot); $('#mdl-title').textContent = kept.title; $('#mdl-desc').textContent = kept.desc; kept.focus?.focus({ preventScroll: true }); };
    easeHeight(mdl, () => CONTENT.timeWheel()); tpSettle();
  });
  CONTENT.timeWheel = () => {
    const { value, label, from: f, to: t, step } = tpState, [h0, m0] = value.split(':').map(Number);
    const HS = Array.from({ length: t - f + 1 }, (_, i) => f + i), MS = Array.from({ length: 60 / step }, (_, i) => i * step);
    let h = HS.includes(h0) ? h0 : HS[0], m = MS.includes(m0) ? m0 : 0;
    $('#mdl-title').textContent = label; $('#mdl-desc').textContent = 'Arrastra cada rueda, toca un valor o usa las flechas.';
    body.innerHTML = '<div class="cx-wheels"><div class="cx-wheel" id="tw-h"></div><div class="cx-wheel" id="tw-m"></div></div><p class="cx-wheel-sum" id="tw-sum"></p>';
    const sum = () => { $('#tw-sum').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
    wheelsNow = [makeWheel($('#tw-h'), HS.map((x) => String(x).padStart(2, '0')), HS.indexOf(h), (i) => { h = HS[i]; sum(); }, 'Hora'), makeWheel($('#tw-m'), MS.map((x) => String(x).padStart(2, '0')), MS.indexOf(m), (i) => { m = MS[i]; sum(); }, 'Minutos')];
    sum();
    foot.innerHTML = ui.button({ label: tpBack ? 'Volver' : 'Cancelar', size: 'default', attrs: 'data-tw-no', cls: 'cx-exit' }) + ui.button({ label: 'Listo', variant: 'default', size: 'default', attrs: 'data-tw-ok', cls: 'cx-go' });
  };
  document.addEventListener('click', (e) => {
    const ok = e.target.closest('[data-tw-ok]'), no = e.target.closest('[data-tw-no]'); if ((!ok && !no) || !tpCb) return;
    const v = ok ? $('#tw-sum', body).textContent : null, cb = tpCb; tpCb = null;
    if (tpBack) { const back = tpBack; tpBack = null; easeHeight(mdl, back); } else closeModal();
    cb(v);
  });
  addEventListener('popstate', () => { if (tpCb && !open) { const cb = tpCb; tpCb = null; tpBack = null; cb(null); } });
  // a field-like Button that shows a time and opens the wheels
  kit.timeButton = (value, attrs = '') => `<button type="button" class="cn-button cn-button-variant-outline cn-button-size-sm cx-time-btn" ${attrs}>${ui.icon('clock')}<span class="cx-num">${value}</span></button>`;

  // kit.selectMenu(trigger, { options:[{value,label,description}], value, onChange, label }) — the library's menu, not a native list
  kit.selectMenu = (trigger, { options, value, onChange = () => {}, label = '' }) => {
    const menu = document.createElement('div'); menu.className = 'cn-dropdown-menu-content pg-pop cx-selmenu'; menu.setAttribute('role', 'listbox'); if (label) menu.setAttribute('aria-label', label); menu.hidden = true; lib.appendChild(menu);
    trigger.setAttribute('aria-haspopup', 'listbox'); trigger.setAttribute('aria-expanded', 'false');
    const paintT = () => { trigger.innerHTML = `<span>${options.find((o) => o.value === value)?.label ?? value}</span>${ui.icon('chev')}`; };
    const paintM = () => { menu.innerHTML = options.map((o) => `<div class="cn-dropdown-menu-item cx-selitem" role="option" tabindex="-1" aria-selected="${o.value === value}" data-sv="${o.value}"><span class="cx-vstack" style="gap:0">${ui.text(o.label)}${o.description ? ui.text(o.description, 'caption') : ''}</span>${o.value === value ? `<svg class="cx-selcheck"><use href="#check"/></svg>` : ''}</div>`).join(''); };
    const close = (refocus) => { if (menu.dataset.state !== 'open') return; hide(menu, 120); trigger.setAttribute('aria-expanded', 'false'); if (refocus) trigger.focus(); };
    trigger.addEventListener('click', () => { if (menu.dataset.state === 'open') return close(); paintM(); menu.hidden = false; menu.style.minWidth = trigger.offsetWidth + 'px'; place(menu, trigger, 'end', 6); show(menu); trigger.setAttribute('aria-expanded', 'true'); ($('[aria-selected="true"]', menu) || $('[role=option]', menu)).focus({ preventScroll: true }); });
    menu.addEventListener('click', (e) => { const it = e.target.closest('[data-sv]'); if (!it) return; value = it.dataset.sv; paintT(); close(true); onChange(value); });
    menu.addEventListener('pointermove', (e) => { const it = e.target.closest('[data-sv]'); if (it && document.activeElement !== it) it.focus({ preventScroll: true }); });
    menu.addEventListener('keydown', (e) => { const all = $$('[role=option]', menu), i = all.indexOf(document.activeElement); const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 }[e.key]; if (to !== undefined) { e.preventDefault(); all[(to + all.length) % all.length].focus(); } if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement.click(); } if (e.key === 'Escape') { e.stopPropagation(); close(true); } if (e.key === 'Tab') close(); });
    document.addEventListener('pointerdown', (e) => { if (menu.dataset.state === 'open' && !menu.contains(e.target) && !trigger.contains(e.target)) close(); });
    addEventListener('scroll', () => { if (menu.dataset.state === 'open') place(menu, trigger, 'end', 6); }, { passive: true });
    paintT();
  };


  // ── Calendar: mode 'single' | 'range'; months 1 | 2; onChange(value) ──
  kit.calendar = (root, { mode = 'single', months = 1, value = null, onChange = () => {}, min = null } = {}) => {
    let view = new Date((mode === 'range' ? value?.[0] : value) || today); view.setDate(1);
    let sel = value, hover = null, focusDay = startOfDay((mode === 'range' ? value?.[0] : value) || today);
    const WD = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];
    const inRange = (d) => mode === 'range' && sel?.[0] && (sel[1] || hover) && d > startOfDay(sel[0]) && d < startOfDay(sel[1] || hover) ;
    const isEdge = (d) => mode === 'range' ? (sameDay(d, sel?.[0]) || sameDay(d, sel?.[1])) : sameDay(d, sel);
    const month = (m) => {
      const first = new Date(view.getFullYear(), view.getMonth() + m, 1), lead = (first.getDay() + 6) % 7, days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i - lead)).slice(0, Math.ceil((lead + days) / 7) * 7);
      return `<div class="cx-cal-month" role="grid" aria-label="${MON[first.getMonth()]} ${first.getFullYear()}"><div class="cx-cal-title">${ui.text(`${MON[first.getMonth()][0].toUpperCase()}${MON[first.getMonth()].slice(1)} ${first.getFullYear()}`, 'heading')}</div><div class="cx-cal-grid" role="row">${WD.map((w) => `<span class="cx-cal-wd" role="columnheader">${ui.text(w, 'caption')}</span>`).join('')}</div><div class="cx-cal-grid">${cells.map((d) => {
        const out = d.getMonth() !== first.getMonth(), off = min && d < startOfDay(min);
        const st = isEdge(d) ? 'edge' : inRange(d) ? 'mid' : '';
        return `<button class="cn-button cn-button-variant-ghost cn-button-size-icon cx-cal-day" role="gridcell" data-day="${+d}" ${out ? 'data-out' : ''} ${sameDay(d, today) ? 'data-today' : ''} ${st ? `data-range="${st}"` : ''} aria-pressed="${st === 'edge'}" aria-label="${DAYLONG[d.getDay()]} ${d.getDate()} de ${MON[d.getMonth()]}" tabindex="${sameDay(d, focusDay) && !out ? 0 : -1}" ${off ? 'disabled' : ''}>${d.getDate()}</button>`;
      }).join('')}</div></div>`;
    };
    const paint = (focus) => {
      root.innerHTML = `<div class="cx-cal" data-months="${months}"><div class="cx-cal-nav">${ui.button({ icon: 'left', variant: 'ghost', size: 'icon-sm', attrs: 'data-cal-nav="-1" aria-label="Mes anterior" title="Mes anterior"' })}${ui.button({ icon: 'right', variant: 'ghost', size: 'icon-sm', attrs: 'data-cal-nav="1" aria-label="Mes siguiente" title="Mes siguiente"' })}</div><div class="cx-cal-months">${Array.from({ length: months }, (_, m) => month(m)).join('')}</div></div>`;
      if (focus) root.querySelector(`[data-day="${+focusDay}"]:not([data-out])`)?.focus();
    };
    const pick = (d) => {
      if (mode === 'single') sel = d;
      else if (!sel?.[0] || sel[1]) sel = [d, null];
      else sel = d < sel[0] ? [d, sel[0]] : [sel[0], d];
      focusDay = d; paint(true); onChange(sel);
    };
    root.addEventListener('click', (e) => {
      const n = e.target.closest('[data-cal-nav]'); if (n) { view.setMonth(view.getMonth() + +n.dataset.calNav); paint(); return; }
      const b = e.target.closest('[data-day]'); if (b && !b.disabled) pick(new Date(+b.dataset.day));
    });
    root.addEventListener('pointerover', (e) => { const b = e.target.closest('[data-day]'); if (mode === 'range' && b && sel?.[0] && !sel[1]) { hover = new Date(+b.dataset.day); $$('[data-day]', root).forEach((x) => { const d = new Date(+x.dataset.day); x.toggleAttribute('data-range', false); if (isEdge(d)) x.dataset.range = 'edge'; else if (inRange(d)) x.dataset.range = 'mid'; }); } });
    root.addEventListener('keydown', (e) => {
      const b = e.target.closest('[data-day]'); if (!b) return;
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (step || e.key === 'PageUp' || e.key === 'PageDown') {
        e.preventDefault(); const d = new Date(+b.dataset.day);
        if (step) d.setDate(d.getDate() + step); else d.setMonth(d.getMonth() + (e.key === 'PageUp' ? -1 : 1));
        focusDay = d; if (d < view || d >= new Date(view.getFullYear(), view.getMonth() + months, 1)) { view = new Date(d.getFullYear(), d.getMonth(), 1); }
        paint(true);
      }
    });
    paint();
    return { set: (v) => { sel = v; const a = mode === 'range' ? v?.[0] : v; if (a) { view = new Date(a.getFullYear(), a.getMonth(), 1); focusDay = startOfDay(a); } paint(); } };
  };

  // ── Agenda (generic). Everything is data:
  // resources [{id,name}] · events [{id,resource,day:Date,start:'HH:MM',dur,title,subtitle,tone,steps,at,payment,contact}]
  // availability(resourceId, day) → [[fromMin,toMin],…] · blocks [{id,resource,day,start,dur,reason}]
  // hooks: onCreate({resource,day,start}) · onChange(events) — the sheet (detail, lifecycle, move, cancel) is built in.
  kit.agenda = (root, { resources, events, blocks = [], availability = () => [[9 * 60, 19 * 60]], from = 9, to = 19, slot = 30, hourPx = 56, onCreate = () => {}, onChange = () => {}, nouns = { item: 'cita', items: 'citas', resource: 'profesional' } }) => {
    let day = new Date(today), view = 'day', who = 'all', narrow = false;
    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const toHM = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const y = (m) => ((m - from * 60) / 60) * hourPx;
    const weekDays = () => { const mon = addDays(day, -((day.getDay() + 6) % 7)); return Array.from({ length: 7 }, (_, i) => addDays(mon, i)); };
    const shown = () => (who === 'all' ? resources : resources.filter((r) => r.id === who));
    const evOn = (d, rid) => events.filter((e) => sameDay(e.day, d) && (rid ? e.resource === rid : who === 'all' || e.resource === who) && e.status !== 'cancelled');
    const blOn = (d, rid) => blocks.filter((b) => sameDay(b.day, d) && (!rid || b.resource === rid || b.resource === 'all'));
    const resName = (id) => resources.find((r) => r.id === id)?.name || '';
    // overlapping events share the column: each gets a lane and the lane count of its cluster
    const lanes = (list) => { const s = [...list].sort((a, b) => toMin(a.start) - toMin(b.start)); const out = new Map(); let cluster = [], end = -1; const flush = () => { const lanesEnd = []; cluster.forEach((e) => { const st = toMin(e.start); let l = lanesEnd.findIndex((x) => x <= st); if (l < 0) { l = lanesEnd.length; lanesEnd.push(0); } lanesEnd[l] = st + e.dur; out.set(e.id, [l, 0]); }); cluster.forEach((e) => { out.get(e.id)[1] = lanesEnd.length; }); }; s.forEach((e) => { const st = toMin(e.start); if (st >= end && cluster.length) { flush(); cluster = []; } cluster.push(e); end = Math.max(end, st + e.dur); }); if (cluster.length) flush(); return out; };
    const evHtml = (e, ln, showWho) => { const [l, n] = ln.get(e.id) || [0, 1]; const short = e.dur < 45; return `<button class="cx-ag-ev" data-ev="${e.id}" data-tone="${e.tone}" style="top:${y(toMin(e.start))}px;height:${(e.dur / 60) * hourPx - 3}px;left:calc(${(l / n) * 100}% + 3px);width:calc(${100 / n}% - 6px)" aria-label="${e.title}, ${e.start}, ${e.dur} minutos${showWho ? ', con ' + resName(e.resource) : ''}">${short ? ui.text(`${e.title} · ${e.start}`, 'label') : `${ui.text(e.title, 'label')}${ui.text(`${e.start} · ${e.subtitle}${showWho ? ' · ' + resName(e.resource) : ''}`, 'caption')}`}<span class="cx-ag-grip" aria-hidden="true"></span></button>`; };
    const offHtml = (d, rid) => { const av = availability(rid, d); if (!av.length) return `<div class="cx-ag-off" data-all style="top:0;height:100%">${ui.text('No trabaja este día', 'caption')}</div>`; const out = []; let cur = from * 60; av.forEach(([a, b]) => { if (a > cur) out.push([cur, a]); cur = Math.max(cur, b); }); if (cur < to * 60) out.push([cur, to * 60]); return out.map(([a, b]) => `<div class="cx-ag-off" style="top:${y(a)}px;height:${y(b) - y(a)}px"></div>`).join(''); };
    const blockHtml = (b) => `<div class="cx-ag-block" style="top:${y(toMin(b.start))}px;height:${(b.dur / 60) * hourPx - 2}px">${ui.text(`${b.reason || 'Bloqueado'} · ${b.start}`, 'caption')}</div>`;
    const title = () => view === 'week' ? `Semana del ${fmtDay(weekDays()[0])}` : `${DAYLONG[day.getDay()]} ${day.getDate()} de ${MON[day.getMonth()]}`;
    const toolbar = () => `<div class="cx-ag-bar">${ui.button({ label: 'Hoy', size: 'sm', attrs: 'data-ag="today"' })}<div class="cx-hstack" style="gap:2px;flex-wrap:nowrap">${ui.button({ icon: 'left', variant: 'ghost', size: 'icon-sm', attrs: `data-ag="prev" aria-label="${view === 'week' ? 'Semana anterior' : 'Día anterior'}"` })}${ui.button({ icon: 'right', variant: 'ghost', size: 'icon-sm', attrs: `data-ag="next" aria-label="${view === 'week' ? 'Semana siguiente' : 'Día siguiente'}"` })}</div>${ui.text(title(), 'heading')}<span class="cx-grow"></span><div class="cx-tabs" role="tablist" aria-label="Vista">${[['day', 'Día'], ['week', 'Semana'], ['list', 'Lista']].filter(([k]) => !narrow || k !== 'week').map(([k, l]) => `<button class="cn-button cn-button-variant-ghost cn-button-size-sm cx-tab" role="tab" aria-selected="${(narrow && view === 'week' ? 'day' : view) === k}" data-ag-view="${k}">${l}</button>`).join('')}</div>${ui.button({ label: `${ui.icon('i-lock')}Bloquear`, size: 'sm', attrs: 'data-ag="block"' })}${ui.button({ label: `${ui.icon('plus')}Nueva ${nouns.item}`, variant: 'default', size: 'sm', attrs: 'data-ag="new"' })}</div>`;
    const people = () => resources.length > 1 ? `<div class="cx-hstack cx-ag-who" role="radiogroup" aria-label="${nouns.resource}">${ui.button({ label: 'Todos', size: 'sm', variant: 'ghost', attrs: `role="radio" aria-checked="${who === 'all'}" aria-pressed="${who === 'all'}" data-who="all"` })}${resources.map((r) => ui.button({ label: `${ui.avatar(r.name, { size: 'sm' })}${r.name}`, size: 'sm', variant: 'ghost', attrs: `role="radio" aria-checked="${who === r.id}" aria-pressed="${who === r.id}" data-who="${r.id}"` })).join('')}</div>` : '';
    const strip = () => `<div class="cx-ag-strip" role="group" aria-label="Días">${weekDays().map((d) => { const n = evOn(d).length; return `<button class="cn-button cn-button-variant-ghost cx-size-tile cx-ag-day" data-ag-day="${+d}" aria-pressed="${sameDay(d, day)}" ${sameDay(d, today) ? 'data-today' : ''} aria-label="${DAYLONG[d.getDay()]} ${d.getDate()}, ${n} ${n === 1 ? nouns.item : nouns.items}"><small>${sameDay(d, today) ? 'hoy' : DAY[d.getDay()]}</small><b>${d.getDate()}</b><span class="cx-ag-count">${n ? n : ''}</span></button>`; }).join('')}</div>`;
    const grid = (cols) => { const hours = Array.from({ length: to - from }, (_, i) => from + i); const nowM = new Date().getHours() * 60 + new Date().getMinutes(); return `<div class="cx-ag-scroll cx-scroll"><div class="cx-ag" style="--cols:${cols.length};--h:${hourPx}px;height:${(to - from) * hourPx + 44}px"><div class="cx-ag-head"><span></span>${cols.map((c) => `<div class="cx-ag-colhead" ${c.today ? 'data-today' : ''}>${c.head}</div>`).join('')}</div><div class="cx-ag-body"><div class="cx-ag-times">${hours.map((h) => `<span style="top:${(h - from) * hourPx}px">${ui.text(`${String(h).padStart(2, '0')}:00`, 'caption')}</span>`).join('')}</div>${cols.map((c) => { const evs = evOn(c.day, c.rid === 'all' ? null : c.rid); const ln = lanes(evs); return `<div class="cx-ag-col" data-day="${+c.day}" data-rid="${c.rid}" role="group" aria-label="${c.label}">${c.rid !== 'all' ? offHtml(c.day, c.rid) : ''}${Array.from({ length: ((to - from) * 60) / slot }, (_, i) => `<button class="cx-ag-slot" data-slot-time="${from * 60 + i * slot}" style="top:${y(from * 60 + i * slot)}px;height:${(slot / 60) * hourPx}px" aria-label="Nueva ${nouns.item}, ${c.label}, ${toHM(from * 60 + i * slot)}" tabindex="-1"></button>`).join('')}${blOn(c.day, c.rid === 'all' ? null : c.rid).map(blockHtml).join('')}${evs.map((e) => evHtml(e, ln, c.rid === 'all' && who === 'all')).join('')}${sameDay(c.day, today) && nowM > from * 60 && nowM < to * 60 ? `<div class="cx-ag-now" style="top:${y(nowM)}px" aria-hidden="true"><i></i></div>` : ''}</div>`; }).join('')}</div></div></div>`; };
    // list = the phone's agenda (Storio's panel): a solid row is sold, a dashed one is still free
    const list = () => {
      const rids = shown().map((r) => r.id), rows = [];
      const evs = evOn(day).sort((a, b) => toMin(a.start) - toMin(b.start));
      const busy = (rid, m) => evOn(day, rid).some((e) => m >= toMin(e.start) && m < toMin(e.start) + e.dur) || blOn(day, rid).some((b) => m >= toMin(b.start) && m < toMin(b.start) + b.dur);
      for (let m = from * 60; m < to * 60; m += slot) {
        evs.filter((e) => toMin(e.start) >= m && toMin(e.start) < m + slot).forEach((e) => rows.push(`<button class="cx-ag-row" data-ev="${e.id}" data-tone="${e.tone}"><span class="cx-ag-row-t">${ui.text(e.start, 'strong')}${ui.text(`${e.dur} min`, 'caption')}</span><span class="cx-vstack" style="gap:0;min-width:0">${ui.text(e.title, 'heading')}${ui.text(`${e.subtitle}${resources.length > 1 ? ' · ' + resName(e.resource) : ''}`, 'muted')}</span>${e.steps ? ui.badge(e.steps[e.at], { tone: e.tone === 'wait' ? 'wait' : e.tone === 'info' ? 'info' : 'ok' }) : ''}</button>`));
        blOn(day).filter((b) => toMin(b.start) === m && (who === 'all' || b.resource === who || b.resource === 'all')).forEach((b) => rows.push(`<div class="cx-ag-row" data-kind="block"><span class="cx-ag-row-t">${ui.text(b.start, 'strong')}${ui.text(`${b.dur} min`, 'caption')}</span>${ui.text(`${b.reason || 'Bloqueado'}${resources.length > 1 && b.resource !== 'all' ? ' · ' + resName(b.resource) : ''}`, 'muted')}</div>`));
        const free = rids.filter((rid) => availability(rid, day).some(([a, b]) => m >= a && m + slot <= b) && !busy(rid, m));
        const key = free.join(','), lastRow = rows.at(-1);
        if (free.length && !evs.some((e) => toMin(e.start) <= m && toMin(e.start) + e.dur > m && (who !== 'all' || rids.length === 1))) {
          if (lastRow?.kind === 'free' && lastRow.key === key && lastRow.end === m) lastRow.end = m + slot;
          else rows.push({ kind: 'free', key, start: m, end: m + slot, free });
        }
      }
      const html = rows.map((r) => (typeof r === 'string' ? r : `<button class="cx-ag-row" data-kind="free" data-free="${r.start}" data-rid="${r.free[0]}" aria-label="Libre de ${toHM(r.start)} a ${toHM(r.end)}, crear"><span class="cx-ag-row-t">${ui.text(toHM(r.start), 'strong')}${r.end - r.start > slot ? ui.text(`a ${toHM(r.end)}`, 'caption') : ''}</span>${ui.text(`Libre${rids.length > 1 ? ` · ${r.free.map(resName).join(', ')}` : ''}`, 'muted')}<span class="cx-grow"></span>${ui.icon('plus')}</button>`)).join('');
      return `<div class="cx-ag-list" role="list">${html || `<div class="cn-empty" style="padding:32px 12px"><div class="cn-empty-header"><div class="cn-empty-title">No hay horario este día</div></div></div>`}</div>`;
    };
    const paint = () => {
      if (typeof drag !== 'undefined' && drag) { const d = drag; drag = null; clearTimeout(d.timer); cancelAnimationFrame(scrollRaf); d.ghost?.remove(); }
      const v = narrow && view === 'week' ? 'day' : view; // the phone keeps the calendar: day grid or list, the week needs a wide screen
      const cols = v === 'week' ? weekDays().map((d) => ({ day: d, rid: who === 'all' ? 'all' : who, head: `${DAY[d.getDay()]} ${d.getDate()}`, label: `${DAYLONG[d.getDay()]} ${d.getDate()}`, today: sameDay(d, today) })) : shown().map((r) => ({ day, rid: r.id, head: `${ui.avatar(r.name, { size: 'sm' })}${r.name}`, label: r.name }));
      root.innerHTML = toolbar() + `<div class="cx-ag-frame"><div class="cx-ag-top">${people()}${strip()}</div>${v === 'list' ? `<div class="cx-ag-listwrap">${list()}</div>` : grid(cols)}</div>`;
      $$('.cx-tabs', root).forEach(initTabs);
      const now = $('.cx-ag-now', root); if (now) $('.cx-ag-scroll', root).scrollTop = Math.max(0, parseFloat(now.style.top) - 120);
    };
    // drag to move · drag the bottom edge to resize (15 min). A ghost shows where it lands and turns red where the
    // time is not free; the real event never moves until a valid drop. Mouse starts after 6 px, touch after a long press.
    const free = (rid, d, st, dur, except) => availability(rid, d).some(([a, b]) => st >= a && st + dur <= b)
      && !evOn(d, rid).some((x) => x.id !== except && st < toMin(x.start) + x.dur && st + dur > toMin(x.start))
      && !blOn(d, rid).some((b) => st < toMin(b.start) + b.dur && st + dur > toMin(b.start));
    let drag = null, justDragged = false, scrollRaf = 0;
    const arm = () => {
      const d = drag; d.armed = true; clearTimeout(d.timer);
      d.ev.dataset.dragging = ''; d.ghost = d.ev.cloneNode(true); d.ghost.classList.add('cx-ag-ghost'); d.ghost.removeAttribute('data-dragging'); d.ghost.removeAttribute('data-ev'); d.ghost.setAttribute('aria-hidden', 'true'); d.ghost.tabIndex = -1;
      d.ghost.insertAdjacentHTML('beforeend', '<span class="cx-ag-ghost-t"></span>'); d.ev.parentElement.appendChild(d.ghost);
      const loop = () => { const scEl = $('.cx-ag-scroll', root); if (!drag?.armed || !scEl) return; const sc = scEl.getBoundingClientRect(), y0 = drag.lastY; const v = y0 < sc.top + 48 ? -10 : y0 > sc.bottom - 48 ? 10 : 0; if (v) { $('.cx-ag-scroll', root).scrollTop += v; move(drag.lastX, drag.lastY); } scrollRaf = requestAnimationFrame(loop); }; scrollRaf = requestAnimationFrame(loop);
      if (navigator.vibrate && d.touch) navigator.vibrate(8);
    };
    const move = (cx, cy) => {
      const d = drag; if (!d?.armed) return; d.lastX = cx; d.lastY = cy;
      if (d.resize) { const top = d.ev.getBoundingClientRect().top; d.dur = Math.max(15, Math.min(to * 60 - toMin(d.it.start), Math.round(((cy - top) / hourPx) * 60 / 15) * 15)); d.target = { day: d.it.day, resource: d.it.resource, start: d.it.start }; }
      else {
        const col = document.elementsFromPoint(cx, cy).find((x) => x.classList?.contains('cx-ag-col')); if (!col) return;
        const cr = col.getBoundingClientRect(), m = Math.round((((cy - d.dy - cr.top) / hourPx) * 60 + from * 60) / 15) * 15;
        d.target = { day: new Date(+col.dataset.day), resource: col.dataset.rid === 'all' ? d.it.resource : col.dataset.rid, start: toHM(Math.max(from * 60, Math.min(to * 60 - d.it.dur, m))) };
        if (d.ghost.parentElement !== col) { col.appendChild(d.ghost); d.ghost.style.left = '3px'; d.ghost.style.width = 'calc(100% - 6px)'; }
      }
      const st = toMin(d.target.start), dur = d.resize ? d.dur : d.it.dur;
      d.ok = free(d.target.resource, d.target.day, st, dur, d.it.id);
      d.ghost.style.top = y(st) + 'px'; d.ghost.style.height = (dur / 60) * hourPx - 3 + 'px';
      d.ghost.toggleAttribute('data-invalid', !d.ok);
      $('.cx-ag-ghost-t', d.ghost).textContent = `${d.target.start}–${toHM(st + dur)}${resources.length > 1 ? ' · ' + resName(d.target.resource) : ''}${d.ok ? '' : ' · no está libre'}`;
    };
    const stop = (commit) => {
      const d = drag; drag = null; cancelAnimationFrame(scrollRaf); if (!d) return; clearTimeout(d.timer);
      if (!d.armed) return;
      justDragged = true; setTimeout(() => { justDragged = false; }, 0);
      delete d.ev.dataset.dragging;
      const changed = d.target && (d.resize ? d.dur !== d.it.dur : d.target.start !== d.it.start || d.target.resource !== d.it.resource || !sameDay(d.target.day, d.it.day));
      if (commit && d.ok && changed) {
        if (d.resize) d.it.dur = d.dur; else Object.assign(d.it, d.target);
        paint(); onChange(events);
        island('done', d.resize ? `Ahora dura ${d.it.dur} min` : `Movida a las ${d.it.start}${resources.length > 1 ? ' con ' + resName(d.it.resource) : ''}`, 2000);
        $(`.cx-ag-ev[data-ev="${d.it.id}"]`, root)?.animate([{ boxShadow: '0 0 0 2px var(--selected)' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 700 });
        return;
      }
      if (commit && !d.ok && changed) island('error', 'Ese horario no está libre', 2000);
      // back to where it was: the ghost flies home, then goes
      const home = d.ev.getBoundingClientRect(), g = d.ghost.getBoundingClientRect();
      d.ghost.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${home.left - g.left}px, ${home.top - g.top}px)`, opacity: 0.4 }], { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }).finished.then(() => d.ghost.remove());
    };
    root.addEventListener('pointerdown', (e) => {
      const ev = e.target.closest('.cx-ag-ev'); if (!ev || e.button > 0 || drag) return;
      const it = events.find((x) => x.id === ev.dataset.ev), r = ev.getBoundingClientRect();
      drag = { ev, it, resize: !!e.target.closest('.cx-ag-grip'), dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, lastX: e.clientX, lastY: e.clientY, armed: false, touch: e.pointerType === 'touch', dur: it.dur, pid: e.pointerId };
      if (drag.touch) drag.timer = setTimeout(() => { if (drag && !drag.armed) { arm(); move(drag.lastX, drag.lastY); } }, 320);
    });
    root.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.pid) return; drag.lastX = e.clientX; drag.lastY = e.clientY;
      const dist = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
      if (!drag.armed) { if (drag.touch) { if (dist > 10) { clearTimeout(drag.timer); drag = null; } return; } if (dist < 6) return; arm(); try { drag.ev.setPointerCapture(e.pointerId); } catch { /* already gone */ } }
      move(e.clientX, e.clientY);
    });
    // a long-pressed touch drag must not scroll the grid underneath it
    root.addEventListener('touchmove', (e) => { if (drag?.armed) e.preventDefault(); }, { passive: false });
    root.addEventListener('pointerup', (e) => { if (drag && e.pointerId === drag.pid) stop(true); });
    root.addEventListener('pointercancel', () => stop(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drag?.armed) { e.preventDefault(); stop(false); } });
    root.addEventListener('click', (e) => {
      const evb = e.target.closest('.cx-ag-ev'); if (evb) { if (!justDragged) openEvent(events.find((x) => x.id === evb.dataset.ev)); return; }
      const a = e.target.closest('[data-ag]'); if (a) { const k = a.dataset.ag; if (k === 'today') day = new Date(today); if (k === 'prev' || k === 'next') day = addDays(day, (k === 'next' ? 1 : -1) * (view === 'week' && !narrow ? 7 : 1)); if (k === 'new') return onCreate({ resource: who === 'all' ? resources[0].id : who, day, start: null }); if (k === 'block') return openBlock(); paint(); return; }
      const v = e.target.closest('[data-ag-view]'); if (v) { view = v.dataset.agView; paint(); return; }
      const w = e.target.closest('[data-who]'); if (w) { who = w.dataset.who; paint(); return; }
      const dd = e.target.closest('[data-ag-day]'); if (dd) { day = new Date(+dd.dataset.agDay); if (view === 'week' && !narrow) view = 'day'; paint(); return; }
      const s = e.target.closest('.cx-ag-slot'); if (s) { const col = s.closest('.cx-ag-col'); onCreate({ resource: col.dataset.rid === 'all' ? resources[0].id : col.dataset.rid, day: new Date(+col.dataset.day), start: toHM(+s.dataset.slotTime) }); return; }
      const f = e.target.closest('[data-free]'); if (f) { onCreate({ resource: f.dataset.rid, day, start: toHM(+f.dataset.free) }); return; }
      const row = e.target.closest('.cx-ag-row[data-ev]'); if (row) openEvent(events.find((x) => x.id === row.dataset.ev));
    });
    root.addEventListener('keydown', (e) => { const ev = e.target.closest('.cx-ag-ev'); if (ev && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openEvent(events.find((x) => x.id === ev.dataset.ev)); } });
    new ResizeObserver(() => { const n = root.clientWidth < 700; if (n !== narrow) { narrow = n; paint(); } }).observe(root);

    // ── the event sheet: detail · lifecycle · payment · move (second step) · cancel (second step) ──
    let open1 = null, step = 'detail', moveTo = null;
    const openEvent = (ev) => { open1 = ev; step = 'detail'; moveTo = null; openModal('agEvent', 'auto'); };
    const sheet = () => {
      const e = open1;
      if (step === 'move') {
        const days = Array.from({ length: 6 }, (_, i) => addDays(today, i)).filter((d) => availability(e.resource, d).length);
        const md = moveTo?.day || e.day, free = [];
        const nowMin = sameDay(md, new Date()) ? new Date().getHours() * 60 + new Date().getMinutes() : -1;
        for (let m = from * 60; m + e.dur <= to * 60; m += slot) { const ok = m > nowMin && availability(e.resource, md).some(([a, b]) => m >= a && m + e.dur <= b) && !evOn(md, e.resource).some((x) => x.id !== e.id && m < toMin(x.start) + x.dur && m + e.dur > toMin(x.start)); if (ok) free.push(toHM(m)); }
        $('#mdl-title').textContent = 'Cambiar la hora'; $('#mdl-desc').textContent = `${e.title} · ${e.dur} min con ${resName(e.resource)}`;
        body.innerHTML = `<div class="cx-vstack" style="gap:14px">${ui.text('Día', 'label')}<div class="cx-wz-days" style="grid-template-columns:repeat(${days.length},1fr)">${days.map((d) => `<button class="cn-button cn-button-variant-outline cx-size-tile cx-day" data-mv-day="${+d}" aria-pressed="${sameDay(d, md)}"><small>${sameDay(d, today) ? 'hoy' : DAY[d.getDay()]}</small><b>${d.getDate()}</b><i></i></button>`).join('')}</div>${ui.text('Hora libre', 'label')}${free.length ? `<div class="cx-hour-grid">${free.map((h) => (sameDay(md, e.day) && h === e.start ? ui.button({ label: h, size: 'sm', attrs: `disabled title="Es su hora actual" aria-label="${h}, su hora actual"` }) : ui.button({ label: h, size: 'sm', attrs: `aria-pressed="${moveTo?.start === h}" data-mv-h="${h}"` }))).join('')}</div>` : ui.text('No queda una hora libre ese día.', 'muted', 'p')}</div>`;
        foot.innerHTML = ui.button({ label: `${ui.icon('left')}Volver`, size: 'default', attrs: 'data-ev-back', cls: 'cx-exit' }) + ui.button({ label: 'Guardar nueva hora', variant: 'default', size: 'default', attrs: `data-ev-move ${moveTo?.start ? '' : 'disabled'}`, cls: 'cx-go' });
        return;
      }
      if (step === 'cancel') {
        const R = ['El cliente pidió cancelar', 'No vino', 'Me surgió algo', 'Otro'];
        $('#mdl-title').textContent = `Cancelar la ${nouns.item}`; $('#mdl-desc').textContent = `${e.title} · ${e.start}`;
        body.innerHTML = `<div class="cx-vstack" role="radiogroup" aria-label="Motivo" style="gap:8px">${ui.text('¿Por qué?', 'label')}${R.map((r, i) => ui.choice({ title: r, checked: i === 0, attrs: `data-why="${r}"` })).join('')}</div>${ui.text('Le avisamos al cliente con este motivo.', 'caption', 'p')}`;
        foot.innerHTML = ui.button({ label: `${ui.icon('left')}Volver`, size: 'default', attrs: 'data-ev-back', cls: 'cx-exit' }) + ui.button({ label: `Cancelar la ${nouns.item}`, variant: 'destructive', size: 'default', attrs: 'data-ev-cancel-go', cls: 'cx-go' });
        return;
      }
      const last = e.steps && e.at >= e.steps.length - 1, next = e.steps && !last ? e.steps[e.at + 1] : null;
      $('#mdl-title').textContent = e.title; $('#mdl-desc').textContent = `${DAYLONG[e.day.getDay()]} ${e.day.getDate()} · ${e.start} · ${e.dur} min · ${resName(e.resource)}`;
      body.innerHTML = `${e.steps ? ui.stepper(e.steps, e.at) : ''}<div class="cn-item-group" style="gap:0">${[
        ui.item({ media: ui.itemMedia(ui.icon('scissors')), title: e.subtitle, description: e.price ? money0(e.price) : '' }),
        e.payment ? ui.item({ media: ui.itemMedia(ui.icon('card')), title: e.payment.label, description: e.payment.detail, actions: ui.badge(e.payment.state, { tone: e.payment.tone }), footer: e.payment.receipt ? `<div class="cx-vstack" style="gap:8px">${e.payment.seen ? `<span class="cx-rcpt-mini" style="background:linear-gradient(135deg,#e8e3d6,#cfc6b0)" role="img" aria-label="Comprobante"></span>` : ''}<div class="cx-hstack">${ui.button({ label: `${ui.icon('image')}${e.payment.seen ? 'Ocultar' : 'Ver'} comprobante`, size: 'sm', attrs: 'data-ev-proof' })}${e.payment.tone === 'info' ? ui.button({ label: 'Pago recibido', size: 'sm', variant: 'default', attrs: `data-ev-paid ${e.payment.seen ? '' : 'disabled title="Ábrelo primero"'}` }) : ''}</div></div>` : '' }) : '',
        e.contact ? ui.item({ media: ui.itemMedia(ui.icon('i-mail')), title: e.contact.label, description: e.contact.handle, actions: ui.button({ label: 'Escribir', size: 'xs', attrs: 'data-ev-write' }) }) : '',
      ].filter(Boolean).join(ui.itemSeparator())}</div><div class="cx-hstack">${ui.button({ label: `${ui.icon('clock')}Cambiar la hora`, size: 'sm', variant: 'ghost', attrs: 'data-ev-step="move"' })}${ui.button({ label: `${ui.icon('caloff')}Cancelar`, size: 'sm', variant: 'ghost', attrs: 'data-ev-step="cancel"' })}</div>`;
      foot.innerHTML = ui.button({ label: 'Cerrar', size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }) + (next ? ui.button({ label: `${e.actions?.[e.at] || next}${ui.icon('right')}`, variant: 'default', size: 'default', attrs: `data-ev-next ${e.payment && e.payment.tone === 'info' && e.at === 0 ? 'disabled title="Primero confirma el pago"' : ''}`, cls: 'cx-go' }) : ui.button({ label: `${ui.icon('check')}Terminada`, size: 'default', attrs: 'disabled', cls: 'cx-go' }));
    };
    CONTENT.agEvent = sheet;
    const reSheet = () => easeHeight(mdl, sheet);
    document.addEventListener('click', (e) => {
      if (!open1 || !mdl.contains(e.target)) return;
      const st = e.target.closest('[data-ev-step]'); if (st) { step = st.dataset.evStep; moveTo = null; return reSheet(); }
      if (e.target.closest('[data-ev-back]')) { step = 'detail'; return reSheet(); }
      if (e.target.closest('[data-ev-proof]')) { open1.payment.seen = !open1.payment.seen; return reSheet(); }
      if (e.target.closest('[data-ev-paid]')) { Object.assign(open1.payment, { state: 'Pagado', tone: 'ok', receipt: false }); open1.tone = 'ok'; paint(); return reSheet(); }
      if (e.target.closest('[data-ev-next]')) { open1.at++; if (open1.at >= open1.steps.length - 1) open1.tone = 'ok'; paint(); onChange(events); return reSheet(); }
      const md = e.target.closest('[data-mv-day]'); if (md) { moveTo = { day: new Date(+md.dataset.mvDay), start: null }; return reSheet(); }
      const mh = e.target.closest('[data-mv-h]'); if (mh) { moveTo = { day: moveTo?.day || open1.day, start: mh.dataset.mvH }; return sheet(); }
      if (e.target.closest('[data-ev-move]')) { Object.assign(open1, moveTo); day = new Date(moveTo.day); paint(); onChange(events); closeModal(); island('done', `Movida al ${moveTo.day.getDate()} a las ${moveTo.start}`, 2200); return; }
      const why = e.target.closest('[data-why]'); if (why) { $$('[data-why]', body).forEach((x) => x.setAttribute('aria-checked', x === why)); return; }
      if (e.target.closest('[data-ev-cancel-go]')) { open1.status = 'cancelled'; paint(); onChange(events); closeModal(); island('done', `${nouns.item[0].toUpperCase()}${nouns.item.slice(1)} cancelada`, 2400); return; }
      if (e.target.closest('[data-ev-write]')) island('info', `Abriendo ${open1.contact.label}`, 1800);
    });

    // ── block time ──
    const openBlock = () => openModal('agBlock', 'auto');
    CONTENT.agBlock = () => {
      $('#mdl-title').textContent = 'Bloquear un horario'; $('#mdl-desc').textContent = 'Nadie puede reservar en ese rato.';
      const sel = (id, label, v) => ui.field({ id, label, control: kit.timeButton(v, `id="${id}" data-blt="${label}" style="width:100%;justify-content:flex-start"`) });
      body.innerHTML = `${resources.length > 1 ? ui.field({ id: 'bl-r', label: 'Para', control: `<button type="button" class="cn-button cn-button-variant-outline cn-button-size-default cx-sel-btn cx-fill" id="bl-r" data-v="all"></button>` }) : ''}<div class="cx-frange">${sel('bl-f', 'Desde', '13:00')}${sel('bl-t', 'Hasta', '14:00')}</div>${ui.field({ id: 'bl-why', label: 'Motivo', control: ui.input({ id: 'bl-why', value: 'Almuerzo' }), description: 'Solo lo ves tú.' })}`;
      foot.innerHTML = ui.button({ label: 'Cancelar', size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }) + ui.button({ label: `${ui.icon('i-lock')}Bloquear`, variant: 'default', size: 'default', attrs: 'data-bl-go', cls: 'cx-go' });
      const br = $('#bl-r', body); if (br) kit.selectMenu(br, { label: 'Para', value: 'all', options: [{ value: 'all', label: 'Todo el negocio' }, ...resources.map((r) => ({ value: r.id, label: r.name }))], onChange: (v) => { br.dataset.v = v; } });
    };
    body.addEventListener('click', async (e) => { const b = e.target.closest('[data-blt]'); if (!b) return; const v = await kit.pickTime({ value: b.querySelector('span').textContent, label: b.dataset.blt, from, to, step: 15 }); if (!v) return; b.querySelector('span').textContent = v; b.removeAttribute('aria-invalid'); const fb = $('#bl-f span', body), tb = $('#bl-t span', body); if (toMin(tb.textContent) <= toMin(fb.textContent)) tb.textContent = toHM(Math.min(toMin(fb.textContent) + 60, to * 60)); });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-bl-go]')) return;
      const f = toMin($('#bl-f span', body).textContent), t2 = toMin($('#bl-t span', body).textContent); if (t2 <= f) { $('#bl-t', body).setAttribute('aria-invalid', 'true'); return; }
      blocks.push({ id: 'b' + Date.now(), resource: $('#bl-r', body)?.dataset.v || resources[0].id, day: new Date(day), start: toHM(f), dur: t2 - f, reason: $('#bl-why', body).value.trim() || 'Bloqueado' });
      closeModal(); paint(); onChange(events);
    });
    paint();
    return { refresh: paint };
  };

  // ── Chat thread + composer (shared by the inbox and the chatbot) ──
  const TICK = { sending: 'clock', sent: 'i-tick', delivered: 'i-ticks', read: 'i-ticks' };
  kit.bubble = (m) => {
    if (m.day) return `<div class="cx-chat-day" role="separator">${ui.text(m.day, 'caption')}</div>`;
    const body = m.image ? `<span class="cx-chat-img" style="background:${m.image}" role="img" aria-label="Foto"></span>${m.text ? `<p>${m.text}</p>` : ''}`
      : m.audio ? `<span class="cx-chat-audio">${ui.button({ icon: 'play', variant: 'ghost', size: 'icon-sm', cls: 'cx-audio-btn', attrs: `data-audio="${m.audio}" aria-label="Reproducir audio de ${m.audio} s"` })}${ui.progress(0, 'Audio')}${ui.text(`0:${String(m.audio).padStart(2, '0')}`, 'caption')}</span>`
      : m.card ? `<span class="cx-chat-card">${m.card}</span>` : `<p>${m.text}</p>`;
    return `<div class="cx-chat-msg" data-who="${m.out ? 'out' : 'in'}" ${m.id ? `data-mid="${m.id}"` : ''}><div class="cx-chat-bubble">${body}<span class="cx-chat-meta">${m.tag ? `<span class="cx-chat-tag">${m.tagIcon ? ui.icon(m.tagIcon) : ''}${m.tag}</span>` : ''}${ui.text(m.time || '', 'caption')}${m.out && m.status ? `<svg class="cx-tick" data-status="${m.status}" aria-label="${{ sending: 'Enviando', sent: 'Enviado', delivered: 'Entregado', read: 'Leído' }[m.status]}"><use href="#${TICK[m.status]}"/></svg>` : ''}</span></div>${m.actions ? `<div class="cx-chat-actions">${m.actions}</div>` : ''}</div>`;
  };
  // audio bubbles play (a demo clock drives the Progress atom)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-audio]'); if (!b) return;
    const wrap = b.closest('.cx-chat-audio'), bar = $('.cn-progress-indicator', wrap), label = $('[data-variant="caption"]', wrap), secs = +b.dataset.audio;
    if (b._t) { clearInterval(b._t); b._t = null; b.innerHTML = ui.icon('play'); return; }
    let t = b._pos || 0; b.innerHTML = ui.icon('pause');
    b._t = setInterval(() => { t += 0.25; b._pos = t; bar.style.transform = `translateX(-${100 - (t / secs) * 100}%)`; label.textContent = `0:${String(Math.floor(t)).padStart(2, '0')}`; if (t >= secs) { clearInterval(b._t); b._t = null; b._pos = 0; b.innerHTML = ui.icon('play'); } }, 250);
  });
  const typing = () => `<div class="cx-chat-msg" data-who="in" data-typing><div class="cx-chat-bubble cx-typing" aria-label="Escribiendo"><i></i><i></i><i></i></div></div>`;

  // ── More atoms: Card, Alert and the InputGroup button, so nothing below is drawn by hand ──
  ui.card = ({ title = '', description = '', action = '', content = '', footer = '', size = 'sm', cls = '', attrs = '' }) =>
    `<div data-slot="card" data-size="${size}" class="cn-card ${cls}" ${attrs}>${title || description || action ? `<div data-slot="card-header" class="cn-card-header">${title ? `<div data-slot="card-title" class="cn-card-title">${title}</div>` : ''}${description ? `<div data-slot="card-description" class="cn-card-description">${description}</div>` : ''}${action ? `<div data-slot="card-action" class="cn-card-action">${action}</div>` : ''}</div>` : ''}${content ? `<div data-slot="card-content" class="cn-card-content">${content}</div>` : ''}${footer ? `<div data-slot="card-footer" class="cn-card-footer">${footer}</div>` : ''}</div>`;
  ui.alert = ({ icon = 'info', title = '', description = '', action = '', tone = '', attrs = '' }) =>
    `<div data-slot="alert" role="status" class="cn-alert cn-alert-variant-default group/alert cx-alert" ${tone ? `data-tone="${tone}"` : ''} ${attrs}>${ui.icon(icon)}${title ? `<div data-slot="alert-title" class="cn-alert-title">${title}</div>` : ''}${description ? `<div data-slot="alert-description" class="cn-alert-description">${description}</div>` : ''}${action ? `<div data-slot="alert-action" class="cn-alert-action">${action}</div>` : ''}</div>`;
  ui.groupButton = ({ icon = '', label = '', variant = 'ghost', size = 'icon-sm', type = 'button', attrs = '' }) =>
    `<button type="${type}" data-slot="button" data-size="${size}" class="cn-button cn-button-variant-${variant} cn-input-group-button cn-input-group-button-size-${size} group/button" ${attrs}>${icon ? ui.icon(icon) : ''}${label}</button>`;

  // ── Action menu: the library's dropdown for verbs (archive, delete…), items [{id, label, icon, danger}] ──
  kit.actionMenu = (trigger, { items, label = 'Opciones', onPick }) => {
    const menu = document.createElement('div'); menu.className = 'cn-dropdown-menu-content pg-pop cx-selmenu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', label); menu.hidden = true; lib.appendChild(menu);
    trigger.setAttribute('aria-haspopup', 'menu'); trigger.setAttribute('aria-expanded', 'false');
    const paint = () => { menu.innerHTML = (typeof items === 'function' ? items() : items).map((it) => `<div class="cn-dropdown-menu-item cx-selitem" role="menuitem" tabindex="-1" data-mi-id="${it.id}" ${it.danger ? 'data-variant="destructive"' : ''}><span class="cx-hstack" style="gap:8px">${ui.icon(it.icon)}${it.label}</span></div>`).join(''); };
    const close = (refocus) => { if (menu.dataset.state !== 'open') return; hide(menu, 120); trigger.setAttribute('aria-expanded', 'false'); if (refocus) trigger.focus(); };
    trigger.addEventListener('click', () => { if (menu.dataset.state === 'open') return close(); paint(); menu.hidden = false; place(menu, trigger, 'end', 6); show(menu); trigger.setAttribute('aria-expanded', 'true'); $('[role=menuitem]', menu)?.focus({ preventScroll: true }); });
    menu.addEventListener('click', (e) => { const it = e.target.closest('[data-mi-id]'); if (!it) return; close(true); onPick(it.dataset.miId); });
    menu.addEventListener('pointermove', (e) => { const it = e.target.closest('[role=menuitem]'); if (it && document.activeElement !== it) it.focus({ preventScroll: true }); });
    menu.addEventListener('keydown', (e) => { const all = $$('[role=menuitem]', menu), i = all.indexOf(document.activeElement); const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 }[e.key]; if (to !== undefined) { e.preventDefault(); all[(to + all.length) % all.length].focus(); } if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement.click(); } if (e.key === 'Escape') { e.stopPropagation(); close(true); } if (e.key === 'Tab') close(); });
    document.addEventListener('pointerdown', (e) => { if (menu.dataset.state === 'open' && !menu.contains(e.target) && !trigger.contains(e.target)) close(); });
  };

  // ── Composer: shadcn's InputGroup with a Textarea and a block-end addon for its buttons ──
  const EMOJI = ['😀', '😂', '😊', '😍', '🙏', '👍', '👌', '🙌', '🎉', '❤️', '🔥', '✨', '📅', '⏰', '📍', '💳', '✅', '👋', '🤝', '😉'];
  kit.composer = ({ placeholder = 'Escribe un mensaje', attach = true, emoji = true, templates = [], hint = '' } = {}) =>
    `<form class="cx-composer" data-composer><div data-slot="input-group" role="group" class="cn-input-group group/input-group cx-composer-box"><textarea data-slot="input-group-control" class="cn-textarea cn-input-group-textarea cx-composer-in" rows="1" placeholder="${placeholder}" aria-label="${placeholder}"></textarea><div data-slot="input-group-addon" data-align="block-end" role="group" class="cn-input-group-addon cn-input-group-addon-align-block-end">${emoji ? ui.groupButton({ icon: 'smile', attrs: 'data-emoji aria-haspopup="dialog" aria-label="Emoji" title="Emoji"' }) : ''}${attach ? ui.groupButton({ icon: 'i-clip', attrs: 'data-attach aria-label="Adjuntar" title="Adjuntar"' }) : ''}${templates.length ? ui.groupButton({ icon: 'i-doc', attrs: 'data-templates aria-label="Plantillas" title="Plantillas"' }) : ''}<span class="cx-grow"></span>${ui.groupButton({ icon: 'i-send', variant: 'default', type: 'submit', attrs: 'data-send aria-label="Enviar" title="Enviar" disabled' })}</div></div>${hint ? `<p class="cx-composer-hint">${ui.text(hint, 'caption')}</p>` : ''}</form>`;
  const autosize = (ta) => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'; };
  const wireComposer = (root, onSend, templates = []) => {
    const form = $('[data-composer]', root), ta = $('textarea', form), send = $('[data-send]', form);
    const sync = () => { autosize(ta); if (!('stop' in send.dataset)) send.disabled = !ta.value.trim(); };
    const insert = (text) => { const a = ta.selectionStart ?? ta.value.length, b = ta.selectionEnd ?? a; ta.value = ta.value.slice(0, a) + text + ta.value.slice(b); ta.selectionStart = ta.selectionEnd = a + text.length; sync(); ta.focus(); };
    ta.addEventListener('input', sync);
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener('submit', (e) => { e.preventDefault(); if ('stop' in send.dataset) return; const t = ta.value.trim(); if (!t) return; ta.value = ''; sync(); onSend(t); });
    const tb = $('[data-templates]', form);
    if (tb) kit.actionMenu(tb, { label: 'Plantillas', items: templates.map((t, i) => ({ id: String(i), label: t[0], icon: 'i-doc' })), onPick: (i) => { ta.value = templates[+i][1]; sync(); ta.focus(); } });
    const eb = $('[data-emoji]', form);
    if (eb) {
      const pop = document.createElement('div'); pop.className = 'cn-popover-content pg-pop cx-emoji'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Emoji'); pop.hidden = true; lib.appendChild(pop);
      pop.innerHTML = EMOJI.map((x) => ui.button({ label: x, variant: 'ghost', size: 'icon', attrs: `data-emo="${x}" aria-label="${x}"` })).join('');
      eb.addEventListener('click', () => { if (pop.dataset.state === 'open') return hide(pop, 120); pop.hidden = false; place(pop, eb, 'start', 8); show(pop); });
      pop.addEventListener('click', (e) => { const b = e.target.closest('[data-emo]'); if (b) insert(b.dataset.emo); });
      document.addEventListener('pointerdown', (e) => { if (pop.dataset.state === 'open' && !pop.contains(e.target) && !eb.contains(e.target)) hide(pop, 120); });
    }
    $('[data-attach]', form)?.addEventListener('click', () => onSend(null, { image: 'linear-gradient(135deg,#c79a6b,#6b4a2e)' }));
  };

  // ── Messaging: one inbox for every channel. Three panes when wide (list · chat · person), the person in a sheet
  // when medium, master/detail when narrow. Generic: channels, filters, states, the bot's control copy, quick actions
  // and the person panel are options; a conversation is { id, name, channel, handle, state, control, unread, last,
  // lastBy, time, window, archived, messages }. A message can be text/image/audio/card (kit.bubble), a day, a
  // system line { system, icon } or an event card { event: { icon, title, subtitle, rows, total, state, actions } }.
  kit.messaging = (root, { title = 'Mensajes', channels, conversations, filters, states = {}, control = {}, quick = [], profile = () => null, templates = [], reply = () => null, hint = 'Enter envía · Shift+Enter hace un salto de línea' }) => {
    let cur = conversations[0].id, filter = filters[0].id, q = '', archived = false, armed = null;
    const conv = () => conversations.find((c) => c.id === cur);
    const inView = (c) => !!c.archived === archived && (!q || fold(`${c.name} ${c.last}`).includes(fold(q)));
    const visible = () => conversations.filter((c) => inView(c) && filters.find((f) => f.id === filter).match(c));
    const chMark = (c) => `<span class="cx-ch" style="--brand:${channels[c.channel].color}" title="${channels[c.channel].name}">${ui.icon(channels[c.channel].icon)}</span>`;
    const stateBadge = (c) => (states[c.state] ? ui.badge(states[c.state].label, { tone: states[c.state].tone }) : '');
    const animIn = (el) => el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.22,1,.36,1)' });
    const clock = () => { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`; };

    // ── list ──
    const row = (c) => `<button type="button" class="cn-item cn-item-variant-default cn-item-size-sm cx-mx-row" role="listitem" data-conv="${c.id}" ${c.id === cur ? 'aria-current="true"' : ''} ${c.unread ? 'data-unread' : ''}><div class="cn-item-media cx-mx-av">${ui.avatar(c.name)}${chMark(c)}</div><div class="cn-item-content"><div class="cn-item-title"><span class="cx-ellipsis">${c.name}</span>${stateBadge(c)}</div><p class="cn-item-description"><span class="cx-ellipsis">${c.lastBy ? `<span class="cx-mx-by">${c.lastBy}:</span> ` : ''}${c.last}</span></p></div><div class="cn-item-actions cx-mx-end">${ui.text(c.time, 'caption')}${c.unread ? ui.badge(String(c.unread), { variant: 'default' }) : '<span class="cx-mx-badge-gap"></span>'}</div></button>`;
    const paintChips = () => { $('.cx-mx-chips', root).innerHTML = filters.map((f) => ui.button({ label: `${f.label}<span class="cx-mx-n">${conversations.filter((c) => inView(c) && f.match(c)).length}</span>`, size: 'xs', attrs: `data-mx-f="${f.id}" aria-pressed="${f.id === filter}"` })).join(''); };
    const paintList = () => {
      const items = visible();
      $('.cx-mx-items', root).innerHTML = items.map(row).join('') || `<div class="cn-empty cx-mx-empty"><div class="cn-empty-header"><div class="cn-empty-media cn-empty-media-icon">${ui.icon(archived ? 'i-archive' : 'i-inbox')}</div><div class="cn-empty-title">${archived ? 'Nada archivado' : 'Nada por aquí'}</div><div class="cn-empty-description">${q ? 'Prueba con otro nombre.' : archived ? 'Lo que archives queda aquí.' : 'Cuando te escriban, aparece aquí.'}</div></div></div>`;
      $('.cx-mx-count', root).textContent = `${conversations.filter((c) => !!c.archived === archived).length} ${archived ? 'archivadas' : 'conversaciones'}`;
      $('[data-mx-arch]', root).innerHTML = archived ? `${ui.icon('i-inbox')}Bandeja` : `${ui.icon('i-archive')}Archivadas`;
      paintChips();
    };

    // ── thread ──
    const msgHtml = (m) => m.system ? `<div class="cx-chat-sys" role="note">${ui.icon(m.icon || 'info')}${ui.text(m.system, 'caption')}</div>`
      : m.event ? `<div class="cx-chat-msg cx-chat-event" data-who="${m.out ? 'out' : 'in'}">${ui.card({ cls: 'cx-mx-card', title: `<span class="cx-hstack" style="gap:10px;flex-wrap:nowrap">${ui.itemMedia(ui.icon(m.event.icon), 'icon')}<span class="cx-vstack" style="gap:0">${ui.text(m.event.title, 'strong')}${ui.text(m.event.subtitle, 'caption')}</span></span>`, content: `${(m.event.rows || []).map(([l, v]) => `<div class="cx-mx-line">${ui.text(l)}${ui.text(v, 'strong')}</div>`).join('')}${m.event.total ? `<div class="cx-mx-line cx-mx-total">${ui.text(m.event.total[0], 'strong')}${ui.text(m.event.total[1], 'strong')}</div>` : ''}${m.event.state ? `<div>${ui.badge(m.event.state.label, { tone: m.event.state.tone })}</div>` : ''}`, footer: m.event.actions || '' })}</div>`
      : kit.bubble(m);
    const syncHead = () => { const c = conv(), slot = $('.cx-mx-thwho > span', root); if (!slot) return; $('.cn-badge', slot)?.remove(); slot.insertAdjacentHTML('beforeend', stateBadge(c)); };
    const paintControl = () => {
      const c = conv(), k = control[c.control]; const slot = $('.cx-mx-control', root); if (!slot) return;
      easeHeight(slot, () => { slot.innerHTML = k ? ui.alert({ icon: k.icon, tone: k.tone, title: k.title, description: typeof k.description === 'function' ? k.description(c) : k.description, action: ui.button({ label: k.action, size: 'xs', variant: k.tone === 'wait' ? 'default' : 'outline', attrs: `data-mx-ctl="${k.next}"` }) }) : ''; });
    };
    const paintQuick = () => {
      const slot = $('.cx-mx-quick', root), c = conv();
      easeHeight(slot, () => {
        slot.innerHTML = armed ? ui.alert({ icon: armed.icon, title: `Se le envía ${armed.noun} a ${c.name.split(' ')[0]} por ${channels[c.channel].name}.`, action: `<span class="cx-hstack" style="gap:6px">${ui.button({ label: 'Cancelar', variant: 'ghost', size: 'xs', attrs: 'data-mx-q-no' })}${ui.button({ label: 'Enviar', variant: 'default', size: 'xs', attrs: 'data-mx-q-yes' })}</span>`, attrs: 'data-mx-confirm' })
          : `<div class="cx-mx-qrow cx-noscrollbar" role="group" aria-label="Acciones rápidas">${quick.map((x) => ui.button({ label: `${ui.icon(x.icon)}${x.label}`, size: 'xs', attrs: `data-mx-q="${x.id}"` })).join('')}</div>`;
      });
    };
    const paintThread = () => {
      const c = conv(), th = $('.cx-mx-thread', root);
      if (!c) { th.innerHTML = `<div class="cn-empty cx-mx-empty" style="flex:1"><div class="cn-empty-header"><div class="cn-empty-media cn-empty-media-icon">${ui.icon('i-inbox')}</div><div class="cn-empty-title">Elige una conversación</div></div></div>`; return; }
      armed = null;
      const resolved = c.state === 'resolved';
      th.innerHTML = `<header class="cx-mx-th">${ui.button({ icon: 'left', variant: 'ghost', size: 'icon-sm', cls: 'cx-mx-back', attrs: 'data-mx-back aria-label="Volver a la bandeja"' })}<span class="cx-mx-av">${ui.avatar(c.name)}${chMark(c)}</span><div class="cx-vstack cx-mx-thwho"><span class="cx-hstack" style="gap:8px;flex-wrap:nowrap;min-width:0"><span class="cx-ellipsis cx-mx-thname">${ui.text(c.name, 'heading')}</span>${stateBadge(c)}</span>${ui.text(`${channels[c.channel].name}${c.handle ? ` · ${c.handle}` : ''}`, 'caption')}</div><span class="cx-grow"></span>${ui.button({ label: `${ui.icon('check')}<span class="cx-mx-hide-sm">${resolved ? 'Resuelta' : 'Marcar resuelta'}</span>`, size: 'sm', attrs: `data-mx-resolve aria-pressed="${resolved}" aria-label="${resolved ? 'Resuelta, reabrir' : 'Marcar resuelta'}"` })}${ui.button({ icon: 'i-panel', variant: 'ghost', size: 'icon-sm', cls: 'cx-mx-ctxbtn', attrs: 'data-mx-profile aria-label="Ver cliente" title="Ver cliente"' })}${ui.button({ icon: 'more', variant: 'ghost', size: 'icon-sm', attrs: 'data-mx-more aria-label="Opciones" title="Opciones"' })}</header>`
        + `<div class="cx-mx-control"></div>`
        + `<div class="cx-chat cx-scroll" role="log" aria-live="polite">${c.window ? `<div class="cx-chat-sys" role="note">${ui.icon('clock')}${ui.text(c.window, 'caption')}</div>` : ''}${c.messages.map(msgHtml).join('')}</div>`
        + `<div class="cx-mx-compose"><div class="cx-mx-quick"></div>${kit.composer({ placeholder: 'Escribe un mensaje…', templates, hint })}</div>`;
      paintControl(); paintQuick();
      wireComposer($('.cx-mx-compose', root), send, templates);
      kit.actionMenu($('[data-mx-more]', root), { items: () => [{ id: 'archive', label: c.archived ? 'Sacar del archivo' : 'Archivar', icon: c.archived ? 'i-inbox' : 'i-archive' }, { id: 'delete', label: 'Eliminar', icon: 'trash', danger: true }], onPick: act });
      const ch = $('.cx-chat', root); ch.scrollTop = ch.scrollHeight;
    };

    // ── person ──
    const profileHtml = (c) => {
      const p = profile(c) || {};
      return `<div class="cx-mx-who"><span class="cx-mx-av">${ui.avatar(c.name, { size: 'lg' })}${chMark(c)}</span>${ui.text(c.name, 'heading')}${ui.text(c.handle || channels[c.channel].name, 'caption')}</div>`
        + (p.stats ? `<div class="cx-mx-stats">${p.stats.map(([v, l]) => `<div>${ui.text(v, 'strong')}${ui.text(l, 'caption')}</div>`).join('')}</div>` : '')
        + (p.now?.length ? `<section class="cx-mx-sec">${ui.text('Ahora', 'label')}<div class="cn-item-group">${p.now.map((n) => `<button type="button" class="cn-item cn-item-variant-outline cn-item-size-sm cx-mx-now" data-mx-go="${n.go || ''}">${ui.itemMedia(ui.icon(n.icon), 'icon')}<div class="cn-item-content"><div class="cn-item-title">${n.title}</div><p class="cn-item-description">${n.description}</p></div><div class="cn-item-actions">${ui.icon('right')}</div></button>`).join('')}</div></section>` : '')
        + (p.rows?.length ? `<section class="cx-mx-sec">${ui.text('Cliente', 'label')}<dl class="cx-mx-dl">${p.rows.map(([l, v]) => `<div><dt>${ui.text(l, 'muted')}</dt><dd>${ui.text(v)}</dd></div>`).join('')}</dl></section>` : '')
        + `<div class="cx-mx-acts">${ui.button({ label: `${ui.icon(c.archived ? 'i-inbox' : 'i-archive')}${c.archived ? 'Sacar del archivo' : 'Archivar'}`, variant: 'ghost', size: 'sm', attrs: 'data-mx-act="archive"' })}${ui.button({ label: `${ui.icon('trash')}Eliminar`, variant: 'ghost', size: 'sm', cls: 'cx-mx-danger', attrs: 'data-mx-act="delete"' })}</div>`;
    };
    const paintCtx = () => { const c = conv(); $('.cx-mx-ctx', root).innerHTML = c ? profileHtml(c) : ''; };
    CONTENT.mxProfile = () => { $('#mdl-title').textContent = 'Cliente'; $('#mdl-desc').textContent = conv().name; body.innerHTML = `<div class="cx-mx-ctx cx-mx-ctx-sheet">${profileHtml(conv())}</div>`; foot.innerHTML = ui.button({ label: 'Cerrar', size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }); };
    CONTENT.mxDelete = () => { $('#mdl-title').textContent = '¿Eliminar la conversación?'; $('#mdl-desc').textContent = `Se borra el chat con ${conv().name} de tu bandeja. Sus citas y pedidos siguen igual.`; body.innerHTML = ''; foot.innerHTML = ui.button({ label: 'Cancelar', size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }) + ui.button({ label: 'Eliminar', variant: 'destructive', size: 'default', attrs: 'data-mx-del-go', cls: 'cx-go' }); };
    CONTENT.mxConnect = () => { $('#mdl-title').textContent = 'Conectar un canal'; $('#mdl-desc').textContent = 'Los mensajes de cada canal llegan a esta misma bandeja.'; body.innerHTML = `<div class="cn-item-group">${Object.entries(channels).map(([k, ch]) => ui.item({ media: `<div class="cn-item-media"><span class="cx-ch cx-ch-lg" style="--brand:${ch.color}">${ui.icon(ch.icon)}</span></div>`, title: ch.name, description: ch.description || '', actions: ch.connected ? ui.badge('Conectado', { tone: 'ok' }) : ui.button({ label: 'Conectar', size: 'xs', attrs: `data-mx-conn="${k}"` }) })).join(ui.itemSeparator())}</div>`; foot.innerHTML = ui.button({ label: 'Listo', size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }); };

    // ── behaviour ──
    const openConv = (id) => { cur = id; const c = conv(); if (c) c.unread = 0; root.dataset.view = 'thread'; paintList(); paintThread(); paintCtx(); };
    const act = (what) => {
      const c = conv(); if (!c) return;
      if (what === 'archive') { c.archived = !c.archived; island('done', c.archived ? 'Conversación archivada' : 'De vuelta en la bandeja', 2000); const next = visible()[0]; cur = next?.id; root.dataset.view = 'list'; paintList(); paintThread(); paintCtx(); }
      if (what === 'delete') openModal('mxDelete', 'auto');
    };
    const pushMsg = (m) => { const ch = $('.cx-chat', root); ch.insertAdjacentHTML('beforeend', msgHtml(m)); animIn(ch.lastElementChild); ch.scrollTop = ch.scrollHeight; };
    const send = (text, extra = {}) => {
      const c = conv(), id = 'm' + Date.now(), time = clock();
      const m = { id, out: true, text, time, status: 'sending', tag: 'Tú', ...extra }; c.messages.push(m); c.last = text || 'Foto'; c.lastBy = 'Tú'; c.time = time;
      if (c.control === 'bot' || c.control === 'need') { c.control = 'me'; if (c.state === 'attention') c.state = ''; paintControl(); syncHead(); }
      pushMsg(m);
      const st = (s) => { m.status = s; const t = $(`[data-mid="${id}"] .cx-tick`, root); if (t) { t.dataset.status = s; t.innerHTML = `<use href="#${TICK[s]}"/>`; } };
      setTimeout(() => st('sent'), 500); setTimeout(() => st('delivered'), 1100); setTimeout(() => st('read'), 1800);
      paintList();
      const r = text ? reply(c, text) : null;
      if (r) { setTimeout(() => { if (conv() === c) { $('.cx-chat', root).insertAdjacentHTML('beforeend', typing()); $('.cx-chat', root).scrollTop = 1e6; } }, 2000); setTimeout(() => { $('[data-typing]', root)?.remove(); const rm = { text: r, time: clock() }; c.messages.push(rm); c.last = r; c.lastBy = ''; if (conv() === c) pushMsg(rm); paintList(); }, 3400); }
    };

    root.classList.add('cx-mx');
    root.innerHTML = `<aside class="cx-mx-list"><header class="cx-mx-lh">${ui.text(title, 'heading')}<span class="cx-grow"></span>${ui.button({ label: `${ui.icon('plus')}Conectar`, size: 'sm', attrs: 'data-mx-connect' })}</header><div class="cx-mx-tools"><div data-slot="input-group" role="group" class="cn-input-group group/input-group"><div data-slot="input-group-addon" data-align="inline-start" class="cn-input-group-addon cn-input-group-addon-align-inline-start">${ui.icon('search')}</div><input data-slot="input-group-control" class="cn-input cn-input-group-input" placeholder="Buscar conversación" aria-label="Buscar conversación" data-mx-q></div><div class="cx-mx-chips cx-noscrollbar" role="group" aria-label="Filtrar"></div></div><div class="cx-mx-items cx-scroll" role="list"></div><footer class="cx-mx-lf"><span class="cx-mx-count cx-text" data-variant="caption"></span>${ui.button({ label: '', variant: 'ghost', size: 'xs', attrs: 'data-mx-arch' })}</footer></aside><section class="cx-mx-thread" aria-label="Conversación"></section><aside class="cx-mx-ctx" aria-label="Cliente"></aside>`;
    root.dataset.view = 'list';

    root.addEventListener('input', (e) => { if (e.target.matches('[data-mx-q]')) { q = e.target.value; paintList(); } });
    root.addEventListener('click', (e) => {
      const t = (s) => e.target.closest(s);
      if (t('[data-conv]')) return openConv(t('[data-conv]').dataset.conv);
      if (t('[data-mx-f]')) { filter = t('[data-mx-f]').dataset.mxF; return paintList(); }
      if (t('[data-mx-arch]')) { archived = !archived; filter = filters[0].id; cur = visible()[0]?.id; root.dataset.view = 'list'; paintList(); paintThread(); paintCtx(); return; }
      if (t('[data-mx-back]')) { root.dataset.view = 'list'; return; }
      if (t('[data-mx-connect]')) return openModal('mxConnect', 'auto');
      if (t('[data-mx-profile]')) return openModal('mxProfile', 'auto');
      if (t('[data-mx-act]')) return act(t('[data-mx-act]').dataset.mxAct);
      if (t('[data-mx-resolve]')) { const c = conv(); c.state = c.state === 'resolved' ? '' : 'resolved'; if (c.state === 'resolved') island('done', 'Conversación resuelta', 1800); paintList(); const b = t('[data-mx-resolve]'), on = c.state === 'resolved'; b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Resuelta, reabrir' : 'Marcar resuelta'); $('.cx-mx-hide-sm', b).textContent = on ? 'Resuelta' : 'Marcar resuelta'; syncHead(); return; }
      if (t('[data-mx-ctl]')) { const c = conv(); c.control = t('[data-mx-ctl]').dataset.mxCtl; if (c.state === 'attention' && c.control === 'me') c.state = ''; paintControl(); syncHead(); paintList(); return; }
      if (t('[data-mx-q]')) { armed = quick.find((x) => x.id === t('[data-mx-q]').dataset.mxQ); paintQuick(); $('[data-mx-q-yes]', root)?.focus(); return; }
      if (t('[data-mx-q-no]')) { armed = null; paintQuick(); return; }
      if (t('[data-mx-q-yes]')) { const x = armed; armed = null; paintQuick(); send(null, { card: x.card ? x.card(conv()) : `${ui.text(x.label, 'label')}` }); conv().last = x.label; paintList(); return; }
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-mx-del-go]')) { const i = conversations.findIndex((c) => c.id === cur); conversations.splice(i, 1); closeModal(); island('done', 'Conversación eliminada', 2000); cur = visible()[0]?.id; root.dataset.view = 'list'; paintList(); paintThread(); paintCtx(); }
      const cn = e.target.closest('[data-mx-conn]'); if (cn) { channels[cn.dataset.mxConn].connected = true; cn.outerHTML = ui.badge('Conectado', { tone: 'ok' }); island('done', `${channels[cn.dataset.mxConn].name} conectado`, 2000); }
    });
    // layout by the component's own width, not the window's: wide = 3 panes, mid = person in a sheet, narrow = one pane
    kit.watchWidth(root, [[720, 'narrow'], [1060, 'mid']], 'wide');
    if (conv()) conv().unread = 0; // the chat open on arrival is being read
    paintList(); paintThread(); paintCtx();
  };

  // ═════ Skeletons: the shape of the content, never a generic spinner ═════
  // Built from the SAME atoms as the real thing (Item, Card, bubbles…) with Skeleton shapes in place of text, so the
  // swap to content changes nothing but pixels. Shown only while there is NOTHING to show: a refresh keeps the content.
  ui.skeleton = ({ w = '100%', h = 12, shape = '' } = {}) => `<span data-slot="skeleton" class="cn-skeleton cx-sk" ${shape ? `data-shape="${shape}"` : ''} style="width:${typeof w === 'number' ? w + 'px' : w};height:${h}px" aria-hidden="true"></span>`;
  const skw = (i, list = [72, 54, 81, 46, 63, 50, 68]) => list[i % list.length] + '%';
  const sk = {
    line: (w = '100%', h = 12) => ui.skeleton({ w, h }),
    // an Item: avatar|icon|none media, a title line and a description line, an optional aside
    item: ({ media = 'avatar', title = '60%', description = '85%', aside = 0, size = 'sm' } = {}) =>
      ui.item({ size, media: media === 'none' ? '' : `<div class="cn-item-media">${ui.skeleton({ w: media === 'avatar' ? 32 : 32, h: 32, shape: media === 'avatar' ? 'circle' : '' })}</div>`, title: ui.skeleton({ w: title, h: 12 }), description: description ? ui.skeleton({ w: description, h: 10 }) : '', actions: aside ? ui.skeleton({ w: aside, h: 10 }) : '' }),
    list: (n = 4, opts = {}) => Array.from({ length: n }, (_, i) => sk.item({ ...opts, title: skw(i, [58, 44, 66, 50]), description: opts.description === '' ? '' : skw(i + 2, [80, 62, 74, 56]) })).join(ui.itemSeparator()),
    stat: () => `<div data-slot="card" data-size="sm" class="cn-card cx-stat"><div class="cx-vstack" style="gap:10px;padding:14px 14px 12px">${ui.skeleton({ w: '45%', h: 12 })}${ui.skeleton({ w: '60%', h: 26 })}${ui.skeleton({ w: '80%', h: 10 })}${ui.skeleton({ h: 36 })}</div></div>`,
    card: ({ media = 0, lines = 2 } = {}) => `<div data-slot="card" data-size="sm" class="cn-card cx-sk-card">${media ? `<span class="cx-sk-media">${ui.skeleton({ h: media })}</span>` : ''}<div class="cx-vstack" style="gap:8px;padding:12px">${Array.from({ length: lines }, (_, i) => ui.skeleton({ w: i ? '45%' : '80%', h: i ? 10 : 12 })).join('')}</div></div>`,
    bubbles: (n = 6) => `<div class="cx-chat" aria-hidden="true">${Array.from({ length: n }, (_, i) => { const out = [false, true, true, false, false, true, false][i % 7]; return `<div class="cx-chat-msg" data-who="${out ? 'out' : 'in'}" style="width:${[52, 40, 62, 34, 58, 46, 40][i % 7]}%">${ui.skeleton({ h: 36, shape: 'bubble' })}</div>`; }).join('')}</div>`,
    // whole components, from the same layout classes they use when loaded
    messaging: () => `<aside class="cx-mx-list"><header class="cx-mx-lh">${ui.skeleton({ w: 90, h: 14 })}<span class="cx-grow"></span>${ui.skeleton({ w: 92, h: 32 })}</header><div class="cx-mx-tools">${ui.skeleton({ h: 32 })}<div class="cx-mx-chips cx-noscrollbar">${[58, 74, 66, 56, 78].map((w) => ui.skeleton({ w, h: 24, shape: 'pill' })).join('')}</div></div><div class="cx-mx-items">${Array.from({ length: 6 }, (_, i) => `<div class="cn-item cn-item-variant-default cn-item-size-sm cx-mx-row">${`<div class="cn-item-media">${ui.skeleton({ w: 32, h: 32, shape: 'circle' })}</div>`}<div class="cn-item-content" style="gap:8px">${ui.skeleton({ w: skw(i, [55, 42, 64, 48, 60, 38]), h: 12 })}${ui.skeleton({ w: skw(i + 1, [85, 70, 78, 62]), h: 10 })}</div><div class="cn-item-actions cx-mx-end">${ui.skeleton({ w: 30, h: 10 })}</div></div>`).join('')}</div></aside><section class="cx-mx-thread"><header class="cx-mx-th">${ui.skeleton({ w: 32, h: 32, shape: 'circle' })}<div class="cx-vstack" style="gap:6px;flex:1">${ui.skeleton({ w: 140, h: 12 })}${ui.skeleton({ w: 100, h: 10 })}</div>${ui.skeleton({ w: 132, h: 32 })}</header><div class="cx-mx-control" style="padding:14px 16px;border-bottom:1px solid var(--border)">${ui.skeleton({ w: '60%', h: 12 })}</div>${sk.bubbles(7)}<div class="cx-mx-compose"><div class="cx-mx-qrow cx-noscrollbar">${[96, 112, 104, 118].map((w) => ui.skeleton({ w, h: 24 })).join('')}</div><div class="cx-composer">${ui.skeleton({ h: 84 })}</div></div></section><aside class="cx-mx-ctx"><div class="cx-mx-who">${ui.skeleton({ w: 48, h: 48, shape: 'circle' })}${ui.skeleton({ w: 120, h: 12 })}${ui.skeleton({ w: 90, h: 10 })}</div>${ui.skeleton({ h: 58 })}<div class="cx-mx-sec">${ui.skeleton({ w: 50, h: 10 })}${ui.skeleton({ h: 62 })}</div><div class="cx-mx-sec">${[0, 1, 2].map(() => `<div class="cx-hstack" style="justify-content:space-between">${ui.skeleton({ w: 90, h: 10 })}${ui.skeleton({ w: 70, h: 10 })}</div>`).join('')}</div></aside>`,
    agenda: ({ columns = 3, hours = 10 } = {}) => `<div class="cx-sk-ag"><div class="cx-hstack" style="gap:8px">${ui.skeleton({ w: 52, h: 28 })}${ui.skeleton({ w: 60, h: 28 })}${ui.skeleton({ w: 180, h: 16 })}<span class="cx-grow"></span>${ui.skeleton({ w: 120, h: 28 })}${ui.skeleton({ w: 110, h: 28 })}</div><div class="cx-sk-strip">${Array.from({ length: 7 }, () => ui.skeleton({ h: 52 })).join('')}</div><div class="cx-sk-grid" style="--cols:${columns}"><div class="cx-sk-hours">${Array.from({ length: hours }, () => ui.skeleton({ w: 34, h: 10 })).join('')}</div>${Array.from({ length: columns }, (_, c) => `<div class="cx-sk-col">${[[0, 1], [2, 1.5], [5, 1], [7, 2]].filter((_, i) => (i + c) % 3 !== 2).map(([top, len]) => `<span class="cx-sk-ev" style="top:${top * 48 + 4}px;height:${len * 48 - 8}px">${ui.skeleton({ h: len * 48 - 8 })}</span>`).join('')}</div>`).join('')}</div></div>`,
    table: (rows = 5, cols = [30, 22, 18, 14]) => `<div class="cx-sk-table">${Array.from({ length: rows }, () => `<div class="cx-sk-tr">${cols.map((w, i) => ui.skeleton({ w: `${w + ((i * 7) % 10)}%`, h: 10 })).join('')}</div>`).join('')}</div>`,
    products: (n = 4) => `<div class="cx-sk-products">${Array.from({ length: n }, () => sk.card({ media: 140, lines: 2 })).join('')}</div>`,
  };
  kit.sk = sk;

  // kit.load(root, { skeleton, load, render }): skeleton while there is nothing, then a crossfade to the content.
  // A later reload passes { keep: true }: the content stays and only `busy` marks it (no skeleton flash on refresh).
  kit.load = async (root, { skeleton, load, render, keep = false }) => {
    const hasContent = root.dataset.loaded === 'true';
    root.setAttribute('aria-busy', 'true');
    if (!hasContent || !keep) { root.innerHTML = `<span class="cx-sr">Cargando…</span>${skeleton}`; root.dataset.loaded = 'false'; }
    const data = await load();
    easeHeight(root, () => { root.innerHTML = ''; render(data); root.dataset.loaded = 'true'; });
    root.removeAttribute('aria-busy');
    root.animate([{ opacity: 0.001 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // layout by the component's own width, not the window's: [[maxWidth, name]…], fallback
  kit.watchWidth = (root, steps, wide) => {
    if (root._ww) return;
    const pick = (w) => { root.dataset.layout = (steps.find(([max]) => w < max) || [0, wide])[1]; };
    pick(root.getBoundingClientRect().width || root.parentElement?.getBoundingClientRect().width || 0);   // now, before the first paint: a layout that arrives a frame late makes the whole component jump
    root._ww = new ResizeObserver(([en]) => pick(en.contentRect.width)); root._ww.observe(root);
  };

  // ── Chatbot: { name, avatar, greeting, suggestions, respond(text) → {text, actions} } ──
  kit.chatbot = (root, { name, greeting, suggestions, respond }) => {
    root.innerHTML = `<header class="cx-ib-th"><span class="cx-bot-face" aria-hidden="true"><i></i><i></i></span><div class="cx-vstack" style="gap:0">${ui.text(name, 'heading')}${ui.text('Asistente · responde al instante', 'caption')}</div></header><div class="cx-chat cx-scroll" role="log" aria-live="polite"></div><div class="cx-hstack cx-bot-sugs" role="group" aria-label="Sugerencias">${suggestions.map((s) => ui.button({ label: s, size: 'sm', attrs: `data-sug="${s}"` })).join('')}</div>${kit.composer({ placeholder: `Pregúntale a ${name}`, attach: false, emoji: false })}`;
    const ch = $('.cx-chat', root);
    const add = (html) => { ch.insertAdjacentHTML('beforeend', html); const el = ch.lastElementChild; el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.22,1,.36,1)' }); ch.scrollTop = ch.scrollHeight; return el; };
    let stop = null;
    const ask = (text) => {
      if (stop) return; add(kit.bubble({ out: true, text }));
      $('.cx-bot-sugs', root).hidden = true;
      const thinking = add(`<div class="cx-chat-msg" data-who="in"><div class="cx-chat-bubble cx-typing" aria-label="Pensando"><i></i><i></i><i></i></div></div>`);
      const send = $('[data-send]', root); send.innerHTML = ui.icon('pause'); send.disabled = false; send.setAttribute('aria-label', 'Detener'); send.dataset.stop = '';
      setTimeout(() => {
        const ans = respond(text); thinking.remove();
        const el = add(kit.bubble({ text: '' })); const p = $('p', el); let i = 0, cancelled = false;
        const done = () => { stop = null; send.innerHTML = ui.icon('i-send'); send.setAttribute('aria-label', 'Enviar'); delete send.dataset.stop; send.disabled = !$('textarea', root).value.trim(); el.insertAdjacentHTML('beforeend', `<div class="cx-chat-actions">${cancelled ? ui.text('Detenido', 'caption') : ''}${!cancelled && ans.actions ? ans.actions : ''}${ui.button({ icon: 'i-copy', variant: 'ghost', size: 'icon-xs', attrs: 'data-bot-copy aria-label="Copiar respuesta" title="Copiar"' })}${ui.button({ label: '👍', variant: 'ghost', size: 'icon-xs', attrs: 'data-rate="up" aria-label="Me sirvió" aria-pressed="false"' })}${ui.button({ label: '👎', variant: 'ghost', size: 'icon-xs', attrs: 'data-rate="down" aria-label="No me sirvió" aria-pressed="false"' })}</div>`); ch.scrollTop = ch.scrollHeight; };
        const tick = setInterval(() => { i += 2; p.textContent = ans.text.slice(0, i); ch.scrollTop = ch.scrollHeight; if (i >= ans.text.length) { clearInterval(tick); done(); } }, 18);
        stop = () => { clearInterval(tick); cancelled = true; done(); };
      }, 700);
    };
    wireComposer(root, (t) => ask(t));
    root.addEventListener('click', (e) => {
      const s = e.target.closest('[data-sug]'); if (s) return ask(s.dataset.sug);
      const st = e.target.closest('[data-stop]'); if (st && stop) { e.preventDefault(); stop(); return; }
      const r = e.target.closest('[data-rate]'); if (r) { $$('[data-rate]', r.parentElement).forEach((x) => x.setAttribute('aria-pressed', x === r)); return; }
      const c = e.target.closest('[data-bot-copy]'); if (c) { try { navigator.clipboard.writeText($('p', c.closest('.cx-chat-msg')).textContent); } catch {} c.innerHTML = ui.icon('check'); }
    }, true);
    add(kit.bubble({ text: greeting }));
  };

  // ── Stat card { label, value, delta (number, %), series [] } ──
  const spark = (series, tone) => { const max = Math.max(...series), min = Math.min(...series), w = 100, h = 28; const pts = series.map((v, i) => `${(i / (series.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' '); return `<svg class="cx-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--${tone})" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/></svg>`; };
  // goodWhen: 'up' (sales) or 'down' (costs, wait time…) decides green/red; icon optional; compare = the period it is measured against
  kit.stat = ({ label, value, delta, series, compare = '', icon = '', goodWhen = 'up' }) => { const up = delta >= 0, good = goodWhen === 'up' ? up : !up; return `<div data-slot="card" data-size="sm" class="cn-card cx-stat"><div class="cx-vstack" style="gap:6px;padding:14px 14px 12px"><div class="cx-hstack" style="justify-content:space-between;flex-wrap:nowrap">${ui.text(label, 'muted')}${icon ? `<span class="cx-stat-ic">${ui.icon(icon)}</span>` : ''}</div>${ui.text(value, 'title', 'b')}<div class="cx-hstack" style="justify-content:space-between;flex-wrap:nowrap">${ui.badge(`${up ? '▲' : '▼'} ${Math.abs(delta)} %`, { tone: good ? 'ok' : 'bad' })}${ui.text(compare, 'caption')}</div>${series ? spark(series, good ? 'success' : 'destructive') : ''}</div></div>`; };

  // ── Bar chart { title, data [[label, value]], fmt } ──
  kit.barChart = (root, { title, data, fmt = (v) => v, periods }) => {
    const paint = (rows) => {
      const max = Math.max(...rows.map(([, v]) => v)) * 1.1, W = 100, H = 160, bw = W / rows.length;
      const ticks = [0, .5, 1].map((t) => max * t);
      root.innerHTML = `<div data-slot="card" data-size="sm" class="cn-card cx-chart"><div class="cx-hstack" style="justify-content:space-between;padding:14px 14px 0">${ui.text(title, 'heading')}${periods ? `<div class="cx-tabs" data-tabs role="tablist" aria-label="Periodo">${periods.map((p, i) => `<button class="cn-button cn-button-variant-ghost cn-button-size-sm cx-tab" role="tab" ${i === 0 ? 'aria-selected="true"' : ''}>${p[0]}</button>`).join('')}</div>` : ''}</div>
        <div class="cx-chart-body"><div class="cx-chart-y">${ticks.slice().reverse().map((t) => ui.text(fmt(Math.round(t)), 'caption')).join('')}</div><div class="cx-chart-plot"><div class="cx-chart-grid">${ticks.map(() => '<i></i>').join('')}</div><div class="cx-chart-bars" style="--n:${rows.length}">${rows.map(([l, v]) => `<button class="cx-chart-bar" style="--v:${(v / max) * 100}%" data-tip-v="${l}: ${fmt(v)}" aria-label="${l}: ${fmt(v)}"><i></i></button>`).join('')}</div><div class="cx-chart-x" style="--n:${rows.length}">${rows.map(([l], i) => `<span>${i % Math.ceil(rows.length / 7) === 0 ? ui.text(l, 'caption') : ''}</span>`).join('')}</div></div></div></div>`;
      if (periods) { const tl = $('.cx-tabs', root); initTabs(tl); tl.addEventListener('pick', (e) => { const d = periods[e.detail][1]; paint(d); const t2 = $$('.cx-tab', root); t2.forEach((x, i) => x.setAttribute('aria-selected', i === e.detail)); }); }
      $$('.cx-chart-bar', root).forEach((b, i) => b.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 420, delay: i * 18, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    };
    root.addEventListener('pointerover', (e) => { const b = e.target.closest('.cx-chart-bar'); if (b) { tip.textContent = b.dataset.tipV; tip.hidden = false; const r = b.getBoundingClientRect(); tip.style.left = (r.left + r.width / 2 - tip.offsetWidth / 2) + 'px'; tip.style.top = (r.top + (1 - parseFloat(getComputedStyle(b).getPropertyValue('--v')) / 100) * r.height - tip.offsetHeight - 6) + 'px'; requestAnimationFrame(() => tip.dataset.state = 'open'); } });
    root.addEventListener('pointerout', (e) => { if (e.target.closest('.cx-chart-bar')) { tip.dataset.state = 'closed'; tip.hidden = true; } });
    root.addEventListener('focusin', (e) => e.target.closest('.cx-chart-bar')?.dispatchEvent(new PointerEvent('pointerover', { bubbles: true })));
    paint(data);
  };

  // ── Checklist { title, steps [{title, desc, done, action}] } ──
  kit.checklist = (root, { title, steps }) => {
    const paint = () => { const n = steps.filter((s) => s.done).length; root.innerHTML = `<div data-slot="card" data-size="sm" class="cn-card"><div class="cx-vstack" style="gap:8px;padding:14px 14px 4px">${ui.text(title, 'heading')}<div class="cx-hstack" style="flex-wrap:nowrap;gap:10px">${ui.progress((n / steps.length) * 100, `${n} de ${steps.length} pasos`)}${ui.text(`${n}/${steps.length}`, 'caption')}</div></div><div class="cn-card-content" style="padding:0 12px 8px"><div class="cn-item-group">${steps.map((s, i) => ui.item({ media: `<div class="cn-item-media"><span class="cx-check-dot" ${s.done ? 'data-done' : ''}>${s.done ? ui.icon('i-tick') : i + 1}</span></div>`, title: s.title, description: s.desc, actions: s.done ? '' : ui.button({ label: s.action, size: 'xs', attrs: `data-step="${i}"` }) })).join(ui.itemSeparator())}</div></div></div>`; };
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (!b) return; steps[+b.dataset.step].done = true; easeHeight(root, paint); });
    paint();
  };

  // ── Dirty bar: watch a form; show «unsaved changes» while it differs from its saved state ──
  kit.dirtyBar = (form, { onSave }) => {
    const snap = () => JSON.stringify($$('input, select, textarea, [role=switch], .cx-time-btn, .cx-sel-btn', form).map((x) => x.getAttribute('role') === 'switch' ? x.getAttribute('aria-checked') : x.matches('button') ? x.textContent : x.value));
    let saved = snap();
    const bar = document.createElement('div'); bar.className = 'cx-dirty'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Cambios sin guardar');
    bar.innerHTML = `<div class="cx-dirty-in">${ui.text('Tienes cambios sin guardar', 'label')}<span class="cx-dirty-acts">${ui.button({ label: 'Descartar', variant: 'ghost', size: 'sm', attrs: 'data-discard' })}${ui.button({ label: 'Guardar', variant: 'default', size: 'sm', attrs: 'data-save-all', cls: 'cx-save-w' })}</span></div>`;
    form.appendChild(bar);
    const check = () => bar.toggleAttribute('data-open', snap() !== saved);
    form.addEventListener('input', check); form.addEventListener('click', () => setTimeout(check));
    bar.addEventListener('click', (e) => {
      if (e.target.closest('[data-discard]')) { form.dispatchEvent(new CustomEvent('discard', { detail: JSON.parse(saved) })); setTimeout(check, 30); }
      const s = e.target.closest('[data-save-all]'); if (s) { s.innerHTML = `<svg class="animate-spin"><use href="#loader"/></svg>Guardando…`; s.disabled = true; setTimeout(() => { onSave?.(); saved = snap(); s.innerHTML = `${ui.icon('check')}Guardado`; setTimeout(() => { check(); setTimeout(() => { s.innerHTML = 'Guardar'; s.disabled = false; }, 320); }, 900); }, 800); }
    });
    return { reset: () => { saved = snap(); check(); } };
  };
  const sw = (on, label) => `<button type="button" data-slot="switch" role="switch" aria-checked="${on}" data-state="${on ? 'checked' : 'unchecked'}" data-size="default" class="cn-switch group/switch" aria-label="${label}"><span data-slot="switch-thumb" data-state="${on ? 'checked' : 'unchecked'}" class="cn-switch-thumb"></span></button>`;

  // ── Weekly hours { days: [{name, open, ranges:[[from,to]]}] } ──
  kit.weeklyHours = (root, { days }) => {
    days = JSON.parse(JSON.stringify(days));
    const paint = () => { root.innerHTML = days.map((d, i) => `<div class="cx-wh-day" data-wd="${i}"><div class="cx-wh-name">${sw(d.open, `${d.name} abierto`)}${ui.text(d.name, 'heading')}</div><div class="cx-wh-ranges">${d.open ? d.ranges.map((r, j) => `<div class="cx-wh-range">${kit.timeButton(r[0], `data-r="${j}" data-k="0" aria-label="${d.name}, desde ${r[0]}"`)}${ui.text('a', 'caption')}${kit.timeButton(r[1], `data-r="${j}" data-k="1" aria-label="${d.name}, hasta ${r[1]}"`)}${d.ranges.length > 1 ? ui.button({ icon: 'x', variant: 'ghost', size: 'icon-sm', attrs: `data-rm="${j}" aria-label="Quitar tramo" title="Quitar tramo"` }) : ''}</div>`).join('') + `<div class="cx-hstack">${ui.button({ label: `${ui.icon('plus')}Agregar tramo`, variant: 'ghost', size: 'xs', attrs: 'data-add' })}${i === 0 ? ui.button({ label: `${ui.icon('i-copy')}Copiar a todos`, variant: 'ghost', size: 'xs', attrs: 'data-copyall' }) : ''}</div>` : ui.text('Cerrado', 'muted')}</div></div>`).join(''); };
    root.addEventListener('click', (e) => {
      const day = e.target.closest('[data-wd]'); if (!day) return; const d = days[+day.dataset.wd];
      if (e.target.closest('[role=switch]')) { d.open = !d.open; if (d.open && !d.ranges.length) d.ranges = [['09:00', '18:00']]; easeHeight(root, paint); }
      if (e.target.closest('[data-add]')) { const last = d.ranges.at(-1); d.ranges.push([last ? last[1] : '09:00', '19:00']); easeHeight(root, paint); }
      const rm = e.target.closest('[data-rm]'); if (rm) { d.ranges.splice(+rm.dataset.rm, 1); easeHeight(root, paint); }
      if (e.target.closest('[data-copyall]')) { days.forEach((x, i) => { if (i) { x.open = days[0].open; x.ranges = days[0].ranges.map((r) => [...r]); } }); easeHeight(root, paint); }
    });
    root.addEventListener('click', async (e) => { const b = e.target.closest('.cx-time-btn[data-r]'); if (!b) return; const d = days[+b.closest('[data-wd]').dataset.wd], r = d.ranges[+b.dataset.r], k = +b.dataset.k; const v = await kit.pickTime({ value: r[k], label: `${d.name}, ${k ? 'hasta' : 'desde'}`, step: 15 }); if (v) { r[k] = v; b.querySelector('span').textContent = v; root.dispatchEvent(new Event('input', { bubbles: true })); } });
    paint();
    return { value: () => JSON.parse(JSON.stringify(days)), set: (v) => { days = JSON.parse(JSON.stringify(v)); easeHeight(root, paint); } };
  };

  // ── Plan cards { cycle: ['month','year'], plans [{id,name,price:{month,year},desc,features,current}] } ──
  kit.plans = (root, { plans, yearlyNote = '' }) => {
    let cycle = 'month', chosen = plans.find((p) => p.current).id;
    const paint = () => { root.innerHTML = `<div class="cx-vstack" style="gap:16px;align-items:center"><div class="cx-tabs" data-tabs role="tablist" aria-label="Facturación"><button class="cn-button cn-button-variant-ghost cn-button-size-sm cx-tab" role="tab" ${cycle === 'month' ? 'aria-selected="true"' : ''} data-cycle="month">Mensual</button><button class="cn-button cn-button-variant-ghost cn-button-size-sm cx-tab" role="tab" ${cycle === 'year' ? 'aria-selected="true"' : ''} data-cycle="year">Anual ${ui.badge(yearlyNote, { variant: 'secondary' })}</button></div><div class="cx-plans" role="radiogroup" aria-label="Planes">${plans.map((p) => `<div data-slot="card" class="cn-card cx-plan" role="radio" aria-checked="${p.id === chosen}" tabindex="${p.id === chosen ? 0 : -1}" data-plan="${p.id}"><div class="cx-vstack" style="gap:6px;padding:16px 16px 0"><div class="cx-hstack" style="justify-content:space-between">${ui.text(p.name, 'heading')}${p.current ? ui.badge('Tu plan', { tone: 'ok' }) : ''}</div><div class="cx-plan-price">${ui.text(money0(p.price[cycle]), 'title', 'b')}${ui.text(cycle === 'month' ? '/ mes' : '/ año', 'muted')}</div>${ui.text(p.desc, 'muted', 'p')}</div><ul class="cx-plan-feats">${p.features.map((f) => `<li>${ui.icon('check')}${ui.text(f)}</li>`).join('')}</ul><div style="padding:0 16px 16px;margin-top:auto">${ui.button({ label: p.current ? 'Tu plan actual' : (plans.indexOf(p) > plans.findIndex((x) => x.current) ? `Pasar a ${p.name}` : `Bajar a ${p.name}`), variant: p.current ? 'outline' : 'default', size: 'default', cls: 'cx-fill', attrs: p.current ? 'disabled' : '' })}</div></div>`).join('')}</div></div>`; const tl = $('.cx-tabs', root); initTabs(tl); };
    root.addEventListener('click', (e) => { const c = e.target.closest('[data-cycle]'); if (c && c.dataset.cycle !== cycle) { cycle = c.dataset.cycle; setTimeout(paint, 220); return; } const p = e.target.closest('[data-plan]'); if (p && !e.target.closest('button')) { chosen = p.dataset.plan; $$('[data-plan]', root).forEach((x) => { const on = x === p; x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; }); } });
    paint();
  };

  // ── Card field (number with brand, expiry, CVC) ──
  kit.cardField = (root, { onSubmit }) => {
    const BRANDS = [[/^4/, 'Visa'], [/^(5[1-5]|2[2-7])/, 'Mastercard'], [/^3[47]/, 'Amex']];
    const luhn = (n) => { let s = 0; [...n].reverse().forEach((c, i) => { let d = +c; if (i % 2) { d *= 2; if (d > 9) d -= 9; } s += d; }); return n.length >= 13 && s % 10 === 0; };
    root.innerHTML = `${ui.field({ id: 'cc-n', label: 'Número de la tarjeta', control: `<div data-slot="input-group" class="cn-input-group">${'<div class="cn-input-group-addon cn-input-group-addon-align-inline-start">' + ui.icon('card') + '</div>'}<input class="cn-input cn-input-group-input cx-num" id="cc-n" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234"><div class="cn-input-group-addon cn-input-group-addon-align-inline-end"><span class="cx-cc-brand" id="cc-b"></span></div></div>` })}<div class="cx-frange">${ui.field({ id: 'cc-e', label: 'Vence', control: ui.input({ id: 'cc-e', placeholder: 'MM/AA', attrs: 'inputmode="numeric" autocomplete="cc-exp" class="cn-input cx-num"' }) })}${ui.field({ id: 'cc-c', label: 'Código', control: ui.input({ id: 'cc-c', placeholder: '123', attrs: 'inputmode="numeric" autocomplete="cc-csc" maxlength="4"' }) })}</div><p class="cn-field-description cx-msg" id="cc-msg">${ui.icon('i-lock')} Pago seguro con Stripe. No guardamos el número.</p>${ui.button({ label: 'Guardar tarjeta', variant: 'default', size: 'default', cls: 'cx-fill', attrs: 'data-cc-save' })}`;
    const n = $('#cc-n', root), ex = $('#cc-e', root), cvc = $('#cc-c', root), msg = $('#cc-msg', root), help = msg.innerHTML;
    const brand = () => BRANDS.find(([re]) => re.test(n.value.replace(/\D/g, '')))?.[1] || '';
    n.addEventListener('input', () => { reformat(n, (v) => { const d = v.replace(/\D/g, '').slice(0, brand() === 'Amex' ? 15 : 16); return brand() === 'Amex' ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' ')) : d.replace(/(\d{4})(?=\d)/g, '$1 '); }, /\d/); $('#cc-b', root).textContent = brand(); });
    ex.addEventListener('input', () => reformat(ex, (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; }, /\d/));
    cvc.addEventListener('input', () => { cvc.value = cvc.value.replace(/\D/g, ''); });
    $('[data-cc-save]', root).addEventListener('click', () => {
      const num = n.value.replace(/\D/g, ''), [mm, yy] = ex.value.split('/').map(Number), expOk = mm >= 1 && mm <= 12 && yy >= today.getFullYear() % 100;
      const err = !luhn(num) ? 'Revisa el número de la tarjeta.' : !expOk ? 'La fecha de vencimiento no es válida.' : cvc.value.length < 3 ? 'Falta el código de 3 o 4 dígitos.' : '';
      msg.closest('.cx-form')?.toggleAttribute('data-invalid', !!err); msg.innerHTML = err ? `${ui.icon('info')} ${err}` : `${ui.icon('check')} Tarjeta ${brand()} terminada en ${num.slice(-4)} guardada.`; msg.dataset.tone = err ? 'bad' : 'ok';
      if (!err) onSubmit?.(num.slice(-4));
    });
  };

  // ── Member list (any group: team, workspace, family plan…) + invite; Permission matrix (any rows × any roles) ──
  // memberList({ members:[{name,email,role,pending}], roles:[{name, description, icon}], ownerRole, invite:{ title, description, cta } })
  kit.memberList = (root, { members, roles, ownerRole, noun = ['persona', 'personas'], invite }) => {
    const paint = () => { root.innerHTML = `<div class="cx-hstack" style="justify-content:space-between">${ui.text(`${members.length} ${members.length === 1 ? noun[0] : noun[1]}`, 'heading')}${ui.button({ label: `${ui.icon('plus')}${invite.cta}`, variant: 'default', size: 'sm', attrs: 'data-invite' })}</div><div class="cn-item-group">${members.map((m, i) => ui.item({ media: ui.itemMedia(ui.avatar(m.name), 'default'), title: `${m.name}${m.pending ? ` ${ui.badge('Invitación enviada', { tone: 'wait' })}` : ''}`, description: m.email, actions: m.role === ownerRole ? ui.text(ownerRole, 'muted') : `<button type="button" class="cn-button cn-button-variant-outline cn-button-size-sm cx-sel-btn" aria-label="Rol de ${m.name}" data-mi="${i}"></button>` })).join(ui.itemSeparator())}</div>`; $$('[data-mi]', root).forEach((b) => kit.selectMenu(b, { label: `Rol de ${members[+b.dataset.mi].name}`, value: members[+b.dataset.mi].role, options: roles.filter((r) => r.name !== ownerRole).map((r) => ({ value: r.name, label: r.name, description: r.description })), onChange: (v) => { members[+b.dataset.mi].role = v; } })); };
    root.addEventListener('click', (e) => { if (e.target.closest('[data-invite]')) openModal('invite', 'auto'); });
    const choosable = roles.filter((r) => r.name !== ownerRole);
    CONTENT.invite = () => {
      $('#mdl-title').textContent = invite.title; $('#mdl-desc').textContent = invite.description;
      body.innerHTML = `${ui.field({ id: 'inv-e', label: 'Correo', control: ui.input({ id: 'inv-e', type: 'email', placeholder: 'nombre@correo.com' }) })}<div class="cx-vstack" role="radiogroup" aria-label="Rol" style="gap:8px">${ui.text('Rol', 'label')}${choosable.map((r, i) => ui.choice({ media: ui.itemMedia(ui.icon(r.icon || 'user')), title: r.name, description: r.description, checked: i === choosable.length - 1, attrs: `data-role="${r.name}"` })).join('')}</div>`;
      foot.innerHTML = ui.button({ label: 'Cancelar', size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }) + ui.button({ label: `${ui.icon('i-mail')}Enviar invitación`, variant: 'default', size: 'default', attrs: 'data-inv-send', cls: 'cx-go' });
    };
    document.addEventListener('click', (e) => {
      const ch = e.target.closest('[data-role]'); if (ch && body.contains(ch)) { $$('[data-role]', body).forEach((x) => { x.setAttribute('aria-checked', x === ch); x.tabIndex = x === ch ? 0 : -1; }); }
      if (e.target.closest('[data-inv-send]')) { const em = $('#inv-e', body).value.trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { $('#inv-e', body).setAttribute('aria-invalid', 'true'); $('#inv-e', body).focus(); return; } members.push({ name: em.split('@')[0], email: em, role: $('[data-role][aria-checked="true"]', body)?.dataset.role || choosable.at(-1).name, pending: true }); closeModal(); setTimeout(() => easeHeight(root, paint), 300); }
    });
    paint();
  };
  // permissionMatrix({ roles:[name], rows:[{name, description, allow:[bool per role]}], lockedRole, onChange })
  kit.permissionMatrix = (root, { roles, rows, lockedRole, rowLabel = 'Permiso', onChange = () => {} }) => {
    const li = roles.indexOf(lockedRole);
    root.innerHTML = `<div class="cx-dt-scroll cx-scroll" style="max-height:none"><table class="cx-dt cx-perm"><thead><tr><th>${ui.text(rowLabel, 'label')}</th>${roles.map((r) => `<th class="cx-perm-c">${ui.text(r, 'label')}</th>`).join('')}</tr></thead><tbody>${rows.map((row, pi) => `<tr><td>${ui.text(row.name, 'heading')}${row.description ? `<br>${ui.text(row.description, 'caption')}` : ''}</td>${roles.map((r, ri) => { const on = ri === li || !!row.allow[ri]; return `<td class="cx-perm-c"><button type="button" data-slot="checkbox" role="checkbox" class="cn-checkbox" aria-checked="${on}" data-state="${on ? 'checked' : 'unchecked'}" aria-label="${r}: ${row.name}" ${ri === li ? `disabled title="${lockedRole} siempre puede"` : ''} data-p="${pi}" data-r="${ri}"><span class="cn-checkbox-indicator"><svg class="cb-mark" viewBox="0 0 24 24">${CB_CHECK}</svg></span></button></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
    root.addEventListener('click', (e) => { const c2 = e.target.closest('[data-p]'); if (!c2 || c2.disabled) return; const on = c2.getAttribute('aria-checked') !== 'true'; setCheck(c2, on); rows[+c2.dataset.p].allow[+c2.dataset.r] = on; onChange(rows); });
  };

  // ── Stamp card { owner, total, stamps, reward } ──
  kit.stampCard = (root, { owner, total, stamps, reward, store }) => {
    const paint = (popIdx = -1) => { const done = stamps >= total; root.innerHTML = `<div data-slot="card" class="cn-card cx-stamps"><div class="cx-vstack" style="gap:2px;padding:16px 16px 0">${ui.text(store, 'caption')}${ui.text(`Cartilla de ${owner}`, 'heading')}</div><div class="cx-stamp-grid" role="img" aria-label="${stamps} de ${total} sellos">${Array.from({ length: total }, (_, i) => `<span class="cx-stamp" ${i < stamps ? 'data-on' : ''} ${i === total - 1 ? 'data-gift' : ''} ${i === popIdx ? 'data-pop' : ''}>${i < stamps ? ui.icon('scissors') : i === total - 1 ? ui.icon('i-gift') : ''}</span>`).join('')}</div><div class="cx-vstack" style="gap:10px;padding:0 16px 16px">${ui.text(done ? `¡Completa! Ganó ${reward}.` : `${stamps} de ${total} · faltan ${total - stamps} para ${reward}`, done ? 'label' : 'muted', 'p')}${done ? ui.button({ label: `${ui.icon('i-gift')}Canjear premio`, variant: 'default', size: 'default', cls: 'cx-fill', attrs: 'data-redeem' }) : ui.button({ label: `${ui.icon('plus')}Sellar visita`, variant: 'outline', size: 'default', cls: 'cx-fill', attrs: 'data-stamp' })}</div></div>`; };
    root.addEventListener('click', (e) => { if (e.target.closest('[data-stamp]') && stamps < total) { stamps++; paint(stamps - 1); } if (e.target.closest('[data-redeem]')) { stamps = 0; paint(); } });
    paint();
  };

  // ── Notifications bell { items [{icon,tone,title,desc,time,unread}] } ──
  kit.bell = (root, { items }) => {
    root.innerHTML = `<div class="cx-hstack" style="gap:12px">${ui.text('Avisos', 'heading')}<span class="cx-grow"></span><span class="cx-bell-wrap">${ui.button({ icon: 'i-bell', variant: 'outline', size: 'icon', cls: 'cx-has-indicator', attrs: 'data-bell aria-haspopup="dialog" aria-label="Avisos"' })}</span></div>${ui.text('La campana del sistema: toca para ver los avisos.', 'caption', 'p')}`;
    const pop = document.createElement('div'); pop.className = 'cn-popover-content pg-pop cx-bellpop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Avisos'); pop.hidden = true; lib.appendChild(pop);
    const btnEl = $('[data-bell]', root);
    const unread = () => items.filter((i) => i.unread).length;
    const syncDot = () => { $('.cx-indicator', btnEl)?.remove(); if (unread()) btnEl.insertAdjacentHTML('beforeend', `<span class="cx-indicator cx-count-ind" data-tone="bad">${unread()}</span>`); btnEl.setAttribute('aria-label', unread() ? `Avisos, ${unread()} sin leer` : 'Avisos'); };
    const paint = () => { pop.innerHTML = `<div class="cx-hstack" style="justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border)">${ui.text('Avisos', 'heading')}${unread() ? ui.button({ label: 'Marcar todo como leído', variant: 'ghost', size: 'xs', attrs: 'data-readall' }) : ''}</div>${items.length ? `<div class="cx-bell-list cx-scroll">${items.map((it, i) => `<button class="cn-item cn-item-variant-default cn-item-size-sm cx-bell-it" data-ni="${i}" ${it.unread ? 'data-unread' : ''}>${ui.itemMedia(`<span class="cx-tonal-ic" data-tone="${it.tone}">${ui.icon(it.icon)}</span>`, 'default')}<div class="cn-item-content"><div class="cn-item-title">${it.title}</div><p class="cn-item-description">${it.desc}</p></div><div class="cn-item-actions cx-vstack" style="width:auto;align-items:flex-end;gap:6px">${ui.text(it.time, 'caption')}${it.unread ? '<span class="cx-unread-dot" aria-label="Sin leer"></span>' : ''}</div></button>`).join('')}</div>` : `<div class="cn-empty" style="padding:28px 12px"><div class="cn-empty-header"><div class="cn-empty-media cn-empty-media-icon">${ui.icon('i-bell')}</div><div class="cn-empty-title">Todo al día</div></div></div>`}`; };
    btnEl.addEventListener('click', () => { if (pop.dataset.state === 'open') return hide(pop, 120); paint(); pop.hidden = false; place(pop, btnEl, 'end', 8); show(pop); });
    pop.addEventListener('click', (e) => { if (e.target.closest('[data-readall]')) { items.forEach((i) => i.unread = false); paint(); syncDot(); } const it = e.target.closest('[data-ni]'); if (it) { items[+it.dataset.ni].unread = false; paint(); syncDot(); } });
    document.addEventListener('pointerdown', (e) => { if (pop.dataset.state === 'open' && !pop.contains(e.target) && !btnEl.contains(e.target)) hide(pop, 120); });
    syncDot();
  };

  // ── Queue (waitlist) { people [{name, service, since}] } ──
  kit.queue = (root, { title, people, offerMinutes = 10 }) => {
    const paint = () => { root.innerHTML = `<div class="cx-hstack" style="justify-content:space-between">${ui.text(title, 'heading')}${ui.badge(`${people.length} esperando`, { variant: 'secondary' })}</div><div class="cn-item-group">${people.map((p, i) => ui.item({ media: `<div class="cn-item-media"><span class="cx-q-pos">${i + 1}</span></div>`, title: p.name, description: p.offer ? `Ofrecido ${p.offer} · ${p.service}` : `${p.service} · espera desde ${p.since}`, actions: p.offer ? `<span class="cx-q-timer" data-qi="${i}">${ui.text(`${String(Math.floor(p.left / 60)).padStart(2, '0')}:${String(p.left % 60).padStart(2, '0')}`, 'strong')}</span>` : ui.button({ label: 'Ofrecer horario', size: 'xs', attrs: `data-offer="${i}"` }) })).join(ui.itemSeparator())}</div>`; };
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-offer]'); if (!b) return; const p = people[+b.dataset.offer]; p.offer = 'hoy 16:30'; p.left = offerMinutes * 60; paint(); });
    setInterval(() => { let changed = false; people.forEach((p, i) => { if (p.offer && p.left > 0) { p.left--; const t = $(`[data-qi="${i}"] .cx-text`, root); if (t) t.textContent = `${String(Math.floor(p.left / 60)).padStart(2, '0')}:${String(p.left % 60).padStart(2, '0')}`; } }); }, 1000);
    paint();
  };

  // ── Password field with strength ──
  kit.password = (root, { label = 'Contraseña' } = {}) => {
    const RULES = [['8 caracteres o más', (v) => v.length >= 8], ['Un número', (v) => /\d/.test(v)], ['Una mayúscula', (v) => /[A-ZÁÉÍÓÚÑ]/.test(v)], ['Un símbolo', (v) => /[^\w\s]/.test(v)]];
    const NAMES_S = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'], TONES = ['bad', 'bad', 'wait', 'ok', 'ok'];
    root.innerHTML = `${ui.field({ id: 'pw', label, control: `<div data-slot="input-group" class="cn-input-group"><div class="cn-input-group-addon cn-input-group-addon-align-inline-start">${ui.icon('i-lock')}</div><input class="cn-input cn-input-group-input" id="pw" type="password" autocomplete="new-password" aria-describedby="pw-s"><div class="cn-input-group-addon cn-input-group-addon-align-inline-end">${ui.button({ icon: 'i-eye', variant: 'ghost', size: 'icon-xs', attrs: 'data-pw-toggle aria-label="Mostrar contraseña" title="Mostrar"' })}</div></div>` })}<div class="cx-pw-meter" id="pw-s" aria-live="polite"><div class="cx-pw-bars">${Array.from({ length: 4 }, () => ui.progress(0, 'Fuerza')).join('')}</div>${ui.badge('Escribe una contraseña', { tone: 'muted' })}</div><ul class="cx-pw-rules">${RULES.map(([t]) => `<li>${ui.icon('i-tick')}${ui.text(t, 'muted')}</li>`).join('')}</ul>`;
    const inp = $('#pw', root);
    inp.addEventListener('input', () => {
      const v = inp.value, ok = RULES.map(([, f]) => f(v)), score = v ? Math.min(4, ok.filter(Boolean).length + (v.length >= 12 ? 1 : 0)) : 0;
      $$('.cx-pw-bars .cn-progress-indicator', root).forEach((b, i) => { b.style.transform = `translateX(-${i < score ? 0 : 100}%)`; b.parentElement.dataset.tone = TONES[score]; });
      $('.cx-pw-meter .cn-badge', root).outerHTML = ui.badge(v ? NAMES_S[score] : 'Escribe una contraseña', { tone: v ? TONES[score] : 'muted' });
      $$('.cx-pw-rules li', root).forEach((li, i) => li.toggleAttribute('data-ok', ok[i]));
    });
    $('[data-pw-toggle]', root).addEventListener('click', (e) => { const b = e.currentTarget, showIt = inp.type === 'password'; inp.type = showIt ? 'text' : 'password'; b.innerHTML = ui.icon(showIt ? 'i-eyeoff' : 'i-eye'); b.setAttribute('aria-label', showIt ? 'Ocultar contraseña' : 'Mostrar contraseña'); });
  };


export { CB_CHECK, kit, ui, $, $$, lib, island, openModal, closeModal, CONTENT, body, foot, mdl, easeHeight, place, show, hide, initTabs, makeWheel, today, addDays, DAY, MON, DAYLONG, sameDay, fmtDay, money0, fold, hue, ini, reformat, groupThousands, setCheck };
