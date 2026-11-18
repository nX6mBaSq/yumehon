(() => {
  "use strict";

  // 届いた夢カードの挿絵と抜粋（未登録の夢はカテゴリの挿絵と本文を使う）
  const dreamArtwork = ["forest", "library", "train"];
  const dreamExcerpts = [
    "月明かりに導かれて森の奥へ。古い石の門の前に、白い服の少年が立っていた。",
    "雲に浮かぶ図書館で、まだ見たことのない夢が書かれた本を見つける。",
    "夜の列車に乗り込むと、車窓のすぐそばを小さな星たちが流れていった。"
  ];
  const framedCategoryArtwork = ["world", "encounter", "recurring", "surreal", "door"];
  const categoryArtwork = [...framedCategoryArtwork, "memory"];
  const book = '<img class="book-symbol" src="assets/book.webp" width="42" height="36" alt="">';
  const ornament = `<div class="book-ornament" aria-hidden="true">${book}</div>`;
  const heading = (id, label) => `<h2 id="${id}" class="ornate-heading"><span>${label}</span></h2>`;
  const cta = (route, label, gold = false) =>
    `<a class="home-cta${gold ? " home-cta-gold" : ""}" href="#${route}">${label}</a>`;

  const artworkFor = (dream, index) => dreamArtwork[index] ?? categoryArtwork[Number(dream.category)] ?? "world";
  const excerptFor = (dream, index) => dreamExcerpts[index] ?? dream.body;

  const dreamCard = (dream, index) => {
    const artwork = artworkFor(dream, index);
    const crop = framedCategoryArtwork.includes(artwork) ? ' class="category-art-crop"' : "";
    return `
    <article class="dream-book">
      <a href="#dream/${index}">
        <div class="dream-illustration">
          <img${crop} src="assets/${artwork}.webp" loading="lazy" alt="">
        </div>
        <div class="dream-page">
          <h3>${esc(dream.title)}</h3>
          <p class="dream-author">投稿者　${esc(dream.author)}</p>
          <p>${esc(excerptFor(dream, index))}</p>
          ${dream.analysis ? '<p class="dream-mark"><span>分析あり</span></p>' : ""}
          <span class="dream-detail">詳細を読む <span aria-hidden="true">›</span></span>
        </div>
      </a>
    </article>`;
  };

  function renderHome() {
    return `
      <section class="home-hero" aria-labelledby="home-title">
        <div class="hero-art" aria-hidden="true"></div>
        <div class="hero-copy">
          ${ornament}
          <h1 id="home-title"><span>不思議な</span>夢の本屋さん</h1>
          <p class="home-english" lang="en">The Dream Bookstore</p>
          <p class="hero-lead">あなたが眠っている間に見た夢が、<br>誰かの読みたい物語になる。</p>
          <h2>あなたが見た夢の話を<br>きかせてください。</h2>
          <div class="home-actions">
            ${cta("new", "夢を記録する", true)}
            ${cta("browse", "誰かの夢を読む")}
          </div>
        </div>
      </section>

      <section class="home-about" aria-labelledby="home-about-title">
        <h2 id="home-about-title">このお店は、どんな場所？</h2>
        <img src="assets/bookstore-welcome.png" width="1199" height="1312" loading="lazy" decoding="async"
          alt="不思議な夢の本屋さんへようこそ。いらっしゃいませ。当店は、眠りの中で本当に見た、不思議な夢の物語だけを集めた小さな本屋です。この本屋には、夢に呼ばれた人だけがたどり着けるのだとか。さあ、今日はどんな夢の世界に出会えるのでしょうか。">
        <p class="home-about-note">実際に見た夢を無料で記録し、公開するかを自分で選べます。<br>公開された夢は、誰でも無料で読めます。</p>
        <p class="home-text-link"><a href="#about">この本屋さんについて <span aria-hidden="true">›</span></a></p>
      </section>

      <section class="home-section home-dreams" aria-labelledby="home-dreams-title">
        ${heading("home-dreams-title", "届いた夢")}
        <div class="dream-books">${entries().slice(0, 3).map(({ dream, index }) => dreamCard(dream, index)).join("")}</div>
        ${cta("browse", "もっと夢を読む")}
      </section>

      <section class="home-section home-categories" aria-labelledby="home-categories-title">
        ${heading("home-categories-title", "夢のカテゴリ")}
        <ul class="category-windows">
          ${categories.map((label, index) => {
            const artwork = categoryArtwork[index];
            const crop = framedCategoryArtwork.includes(artwork) ? ' class="category-art-crop"' : "";
            return `
            <li><a href="#browse/${index}">
              <div class="category-picture">
                <img${crop} src="assets/${artwork}.webp" width="334" height="190" loading="lazy" alt="">
              </div>
              <span>${label}</span>
            </a></li>`;
          }).join("")}
        </ul>
      </section>

      <section class="home-ending" aria-labelledby="home-ending-title">
        ${heading("home-ending-title", "作家のみなさんへ")}
        <p>今夜も、どうかたくさん眠ってください。<br>
          あなたが眠りの中で出会う、不思議な世界。<br>
          その物語を、楽しみに待っている読者がいます。<br>
          眠ることも、あなたのお仕事なのですから。</p>
        <p class="goodnight">おやすみなさい。<span class="goodnight-moon" aria-hidden="true"></span></p>
        <img class="ending-art" src="assets/goodnight-valley.webp" width="1170" height="1170" loading="lazy" alt="紫の花に囲まれたテラスで、本の上に眠る白い猫。雲の向こうに街とお城の灯りが見える。">
      </section>`;
  }

  function homeBrand() {
    return `<a class="home-brand" href="#home">
        ${book}
        <span>不思議な夢の本屋さん</span>
      </a>`;
  }

  function renderHomeHeader(navigation) {
    return `<div class="home-bar">
      ${homeBrand()}
      <details class="home-menu">
        <summary><span class="menu-icon" aria-hidden="true"></span>メニュー</summary>
        <nav aria-label="メイン">${navigation}${link("about", "この本屋さんについて")}</nav>
      </details>
    </div>`;
  }

  window.dreamHome = {
    render: renderHome,
    header: renderHomeHeader,
    brand: homeBrand,
    card: dreamCard,
    ornament,
    artwork: artworkFor
  };
})();
