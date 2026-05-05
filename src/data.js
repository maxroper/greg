// Data: Greg Pryor career stats, book quotes, podcast eps, memorabilia, etc.
// Image paths reference files in /public, served at the site root.

export const ASSETS = {
  gregYankees: "/assets/greg-yankees.jpg",
  gregFielding: "/assets/greg-fielding.jpg",
  gregKids: "/assets/greg-kids.jpg",
};

export const FB_PAGE_URL = "https://www.facebook.com/GregPryor85/";

export const FB_POSTS = [
  {
    id: 1,
    when: "2 days ago",
    text: "Forty-one years ago today I made my Royals debut in spring training. Fans still send me cards from that '85 club to sign. I sign every one. Keep 'em coming.",
    likes: 318, comments: 47, shares: 22,
    tag: "MEMORY",
  },
  {
    id: 2,
    when: "1 week ago",
    text: "Headed to Indian Valley last weekend to talk baseball with the kids. They asked me which was scarier — facing Nolan Ryan or signing the contract that meant I had to shave. I told them the truth.",
    likes: 642, comments: 89, shares: 41,
    tag: "EVENT",
  },
  {
    id: 3,
    when: "2 weeks ago",
    text: "Bret Saberhagen called me yesterday. He's still mad I didn't catch that ball in Game 7. I told him to read Chapter 11. We laughed for an hour.",
    likes: 1240, comments: 156, shares: 88,
    tag: "STORY",
  },
];

export const PRYOR_STATS = {
  career: { G: 789, AB: 1885, R: 204, H: 471, "2B": 81, "3B": 9, HR: 14, RBI: 146, BB: 96, AVG: ".250", OBP: ".289", SLG: ".326" },
  bestYears: [
    { year: 1979, team: "CHW", G: 143, AVG: ".275", H: 144, R: 64, RBI: 36, note: "Regular shortstop. Career-high in games and hits." },
    { year: 1982, team: "KCR", G: 73, AVG: ".270", H: 49, RBI: 12, note: "First season in Kansas City. Played all 4 infield positions." },
    { year: 1984, team: "KCR", G: 90, AVG: ".263", H: 49, HR: 4, RBI: 24, note: "Filled in for Brett & White. Career-best 4 HR. Royals win AL West." },
    { year: 1985, team: "KCR", G: 50, AVG: ".219", H: 14, R: 8, note: "World Series ring. Appeared in Game 5." },
  ],
  byYear: [
    { y: 1976, t: "TEX", g: 5, ab: 8, h: 3, hr: 0, rbi: 1, avg: ".375" },
    { y: 1978, t: "CHW", g: 82, ab: 195, h: 51, hr: 1, rbi: 19, avg: ".261" },
    { y: 1979, t: "CHW", g: 143, ab: 524, h: 144, hr: 1, rbi: 36, avg: ".275" },
    { y: 1980, t: "CHW", g: 122, ab: 384, h: 95, hr: 2, rbi: 32, avg: ".247" },
    { y: 1981, t: "CHW", g: 36, ab: 64, h: 14, hr: 0, rbi: 4, avg: ".219" },
    { y: 1982, t: "KCR", g: 73, ab: 181, h: 49, hr: 1, rbi: 12, avg: ".270" },
    { y: 1983, t: "KCR", g: 54, ab: 124, h: 27, hr: 1, rbi: 13, avg: ".217" },
    { y: 1984, t: "KCR", g: 90, ab: 187, h: 49, hr: 4, rbi: 24, avg: ".263" },
    { y: 1985, t: "KCR", g: 50, ab: 64, h: 14, hr: 0, rbi: 5, avg: ".219" },
    { y: 1986, t: "KCR", g: 47, ab: 100, h: 17, hr: 4, rbi: 0, avg: ".170" },
  ],
};

export const BOOK_QUOTES = [
  { who: "George Brett", role: "HOF, Royals 3B", text: "Greg saw things from the bench most of us never noticed on the field. The book is the next best thing to being in the dugout." },
  { who: "Bret Saberhagen", role: "'85 Cy Young", text: "Equal parts hilarious and honest. The clubhouse stories are the real deal." },
  { who: "Frank White", role: "Royals 2B, '85 Champion", text: "Pryor remembers everything. Some of us wish he didn't." },
  { who: "Joe Posnanski", role: "Sportswriter, The Athletic", text: "A backup infielder's memoir has no business being this funny, this honest, or this readable. It's a small miracle." },
];

export const PODCAST_EPS = [
  { n: 1, title: "Why I Got Cut by Billy Martin (Three Times)", duration: "47:12", date: "Coming Soon" },
  { n: 2, title: "The Pine Tar Game, From My Seat", duration: "52:08", date: "Coming Soon" },
  { n: 3, title: "Steinbrenner Called Me a Dumbass", duration: "39:44", date: "Coming Soon" },
  { n: 4, title: "Yacht Rock & The '85 Bus Rides", duration: "41:30", date: "Coming Soon" },
];

export const MEMORABILIA = [
  { id: 1, title: "1985 World Series Trophy", category: "Championship", year: "1985", size: "tall",
    img: "/assets/memorabilia/world-series-trophy.jpg",
    desc: "The replica every player on the '85 Royals got — pennants for all 26 clubs, the crown on top, our names engraved on the base. Mine sits on a bookshelf in the den. Forty-one years and the gold still hasn't dulled. Some nights I just walk past it and nod." },
  { id: 2, title: "1985 Royals Championship Ring", category: "Championship", year: "1985", size: "lg",
    img: "/assets/memorabilia/pryor-ring.jpg",
    desc: "PRYOR across the top, the Royals crown shield in the middle, my number 4 underneath. I wore it to a card show in 1991 and a kid asked if it was real. I told him it was the most real thing I owned." },
  { id: 3, title: "Signed Baseball Display", category: "Signed", year: "Various", size: "wide",
    img: "/assets/memorabilia/signed-baseballs-case.jpg",
    desc: "Twelve baseballs, twelve stories. Mickey Mantle. Bob Gibson. Willie Mays. George Brett with W.S. M.V.P. under his name. Two from my own first big league home runs at Comiskey in '78 — first AB, second AB, two days apart. The case stays locked. I have the only key." },
  { id: 4, title: "1984 AL West Champions Plaque", category: "Award", year: "1985", size: "md",
    img: "/assets/memorabilia/1984-plaque.jpg",
    desc: "Handed out at the 14th Annual Kansas City Baseball Awards Dinner, January 26th, 1985. \"In recognition of outstanding individual achievements and contributions.\" I played 90 games that year. They were generous with the word 'outstanding.'" },
  { id: 5, title: "Team-Signed Moët", category: "Signed", year: "1985", size: "tall",
    img: "/assets/memorabilia/signed-moet.jpg",
    desc: "Brut Impérial. Signed by the boys after we clinched. I never opened it. My wife asks every anniversary. The answer is still no." },
  { id: 6, title: "Game-Worn Pony Cleats", category: "Gear", year: "1984", size: "md",
    img: "/assets/memorabilia/pony-cleats.jpg",
    desc: "Made in USA. Two-tone blue, busted at the toe, the Pony tongue flap nearly torn off the right one. I wore these the season we won the West. They smell like a dugout in August. I've never had the heart to clean them." },
  { id: 7, title: "Champions Weekend 2015", category: "Memento", year: "2015", size: "sm",
    img: "/assets/memorabilia/champions-weekend-bottle.jpg",
    desc: "Engraved bottle from the Royals' Champions Weekend — the '85 club back together to celebrate the 2015 ring. Thirty years between titles. We were grayer. The hugs were the same." },
  { id: 8, title: "Wrigley Souvenir Baseball", category: "Memento", year: "1979", size: "sm",
    img: "/assets/memorabilia/wrigley-baseball.jpg",
    desc: "A printed-cover ball with the old ballpark on it — light towers, packed grandstand, ivy you can almost see. White Sox days. A reminder that before Kansas City, there was the South Side, and that mattered too." },
  { id: 9, title: "Norman Rockwell Figurine", category: "Memento", year: "1986", size: "tall",
    img: "/assets/memorabilia/rockwell-figurine.jpg",
    desc: "Given to me by my dad after the World Series. Rockwell's umpire, the kids gathered around him at home plate. Dad said it reminded him of me at nine years old. I keep it on the windowsill where the morning light hits it." },
  { id: 10, title: "1912 Duffy Town Team", category: "Memento", year: "1912", size: "wide",
    img: "/assets/memorabilia/1912-team-photo.jpg",
    desc: "Not mine, technically — a framed print I bought at an antique store in Bonner Springs. Eleven men in wool flannels, bats crossed at their feet, mustaches you could lose a nickel in. 1912. Same game. That's the whole point." },
];

export const TAKES = [
  { id: 1, hot: true, topic: "The Ghost Runner", verdict: "Bench it.", body: "The whole point of extra innings was that you earned the runner. Now we just hand them one and call it a game. Statistical fiction. Get rid of it.", reactions: 312, comments: 87 },
  { id: 2, hot: false, topic: "The Pitch Clock", verdict: "Keep it.", body: "I came up in an era where Mike Hargrove took 90 seconds between pitches. Nobody misses it. Game's crisper. I'm in.", reactions: 198, comments: 41 },
  { id: 3, hot: true, topic: "The Banned Shift", verdict: "Bring it back.", body: "If you can't pull a ground ball through a defender, that's on you. Banning the shift is babying hitters. Adapt or get demoted.", reactions: 412, comments: 156 },
  { id: 4, hot: false, topic: "Bigger Bases", verdict: "I'll allow it.", body: "Three more inches. Stolen bases are up. Game looks faster. I don't see the controversy here.", reactions: 89, comments: 22 },
  { id: 5, hot: true, topic: "ABS / Robo Umps", verdict: "Stop. Don't.", body: "The strike zone is supposed to breathe. A high cheese on the corner that the ump rings up — that's a memory. A computer beep is not.", reactions: 521, comments: 203 },
];

export const HOT_TAKE_ROYALS = {
  date: "April 25, 2026",
  team: "Kansas City Royals",
  record: "12-9",
  take: "Bobby Witt Jr. is going to win an MVP and the front office is finally not blowing up the rotation to fund it. I've waited 41 years to feel this way again. Don't trade Lugo. Don't trade Singer. Let it cook.",
};

export const PLAYLISTS = [
  { name: "Yacht Rock Essentials", count: 87, hours: "5h 42m", color: "#7a3b2e", emoji: "⛵" },
  { name: "Psychedelic '70s", count: 64, hours: "4h 18m", color: "#BD9B60", emoji: "🌀" },
  { name: "Bus Ride Mixtape '85", count: 42, hours: "2h 51m", color: "#004687", emoji: "📻" },
  { name: "Slow Burn Sundays", count: 51, hours: "3h 27m", color: "#2d4a3e", emoji: "🌅" },
];

export const NAV_ITEMS = [
  { id: "hero", label: "Home", index: "00" },
  { id: "book", label: "The Book", index: "01" },
  { id: "memorabilia", label: "The Collection", index: "02" },
  { id: "about", label: "About Greg", index: "03" },
  { id: "speaking", label: "On the Road", index: "04" },
  { id: "apply", label: "Sit Next To Me", index: "05" },
  { id: "mytake", label: "My Take", index: "06" },
  { id: "music", label: "The Music", index: "07" },
  { id: "podcast", label: "The Podcast", index: "08" },
  { id: "contact", label: "Get in Touch", index: "09" },
];
