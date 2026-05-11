import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export const DEFAULT_SITE_CONTENT = {
  nav: {
    brand: "Greg Pryor",
    items: [
      { id: "hero", label: "Home", index: "00" },
      { id: "book", label: "The Book", index: "01" },
      { id: "memorabilia", label: "The Collection", index: "02" },
      { id: "about", label: "About Greg", index: "03" },
      { id: "speaking", label: "On the Road", index: "04" },
      { id: "apply", label: "Sit Next To Me", index: "05" },
      { id: "mytake", label: "My Take", index: "06" },
      { id: "contact", label: "Get in Touch", index: "07" },
    ],
  },
  hero: {
    badge: "№ 4 · UTILITY INFIELDER · 1976–1986",
    firstName: "Greg",
    lastName: "Pryor",
    lede: "Former Major Leaguer. World Series Champion. Author. Speaker. Podcaster. I have stories. I'm finally telling them.",
    sublede: "Forty years later, the dugout is quieter, but the memory is louder. Pull up a seat.",
    primaryCta: "Read the book",
    secondaryCta: "Sit next to me",
    stats: [
      { value: "10", label: "MLB SEASONS" },
      { value: "789", label: "GAMES" },
      { value: "6", label: "YEARS IN THE MINORS" },
      { value: "1", label: "WORLD SERIES RING" },
    ],
  },
  book: {
    eyebrow: "The Book",
    titleBefore: "A clubhouse seat to",
    titleEmphasis: "baseball's strangest decade",
    lede: "In 1977 I was a 27-year-old career minor leaguer with a Yankees contract, a mustache, and a dwindling supply of optimism. Then George Steinbrenner walked through the clubhouse with a razor in his hand. This is what happened next - and the ten years that followed.",
    pullQuote: "Greg saw things from the bench most of us never noticed on the field. The book is the next best thing to being in the dugout.",
    pullAttribution: "George Brett, HOF, Royals 3B",
    directTabLabel: "Direct from Greg",
    directTabSub: "Signed · $32.00",
    amazonTabLabel: "Amazon",
    amazonTabSub: "Kindle & Hardcover",
    directCta: "Order signed copy",
    amazonCta: "Buy on Amazon",
    teaserTag: "Book 2",
    teaserDate: "Coming in 2027",
    teaserText: "27 new chapters, including the never-before-told story of...",
    quotes: [
      { who: "George Brett", role: "HOF, Royals 3B", text: "Greg saw things from the bench most of us never noticed on the field. The book is the next best thing to being in the dugout." },
      { who: "Bret Saberhagen", role: "'85 Cy Young", text: "Equal parts hilarious and honest. The clubhouse stories are the real deal." },
      { who: "Frank White", role: "Royals 2B, '85 Champion", text: "Pryor remembers everything. Some of us wish he didn't." },
      { who: "Joe Posnanski", role: "Sportswriter, The Athletic", text: "A backup infielder's memoir has no business being this funny, this honest, or this readable. It's a small miracle." },
    ],
  },
  checkout: {
    headerTag: "DIRECT FROM GREG · NO. 04",
    headerTitle: "Order signed copy",
    editionHeading: "Pick your edition.",
    editionLede: "Two ways to take a book home from the dugout. Signed by me, personalized however you want.",
    quantityLabel: "How many copies?",
    quantityHelp: "Buying for the whole team? Greg ships up to 25 in one box.",
    addonTag: "ADD A SIGNED BALL · +$89",
    addonName: "Official MLB ball, signed by Greg",
    addonSub: "Personalize it too. Ships protected in a UV display case.",
    personalizeHeading: "Make it yours.",
    personalizeLedeSingle: "Tell me who I'm writing this for. I'll handle the rest with a real pen.",
    personalizeLedeMultiple: "Tell me who I'm writing this for. All {quantity} copies get the same inscription - message me after if you need different ones per copy.",
    unsignedNote: "You picked the unsigned hardcover, so there's nothing to personalize on the book itself.",
    shippingHeading: "Where am I sending it?",
    shippingLede: "Drops in the mail from Olathe, Kansas. I write the address by hand.",
    paymentHeading: "Payment",
    paymentLede: "Card data goes directly to Stripe - Greg never sees it. Apple Pay and Google Pay appear here when supported.",
    editions: {
      standard: { name: "Hardcover, unsigned", sub: "Direct from Greg's garage. Ships in 2 days." },
      signed: { name: "Hardcover, signed by Greg", sub: "Personalized inscription available. Ships in a week." },
    },
  },
  memorabilia: {
    eyebrow: "The Collection",
    titlePrefix: "The",
    titleEmphasis: "10 things",
    titleSuffix: "I never threw out.",
    lede: "Some of these I earned. Some I borrowed. One of them I'm pretty sure still belongs to Hal McRae. A small museum of a ten-year career.",
    items: [
      { id: 1, title: "1985 World Series Trophy", category: "Championship", year: "1985", desc: "The replica every player on the '85 Royals got - pennants for all 26 clubs, the crown on top, our names engraved on the base. Mine sits on a bookshelf in the den. Forty-one years and the gold still hasn't dulled. Some nights I just walk past it and nod." },
      { id: 2, title: "1985 Royals Championship Ring", category: "Championship", year: "1985", desc: "PRYOR across the top, the Royals crown shield in the middle, my number 4 underneath. I wore it to a card show in 1991 and a kid asked if it was real. I told him it was the most real thing I owned." },
      { id: 3, title: "Signed Baseball Display", category: "Signed", year: "Various", desc: "Twelve baseballs, twelve stories. Mickey Mantle. Bob Gibson. Willie Mays. George Brett with W.S. M.V.P. under his name. Two from my own first big league home runs at Comiskey in '78 - first AB, second AB, two days apart. The case stays locked. I have the only key." },
      { id: 4, title: "1984 AL West Champions Plaque", category: "Award", year: "1985", desc: "Handed out at the 14th Annual Kansas City Baseball Awards Dinner, January 26th, 1985. \"In recognition of outstanding individual achievements and contributions.\" I played 90 games that year. They were generous with the word 'outstanding.'" },
      { id: 5, title: "Team-Signed Moët", category: "Signed", year: "1985", desc: "Brut Impérial. Signed by the boys after we clinched. I never opened it. My wife asks every anniversary. The answer is still no." },
      { id: 6, title: "Game-Worn Pony Cleats", category: "Gear", year: "1984", desc: "Made in USA. Two-tone blue, busted at the toe, the Pony tongue flap nearly torn off the right one. I wore these the season we won the West. They smell like a dugout in August. I've never had the heart to clean them." },
      { id: 7, title: "Champions Weekend 2015", category: "Memento", year: "2015", desc: "Engraved bottle from the Royals' Champions Weekend - the '85 club back together to celebrate the 2015 ring. Thirty years between titles. We were grayer. The hugs were the same." },
      { id: 8, title: "Wrigley Souvenir Baseball", category: "Memento", year: "1979", desc: "A printed-cover ball with the old ballpark on it - light towers, packed grandstand, ivy you can almost see. White Sox days. A reminder that before Kansas City, there was the South Side, and that mattered too." },
      { id: 9, title: "Norman Rockwell Figurine", category: "Memento", year: "1986", desc: "Given to me by my dad after the World Series. Rockwell's umpire, the kids gathered around him at home plate. Dad said it reminded him of me at nine years old. I keep it on the windowsill where the morning light hits it." },
      { id: 10, title: "1912 Duffy Town Team", category: "Memento", year: "1912", desc: "Not mine, technically - a framed print I bought at an antique store in Bonner Springs. Eleven men in wool flannels, bats crossed at their feet, mustaches you could lose a nickel in. 1912. Same game. That's the whole point." },
    ],
  },
  about: {
    eyebrow: "About Greg",
    titleLine1: "Ten seasons.",
    titleLine2: "One ring",
    titleLine3: "A lot of vinyl.",
    bio1: "Born in Marietta, Ohio. Drafted by the Senators in the 6th round in 1971. Spent six years in the minors before Bill Veeck gave me a real shot with the White Sox in 1978. Made the majors for good at 28. Played 789 big league games at second, short, and third. Hit .250 lifetime. Ring in '85.",
    bio2: "Being a utility player meant I had to be sharper than everyone else - ready to step in at four positions on a moment's notice, and good enough to be trusted in October. It's the position that keeps a clubhouse together and a contender on the field. I wore the role with pride, and I came home with the ring to show for it.",
    careerHeading: "Career",
  },
  speaking: {
    heading: "On the Road",
    subheading: "SPEAKING · STORYTELLING · CLINICS",
    eyebrow: "BOOK A SPEAKING ENGAGEMENT",
    headlineLine1: "Bring me to your",
    headlineEmphasis: "special event",
    headlineLine2: "your sales clubhouse,",
    headlineLine3: "or your kid's little league camp.",
    lede: "16 years in the game taught me a lot of character - and a few lessons worth passing on. I do corporate keynotes, fundraisers, fantasy camps, school visits, and the occasional birthday party if the cake is good. The Yankees made me shave. They didn't make me boring.",
    list: [
      { title: "Keynotes & Banquets", text: "30-60 min. Stories from the dugout, the bus, and the World Series." },
      { title: "Youth Clinics", text: "Glove work, base running, and what to do when nobody's watching." },
      { title: "Fundraisers & Q&A", text: "Bring the ring. Sign the book. Stay for dinner." },
    ],
    cta: "Request a date",
    note: "WILL TRAVEL FOR THE RIGHT BBQ",
  },
  apply: {
    eyebrow: "Sit Next To Me",
    title: "Sit",
    titleEmphasis: "next to me",
    lede: "I have three Diamond Club seats at Kauffman and I'm at every home game. The seat in the middle is mine. The two on either side are yours, if you want them. Bring a friend. Bring your dad. Bring whoever you want to spend nine innings hearing stories with.",
    bullets: [
      "Two seats next to mine. Diamond Club Box, Row 2, seats 1-3.",
      "I'll be there too - stories, scorekeeping, peanuts.",
      "Tell me why you want to come. Be honest.",
      "No money changes hands. Just baseball.",
    ],
    calloutTag: "DIAMOND CLUB BOX · ROW 2 · SEATS 1-3",
    calloutText: "Three seats, one of them is mine. The other two are why you're here.",
    formTag: "APPLICATION · 2026 SEASON",
    finePrint: "I read every one. No bots. No bots. No bots.",
    successEyebrow: "You're In",
    successTitle: "See you at the",
    successTitleEmphasis: "K",
    successText: "I read every application personally. If we're a fit, I'll email you within a week with confirmation, parking instructions, and a meet-up spot before first pitch. The seats are next to mine - so come ready to talk baseball for nine innings.",
    upcomingGames: ["Jul 05 vs PHI", "Jul 17 vs SDP", "Jul 20 vs SFG", "Jul 22 vs SFG", "Aug 06 vs MIN", "Aug 08 vs CHC", "Aug 18 vs OAK", "Aug 21 vs DET", "Aug 23 vs DET"],
  },
  mytake: {
    eyebrow: "My Take",
    titleLine1: "I have",
    titleEmphasis: "opinions",
    titleLine2: "about your baseball.",
    lede: "The game I came up in is not the game on the field today. Some of that's good. Some of it's not. Here's where I land.",
    weeklyTag: "HOT TAKE OF THE WEEK",
    weeklyFoot: "- Greg, in his recliner, with a drink",
    weekly: {
      date: "May 10, 2026",
      team: "Kansas City Royals",
      record: "23-18",
      take: "Six weeks in and the rotation is finally healthy. Lugo at a 3.10. Wacha eating his innings. Witt slugging like a man with something to prove. Memorial Day is when the standings stop lying - if we're still above water on June 1, the front office better be on the phone. Add a setup man. Add a lefty bat. Don't get cute.",
    },
    takes: [
      { id: 1, hot: true, topic: "The Ghost Runner", verdict: "Bench it.", body: "The whole point of extra innings was that you earned the runner. Now we just hand them one and call it a game. Statistical fiction. Get rid of it.", reactions: 312, comments: 87 },
      { id: 2, hot: false, topic: "The Pitch Clock", verdict: "Keep it.", body: "I came up in an era where Mike Hargrove took 90 seconds between pitches. Nobody misses it. Game's crisper. I'm in.", reactions: 198, comments: 41 },
      { id: 3, hot: true, topic: "The Banned Shift", verdict: "Bring it back.", body: "If you can't pull a ground ball through a defender, that's on you. Banning the shift is babying hitters. Adapt or get demoted.", reactions: 412, comments: 156 },
      { id: 4, hot: false, topic: "Bigger Bases", verdict: "I'll allow it.", body: "Three more inches. Stolen bases are up. Game looks faster. I don't see the controversy here.", reactions: 89, comments: 22 },
      { id: 5, hot: true, topic: "ABS / Robo Umps", verdict: "Stop. Don't.", body: "The strike zone is supposed to breathe. A high cheese on the corner that the ump rings up - that's a memory. A computer beep is not.", reactions: 521, comments: 203 },
    ],
  },
  health: {
    eyebrow: "ALSO RUNNING - SINCE 1991",
    titleLine1: "Played the long game.",
    titleEmphasis: "Still playing it.",
    lede: "After baseball, I co-founded Life Priority with my old teammate Durk Pearson. Our flagship product, LIFT Caps, is a science-first energy and focus formula - caffeine paired with L-Phenylalanine, B-vitamins, and choline. No crash, no jitters, just a clean lift that keeps you moving.",
    pillars: ["Clean energy, no crash", "Mental focus & clarity", "Mood & motivation"],
    cta: "Shop LIFT Caps",
    yearsLabel: "YEARS IN BUSINESS",
  },
  facebook: {
    eyebrow: "FROM THE FACEBOOK PAGE",
    titlePrefix: "Latest from",
    titleHandle: "@GregPryor85",
    followCta: "Follow on Facebook",
    bottomCta: "Follow @GregPryor85 - the stories don't stop",
  },
  contact: {
    tag: "GET IN TOUCH",
    headingLine1: "I read everything.",
    headingEmphasis: "Eventually.",
    lede: "Press, podcast guests, autograph requests, baseball questions, or a friendly hello - pick a button.",
    emailCta: "Email Greg",
    facebookCta: "Facebook",
    pressCta: "Press Kit",
    autographCta: "Autograph Request",
  },
  footer: {
    brand: "Greg Pryor",
    subbrand: "№ 4 · ROYALS '85",
    quote: "\"I was axed three times by Billy Martin in the minors. In '78, Bill Veeck gave me a job. The rest is in the book.\"",
    copyright: "© 2026 GREG PRYOR. ALL RIGHTS RESERVED.",
    credit: "DESIGNED IN KANSAS CITY · BUILT WITH LOVE FOR THE GAME",
  },
};

export const CONTENT_SECTIONS = [
  {
    id: "hero",
    label: "Home",
    fields: [
      ["hero.badge", "Badge"],
      ["hero.firstName", "First name"],
      ["hero.lastName", "Last name"],
      ["hero.lede", "Main intro", "textarea"],
      ["hero.sublede", "Second intro", "textarea"],
      ["hero.primaryCta", "Primary button"],
      ["hero.secondaryCta", "Secondary button"],
      ["hero.stats.0.value", "Stat 1 value"],
      ["hero.stats.0.label", "Stat 1 label"],
      ["hero.stats.1.value", "Stat 2 value"],
      ["hero.stats.1.label", "Stat 2 label"],
      ["hero.stats.2.value", "Stat 3 value"],
      ["hero.stats.2.label", "Stat 3 label"],
      ["hero.stats.3.value", "Stat 4 value"],
      ["hero.stats.3.label", "Stat 4 label"],
    ],
  },
  {
    id: "book",
    label: "Book",
    fields: [
      ["book.eyebrow", "Eyebrow"],
      ["book.titleBefore", "Title prefix"],
      ["book.titleEmphasis", "Title emphasis"],
      ["book.lede", "Book intro", "textarea"],
      ["book.pullQuote", "Pull quote", "textarea"],
      ["book.pullAttribution", "Pull quote attribution"],
      ["book.directTabLabel", "Direct tab"],
      ["book.directTabSub", "Direct tab sublabel"],
      ["book.amazonTabLabel", "Amazon tab"],
      ["book.amazonTabSub", "Amazon tab sublabel"],
      ["book.directCta", "Direct button"],
      ["book.amazonCta", "Amazon button"],
      ["book.teaserTag", "Teaser tag"],
      ["book.teaserDate", "Teaser date"],
      ["book.teaserText", "Teaser text", "textarea"],
      ["book.quotes.0.text", "Quote 1 text", "textarea"],
      ["book.quotes.0.who", "Quote 1 person"],
      ["book.quotes.0.role", "Quote 1 role"],
      ["book.quotes.1.text", "Quote 2 text", "textarea"],
      ["book.quotes.1.who", "Quote 2 person"],
      ["book.quotes.1.role", "Quote 2 role"],
      ["book.quotes.2.text", "Quote 3 text", "textarea"],
      ["book.quotes.2.who", "Quote 3 person"],
      ["book.quotes.2.role", "Quote 3 role"],
      ["book.quotes.3.text", "Quote 4 text", "textarea"],
      ["book.quotes.3.who", "Quote 4 person"],
      ["book.quotes.3.role", "Quote 4 role"],
    ],
  },
  {
    id: "checkout",
    label: "Checkout",
    fields: [
      ["checkout.headerTag", "Header tag"],
      ["checkout.headerTitle", "Header title"],
      ["checkout.editionHeading", "Edition heading"],
      ["checkout.editionLede", "Edition intro", "textarea"],
      ["checkout.editions.standard.name", "Unsigned edition name"],
      ["checkout.editions.standard.sub", "Unsigned edition subtext", "textarea"],
      ["checkout.editions.signed.name", "Signed edition name"],
      ["checkout.editions.signed.sub", "Signed edition subtext", "textarea"],
      ["checkout.quantityLabel", "Quantity label"],
      ["checkout.quantityHelp", "Quantity help", "textarea"],
      ["checkout.addonTag", "Ball add-on tag"],
      ["checkout.addonName", "Ball add-on name"],
      ["checkout.addonSub", "Ball add-on subtext", "textarea"],
      ["checkout.personalizeHeading", "Personalization heading"],
      ["checkout.personalizeLedeSingle", "Personalization intro", "textarea"],
      ["checkout.personalizeLedeMultiple", "Multiple-copy personalization intro", "textarea"],
      ["checkout.unsignedNote", "Unsigned note", "textarea"],
      ["checkout.shippingHeading", "Shipping heading"],
      ["checkout.shippingLede", "Shipping intro", "textarea"],
      ["checkout.paymentHeading", "Payment heading"],
      ["checkout.paymentLede", "Payment intro", "textarea"],
    ],
  },
  {
    id: "memorabilia",
    label: "Collection",
    fields: [
      ["memorabilia.eyebrow", "Eyebrow"],
      ["memorabilia.titlePrefix", "Title prefix"],
      ["memorabilia.titleEmphasis", "Title emphasis"],
      ["memorabilia.titleSuffix", "Title suffix"],
      ["memorabilia.lede", "Intro", "textarea"],
      ...DEFAULT_SITE_CONTENT.memorabilia.items.flatMap((_, i) => [
        [`memorabilia.items.${i}.title`, `Item ${i + 1} title`],
        [`memorabilia.items.${i}.category`, `Item ${i + 1} category`],
        [`memorabilia.items.${i}.year`, `Item ${i + 1} year`],
        [`memorabilia.items.${i}.desc`, `Item ${i + 1} description`, "textarea"],
      ]),
    ],
  },
  {
    id: "about",
    label: "About",
    fields: [
      ["about.eyebrow", "Eyebrow"],
      ["about.titleLine1", "Title line 1"],
      ["about.titleLine2", "Title emphasis"],
      ["about.titleLine3", "Title line 2"],
      ["about.bio1", "Bio paragraph 1", "textarea"],
      ["about.bio2", "Bio paragraph 2", "textarea"],
      ["about.careerHeading", "Career heading"],
    ],
  },
  {
    id: "speaking",
    label: "Speaking",
    fields: [
      ["speaking.heading", "Heading"],
      ["speaking.subheading", "Subheading"],
      ["speaking.eyebrow", "Eyebrow"],
      ["speaking.headlineLine1", "Headline line 1"],
      ["speaking.headlineEmphasis", "Headline emphasis"],
      ["speaking.headlineLine2", "Headline line 2"],
      ["speaking.headlineLine3", "Headline line 3"],
      ["speaking.lede", "Intro", "textarea"],
      ["speaking.list.0.title", "List item 1 title"],
      ["speaking.list.0.text", "List item 1 text", "textarea"],
      ["speaking.list.1.title", "List item 2 title"],
      ["speaking.list.1.text", "List item 2 text", "textarea"],
      ["speaking.list.2.title", "List item 3 title"],
      ["speaking.list.2.text", "List item 3 text", "textarea"],
      ["speaking.cta", "Button"],
      ["speaking.note", "Button note"],
    ],
  },
  {
    id: "apply",
    label: "Sit Next To Me",
    fields: [
      ["apply.eyebrow", "Eyebrow"],
      ["apply.title", "Title prefix"],
      ["apply.titleEmphasis", "Title emphasis"],
      ["apply.lede", "Intro", "textarea"],
      ["apply.bullets.0", "Bullet 1", "textarea"],
      ["apply.bullets.1", "Bullet 2", "textarea"],
      ["apply.bullets.2", "Bullet 3", "textarea"],
      ["apply.bullets.3", "Bullet 4", "textarea"],
      ["apply.calloutTag", "Callout tag"],
      ["apply.calloutText", "Callout text", "textarea"],
      ["apply.formTag", "Form tag"],
      ["apply.finePrint", "Fine print"],
      ["apply.successEyebrow", "Success eyebrow"],
      ["apply.successTitle", "Success title"],
      ["apply.successTitleEmphasis", "Success title emphasis"],
      ["apply.successText", "Success text", "textarea"],
      ["apply.upcomingGames", "Upcoming games, one per line", "lines"],
    ],
  },
  {
    id: "mytake",
    label: "My Take",
    fields: [
      ["mytake.eyebrow", "Eyebrow"],
      ["mytake.titleLine1", "Title line 1"],
      ["mytake.titleEmphasis", "Title emphasis"],
      ["mytake.titleLine2", "Title line 2"],
      ["mytake.lede", "Intro", "textarea"],
      ...DEFAULT_SITE_CONTENT.mytake.takes.flatMap((_, i) => [
        [`mytake.takes.${i}.topic`, `Take ${i + 1} topic`],
        [`mytake.takes.${i}.verdict`, `Take ${i + 1} verdict`],
        [`mytake.takes.${i}.body`, `Take ${i + 1} body`, "textarea"],
      ]),
      ["mytake.weeklyTag", "Weekly tag"],
      ["mytake.weekly.date", "Weekly date"],
      ["mytake.weekly.team", "Weekly team"],
      ["mytake.weekly.record", "Weekly record"],
      ["mytake.weekly.take", "Weekly take", "textarea"],
      ["mytake.weeklyFoot", "Weekly footer"],
    ],
  },
  {
    id: "health",
    label: "Health",
    fields: [
      ["health.eyebrow", "Eyebrow"],
      ["health.titleLine1", "Title line 1"],
      ["health.titleEmphasis", "Title emphasis"],
      ["health.lede", "Intro", "textarea"],
      ["health.pillars.0", "Pillar 1"],
      ["health.pillars.1", "Pillar 2"],
      ["health.pillars.2", "Pillar 3"],
      ["health.cta", "Button"],
      ["health.yearsLabel", "Years label"],
    ],
  },
  {
    id: "facebook",
    label: "Facebook",
    fields: [
      ["facebook.eyebrow", "Eyebrow"],
      ["facebook.titlePrefix", "Title prefix"],
      ["facebook.titleHandle", "Title handle"],
      ["facebook.followCta", "Follow button"],
      ["facebook.bottomCta", "Bottom button"],
    ],
  },
  {
    id: "contact",
    label: "Contact",
    fields: [
      ["contact.tag", "Tag"],
      ["contact.headingLine1", "Heading line 1"],
      ["contact.headingEmphasis", "Heading emphasis"],
      ["contact.lede", "Intro", "textarea"],
      ["contact.emailCta", "Email button"],
      ["contact.facebookCta", "Facebook button"],
      ["contact.pressCta", "Press kit button"],
      ["contact.autographCta", "Autograph button"],
    ],
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      ["footer.brand", "Brand"],
      ["footer.subbrand", "Subbrand"],
      ["footer.quote", "Quote", "textarea"],
      ["footer.copyright", "Copyright"],
      ["footer.credit", "Credit"],
    ],
  },
];

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function mergeContent(base, override) {
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    if (base.every(isPlainObject) && override.every(isPlainObject)) {
      const length = Math.max(base.length, override.length);
      return Array.from({ length }, (_, i) => mergeContent(base[i] || {}, override[i] || {}));
    }
    return override;
  }
  if (isPlainObject(base)) {
    const next = { ...base };
    if (!isPlainObject(override)) return next;
    for (const [key, value] of Object.entries(override)) {
      next[key] = key in base ? mergeContent(base[key], value) : value;
    }
    return next;
  }
  return override == null ? base : override;
}

export function normalizeSiteContent(content) {
  return mergeContent(DEFAULT_SITE_CONTENT, content || {});
}

const SiteContentContext = createContext(DEFAULT_SITE_CONTENT);

export function SiteContentProvider({ children }) {
  const [remote, setRemote] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/site-content.json?ts=${Date.now()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (!cancelled) setRemote(data && typeof data === "object" ? data : {});
      })
      .catch(() => {
        if (!cancelled) setRemote({});
      });
    return () => { cancelled = true; };
  }, []);

  const content = useMemo(() => normalizeSiteContent(remote), [remote]);
  return React.createElement(SiteContentContext.Provider, { value: content }, children);
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
