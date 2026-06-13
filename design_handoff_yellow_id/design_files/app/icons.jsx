/* Line icon set — 1.7px stroke, currentColor. Size via `s` prop (default 24). */
(function () {
  const Svg = ({ s = 24, children, fill = false, style }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={fill ? 'none' : 'currentColor'} strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );

  const IconShield = (p) => (<Svg {...p}><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></Svg>);
  const IconLock = (p) => (<Svg {...p}><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></Svg>);
  const IconUpload = (p) => (<Svg {...p}><path d="M12 16V5"/><path d="M7.5 9.5L12 5l4.5 4.5"/><path d="M5 16v2.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V16"/></Svg>);
  const IconCamera = (p) => (<Svg {...p}><path d="M4 8.5A1.5 1.5 0 015.5 7h2L9 5h6l1.5 2h2A1.5 1.5 0 0120 8.5V17a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17z"/><circle cx="12" cy="12.5" r="3.2"/></Svg>);
  const IconImage = (p) => (<Svg {...p}><rect x="4" y="5" width="16" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M5 17l4-3.5 3 2.2L16 12l3 3"/></Svg>);
  const IconPassport = (p) => (<Svg {...p}><rect x="5" y="3.5" width="14" height="17" rx="2.2"/><circle cx="12" cy="10" r="2.6"/><path d="M9 15.5h6"/></Svg>);
  const IconCard = (p) => (<Svg {...p}><rect x="3.5" y="6" width="17" height="12" rx="2.2"/><circle cx="8.5" cy="11.5" r="2"/><path d="M13 10h4M13 13.5h4M6.5 15.5h4"/></Svg>);
  const IconUser = (p) => (<Svg {...p}><circle cx="12" cy="9" r="3.4"/><path d="M5.5 19a6.5 6.5 0 0113 0"/></Svg>);
  const IconCrop = (p) => (<Svg {...p}><path d="M7 3v14h14"/><path d="M3 7h14v14"/></Svg>);
  const IconSun = (p) => (<Svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/></Svg>);
  const IconDroplet = (p) => (<Svg {...p}><path d="M12 3.5c3 3.4 5.5 6.2 5.5 9.2A5.5 5.5 0 0112 18a5.5 5.5 0 01-5.5-5.3c0-3 2.5-5.8 5.5-9.2z"/></Svg>);
  const IconWand = (p) => (<Svg {...p}><path d="M6 18L16 8"/><path d="M14 6l1.2-1.2M19 11l1.2-1.2M18 6.5l.7-.2-.2.7-.7.2.2-.7zM8.5 4.5l.6-.2-.2.6-.6.2.2-.6z" fill="currentColor"/><path d="M15 5l1 1 1-1-1-1zM4 8l.8.8.8-.8-.8-.8z" /></Svg>);
  const IconLayers = (p) => (<Svg {...p}><path d="M12 4l8 4-8 4-8-4 8-4z"/><path d="M4 12l8 4 8-4"/></Svg>);
  const IconSparkle = (p) => (<Svg {...p}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z"/><path d="M18.5 15.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" fill="currentColor" stroke="none"/></Svg>);
  const IconCheck = (p) => (<Svg {...p}><path d="M5 12.5l4.5 4.5L19 7"/></Svg>);
  const IconCheckCircle = (p) => (<Svg {...p}><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></Svg>);
  const IconAlert = (p) => (<Svg {...p}><path d="M12 4.5l8.5 14.5h-17z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r="0.4" fill="currentColor"/></Svg>);
  const IconInfo = (p) => (<Svg {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8.2" r="0.5" fill="currentColor"/></Svg>);
  const IconDownload = (p) => (<Svg {...p}><path d="M12 4v10"/><path d="M7.5 10L12 14.5 16.5 10"/><path d="M5 19h14"/></Svg>);
  const IconPlay = (p) => (<Svg {...p}><path d="M8 5.5l10 6.5-10 6.5z" fill="currentColor" stroke="none"/></Svg>);
  const IconGift = (p) => (<Svg {...p}><rect x="4" y="9" width="16" height="11" rx="2"/><path d="M4 12.5h16M12 9v11"/><path d="M12 9c-1.5-3.5-5.5-3-5 0M12 9c1.5-3.5 5.5-3 5 0"/></Svg>);
  const IconChevR = (p) => (<Svg {...p}><path d="M9 6l6 6-6 6"/></Svg>);
  const IconChevL = (p) => (<Svg {...p}><path d="M15 6l-6 6 6 6"/></Svg>);
  const IconChevD = (p) => (<Svg {...p}><path d="M6 9l6 6 6-6"/></Svg>);
  const IconX = (p) => (<Svg {...p}><path d="M6 6l12 12M18 6L6 18"/></Svg>);
  const IconPlus = (p) => (<Svg {...p}><path d="M12 5v14M5 12h14"/></Svg>);
  const IconMinus = (p) => (<Svg {...p}><path d="M5 12h14"/></Svg>);
  const IconSettings = (p) => (<Svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6L6 18M18 18l-1.4-1.4M7.4 7.4L6 6"/></Svg>);
  const IconRefresh = (p) => (<Svg {...p}><path d="M19 12a7 7 0 11-2-4.9"/><path d="M19 4v3.5h-3.5"/></Svg>);
  const IconGrid = (p) => (<Svg {...p}><path d="M9 4v16M15 4v16M4 9h16M4 15h16"/></Svg>);
  const IconRuler = (p) => (<Svg {...p}><rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/></Svg>);
  const IconDoc = (p) => (<Svg {...p}><path d="M7 3.5h7l4 4V20a.5.5 0 01-.5.5H7A.5.5 0 016.5 20V4a.5.5 0 01.5-.5z"/><path d="M14 3.5V8h4"/></Svg>);
  const IconHeart = (p) => (<Svg {...p}><path d="M12 19s-6.5-4-6.5-8.5A3.5 3.5 0 0112 8a3.5 3.5 0 016.5 2.5C18.5 15 12 19 12 19z"/></Svg>);

  Object.assign(window, {
    IconShield, IconLock, IconUpload, IconCamera, IconImage, IconPassport, IconCard,
    IconUser, IconCrop, IconSun, IconDroplet, IconWand, IconLayers, IconSparkle,
    IconCheck, IconCheckCircle, IconAlert, IconInfo, IconDownload, IconPlay, IconGift,
    IconChevR, IconChevL, IconChevD, IconX, IconPlus, IconMinus, IconSettings,
    IconRefresh, IconGrid, IconRuler, IconDoc, IconHeart,
  });
})();
