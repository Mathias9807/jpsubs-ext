let jpsubs = 'https://kitsunekko.net/dirlist.php?dir=subtitles%2Fjapanese%2F';
let jpsubsBase = 'https://kitsunekko.net';
let storage = window.sessionStorage;

const searchOptions = {
  // isCaseSensitive: false,
  includeScore: true,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 3,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  keys: [
    "title"
  ]
};

/** If the current MAL page's anime exists on kitsunekko.net, add links to it */
function checkSubs(kitsunekko) {
  storage.setItem('kitsunekkoSubs', kitsunekko);

  // Get MAL anime name
  if (document.getElementsByClassName("title-name")?.length < 1) return;
  let titleTag = document.getElementsByClassName("title-name")[0];
  let title = titleTag.textContent;
  let title_en = document.getElementsByClassName("title-english")?.[0]?.textContent ?? '';

  // Match against kitsunekko
  // Parse kitsunekko src as fake HTML node so we can search it with DOM functions
  let kitsu = document.createElement('html');
  kitsu.innerHTML = kitsunekko;
  let rows = kitsu.getElementsByTagName('tr');
  let subs = [...rows].map(s => ({
    'title': s.firstChild.textContent,
    'href': s.firstChild.firstChild.pathname + s.firstChild.firstChild.search,
  }));

  const fuse = new Fuse(subs, searchOptions);
  let matches = fuse.search(title);
  matches = matches.slice(0, 3); // Only include first 5 matches

  // For each match, add jpsubs link
  // let styles = `
  //   .title-name:after {
  //     content: '';
  //     position: absolute;
  //     top: 0;
  //     right: 0;
  //     width: 30%;
  //     height: 100%;
  //     background-image: linear-gradient(left, rgba(255,255,255,0) 0%, white 80%, white 100%);
  //     pointer-events: none;
  //   }
  // `;
  // var styleSheet = document.createElement("style");
  // styleSheet.type = "text/css";
  // styleSheet.innerText = styles;
  // document.head.appendChild(styleSheet);
  titleTag.style.whiteSpace = 'nowrap';
  for (let m of matches) {
    let newTag = document.createElement('a');
    newTag.textContent = ' ' + m.item.title.trim() + (m==matches[matches.length-1]?'':',');
    newTag.href = jpsubsBase + m.item.href;
    newTag.style.fontSize = '7pt';
    titleTag.appendChild(newTag);
  }
}

// Fetch kitsunekko subs from storage if cached, otherwise fetch from website
let subData = storage.getItem('kitsunekkoSubs');
if (subData) {
  checkSubs(subData);
}else {
  (chrome || browser).runtime.sendMessage(jpsubs, data => checkSubs(data)); 
}

