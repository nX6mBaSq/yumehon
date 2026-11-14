'use strict';
const shopName = '不思議な夢の本屋さん';
const genres = ['怖い夢', '幸せな夢', '奇妙な夢'];
const initial = () => ({
  signedIn: false, purchased: ['3'], payments: [{id:'3', status:'success'}], reports: [],
  dreams: [
    {id:'1', title:'真夜中の図書館', genre:genres[0], summary:'閉館した図書館で、まだ書かれていないはずの自分の日記を見つけた。', body:'返却口の奥で小さなベルが鳴った。日記を開くと、まっさらなページに「いま聞こえた音」とだけ書いてあった。', status:'公開中'},
    {id:'2', title:'雲の上の朝ごはん', genre:genres[1], summary:'雲を階段のようにのぼると、祖母が朝ごはんを用意して待っていた。', body:'テーブルには焼きたてのパンがあった。足元の雲がゆっくり流れ、祖母は「冷める前に」と笑った。', status:'公開中'},
    {id:'3', title:'海へ向かう最終電車', genre:genres[2], summary:'いつもの最終電車に乗ると、窓の外に魚が泳いでいた。', body:'車掌が「次は海底です」と告げた。ドアが開くと水は入ってこず、魚だけがホームの向こうへ通り過ぎた。', status:'公開中', own:true},
    {id:'4', title:'名前を呼ぶポスト', genre:genres[2], summary:'帰り道で赤いポストが私を呼んだ。', body:'近づくと投函口が開き、白い封筒が滑り出てきた。', status:'要修正', reason:'本文に出てくる人名を伏せてください。', own:true}
  ]
});
const storageKey = 'dream-bookshop-wireframe-v1';
let state = initial();
try { state = JSON.parse(localStorage.getItem(storageKey)) || state; } catch {}
const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} };
const main = document.querySelector('main');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = (path, params) => '#' + path + (params ? '?' + new URLSearchParams(params) : '');
const go = (path, params) => { location.hash = url(path, params); };
const link = (label, path, params) => '<a href="' + esc(url(path, params)) + '">' + esc(label) + '</a>';
const btn = (label, path, params, primary = false) => '<a class="btn' + (primary ? ' primary' : '') + '" href="' + esc(url(path, params)) + '">' + esc(label) + '</a>';
const block = (title, body) => '<section class="card"><h2>' + esc(title) + '</h2>' + body + '</section>';
const actions = (...items) => '<div class="actions">' + items.join('') + '</div>';
const notice = message => '<p class="notice" role="status">' + esc(message) + '</p>';
const back = (label, path) => '<div class="back">' + link('← ' + label, path) + '</div>';
const field = (label, name, value, rows) => '<label>' + label + (rows ? '<textarea required name="' + name + '" rows="' + rows + '">' + esc(value) + '</textarea>' : '<input required name="' + name + '" value="' + esc(value) + '">') + '</label>';
const option = (label, selected) => '<option' + (label === selected ? ' selected' : '') + '>' + esc(label) + '</option>';
const submit = label => '<button class="primary">' + label + '</button>';
const dreamPath = d => '/dreams/' + d.id;
const ownPath = d => '/account/dreams/' + d.id;
const postingRules = [
  '性的な描写や性的行為を含む夢',
  'わいせつ・露骨な表現を含む夢',
  '性的な興奮を目的とした内容',
  '実在する人物への誹謗中傷や、本人・第三者の個人情報の公開',
  '犯罪の予告、脅迫、違法行為を助長する内容',
  '作り話、AIによって創作された夢、結末の付け足し'
];
const postingRulesList = '<ul>' + postingRules.map(rule => '<li>' + esc(rule) + '</li>').join('') + '</ul>';
const info = {
  '/royalties': ['報酬の仕組み','投稿は無料です。販売1件150円のうち、投稿者90円・運営60円を想定しています（仮配分）。支払い条件はβ版の募集前に確定します。'],
  '/terms': ['利用規約','利用条件、投稿と購入、返金、通報・非公開化について掲載する予定です。'],
  '/privacy': ['プライバシーポリシー','会員情報・購入履歴・通報情報の取り扱いについて掲載する予定です。']
};

function home() {
  const picks = state.dreams.filter(d => d.status === '公開中').slice(0, 3);
  return `
    <section class="shop-entrance" aria-labelledby="shop-title">
      <div class="shop-moon" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
      <h1 id="shop-title">${shopName}</h1>
      <p class="shop-lead">何度も繰り返し見る夢。<br>目が覚めても、忘れられない夢。</p>
      ${btn('本棚をのぞく', '/dreams', null, true)}
    </section>
    <section class="shop-letter" aria-labelledby="shop-about">
      <h2 id="shop-about">あなたも、そんな夢を見たことはありませんか？</h2>
      <p>どこの世界なのかもわからない場所。<br>人間ではない、見知らぬ存在との出会い。<br>現実では説明できない、不思議な出来事。</p>
      <p>ここに集めたいのは、<br>誰かが本当に眠りの中で体験した、不思議な夢だけ。</p>
    </section>
    <section class="shop-shelf" aria-labelledby="shop-picks">
      <p class="shop-kicker">棚からひとつまみ</p>
      <h2 id="shop-picks">本棚から、今夜の一冊</h2>
      <p class="shop-note">あらすじは無料。全文は一話150円（仮価格）です。</p>
      ${picks.length ? `<ul class="shop-books">${picks.map(d => `
        <li><a class="shop-book" href="${esc(url(dreamPath(d)))}">
          <span class="shop-genre">${esc(d.genre)}</span>
          <h3>${esc(d.title)}</h3>
          <p>${esc(d.summary)}</p>
          <span class="shop-read">あらすじを読む <span aria-hidden="true">→</span></span>
        </a></li>`).join('')}</ul>` : '<p>本棚には、まだ夢が並んでいません。</p>'}
      ${btn('すべての夢を見る', '/dreams')}
    </section>
    <section class="shop-letter shop-author" aria-labelledby="shop-writers">
      <h2 id="shop-writers">心のどこかに残っている不思議な夢</h2>
      <p>誰かに話したかったけれど、<br>うまく言葉にできなかった。</p>
      <p>話しても、信じてもらえない気がした。</p>
      <p>あなたが見た、その夢の話を聞かせてください。</p>
      <p>ここは、誰かが本当に見た不思議な夢だけが集まる場所。</p>
      ${btn('夢を投稿する', '/account/dreams/new', null, true)}
      <p class="shop-note">投稿は無料です。 ${link('報酬の仕組み', '/royalties')}</p>
    </section>
    <details class="shop-rules">
      <summary>当店に並べられない夢</summary>
      <p>安心して楽しめる、幻想的な物語の世界を大切にしています。以下の内容を含む投稿はできません。</p>
      ${postingRulesList}
      <p>${link('投稿ルールを読む', '/posting-rules')}</p>
    </details>
    ${state.signedIn ? '' : `<p class="shop-account">はじめての方は${link('会員登録', '/signup')}<span aria-hidden="true"> · </span>${link('ログイン', '/login')}</p>`}
  `;
}

function route() {
  const [path, query] = (location.hash.slice(1) || '/').split('?');
  return [path, new URLSearchParams(query)];
}

function screen(path, query) {
  if (path.startsWith('/account') && !state.signedIn) {
    return ['ログインが必要です', actions(btn('ログイン', '/login', {next:path}, true), btn('会員登録', '/signup', {next:path}))];
  }
  if (path === '/') return [shopName, home()];
  if (path === '/posting-rules') return ['投稿ルール',
    block('掲載できる夢', '<p>本当に眠っている間に見た夢だけを掲載します。途中で終わった夢も、そのまま投稿できます。</p>') +
    block('当店に並べられない夢', '<p>以下の内容を含む投稿は禁止です。</p>' + postingRulesList) +
    actions(btn('夢を投稿する', '/account/dreams/new', null, true))];
  if (path === '/dreams') {
    const genre = query.get('genre') || 'すべて';
    const dreams = state.dreams.filter(d => d.status === '公開中' && (genre === 'すべて' || d.genre === genre));
    return ['本棚','<form class="card" data-form="filter"><label>ジャンル<select name="genre">' + ['すべて', ...genres].map(g => option(g,genre)).join('') + '</select></label></form><div class="grid">' + (dreams.length ? dreams.map(d => '<article class="card"><span class="tag">'+esc(d.genre)+'</span><h2>'+link(d.title,dreamPath(d))+'</h2><p>'+esc(d.summary)+'</p>'+btn('あらすじを読む',dreamPath(d))+'</article>').join('') : '<p>このジャンルの作品はありません。</p>') + '</div>'];
  }
  if (Object.hasOwn(info,path)) return [info[path][0],block('ご案内','<p>'+info[path][1]+'</p>') + (path === '/royalties' ? actions(btn('夢を投稿する','/account/dreams/new',null,true)) : back('利用案内','/help'))];
  if (path === '/help') return ['利用案内',block('読み方と投稿方法','<p>本棚であらすじを読み、全文は「夢の鍵」から購入します。購入した作品はマイページから再読できます。</p><p>投稿は運営による審査を経て公開されます。</p>')+block('問い合わせ・規約','<p>問い合わせ先は準備中です。</p>'+actions(btn('利用規約','/terms'),btn('プライバシーポリシー','/privacy')))];
  if (path === '/login' || path === '/signup') {
    const signup = path === '/signup';
    return [signup?'会員登録':'ログイン', notice('デモです。実際のメールアドレスやパスワードの入力は不要です。')+
      '<form class="card" data-form="auth"><label>メールアドレス<input type="email" name="email" value="demo@example.test" required></label>' +
      (signup?'<label class="check"><input type="checkbox" required>18歳以上です</label>':'')+submit(signup?'デモ登録する':'デモでログイン')+'</form>'+link(signup?'ログインへ':'会員登録へ',signup?'/login':'/signup',{next:query.get('next')||'/account'})];
  }
  if (path === '/account') return ['マイページ','<div class="grid">'+[
    ['購入した夢','/account/library'],['夢を投稿','/account/dreams/new'],['自分の投稿','/account/dreams'],['売上・報酬','/account/earnings']
  ].map(([label,target])=>block(label,btn(label+'を開く',target))).join('')+'</div>'+actions('<button data-logout>ログアウト</button>')];
  if (path === '/account/library') return ['購入した夢',back('マイページ','/account') + state.dreams.filter(d=>state.purchased.includes(d.id)).map(d=>block(d.title,d.status==='公開中'?btn('全文を読む',dreamPath(d)+'/read',null,true):'<p>非公開</p>'+link('問い合わせ先','/help'))).join('')];
  if (path === '/account/dreams/new') return ['夢を投稿',postForm()];
  if (path === '/account/dreams') return ['自分の投稿',back('マイページ','/account')+(query.has('submitted')?notice('審査へ提出しました。'):'')+state.dreams.filter(d=>d.own).map(d=>block(d.title,'<p>'+esc(d.status)+'</p>'+btn('詳細を確認',ownPath(d)))).join('')+actions(btn('新しい夢を投稿','/account/dreams/new',null,true))];
  if (path === '/account/earnings') return ['売上・報酬',back('マイページ','/account')+earnings(state.dreams.filter(d=>d.own))];
  const own = path.match(/^\/account\/dreams\/([^/]+)$/);
  if (own) {
    const d = state.dreams.find(d=>d.id===own[1]&&d.own);
    if (d) return [d.title,back('自分の投稿','/account/dreams')+notice(d.status)+(d.status==='要修正'?block('修正依頼', '<p>'+esc(d.reason)+'</p>')+postForm(d):block('投稿内容','<p>'+esc(d.summary)+'</p><p class="read">'+esc(d.body)+'</p>'))];
  }
  const match = path.match(/^\/dreams\/([^/]+)(?:\/(checkout|read|report))?$/);
  if (match) {
    const d = state.dreams.find(d=>d.id===match[1]);
    if (d) return dreamScreen(d, match[2], query);
  }
  if (path === '/checkout/result') {
    const d=state.dreams.find(d=>d.id===query.get('id'));
    const status=query.get('status');
    if (state.signedIn && d) {
      if (status==='success' && state.purchased.includes(d.id)) return ['決済完了',notice(d.title+'の購入が完了しました。')+actions(btn('全文を読む',dreamPath(d)+'/read',null,true),btn('購入した夢','/account/library'))];
      if (status==='pending') return ['決済処理中',notice('決済結果の反映を待っています。')+actions('<button class="primary" data-pay="success" data-id="'+esc(d.id)+'">反映後の画面を確認（デモ）</button>',btn('本棚へ戻る','/dreams'))];
      if (['failed','cancelled'].includes(status)) return [status==='failed'?'決済失敗':'決済キャンセル',notice('購入手続きに戻って、もう一度お試しください。')+actions(btn('夢の鍵に戻る',dreamPath(d)+'/checkout',null,true))];
    }
  }
  if (['/admin/review','/admin/reports','/admin/transactions'].includes(path)) return admin(path,query);
  return ['ページが見つかりません',btn('トップへ','/',null,true)];
}

function dreamScreen(d, mode, query) {
  const base = dreamPath(d);
  const bought = state.signedIn && state.purchased.includes(d.id);
  if (d.status !== '公開中' && !(mode === 'report' && query.has('sent'))) return ['この夢は非公開です',actions(btn('本棚に戻る','/dreams'),btn('問い合わせ先','/help'))];
  if (mode === 'report') return ['通報',back('作品に戻る',query.get('from')==='read' ? base+'/read' : base)+ (query.has('sent') ? notice('通報を受け付けました。') : '<form class="card" data-form="report" data-id="'+esc(d.id)+'"><p>対象作品　'+esc(d.title)+'</p>'+field('通報理由','reason','',4)+submit('通報する')+'</form>')];
  if (mode === 'read') {
    if (!bought) return ['夢の全文',notice('全文は購入後に読めます。')+actions(btn('夢の扉へ',base,null,true))];
    return [d.title, back('購入した夢','/account/library')+block('夢の全文','<p class="read">'+esc(d.body)+'</p>')+link('この夢を通報する',base+'/report',{from:'read'})];
  }
  if (mode === 'checkout') {
    if (!state.signedIn) return ['夢の鍵',notice('購入にはログインが必要です。')+actions(btn('ログインして購入へ','/login',{next:base+'/checkout'},true),btn('会員登録','/signup',{next:base+'/checkout'}))];
    if (bought) return ['購入済み',actions(btn('全文を読む',base+'/read',null,true))];
    if (query.has('demo')) return ['外部決済（デモ）',back('夢の鍵',base+'/checkout')+notice('購入金額　150円（仮価格）')+block('決済結果を選ぶ','<div class="stack">'+[['success','成功'],['pending','処理中'],['failed','失敗'],['cancelled','キャンセル']].map(([value,label])=>'<button data-pay="'+value+'" data-id="'+esc(d.id)+'">'+label+'</button>').join('')+'</div>')];
    return ['夢の鍵',back('夢の扉',base)+block('購入内容','<p>'+esc(d.title)+'</p><p><strong>150円</strong>（仮価格）</p>'+actions(btn('外部決済へ進む（デモ）',base+'/checkout',{demo:1},true)))];
  }
  return [d.title,back('本棚','/dreams')+'<article class="card"><span class="tag">'+esc(d.genre)+'</span><h2>無料のあらすじ</h2><p>'+esc(d.summary)+'</p></article>'+block('夢の全文', (bought ? '<p>購入済み</p>' : '<p>全文1件 <strong>150円</strong>（仮価格）</p>') + actions(bought ? btn('全文を読む',base+'/read',null,true) : btn('夢の鍵へ進む',base+'/checkout',null,true)))+link('この夢を通報する',base+'/report')];
}

function postForm(d) {
  return '<form class="card" data-form="post" data-id="'+esc(d?.id)+'">'+
    field('タイトル','title',d?.title)+field('あらすじ（無料公開）','summary',d?.summary,3)+field('全文（購入者向け）','body',d?.body,6)+
    '<label>ジャンル<select name="genre">'+genres.map(g=>option(g,d?.genre)).join('')+'</select></label>'+
    '<label class="check"><input type="checkbox" required>実際に見た夢であると宣誓します</label><label class="check"><input type="checkbox" required>投稿ルールに同意します</label>'+link('投稿ルールを確認','/posting-rules')+submit(d?'修正して再提出':'審査へ提出')+'</form>';
}

function earnings(dreams) {
  return dreams.map(d=>{
    const sales = state.purchased.includes(d.id) ? 1 : 0;
    return block(d.title,'<p>販売 '+sales+' 件 · 報酬 '+(sales*90)+'円</p><p>支払い状況　'+(sales?'振込待ち':'対象なし')+'</p>');
  }).join('');
}

function admin(path, query) {
  const nav = notice('運営画面デモ') + actions(btn('投稿審査','/admin/review'),btn('通報・公開管理','/admin/reports'),btn('購入・報酬管理','/admin/transactions'));
  if (path === '/admin/transactions') return ['購入・報酬管理',nav+block('決済結果','<ul>'+(state.payments || []).map(entry=>'<li>'+esc(state.dreams.find(d=>d.id===entry.id)?.title)+' · '+({success:'成功',pending:'処理中',failed:'失敗',cancelled:'キャンセル'}[entry.status])+'</li>').join('')+'</ul>')+earnings(state.dreams.filter(d=>state.purchased.includes(d.id)))];
  if (path === '/admin/reports') return ['通報・公開管理',nav+(state.reports.length?state.reports.map((r,i)=>{
    const d=state.dreams.find(d=>d.id===r.id);
    return block(d.title,'<p>作品の状態　'+esc(d.status)+'</p><p class="read">'+esc(r.reason)+'</p>'+(r.note?notice('対応記録　'+r.note):'')+
      '<form data-form="moderate" data-index="'+i+'">'+field('対応記録','note',r.note,2)+'<label>公開状態<select name="status">'+['公開中','非公開'].map(s=>option(s,d.status)).join('')+'</select></label>'+submit('対応を保存')+'</form>');
  }).join(''):notice('通報はありません。作品の通報フォームから追加できます。'))];
  const d = state.dreams.find(d=>d.id===query.get('id') && d.status==='審査中');
  if (d) return ['投稿審査',nav+back('審査一覧','/admin/review')+block(d.title,'<p>'+esc(d.summary)+'</p><p class="read">'+esc(d.body)+'</p><p class="meta">安全確認　目視審査（AIによる補助は次段階候補）</p>')+
    '<form class="card" data-form="review" data-id="'+esc(d.id)+'"><label>審査結果<select name="status"><option>公開中</option><option>要修正</option><option>掲載見送り</option></select></label><label>修正依頼・判断理由<textarea name="reason" rows="3"></textarea></label>'+submit('審査結果を保存')+'</form>'];
  const queue = state.dreams.filter(d=>d.status==='審査中');
  return ['投稿審査',nav+(queue.length?queue.map(d=>block(d.title,btn('内容を確認',path,{id:d.id},true))).join(''):notice('審査中の投稿はありません。夢を投稿するとここに追加されます。'))];
}

function render(focus=true) {
  const [path,query] = route();
  const [title,body] = screen(path,query);
  main.classList.toggle('shop-home', path === '/');
  main.innerHTML=path === '/' ? body : '<h1>'+esc(title)+'</h1>'+body;
  document.title=path === '/' ? shopName+' β版' : title+' | '+shopName+' β版';
  const tab = path.startsWith('/dreams') || path.startsWith('/checkout') ? '/dreams' : path === '/account/dreams/new' ? path : path.startsWith('/account') ? '/account' : path;
  document.querySelectorAll('.tabs a').forEach(a=>{
    if (a.hash===url(tab)) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  if (focus) { window.scrollTo(0,0); main.focus({preventScroll:true}); }
}

main.addEventListener('change', event=>{
  if (event.target.name==='genre' && event.target.form?.dataset.form==='filter') go('/dreams',{genre:event.target.value});
  if (event.target.name==='status' && event.target.form?.dataset.form==='review') event.target.form.elements.reason.required = event.target.value==='要修正';
});
main.addEventListener('submit', event=>{
  event.preventDefault();
  const form=event.target;
  const fields=Object.fromEntries(new FormData(form));
  const [path,query]=route();
  const d=state.dreams.find(d=>d.id===form.dataset.id);
  switch(form.dataset.form) {
    case 'filter': go('/dreams',{genre:fields.genre}); break;
    case 'auth': {
      state.signedIn=true;
      save();
      const next=query.get('next');
      go(next?.startsWith('/') ? next : '/account');
      break;
    }
    case 'report': {
      state.reports.push({id:d.id,reason:fields.reason});
      save();
      go(path,{sent:1,from:query.get('from')||''});
      break;
    }
    case 'post': {
      const values={...fields,status:'審査中',reason:'',own:true};
      if (d) Object.assign(d,values);
      else state.dreams.push({id:String(Date.now()),...values});
      save();
      go('/account/dreams',{submitted:1});
      break;
    }
    case 'review':
      Object.assign(d,fields);
      save();
      go('/admin/review');
      break;
    case 'moderate': {
      const report=state.reports[Number(form.dataset.index)];
      report.note=fields.note;
      state.dreams.find(item=>item.id===report.id).status=fields.status;
      save();
      render();
      break;
    }
  }
});
document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if (!button) return;
  if (button.dataset.pay) {
    const {pay,id}=button.dataset;
    (state.payments ||= []).push({id,status:pay});
    if (pay==='success' && !state.purchased.includes(id)) state.purchased.push(id);
    save();
    go('/checkout/result',{id,status:pay});
  } else if (button.hasAttribute('data-logout')) {
    state.signedIn=false;
    save();
    go('/');
  } else if (button.hasAttribute('data-reset')) {
    state=initial();
    save();
    if (route()[0]==='/') render();
    else go('/');
  }
});
document.querySelector('.skip').addEventListener('click',event=>{ event.preventDefault(); main.focus(); });
window.addEventListener('hashchange',()=>render());
render(false);
