"use strict";

const $ = id => document.getElementById(id);
const categories = ["この世にない世界","不思議な出会い","繰り返し見る夢","現実では説明できない出来事","怖いけど惹かれる夢","懐かしい記憶"];
const categoryTips = [
  "眠る前に、この世にない場所が出てくる本や絵を眺める",
  "会ってみたい人や生き物のことを思い浮かべながら眠る",
  "同じ時間・同じ姿勢で眠る習慣をつくる",
  "その日に起きた小さな不思議を書き出してから眠る",
  "怖さよりも惹かれた場面を思い出しながら眠る",
  "昔よく過ごした場所の写真を眺めてから眠る"
];
const publicDreams = [
  {title:"月の森で出会った白い少年", author:"カナベリー", category:1, elements:["月明かり","森","白い服の少年","星"], before:"窓から月を眺めてから眠った", analysis:true,
   body:"月明かりの森で、白い服を着た少年に出会った。少年が足元を指さすと、落ち葉の裏に小さな星がひとつずつ灯った。"},
  {title:"空に浮かぶ図書館の夢", author:"しらゆき", category:0, elements:["雲の上","図書館","本","季節の風"], before:"眠る前に古い本を読んでいた", analysis:true,
   body:"雲の上に図書館があった。本を開くたび、書かれた季節の風が吹いた。"},
  {title:"星を運ぶ列車に乗った夜", author:"ななせ", category:3, elements:["夜の列車","車掌","星"], before:"", analysis:true,
   body:"夜の列車に乗ると、車掌が窓から手を伸ばし、空の星をひとつ拾った。"},
  {title:"何度も戻る海辺の階段", author:"うみねこ", category:2, elements:["海","階段","波の音"], before:"波の音を流しながら眠った", analysis:false,
   body:"海へ下りる白い階段を、何度下りても同じ踊り場に戻ってくる。波の音だけが少しずつ近づいてくる。"}
];
const itemCatalog = [
  {keys:["月明かり","星","夜の列車","雲の上"], name:"星空を映すルームライト", kind:"眠る前のあかり"},
  {keys:["図書館","本","季節の風"], name:"夢と眠りにまつわる本", kind:"書籍"},
  {keys:["海","波の音","階段"], name:"波の音の睡眠用アプリ", kind:"アプリ"},
  {keys:["森","白い服の少年","車掌"], name:"森の香りのアロマ", kind:"アロマ"}
];
const defaultItem = {name:"夢日記用のノート", kind:"文房具"};
let myDream = {title:"雨の日に戻る駅", body:"同じ駅のホームで、何度も雨の音を聞いた。", category:2, visibility:"private", elements:["駅のホーム","雨の音"], before:"", analysis:true};
const myDiaries = [myDream];
let returnTo = "me";
let account = {pen:"ゆめねこ", email:"dream@example.test"};

// 分析前の広告（確認用の記録）
const DAY = 24*60*60*1000, HOUR = 60*60*1000, VIEW_LIMIT = 3;
const opened = new Map();   // 夢ID → 広告を見て開いた時刻
let viewLog = [];           // 広告を見終えた時刻
let justWatched = null, failOpen = null, adTimer = null;

const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const link = (route,label) => `<a href="#${route}">${label}</a>`;
const button = (route,label,primary=false) => `<a class="button ${primary ? "primary" : ""}" href="#${route}">${label}</a>`;
const submit = label => `<button class="primary" type="submit">${label}</button>`;
const art = label => `<div class="placeholder">${label}</div>`;
const page = (title,body) => `<div class="narrow page">${window.dreamHome.ornament}<h1 class="page-title">${title}</h1>${body}</div>`;
const note = message => `<p class="notice">${message}</p>`;
const field = (label,input) => `<label class="field"><span>${label}</span>${input}</label>`;
const input = (name,value="",type="text",required=true) => `<input name="${name}" type="${type}" value="${esc(value)}" ${required?"required":""}>`;
const area = (name,value="",required=true) => `<textarea name="${name}" ${required?"required":""}>${esc(value)}</textarea>`;
const choice = (name,labels,selected) => `<select name="${name}">${labels.map((label,i)=>`<option value="${i}" ${i===Number(selected)?"selected":""}>${label}</option>`).join("")}</select>`;
const form = (action,body) => `<form data-action="${action}">${body}</form>`;
const actions = (...items) => `<div class="actions">${items.join("")}</div>`;
const section = (title,body) => `<section><h2>${title}</h2>${body}</section>`;
const tags = list => list?.length ? `<ul class="tags">${list.map(t=>`<li class="tag">${esc(t)}</li>`).join("")}</ul>` : "";
const signed = () => $("signed").checked;
const operator = () => $("operator").checked;
const adMode = () => $("ad").value;
const adSeconds = () => $("short").checked ? 3 : 15;
const dreams = () => [...publicDreams,...myDiaries.filter(item=>item.visibility==="public").map(item=>({...item,author:account.pen}))];
const entries = () => dreams().map((dream,index)=>({dream,index}));
const cards = list => list.length ? `<div class="dream-books">${list.map(({dream,index})=>window.dreamHome.card(dream,index)).join("")}</div>` : note("該当する夢はまだありません。");
const similar = (dream,self) => entries().filter(({dream:d,index})=>index!==self && (d.category===Number(dream.category) || d.elements?.some(e=>dream.elements?.includes(e)))).slice(0,3);
const unavailable = (title,message) => page(title,note(message)+button("home","トップへ"));
const nav = () => [["home","はじめに"],["browse","夢の本棚"],["new","夢を記録する"],["help","ご利用案内"],signed() ? ["me","マイページ"] : ["login","ログイン"]].map(([route,label])=>link(route,label)).join("");
const splitElements = text => String(text ?? "").split(/[、,，\s]+/).map(s=>s.trim()).filter(Boolean).slice(0,6);

function itemsFor(dream) {
  const hits = itemCatalog.filter(item=>item.keys.some(k=>dream.elements?.includes(k))).slice(0,1);
  return [...hits, defaultItem];
}

function freeReason(id) {
  const now = Date.now();
  if (justWatched === id) return "広告の視聴が完了しました。この分析は24時間、広告なしで見返せます。";
  if (opened.has(id) && now - opened.get(id) < DAY) return "24時間以内に開いた分析のため、広告なしで表示しています。";
  if (failOpen === id) return "広告を読み込めなかったため、広告なしで表示しています。";
  if (adMode() === "none") return "広告の配信開始前のため、広告なしで表示しています。";
  if (viewLog.filter(t=>now - t < HOUR).length >= VIEW_LIMIT) return `視聴回数の上限（1時間に${VIEW_LIMIT}回）に達したため、広告なしで表示しています。`;
  return "";
}

function analysisPage(dream, id, reason) {
  const els = dream.elements?.length ? dream.elements : ["夢の情景"];
  const [a, b = "その場の空気"] = els;
  const back = id === null ? link("mine","自分の日記に戻る") : link("dream/"+id,"夢に戻る");
  return page("この夢を見たいと思った人に分析",
    `<p class="meta">対象　${id === null ? esc(dream.title) : link("dream/"+id,esc(dream.title))} ｜ ${esc(dream.author ?? account.pen)}</p>`+note(reason)+
    section("夢の要素", tags(els)+`<p>${els.map(esc).join("、")}が、この夢の雰囲気をつくっています。</p>`)+
    section("きっかけになりそうなこと", `<p>${dream.before ? `投稿者は「${esc(dream.before)}」と書いています。` : "投稿者は、寝る前にしていたことを書いていません。"}</p><p>${esc(a)}が出てくる夢では、眠る前にそれに近いものを見たり読んだりしていた、という投稿がよく見られます。</p>`)+
    section("寝る前に試せること", `<ul class="list"><li>${esc(a)}と${esc(b)}の情景を思い浮かべながら目を閉じる</li><li>${categoryTips[Number(dream.category)] ?? categoryTips[0]}</li><li>目が覚めたら、すぐに夢日記に書く</li></ul>`)+
    section("おすすめのアイテム", `<p class="meta"><span class="badge">広告</span>このコーナーの商品リンクはアフィリエイト広告（PR）です。</p><div class="diary-list">${itemsFor(dream).map(item=>`<a class="card item" href="#external/item" rel="sponsored">${art("商品画像")}<div><span class="badge">PR</span><h3>${item.name}</h3><small>${item.kind}</small></div></a>`).join("")}</div>`)+
    section("似た夢", cards(similar(dream, id)))+
    `<p class="disclaimer">この分析はエンターテインメントであり、医療的な診断ではありません。AIが作成した下書きを、運営が表現の基準に沿って確認しています。</p>`+
    actions(back, link("browse","夢の本棚へ")));
}

const screens = {
  home: () => window.dreamHome.render(),
  browse: id => `<div class="shelf">${window.dreamHome.ornament}<h1 class="page-title">夢の本棚</h1><p class="page-lead">公開された夢日記</p>
    <label class="field filter"><span>カテゴリ</span><select id="category-filter"><option value="">すべて</option>${categories.map((c,i)=>`<option value="${i}" ${id===String(i)?"selected":""}>${c}</option>`).join("")}</select></label>
    ${cards(entries().filter(({dream})=>!id || Number(id)===Number(dream.category)))}</div>`,
  dream: id => {
    const dream = dreams()[Number(id)];
    if (!dream) return unavailable("公開夢日記","表示できる日記がありません。");
    const cta = dream.analysis
      ? `<section class="panel analysis-cta"><h2>この夢、見てみたい？</h2>${button("analysis/"+id,"この夢を見たいと思った人に分析",true)}<p class="meta">15秒ほどの広告のあとに表示されます。夢の本文は広告なしで読めます。</p></section>`
      : `<p class="meta">投稿者の設定により、この夢には分析がありません。</p>`;
    return page(esc(dream.title),`<p class="meta">${esc(dream.author)} ｜ ${esc(categories[dream.category])}</p>${tags(dream.elements)}<article class="panel story">${esc(dream.body)}</article>${cta}${section("似た夢",cards(similar(dream,Number(id))))}<section>${actions(link("browse","夢の本棚へ"),link("report/"+id,"この日記を通報"))}</section>`);
  },
  analysis: id => {
    const dream = dreams()[Number(id)];
    if (!dream) return unavailable("夢の分析","表示できる夢がありません。");
    if (!dream.analysis) return unavailable("夢の分析","この夢は、投稿者の設定により分析を表示していません。");
    const reason = freeReason(id);
    if (reason) return analysisPage(dream, Number(id), reason);
    return page("この夢を見たいと思った人に分析",`<p class="meta">対象　${link("dream/"+id,esc(dream.title))}</p>
      <div id="gate" class="panel"><p>15秒ほどの広告のあとに、分析が表示されます。</p><p class="meta">広告を見るかどうかは選べます。夢の本文は広告なしで読めます。</p>
      ${actions(`<button type="button" class="primary" data-ad-start="${id}">広告を見て分析を開く</button>`,link("dream/"+id,"夢に戻る"))}</div>
      <p class="meta">分析は無料です。広告の収益でこの本屋さんを運営しています。</p>`);
  },
  myanalysis: () => analysisPage(myDream, null, "自分の夢のため、広告なしで表示しています。"),
  external: id => page(id==="advertiser"?"広告主サイトへの遷移":"外部の通販サイトへの遷移",note(id==="advertiser"?"リワード広告から広告主のサイトへ移動する位置の確認用です。広告は広告ネットワークが配信します。":"アフィリエイトリンクの配置確認用です。リンク先は提携先の商品ページを設定します。")+`<p>${link("browse","夢の本棚へ")}</p>`),
  report: id => {
    const dream = dreams()[Number(id)];
    return dream ? page("日記を通報する",`<p>対象　${esc(dream.title)}</p>`+form("report",field("理由",choice("reason",["個人情報の掲載","不適切な内容","その他"],0))+field("補足（任意）",'<textarea name="details"></textarea>')+actions(submit("通報を送る"),link("dream/"+id,"日記に戻る")))) : unavailable("通報","対象の日記が見つかりません。");
  },
  reported: () => page("通報を受け付けました",button("browse","夢の本棚へ")),
  login: () => page("ログイン",form("login",field("メールアドレス",input("email","","email"))+field("パスワード",input("password","","password"))+actions(submit("ログイン"),link("register","会員登録")))),
  register: () => page("会員登録",form("register",field("ペンネーム",input("pen"))+field("メールアドレス",input("email","","email"))+field("パスワード",input("password","","password"))+`<p>${link("terms","利用規約")}・${link("privacy","プライバシーポリシー")}</p><label><input type="checkbox" required> 利用規約とプライバシーポリシーを確認しました（公開した夢に分析ボタンと広告が表示されることを含む）</label>`+actions(submit("登録する"),link("login","ログイン")))),
  me: () => page("マイページ",actions(button("diaries","自分の夢日記"),button("settings","アカウント設定"))),
  diaries: () => page("自分の夢日記",actions(button("new","夢を記録する",true))+`<section class="diary-list">${myDiaries.map((item,index)=>`<a class="card" href="#mine/${index}"><h2>${esc(item.title)}</h2><small>${item.visibility==="public"?"公開":"非公開"} ｜ 分析ボタン${item.analysis?"あり":"なし"}</small></a>`).join("")}</section>`),
  mine: () => {
    const publicIndex = publicDreams.length + myDiaries.filter(item=>item.visibility==="public").indexOf(myDream);
    return page(esc(myDream.title),`<p class="meta">${myDream.visibility==="public"?"公開":"非公開"} ｜ 分析ボタン${myDream.analysis?"あり":"なし"}</p>${tags(myDream.elements)}<article class="panel story">${esc(myDream.body)}</article><section>${actions(button("edit","編集する"),button("myanalysis","自分の夢の分析を見る（広告なし）"),...(myDream.visibility==="public"?[link("dream/"+publicIndex,"公開ページを見る")]:[]),link("diaries","自分の夢日記へ"))}</section>`);
  },
  new: () => diaryEditor(false),
  edit: () => diaryEditor(true),
  settings: () => page("アカウント設定",form("settings",field("ペンネーム",input("pen",account.pen))+field("連絡先メールアドレス",input("email",account.email,"email"))+actions(submit("保存する"),link("me","マイページへ")))),
  // 「この本屋さんについて」ページは一旦非表示（戻すときは行頭の // を外す）
  // about: () => page("この本屋さんについて","<p>眠っている間に実際に見た夢を記録したり、誰かが公開した夢を読んだりできる場所です。気になった夢は、短い広告のあとに「この夢を見たい人向けの分析」を読めます。投稿・閲覧・分析はすべて無料です。</p>"+actions(button("new","夢を記録する",true),button("browse","夢を読む"))),
  help: () => page("ご利用案内",
    section("夢を記録する","<p>ログインして日記を作成します。公開／非公開と、分析ボタンを付けるかどうかを日記ごとに選べます。</p>")+
    section("夢を読む","<p>夢の本棚で、公開された日記を無料で読めます。</p>")+
    section("夢の分析と広告",'<ul class="list"><li>夢の詳細ページの「この夢を見たいと思った人に分析」を押すと、15秒ほどの広告のあとに分析が表示されます。</li><li>一度開いた分析は、24時間は広告なしで見返せます。</li><li>広告を見られる回数には上限があり、上限を超えると広告なしで表示されます。</li><li>分析はエンターテインメントであり、医療的な診断ではありません。</li></ul>')+
    button("contact","お問い合わせ")),
  // 「広告・アフィリエイトについて」ページは一旦非表示（戻すときは各行頭の // を外す）
  // ads: () => page("広告・アフィリエイトについて",
  //   section("分析前の広告","<p>分析を開く前に表示する動画広告は、広告ネットワーク（Google AdSense など）が配信するリワード広告です。広告を見るかどうかは読者が選べます。</p>")+
  //   section("おすすめのアイテム","<p>分析の中で紹介する商品リンクはアフィリエイト広告です。「広告」「PR」と表示しています。リンク先で購入などがあると、運営が提携先から報酬を受け取ります。</p>")+
  //   section("表記の方針","<p>健康や睡眠の効果をうたう表現は使いません。</p>")+
  //   `<p>広告の配信と計測のしくみ（Cookie などの利用）は${link("privacy","プライバシーポリシー")}をご覧ください。</p>`),
  contact: () => page("お問い合わせ",form("contact",field("返信先メールアドレス",input("email","","email"))+field("お問い合わせ内容",area("body"))+actions(submit("送信する"),link("help","ご利用案内へ")))),
  contacted: () => page("お問い合わせの送信完了",button("help","ご利用案内へ")),
  terms: () => page("利用規約",note("利用規約本文の掲載欄（公開した夢に分析ボタンと広告が表示されることを含む）")),
  privacy: () => page("プライバシーポリシー",note("プライバシーポリシー本文の掲載欄（広告の配信・計測と Cookie などの利用を含む）"))
};

function diaryEditor(editing) {
  const item = editing ? myDream : null;
  return page(editing?"日記の編集":"夢を記録する",form("diary",
    '<p>実際に見た夢を記録できます。</p>'+field("タイトル",input("title",item?.title))+field("夢の本文",area("body",item?.body))+
    field("カテゴリ",choice("category",categories,item?.category ?? 0))+
    field("夢の要素（任意・読点区切り）",input("elements",item?.elements?.join("、") ?? "","text",false))+
    `<p class="meta">例：海、階段、波の音。分析と「似た夢」に使います。</p>`+
    field("寝る前にしていたこと（任意）",area("before",item?.before,false))+
    `<fieldset><legend>公開範囲</legend><label><input type="radio" name="visibility" value="private" ${item?.visibility!=="public"?"checked":""}> 非公開</label> <label><input type="radio" name="visibility" value="public" ${item?.visibility==="public"?"checked":""}> 公開</label><p class="meta">公開した日記にはペンネームが表示されます。</p></fieldset>`+
    `<fieldset><legend>分析ボタン（公開した日記のみ）</legend><label><input type="radio" name="analysis" value="on" ${item?.analysis!==false?"checked":""}> 付ける</label> <label><input type="radio" name="analysis" value="off" ${item?.analysis===false?"checked":""}> 付けない</label><p class="meta">付けると、詳細ページに「この夢を見たいと思った人に分析」ボタンと広告が表示されます。</p></fieldset>`+
    actions(submit("日記を保存"),link(editing?"mine":"diaries","戻る"))));
}

const adminPages = {
  reports: "公開日記の通報対応",
  analysis: "分析管理",
  items: "おすすめアイテム管理",
  metrics: "広告・成果の計測"
};
const statusField = (label,options) => field(label,choice("status",options,0));
const saveActions = (...extra) => actions(...extra,'<button type="button" data-preview-save>保存を確認</button>',link("admin","運営管理へ"))+'<output aria-live="polite"></output>';
const adminScreens = {
  reports: () => page(adminPages.reports,"<p>通報理由・対象日記を確認</p>"+form("admin",field("対象日記",input("target","月の森で出会った白い少年"))+field("通報理由",input("reason","個人情報の掲載"))+field("対応メモ",area("memo","",false))+statusField("対応状況",["未対応","確認中","対応済み"])+saveActions())),
  analysis: () => page(adminPages.analysis,"<p>AIが生成した分析を確認し、表現の基準に沿って修正・再生成・非表示にする</p>"+form("admin",
    field("対象日記",input("target","空に浮かぶ図書館の夢"))+field("生成された分析",area("body","夢の要素：雲の上、図書館、本、季節の風\n寝る前に試せること：雲の上の図書館を思い浮かべながら目を閉じる",false))+
    `<fieldset><legend>表現の基準</legend>${["医療・健康効果をうたっていない","不安をあおっていない","断定していない","投稿者が書いていない個人情報を推測していない"].map(t=>`<label><input type="checkbox"> ${t}</label><br>`).join("")}</fieldset>`+
    statusField("公開状態",["確認待ち","公開中","非表示"])+saveActions('<button type="button" data-preview-save>再生成</button>'))),
  items: () => page(adminPages.items,"<p>夢の要素と紹介する商品を対応づけ、アフィリエイトリンクを管理する</p>"+form("admin",
    field("対象の夢の要素",input("keys","海、波の音、階段"))+field("商品名",input("name","波の音の睡眠用アプリ"))+field("種類",input("kind","アプリ"))+field("アフィリエイトリンク",input("url","https://example.com/affiliate","url"))+
    `<label><input type="checkbox"> 「PR」表記と rel="sponsored" を確認した</label><label><input type="checkbox"> 健康・睡眠の効果をうたう表現がない</label>`+
    statusField("掲載状態",["掲載中","停止"])+saveActions())),
  metrics: () => page(adminPages.metrics,"<p>数値はすべて例です。</p>"+
    `<table><tr><th>指標</th><th>今週（例）</th></tr>${[["公開日記数","120件"],["詳細ページの閲覧数","8,400回"],["分析ボタンを押した割合","18%"],["広告を最後まで見た割合","72%"],["1,000回視聴あたりの広告収益","—円"],["アフィリエイトのクリック率","4.1%"],["アフィリエイトの成約数","3件"],["広告で離脱した割合","28%"]].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`+
    `<p class="more">${link("admin","運営管理へ")}</p>`)
};
screens.admin = id => {
  if (!operator()) return unavailable("運営管理","運営権限が必要です。確認用メニューから権限を切り替えられます。");
  if (adminScreens[id]) return adminScreens[id]();
  return page("運営管理",Object.entries(adminPages).map(([key,title])=>`<p>${button("admin/"+key,title)}</p>`).join(""));
};

const screenGroups = [
  ["公開・共通",[["home","トップ"],["browse","公開夢日記一覧"],["dream/0","公開日記詳細（分析あり）"],["dream/3","公開日記詳細（分析なし）"],["analysis/0","夢分析ページ（広告→分析）"],["external/advertiser","広告主サイトへの遷移"],["external/item","通販サイトへの遷移"],["report/0","通報フォーム"],["reported","通報完了"],["help","ご利用案内"],["contact","お問い合わせ"],["contacted","お問い合わせ完了"],["terms","利用規約"],["privacy","プライバシーポリシー"]]],
  ["会員・日記",[["login","ログイン"],["register","会員登録"],["me","マイページ"],["diaries","自分の夢日記一覧"],["new","日記の新規作成"],["mine","自分の日記詳細"],["edit","日記編集"],["myanalysis","自分の夢の分析（広告なし）"],["settings","アカウント設定"]]],
  ["運営権限",[["admin","運営管理"],...Object.entries(adminPages).map(([key,title])=>["admin/"+key,title])]]
];
screens.map = () => page("画面一覧",screenGroups.map(([group,items])=>section(group,`<ul class="screen-list">${items.map(([route,title])=>`<li>${link(route,title)}</li>`).join("")}</ul>`)).join(""));

const memberScreens = new Set(["me","diaries","new","mine","edit","settings","myanalysis"]);
function go(route, replace = false) {
  if (location.hash === "#"+route) render();
  else if (replace) location.replace("#"+route);
  else location.hash = route;
}

function render() {
  clearInterval(adTimer);
  const route = location.hash.slice(1) || "home";
  const [name,id] = route.split("/");
  if (route !== "analysis/"+justWatched) justWatched = null;
  if (route !== "analysis/"+failOpen) failOpen = null;
  if (memberScreens.has(name) && !signed()) {
    returnTo = route;
    go("login",true);
    return;
  }
  if (name === "mine" && id !== undefined) myDream = myDiaries[Number(id)] ?? myDiaries[0];
  const navigation = nav();
  const isHome = name === "home";
  document.body.classList.toggle("is-top", isHome);
  document.querySelector(".preview").hidden = name !== "map" && new URLSearchParams(location.search).get("preview") !== "1";
  $("header").innerHTML = window.dreamHome.header(navigation);
  $("footer").innerHTML = `<div class="bar">${window.dreamHome.brand()}<nav aria-label="フッター">${link("help","ご利用案内")}${link("contact","お問い合わせ")}${link("terms","利用規約")}${link("privacy","プライバシーポリシー")}</nav><p class="copyright"><small>&copy; 2026 不思議な夢の本屋さん</small></p></div>`;
  $("screen").innerHTML = Object.hasOwn(screens,name) ? screens[name](id) : unavailable("画面が見つかりません","画面一覧から選択してください。");
  const heading = $("screen").querySelector("h1");
  document.title = isHome ? "不思議な夢の本屋さん" : heading.textContent + "｜不思議な夢の本屋さん";
}

function startAd(id) {
  const gate = $("gate");
  if (adMode() === "fail") {
    gate.innerHTML = note("広告を読み込めませんでした。分析を表示します。");
    adTimer = setTimeout(() => { failOpen = id; render(); }, 1200);
    return;
  }
  let left = adSeconds();
  gate.className = "";
  gate.innerHTML = `<div class="ad-player" role="region" aria-label="広告">
    <p><span class="badge">広告</span>リワード広告の表示枠（広告ネットワークが配信）</p>
    ${art("縦型の動画広告<br>9:16")}
    <p aria-live="polite" id="ad-status">あと <span class="countdown" id="count">${left}</span> 秒で分析を開けます</p>
    ${actions('<a class="button" href="#external/advertiser">詳しく見る（広告主のサイト）</a>',`<button type="button" class="primary" id="ad-done" data-ad-done="${id}" disabled>分析を見る</button>`,`<button type="button" data-ad-close="${id}">閉じる（分析は開きません）</button>`)}
  </div>`;
  adTimer = setInterval(() => {
    left -= 1;
    if (left > 0) { $("count").textContent = left; return; }
    clearInterval(adTimer);
    $("ad-status").textContent = "視聴が完了しました。";
    $("ad-done").disabled = false;
    $("ad-done").focus();
  }, 1000);
}

$("screen").addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  switch (event.target.dataset.action) {
    case "login":
    case "register": {
      const destination = returnTo;
      returnTo = "me";
      if (data.pen) account = {pen:data.pen,email:data.email};
      $("signed").checked = true;
      go(destination);
      break;
    }
    case "diary": {
      const diary = {...data, category:Number(data.category), elements:splitElements(data.elements), analysis:data.analysis==="on"};
      if (location.hash === "#edit") myDiaries[myDiaries.indexOf(myDream)] = diary;
      else myDiaries.push(diary);
      myDream = diary;
      go("mine/"+myDiaries.indexOf(myDream));
      break;
    }
    case "settings":
      account = data;
      go("me");
      break;
    case "report":
      go("reported");
      break;
    case "contact":
      go("contacted");
      break;
  }
});
$("screen").addEventListener("click", event => {
  const t = event.target;
  if (t.matches("[data-preview-save]")) t.closest("form").querySelector("output").textContent = "操作を確認しました。";
  if (t.matches("[data-ad-start]")) startAd(t.dataset.adStart);
  if (t.matches("[data-ad-done]")) {
    const id = t.dataset.adDone;
    opened.set(id, Date.now());
    viewLog.push(Date.now());
    justWatched = id;
    render();
    window.scrollTo(0,0);
  }
  if (t.matches("[data-ad-close]")) go("dream/"+t.dataset.adClose);
});
$("screen").addEventListener("change", event => {
  if (event.target.id === "category-filter") go(event.target.value ? "browse/"+event.target.value : "browse");
});
$("reset-ads").addEventListener("click", () => {
  opened.clear();
  viewLog = [];
  render();
});
document.querySelector(".controls").addEventListener("change", () => {
  if (signed() && location.hash === "#login" && returnTo) go(returnTo,true);
  else render();
});
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0,0);
  $("screen").focus({preventScroll:true});
});
render();
