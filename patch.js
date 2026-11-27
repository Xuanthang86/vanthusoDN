/* patch.js – Văn thư số thành phố Đà Nẵng – bản vá 1 (chạy sau script chính của index.html) */
(function(){
const NB='\u00a0',q=s=>document.querySelector(s),at=s=>esc(s).replace(/"/g,'&quot;');

/* ---------- CSS bổ sung ---------- */
const st=document.createElement('style');st.textContent=`#toast{top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;background:#1e3a8a!important;font-size:16px;font-weight:600;padding:18px 28px;text-align:center;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.45)!important;max-width:min(520px,90%);cursor:pointer}
.cfg{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}.cfg>div{border:1px solid var(--bd);border-radius:10px;padding:12px}@media(max-width:760px){.cfg{grid-template-columns:1fr}}
.lr{display:grid;grid-template-columns:1fr 1.2fr 1fr auto;gap:6px;margin:5px 0}.lr input{padding:7px}
.btn.on{background:var(--pr);color:#fff;border-color:var(--pr)}.blk{margin-bottom:10px}
#cf .row{margin-bottom:4px}
.hs-fbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;background:var(--bg);border:1px solid var(--bd);border-radius:10px;margin-bottom:12px}
.hs-ftabs,.hs-facts{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.hs-ftabs .btn,.hs-facts .btn{padding:6px 10px;font-size:12.5px}
.lr2{display:grid;grid-template-columns:1.35fr 1fr auto;gap:6px;margin:5px 0}.lr2 input{padding:7px}
.dir-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.dir-tabs .btn{padding:6px 9px;font-size:12.5px}
.dir-box{border:1px solid var(--bd);border-radius:10px;padding:10px;background:var(--bg)}`;
document.head.appendChild(st);

/* ---------- Đổi tên ---------- */
document.title='Văn thư số thành phố Đà Nẵng';
q('header h1').textContent='Văn thư số thành phố Đà Nẵng';
q('#m-nn').textContent='Khối Chính quyền – NĐ 30/2020';
KB.forEach(k=>{k[0]=k[0].replace(/Nhà nước/g,'Chính quyền');k[1]=k[1].replace(/([Kk])hối Nhà nước/g,'$1hối Chính quyền')});

/* ---------- Thông báo giữa màn hình ---------- */
msg=function(t){const e=$('#toast');e.textContent=t;e.style.display='block';e.onclick=()=>e.style.display='none';clearTimeout(window._tt2);window._tt2=setTimeout(()=>e.style.display='none',4500)};

/* ---------- Danh bạ lãnh đạo theo từng khối ---------- */
C.leadersD=C.leadersD||'BÍ THƯ | | T/M ĐẢNG UỶ\nPHÓ BÍ THƯ | | ';
leaders=function(){return((mode=='dang'?C.leadersD:C.leaders)||'').split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(a=>a[0])};

/* ---------- Bọc các hàm dựng văn bản ---------- */
const isQBase=()=>mode=='nn'&&['QC','QyĐ'].includes(S.type);
const isQ=()=>isQBase()&&!S.qcDirect;
const _mk=mkTpl;mkTpl=function(k){const r=_mk(k);if(mode=='dang'&&r.nn)r.nn=r.nn.replace('Lưu Văn phòng.','Lưu VP.');if(mode=='nn'&&['QC','QyĐ'].includes(k)){r.nd=r.nd.replace(/^\(Ban hành[^\n]*\n+/,'');r.qcDirect=false}return r};

const _b=build;build=function(){let m;
 if(isQBase()){const t=S.type,dir=!!S.qcDirect;S.type='KH';try{m=_b()}finally{S.type=t}
  m.B[0].rs[0].x=name(t).toUpperCase();
  if(dir){const ab=TY(t)[2];m.L=m.L.map(o=>o.so?{...o,x:'Số:'+(S.so?' '+S.so:NB.repeat(14))+'/'+ab+'-'+C.nA}:o)}
  else{m.L=m.L.filter(o=>!o.so);
   const ri=m.B.findIndex(b=>b.rule);
   m.B.splice(ri+1,0,{rs:[{x:'Ban hành kèm theo Quyết định số'+NB.repeat(10)+'/QĐ-'+C.nA,i:1}],al:'c',gap:1});
   m.F={k:'none'}}
  m.plain=false}
 else m=_b();
 if(mode=='nn'&&kind()=='bb'&&m.F.k=='bb')m.F.nr=[];
 if(kind()=='pt'){m.B=m.B.filter(b=>!b.rule);const sp={rs:[{x:NB}],al:'c'};
  const ni=m.B.findIndex(b=>b.rs&&/^Người trình/.test(b.rs[0].x));if(ni>-1)m.B.splice(ni,0,sp,sp);
  const ki=m.B.findIndex(b=>b.rs&&/^Kính gửi/.test(b.rs[0].x));if(ki>-1)m.B.splice(ki,0,sp,sp)}
 return m};

const _r=render;render=function(){_r();
 if(kind()=='bb'){const l=$('#paper').lastElementChild;if(l&&/Nơi nhận/.test(l.textContent))l.remove()}};

const _dx=docXml;docXml=function(){let x=_dx();
 if(kind()=='bb')x=x.replace(/<w:p>(?:(?!<w:p>).)*?Nơi nhận:<\/w:t><\/w:r><\/w:p>/s,'');
 return x};

const _ck=check;check=function(t){return _ck(t).filter(r=>!(kind()=='bb'&&/Thiếu Nơi nhận/.test(r[1]))&&!(isQBase()&&/kèm theo Quyết định/.test(r[1]))&&!(isQ()&&(/Thiếu chức vụ hoặc họ tên/.test(r[1])||/Thiếu Nơi nhận/.test(r[1])))).map(r=>[r[0],r[1].replace(/([Kk])hối Nhà nước/g,'$1hối Chính quyền')])};

const _v=vis;vis=function(){_v();
 const kd=kind(),hideSo=(noSo()&&!S.qcDirect);
 const fSo=q('#f-so'),fQcd=q('#f-qcd');
 if(fSo)fSo.style.display=hideSo?'none':'';
 if(fQcd)fQcd.style.display=isQBase()?'':'none';
 if(kd=='bb'||isQ())$('#f-nn').style.display='none';
 if(isQ())$('#f-sg').style.display='none'};

const rsByMode={nn:{rs:'',res:''},dang:{rs:'',res:''}};
const _sm=setMode;setMode=function(m){const prev=mode,ch=m!=prev;
 if(ch&&q('#rs')){rsByMode[prev]={rs:q('#rs').value,res:q('#res')?q('#res').innerHTML:''}}
 _sm(m);$('#mtag').textContent=m=='nn'?'Khối Chính quyền – NĐ 30/2020':'Khối Đảng – HD 05-HD/VPTW';fillLead();
 if(ch){
  if(q('#rs')){const st=rsByMode[m]||{rs:'',res:''};q('#rs').value=st.rs;if(q('#res'))q('#res').innerHTML=st.res}
  if(q('#ai-out'))q('#ai-out').style.display='none';if(q('#ai-err'))q('#ai-err').innerHTML='';
  if(typeof syncModeFilters==='function')syncModeFilters(m);
  sync();render();
 }};

/* ---------- In / Lưu PDF (mở cửa sổ riêng) ---------- */
$('#print').onclick=()=>{const w=window.open('','_blank');
 if(!w){try{window.print()}catch(e){msg('Trình duyệt chặn cửa sổ in – hãy cho phép cửa sổ bật lên rồi bấm lại.')}return}
 w.document.write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>'+esc(S.ty||'Văn bản')+'</title><style>@page{size:A4;margin:20mm 20mm 20mm 30mm}body{margin:0;font:14pt/1.0 "Times New Roman",Times,serif;color:#000}.hd{display:grid;grid-template-columns:minmax(0,4121fr) minmax(0,4950fr);gap:0;text-align:center;font-size:13pt;line-height:1.0}.hd>div{min-width:0}p{margin:0;text-align:justify;line-height:1.0}.ln{border-top:1px solid #000;margin:2pt auto}</style></head><body>'+$('#paper').innerHTML+'</body></html>');
 w.document.close();w.focus();setTimeout(()=>{w.print()},500);msg('Đã mở cửa sổ in – chọn “Lưu dưới dạng PDF” để lưu.')};

/* ---------- Danh mục đơn vị phân cấp ---------- */
const mk=(id,n,p,a,f,s)=>({id,n,p,a:a||'',f:f||n,s:s||''});
const SO=[['skhcn','SỞ KHOA HỌC VÀ CÔNG NGHỆ','SKHCN'],['snv','SỞ NỘI VỤ','SNV'],['stp','SỞ TƯ PHÁP','STP'],['stc','SỞ TÀI CHÍNH','STC'],['sct','SỞ CÔNG THƯƠNG','SCT'],['sxd','SỞ XÂY DỰNG','SXD'],['snn','SỞ NÔNG NGHIỆP VÀ MÔI TRƯỜNG','SNNMT'],['sgd','SỞ GIÁO DỤC VÀ ĐÀO TẠO','SGDĐT'],['syt','SỞ Y TẾ','SYT'],['svh','SỞ VĂN HÓA, THỂ THAO VÀ DU LỊCH','SVHTTDL'],['sdt','SỞ DÂN TỘC VÀ TÔN GIÁO','SDTTG'],['sng','SỞ NGOẠI VỤ','SNGV']];
const DEF={cq:[mk('ub','UBND THÀNH PHỐ ĐÀ NẴNG',''),
 ...SO.map(s=>mk(s[0],s[1],'ub',s[2],s[1]+' THÀNH PHỐ ĐÀ NẴNG')),
 mk('vpub','VĂN PHÒNG ỦY BAN NHÂN DÂN THÀNH PHỐ','ub','VP'),mk('tt','THANH TRA THÀNH PHỐ','ub','TTr'),
 mk('bql','BAN QUẢN LÝ KHU CÔNG NGHỆ CAO VÀ CÁC KHU CÔNG NGHIỆP','ub','BQL'),
 mk('ttdmst','TRUNG TÂM ĐỔI MỚI SÁNG TẠO','skhcn','TTĐMST','TRUNG TÂM ĐỔI MỚI SÁNG TẠO ĐÀ NẴNG','Trung tâm Đổi mới sáng tạo Đà Nẵng'),
 mk('qttc','PHÒNG QUẢN TRỊ - TÀI CHÍNH','ttdmst','QTTC','PHÒNG QUẢN TRỊ - TÀI CHÍNH','Phòng Quản trị - Tài chính'),
 mk('pthst','PHÒNG PHÁT TRIỂN HỆ SINH THÁI ĐỔI MỚI SÁNG TẠO','ttdmst','PTHST','PHÒNG PHÁT TRIỂN HỆ SINH THÁI ĐỔI MỚI SÁNG TẠO','Phòng Phát triển hệ sinh thái đổi mới sáng tạo'),
 mk('tttk','PHÒNG THÔNG TIN - THỐNG KÊ','ttdmst','TTTK','PHÒNG THÔNG TIN - THỐNG KÊ','Phòng Thông tin - Thống kê'),
 mk('cnsh','PHÒNG CÔNG NGHỆ SINH HỌC','ttdmst','CNSH','PHÒNG CÔNG NGHỆ SINH HỌC','Phòng Công nghệ sinh học'),
 mk('vmbd','PHÒNG VI MẠCH, BÁN DẪN VÀ TRÍ TUỆ NHÂN TẠO','ttdmst','VMBD','PHÒNG VI MẠCH, BÁN DẪN VÀ TRÍ TUỆ NHÂN TẠO','Phòng Vi mạch, bán dẫn và trí tuệ nhân tạo'),
 mk('pttt','PHÒNG PHÁT TRIỂN THỊ TRƯỜNG KHOA HỌC VÀ CÔNG NGHỆ','ttdmst','PTTT','PHÒNG PHÁT TRIỂN THỊ TRƯỜNG KHOA HỌC VÀ CÔNG NGHỆ','Phòng Phát triển thị trường khoa học và công nghệ')],
 dang:[mk('tu','THÀNH UỶ ĐÀ NẴNG',''),
 mk('du1','ĐẢNG UỶ SỞ KHOA HỌC VÀ CÔNG NGHỆ','tu','ĐU'),mk('du2','ĐẢNG UỶ UBND THÀNH PHỐ ĐÀ NẴNG','tu','ĐU'),
 mk('b1','VĂN PHÒNG THÀNH UỶ','tu','VPTU'),mk('b2','BAN TỔ CHỨC THÀNH UỶ','tu','BTCTU'),mk('b3','UỶ BAN KIỂM TRA THÀNH UỶ','tu','UBKTTU'),mk('b4','BAN TUYÊN GIÁO VÀ DÂN VẬN THÀNH UỶ','tu','BTGDVTU'),
 mk('cb1','CHI BỘ TRUNG TÂM ĐỔI MỚI SÁNG TẠO','du1','CB','CHI BỘ TRUNG TÂM ĐỔI MỚI SÁNG TẠO')]};
const OT=ls.g('vts-org',null)||DEF;
(function migrateOrg(){
 if(!OT||!Array.isArray(OT.cq))return;
 let dirty=false;
 const upsert=(item)=>{const cur=OT.cq.find(x=>x.id==item.id);if(!cur){OT.cq.push(item);dirty=true}else if(cur.n!=item.n||cur.p!=item.p||cur.f!=item.f||cur.s!=item.s||cur.a!=item.a){Object.assign(cur,item);dirty=true}};
 upsert(mk('skhcn','SỞ KHOA HỌC VÀ CÔNG NGHỆ','ub','SKHCN','SỞ KHOA HỌC VÀ CÔNG NGHỆ THÀNH PHỐ ĐÀ NẴNG'));
 upsert(mk('ttdmst','TRUNG TÂM ĐỔI MỚI SÁNG TẠO','skhcn','TTĐMST','TRUNG TÂM ĐỔI MỚI SÁNG TẠO ĐÀ NẴNG','Trung tâm Đổi mới sáng tạo Đà Nẵng'));
 [
  mk('qttc','PHÒNG QUẢN TRỊ - TÀI CHÍNH','ttdmst','QTTC','PHÒNG QUẢN TRỊ - TÀI CHÍNH','Phòng Quản trị - Tài chính'),
  mk('pthst','PHÒNG PHÁT TRIỂN HỆ SINH THÁI ĐỔI MỚI SÁNG TẠO','ttdmst','PTHST','PHÒNG PHÁT TRIỂN HỆ SINH THÁI ĐỔI MỚI SÁNG TẠO','Phòng Phát triển hệ sinh thái đổi mới sáng tạo'),
  mk('tttk','PHÒNG THÔNG TIN - THỐNG KÊ','ttdmst','TTTK','PHÒNG THÔNG TIN - THỐNG KÊ','Phòng Thông tin - Thống kê'),
  mk('cnsh','PHÒNG CÔNG NGHỆ SINH HỌC','ttdmst','CNSH','PHÒNG CÔNG NGHỆ SINH HỌC','Phòng Công nghệ sinh học'),
  mk('vmbd','PHÒNG VI MẠCH, BÁN DẪN VÀ TRÍ TUỆ NHÂN TẠO','ttdmst','VMBD','PHÒNG VI MẠCH, BÁN DẪN VÀ TRÍ TUỆ NHÂN TẠO','Phòng Vi mạch, bán dẫn và trí tuệ nhân tạo'),
  mk('pttt','PHÒNG PHÁT TRIỂN THỊ TRƯỜNG KHOA HỌC VÀ CÔNG NGHỆ','ttdmst','PTTT','PHÒNG PHÁT TRIỂN THỊ TRƯỜNG KHOA HỌC VÀ CÔNG NGHỆ','Phòng Phát triển thị trường khoa học và công nghệ')
 ].forEach(upsert);
 if(dirty)ls.s('vts-org',OT);
 if(C.nO=='TRUNG TÂM ĐỔI MỚI SÁNG TẠO ĐÀ NẴNG'){C.nO='TRUNG TÂM ĐỔI MỚI SÁNG TẠO';const e=q('[data-c=nO]');if(e)e.value=C.nO}
 if(C.nP=='TRUNG TÂM ĐỔI MỚI SÁNG TẠO'){C.nP='TRUNG TÂM ĐỔI MỚI SÁNG TẠO ĐÀ NẴNG';const e=q('[data-c=nP]');if(e)e.value=C.nP}
})();

const card=q('#cf .card'),kids=[...card.children],fi=t=>kids.findIndex(e=>e.tagName=='B'&&e.textContent.includes(t));
const ia=fi('Khối Nhà nước'),id_=fi('Khối Đảng'),il=fi('Danh bạ');
const Lc=document.createElement('div'),Rc=document.createElement('div');
kids.slice(ia,id_).forEach(e=>Lc.appendChild(e));kids.slice(id_,il).forEach(e=>Rc.appendChild(e));
Lc.firstElementChild.textContent='Khối Chính quyền';
const g=document.createElement('div');g.className='cfg';g.append(Lc,Rc);card.insertBefore(g,kids[il]);card.style.maxWidth='none';
kids[il].style.display='none';kids[il+1].style.display='none';
const ta=kids[il+2];

function setC(k,v){const e=q('[data-c='+k+']');if(e){e.value=v;C[k]=v}}
const sent=s=>{s=s.toLowerCase();return(s[0].toUpperCase()+s.slice(1)).replace(/đà nẵng/g,'Đà Nẵng')};

function orgUI(box,key,F){const nodes=()=>OT[key],by=i=>nodes().find(x=>x.id==i),dp=x=>x.p&&by(x.p)?1+dp(by(x.p)):0;
 const w=document.createElement('div');
 w.innerHTML='<label>Chọn cơ quan chủ quản (cấp trên)</label><select class="op"></select><label>Chọn cơ quan ban hành (cấp dưới của cơ quan chủ quản)</label><select class="oo"></select><label>Thêm đơn vị cấp dưới cho cơ quan chủ quản đang chọn (lưu cục bộ trên trình duyệt)</label><div class="row"><input class="on" maxlength="120" placeholder="TÊN ĐƠN VỊ (in hoa)"><input class="oa" maxlength="20" placeholder="Viết tắt (nếu có)"></div><div class="bar" style="margin-top:6px"><button type="button" class="btn add-u">+ Thêm đơn vị</button><button type="button" class="btn del-u" style="display:none">Xóa đơn vị tự thêm</button><button type="button" class="btn rst-u" style="display:none">Khôi phục gốc</button></div>';
 box.firstElementChild.after(w);
 const sp=w.querySelector('.op'),so=w.querySelector('.oo'),bAdd=w.querySelector('.add-u'),bDel=w.querySelector('.del-u'),bRst=w.querySelector('.rst-u');
 const isRoom=x=>/^PHÒNG\b/i.test(x.n)&&!nodes().some(c=>c.p===x.id);
 const tree=()=>{const out=[],seen=new Set(),walk=pid=>{nodes().filter(x=>(x.p||'')==pid&&!isRoom(x)).forEach(x=>{if(seen.has(x.id))return;seen.add(x.id);out.push(x);walk(x.id)})};walk('');nodes().filter(x=>!isRoom(x)&&!seen.has(x.id)).forEach(x=>out.push(x));return out};
 const updBtns=()=>{const cur=by(so.value);const hasCustom=nodes().some(x=>x.custom);bDel.style.display=(cur&&cur.custom&&!nodes().some(c=>c.p===cur.id))?'':'none';bRst.style.display=hasCustom?'':'none'};
 const fillP=()=>{sp.innerHTML=tree().map(x=>`<option value="${x.id}">${'– '.repeat(dp(x))+esc(x.f)}</option>`).join('')};
 const fillO=()=>{so.innerHTML=nodes().filter(x=>x.p==sp.value).map(x=>`<option value="${x.id}">${esc(x.n)}${x.custom?' (tự thêm)':''}</option>`).join('')||'<option value="">(chưa có đơn vị cấp dưới)</option>';updBtns()};
 const apply=()=>{const p=by(sp.value),o=by(so.value);if(p)setC(F.P,p.f);if(o){setC(F.O,o.n);if(o.a)setC(F.A,o.a);if(F.N)setC(F.N,o.s||sent(o.f))}updBtns();render()};
 const init=()=>{fillP();const p=nodes().find(x=>!isRoom(x)&&x.f==C[F.P]);if(p)sp.value=p.id;fillO();const o=nodes().find(x=>x.p==sp.value&&(x.n==C[F.O]||x.f==C[F.O]||C[F.O]&&x.n.indexOf(C[F.O])===0));if(o)so.value=o.id;updBtns()};
 sp.onchange=()=>{fillO();apply()};so.onchange=apply;
 bAdd.onclick=()=>{
  const n=w.querySelector('.on').value.replace(/\s+/g,' ').trim().toUpperCase();
  const a=w.querySelector('.oa').value.replace(/\s+/g,'').trim().toUpperCase();
  if(n.length<3){msg('Tên đơn vị phải có ít nhất 3 ký tự.');return}
  const pid=sp.value;
  if(nodes().some(x=>x.p==pid&&x.n==n)){msg('Đơn vị “'+n+'” đã tồn tại trong cơ quan chủ quản này.');return}
  if(nodes().filter(x=>x.custom).length>=30){msg('Tối đa 30 đơn vị tự thêm mỗi khối. Hãy xóa bớt đơn vị không dùng.');return}
  const nid=key+Date.now();
  const item=mk(nid,n,pid,a);item.custom=true;
  nodes().push(item);ls.s('vts-org',OT);
  fillP();sp.value=pid;fillO();so.value=nid;apply();w.querySelector('.on').value='';w.querySelector('.oa').value='';msg('Đã thêm đơn vị “'+n+'” (chỉ lưu trên trình duyệt của bạn).')};
 bDel.onclick=async()=>{
  const cur=by(so.value);if(!cur||!cur.custom)return;
  if(nodes().some(c=>c.p===cur.id)){msg('Không thể xóa khi vẫn còn đơn vị cấp dưới trực thuộc.');return}
  if(!(await uiConfirm('Bạn có chắc muốn xóa đơn vị tự thêm “'+cur.n+'”?','Xác nhận xóa đơn vị')))return;
  OT[key]=nodes().filter(x=>x.id!==cur.id);ls.s('vts-org',OT);
  const pid=sp.value;fillP();sp.value=pid;fillO();apply();msg('Đã xóa đơn vị tự thêm “'+cur.n+'”.')};
 bRst.onclick=async()=>{
  if(!(await uiConfirm('Bạn có chắc muốn xóa tất cả đơn vị tự thêm và khôi phục danh mục gốc?','Xác nhận khôi phục gốc','Khôi phục')))return;
  OT[key]=nodes().filter(x=>!x.custom);ls.s('vts-org',OT);
  init();apply();msg('Đã khôi phục danh mục đơn vị gốc.')};
 init()}

function led(box,t,title){const h=document.createElement('b');h.style.cssText='display:block;margin-top:14px';h.textContent=title;const w=document.createElement('div');box.append(h,w,t);t.style.display='none';
 const rows=()=>t.value.split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(a=>a.some(Boolean)),
 coll=()=>[...w.querySelectorAll('.lr')].map(r=>[...r.querySelectorAll('input')].map(i=>i.value.replace(/\|/g,'').trim())),
 save=a=>{t.value=a.map(r=>r.join(' | ')).join('\n');t.dispatchEvent(new Event('input',{bubbles:true}))},
 draw=(a=rows())=>{w.innerHTML='<div class="mu" style="font-size:12px">Chức vụ · Họ và tên · Quyền hạn ký (nếu có, tối đa 30 người)</div>'+a.map((r,i)=>`<div class="lr">${[0,1,2].map(j=>`<input maxlength="80" value="${at(r[j]||'')}" placeholder="${['Chức vụ','Họ và tên','VD: KT. GIÁM ĐỐC'][j]}">`).join('')}<button type="button" class="btn" data-x="${i}" title="Xóa">×</button></div>`).join('')+'<button type="button" class="btn" data-a="1">+ Thêm người</button>'};
 w.addEventListener('input',()=>save(coll()));
 w.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const a=coll();
  if(b.dataset.x!=null){const idx=+b.dataset.x,r=a[idx]||[];const lbl=[r[0],r[1]].filter(Boolean).join(' – ')||'mục này';if(!(await uiConfirm('Bạn có chắc muốn xóa “'+lbl+'” khỏi danh bạ lãnh đạo?','Xác nhận xóa')))return;a.splice(idx,1);save(a);draw()}
  else{
   if(a.length>=30){msg('Danh bạ lãnh đạo tối đa 30 người cho mỗi khối.');return}
   if(a.some(r=>!r[0]&&!r[1])){msg('Hãy nhập thông tin vào dòng trống hiện có trước khi thêm người mới.');return}
   a.push(['','','']);draw(a)
  }});
 draw()}

orgUI(Lc,'cq',{P:'nP',O:'nO',A:'nA',N:'nOn'});
orgUI(Rc,'dang',{P:'dP',O:'dO',A:'dA'});

/* ---------- Danh bạ nhân sự & phòng chuyên môn (Chính quyền) ---------- */
const DEF_DIR={
 ttLead:[
  {role:'GIÁM ĐỐC TRUNG TÂM',name:'',power:''},
  {role:'PHÓ GIÁM ĐỐC TRUNG TÂM',name:'',power:'KT. GIÁM ĐỐC'},
  {role:'PHÓ GIÁM ĐỐC TRUNG TÂM',name:'',power:'KT. GIÁM ĐỐC'}
 ],
 ttDepts:[
  {dept:'Phòng Thông tin - Thống kê',role:'TRƯỞNG PHÒNG',name:''},
  {dept:'Phòng Thông tin - Thống kê',role:'PHÓ TRƯỞNG PHÒNG',name:''},
  {dept:'Phòng Quản trị - Tài chính',role:'TRƯỞNG PHÒNG',name:''},
  {dept:'Phòng Phát triển hệ sinh thái đổi mới sáng tạo',role:'TRƯỞNG PHÒNG',name:''},
  {dept:'Phòng Công nghệ sinh học',role:'TRƯỞNG PHÒNG',name:''},
  {dept:'Phòng Vi mạch, bán dẫn và trí tuệ nhân tạo',role:'TRƯỞNG PHÒNG',name:''},
  {dept:'Phòng Phát triển thị trường khoa học và công nghệ',role:'TRƯỞNG PHÒNG',name:''}
 ],
 specialists:[
  {dept:'Phòng Thông tin - Thống kê',role:'Chuyên viên',name:''}
 ],
 soLead:[
  {role:'GIÁM ĐỐC SỞ',name:'',power:''},
  {role:'PHÓ GIÁM ĐỐC SỞ',name:'',power:'KT. GIÁM ĐỐC'},
  {role:'PHÓ GIÁM ĐỐC SỞ',name:'',power:'KT. GIÁM ĐỐC'}
 ],
 soDepts:[
  {name:'Văn phòng Sở',head:''},
  {name:'Phòng Kế hoạch - Tài chính',head:''},
  {name:'Phòng Quản lý Khoa học',head:''},
  {name:'Phòng Quản lý Công nghệ và Chuyên ngành',head:''},
  {name:'Phòng Chuyển đổi số',head:''},
  {name:'Phòng Bưu chính, Viễn thông và An toàn thông tin',head:''},
  {name:'Thanh tra Sở',head:''}
 ]
};
const cloneDir=d=>JSON.parse(JSON.stringify(d));
function ensureDir(){
 const had=C.dir&&typeof C.dir==='object';
 if(!had){
  C.dir=cloneDir(DEF_DIR);
  const old=(C.leaders||'').split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(a=>a[0]&&a[1]);
  old.forEach(([role,name,power])=>{
   const isPgd=/PHÓ/i.test(role);
   const slot=C.dir.ttLead.find(x=>!x.name&&(/PHÓ/i.test(x.role)===isPgd));
   if(slot){slot.role=role;slot.name=name;if(power)slot.power=power}
   else C.dir.ttLead.push({role,name,power:power||''});
  });
 }
 ['ttLead','ttDepts','specialists','soLead','soDepts'].forEach(k=>{
  if(!Array.isArray(C.dir[k]))C.dir[k]=cloneDir(DEF_DIR[k]);
 });
 C.dir.ttLead=C.dir.ttLead.map(x=>({role:String(x.role||''),name:String(x.name||''),power:String(x.power||'')}));
 C.dir.soLead=C.dir.soLead.map(x=>({role:String(x.role||''),name:String(x.name||''),power:String(x.power||'')}));
 C.dir.ttDepts=C.dir.ttDepts.map(x=>({dept:String(x.dept||''),role:String(x.role||''),name:String(x.name||'')}));
 C.dir.specialists=C.dir.specialists.map(x=>({dept:String(x.dept||''),role:String(x.role||'Chuyên viên'),name:String(x.name||'')}));
 C.dir.soDepts=C.dir.soDepts.map(x=>({name:String(x.name||''),head:String(x.head||'')}));
}
ensureDir();

function syncDirToLegacy(){
 ensureDir();
 C.leaders=C.dir.ttLead.filter(x=>x.role||x.name).map(x=>[x.role,x.name,x.power].join(' | ')).join('\n');
 ta.value=C.leaders;
}
syncDirToLegacy();

function getTtRooms(){
 ensureDir();
 const out=[],seen=new Set(),add=v=>{const s=String(v||'').trim();if(s&&!seen.has(s.toLowerCase())){seen.add(s.toLowerCase());out.push(s)}};
 C.dir.ttDepts.forEach(x=>add(x.dept));
 C.dir.specialists.forEach(x=>add(x.dept));
 if(OT&&Array.isArray(OT.cq))OT.cq.filter(x=>x.p==='ttdmst').forEach(x=>add(x.s||sent(x.n)));
 return out;
}

const DIR_TABS=[
 ['ttLead','Lãnh đạo Trung tâm','+ Thêm lãnh đạo đơn vị','Chức vụ · Họ và tên · Quyền hạn ký (nếu có)'],
 ['ttDepts','Trưởng/Phó phòng','+ Thêm trưởng/phó phòng','Phòng · Chức danh (Trưởng/Phó phòng) · Họ và tên'],
 ['specialists','Chuyên viên','+ Thêm chuyên viên','Phòng · Chức danh (VD: Chuyên viên) · Họ và tên'],
 ['soLead','Lãnh đạo Sở','+ Thêm lãnh đạo Sở','Chức vụ · Họ và tên · Quyền hạn ký (nếu có)'],
 ['soDepts','Phòng chuyên môn Sở','+ Thêm phòng chuyên môn','Tên phòng chuyên môn Sở · Lãnh đạo phòng (tùy chọn)']
];
let dirTab='ttLead',_redrawDir=()=>{};

function staffDirUI(box,t){
 const h=document.createElement('b');h.style.cssText='display:block;margin-top:14px';h.textContent='Danh bạ nhân sự & phòng chuyên môn – Khối Chính quyền';
 const sub=document.createElement('p');sub.className='mu';sub.style.margin='4px 0 6px';sub.textContent='Điền sẵn Ban Lãnh đạo Sở, Ban Lãnh đạo Trung tâm, Trưởng/Phó phòng, Chuyên viên và các phòng chuyên môn để chọn nhanh khi soạn thảo. Đơn vị khác có thể sửa, thêm hoặc xóa tùy ý.';
 const dlRooms=document.createElement('datalist');dlRooms.id='dl-tt-depts';
 const tabs=document.createElement('div');tabs.className='dir-tabs';
 const w=document.createElement('div');w.className='dir-box';
 box.append(h,sub,dlRooms,tabs,w,t);t.style.display='none';

 const updRooms=()=>{dlRooms.innerHTML=getTtRooms().map(r=>`<option value="${at(r)}">`).join('')};
 const cntOf=k=>k==='soDepts'?C.dir[k].filter(x=>x.name.trim()).length:C.dir[k].filter(x=>x.name.trim()).length+'/'+C.dir[k].length;

 const draw=()=>{
  ensureDir();updRooms();
  tabs.innerHTML=DIR_TABS.map(([k,lbl])=>`<button type="button" class="btn${dirTab===k?' on':''}" data-dt="${k}">${esc(lbl)} (${cntOf(k)})</button>`).join('');
  const meta=DIR_TABS.find(x=>x[0]===dirTab);
  const arr=C.dir[dirTab];
  let rowsHtml='';
  if(dirTab==='ttLead'||dirTab==='soLead'){
   rowsHtml=arr.map((r,i)=>`<div class="lr"><input maxlength="80" data-f="role" value="${at(r.role)}" placeholder="Chức vụ"><input maxlength="80" data-f="name" value="${at(r.name)}" placeholder="Họ và tên"><input maxlength="60" data-f="power" value="${at(r.power)}" placeholder="VD: KT. GIÁM ĐỐC"><button type="button" class="btn" data-x="${i}" title="Xóa">×</button></div>`).join('');
  }else if(dirTab==='ttDepts'){
   rowsHtml=arr.map((r,i)=>`<div class="lr"><input maxlength="100" list="dl-tt-depts" data-f="dept" value="${at(r.dept)}" placeholder="Tên phòng"><input maxlength="60" data-f="role" value="${at(r.role)}" placeholder="TRƯỞNG PHÒNG / PHÓ TRƯỞNG PHÒNG"><input maxlength="80" data-f="name" value="${at(r.name)}" placeholder="Họ và tên"><button type="button" class="btn" data-x="${i}" title="Xóa">×</button></div>`).join('');
  }else if(dirTab==='specialists'){
   rowsHtml=arr.map((r,i)=>`<div class="lr"><input maxlength="100" list="dl-tt-depts" data-f="dept" value="${at(r.dept)}" placeholder="Thuộc phòng"><input maxlength="60" data-f="role" value="${at(r.role)}" placeholder="Chuyên viên"><input maxlength="80" data-f="name" value="${at(r.name)}" placeholder="Họ và tên"><button type="button" class="btn" data-x="${i}" title="Xóa">×</button></div>`).join('');
  }else{
   rowsHtml=arr.map((r,i)=>`<div class="lr2"><input maxlength="120" data-f="name" value="${at(r.name)}" placeholder="Tên phòng chuyên môn của Sở"><input maxlength="80" data-f="head" value="${at(r.head)}" placeholder="Lãnh đạo phòng (tùy chọn)"><button type="button" class="btn" data-x="${i}" title="Xóa">×</button></div>`).join('');
  }
  w.innerHTML=`<div class="mu" style="font-size:12px;margin-bottom:4px">${esc(meta[3])} (tối đa 60 mục)</div>${rowsHtml||'<p class="mu">Chưa có mục nào.</p>'}<div class="bar" style="margin-top:8px"><button type="button" class="btn" data-add="1">${esc(meta[2])}</button><button type="button" class="btn" data-rst="1">Khôi phục mẫu TTĐMST & Sở KH&CN</button></div>`;
 };

 tabs.onclick=e=>{const b=e.target.closest('[data-dt]');if(!b)return;dirTab=b.dataset.dt;draw()};
 w.addEventListener('input',e=>{
  const inp=e.target.closest('input[data-f]');if(!inp)return;
  const row=inp.closest('.lr,.lr2');if(!row)return;
  const idx=[...w.querySelectorAll('.lr,.lr2')].indexOf(row);
  if(idx<0||!C.dir[dirTab][idx])return;
  C.dir[dirTab][idx][inp.dataset.f]=inp.value.replace(/\|/g,'');
  if(dirTab==='ttLead')syncDirToLegacy();
  fillLead();fillPtPickers();
  const actTab=tabs.querySelector(`[data-dt="${dirTab}"]`);
  const meta=DIR_TABS.find(x=>x[0]===dirTab);
  if(actTab&&meta)actTab.textContent=`${meta[1]} (${cntOf(dirTab)})`;
 });
 w.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.x!=null){
   const idx=+b.dataset.x,item=C.dir[dirTab][idx];if(!item)return;
   const lbl=[item.role,item.name||item.dept].filter(Boolean).join(' – ')||'mục này';
   if(!(await uiConfirm('Bạn có chắc muốn xóa “'+lbl+'” khỏi danh bạ?','Xác nhận xóa')))return;
   C.dir[dirTab].splice(idx,1);
   if(dirTab==='ttLead')syncDirToLegacy();
   draw();fillLead();fillPtPickers();return;
  }
  if(b.dataset.add){
   if(C.dir[dirTab].length>=60){msg('Mỗi nhóm tối đa 60 mục.');return}
   const emptyRow=dirTab==='ttLead'?{role:'PHÓ GIÁM ĐỐC TRUNG TÂM',name:'',power:'KT. GIÁM ĐỐC'}:dirTab==='soLead'?{role:'PHÓ GIÁM ĐỐC SỞ',name:'',power:'KT. GIÁM ĐỐC'}:dirTab==='ttDepts'?{dept:getTtRooms()[0]||'',role:'PHÓ TRƯỞNG PHÒNG',name:''}:dirTab==='specialists'?{dept:getTtRooms()[0]||'',role:'Chuyên viên',name:''}:{name:'',head:''};
   C.dir[dirTab].push(emptyRow);draw();return;
  }
  if(b.dataset.rst){
   if(!(await uiConfirm('Bạn có chắc muốn khôi phục danh bạ nhân sự & phòng chuyên môn về mẫu mặc định của Trung tâm Đổi mới sáng tạo và Sở KH&CN? Các tên tự nhập sẽ bị đặt lại.','Xác nhận khôi phục mẫu','Khôi phục')))return;
   C.dir=cloneDir(DEF_DIR);syncDirToLegacy();draw();fillLead();fillPtPickers();msg('Đã khôi phục mẫu danh bạ TTĐMST & Sở KH&CN.');
  }
 });
 _redrawDir=draw;
 draw();
}

function led(box,t,title){const h=document.createElement('b');h.style.cssText='display:block;margin-top:14px';h.textContent=title;const w=document.createElement('div');box.append(h,w,t);t.style.display='none';
 const rows=()=>t.value.split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(a=>a.some(Boolean)),
 coll=()=>[...w.querySelectorAll('.lr')].map(r=>[...r.querySelectorAll('input')].map(i=>i.value.replace(/\|/g,'').trim())),
 save=a=>{t.value=a.map(r=>r.join(' | ')).join('\n');t.dispatchEvent(new Event('input',{bubbles:true}))},
 draw=(a=rows())=>{w.innerHTML='<div class="mu" style="font-size:12px">Chức vụ · Họ và tên · Quyền hạn ký (nếu có, tối đa 30 người)</div>'+a.map((r,i)=>`<div class="lr">${[0,1,2].map(j=>`<input maxlength="80" value="${at(r[j]||'')}" placeholder="${['Chức vụ','Họ và tên','VD: KT. GIÁM ĐỐC'][j]}">`).join('')}<button type="button" class="btn" data-x="${i}" title="Xóa">×</button></div>`).join('')+'<button type="button" class="btn" data-a="1">+ Thêm người</button>'};
 w.addEventListener('input',()=>save(coll()));
 w.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const a=coll();
  if(b.dataset.x!=null){const idx=+b.dataset.x,r=a[idx]||[];const lbl=[r[0],r[1]].filter(Boolean).join(' – ')||'mục này';if(!(await uiConfirm('Bạn có chắc muốn xóa “'+lbl+'” khỏi danh bạ lãnh đạo?','Xác nhận xóa')))return;a.splice(idx,1);save(a);draw()}
  else{
   if(a.length>=30){msg('Danh bạ lãnh đạo tối đa 30 người cho mỗi khối.');return}
   if(a.some(r=>!r[0]&&!r[1])){msg('Hãy nhập thông tin vào dòng trống hiện có trước khi thêm người mới.');return}
   a.push(['','','']);draw(a)
  }});
 draw()}

staffDirUI(Lc,ta);
const t2=ta.cloneNode(false);t2.setAttribute('data-c','leadersD');t2.value=C.leadersD;
t2.addEventListener('input',()=>{C.leadersD=t2.value;fillLead()});
led(Rc,t2,'Danh bạ lãnh đạo – Khối Đảng (Bí thư, Phó Bí thư…)');

/* ---------- Chọn nhanh người ký & nhân sự Phiếu trình ---------- */
let _leadMap=[];
fillLead=function(){
 ensureDir();
 const sel=$('#lead'),dl=$('#dl-names');
 const names=new Set();
 const addName=v=>{const s=String(v||'').trim();if(s)names.add(s)};
 C.dir.ttLead.forEach(x=>addName(x.name));
 C.dir.soLead.forEach(x=>addName(x.name));
 C.dir.ttDepts.forEach(x=>addName(x.name));
 C.dir.specialists.forEach(x=>addName(x.name));
 C.dir.soDepts.forEach(x=>addName(x.head));
 (C.leadersD||'').split('\n').forEach(x=>{const p=x.split('|')[1];if(p)addName(p)});
 if(dl)dl.innerHTML=[...names].map(n=>`<option value="${at(n)}">`).join('');

 if(!sel)return;
 if(mode==='dang'){
  const ld=leaders();
  _leadMap=ld.map(a=>({cv:a[0]||'',ten:a[1]||'',quyen:a[2]||''}));
  sel.innerHTML='<option value="">— chọn —</option>'+_leadMap.map((x,i)=>`<option value="${i}">${esc(x.cv+(x.ten?' – '+x.ten:''))}</option>`).join('');
  return;
 }
 _leadMap=[];
 const grp=(title,items)=>{
  const opts=items.map(it=>{const idx=_leadMap.length;_leadMap.push(it.data);return `<option value="${idx}">${esc(it.label)}</option>`}).join('');
  return opts?`<optgroup label="${at(title)}">${opts}</optgroup>`:'';
 };
 const g1=grp('Ban Lãnh đạo Trung tâm / Đơn vị',C.dir.ttLead.filter(x=>x.role||x.name).map(x=>({label:x.role+(x.name?' – '+x.name:' (chưa nhập tên)'),data:{cv:x.role,ten:x.name,quyen:x.power}})));
 const g2=grp('Ban Lãnh đạo Sở / Cơ quan cấp trên',C.dir.soLead.filter(x=>x.role||x.name).map(x=>({label:x.role+(x.name?' – '+x.name:' (chưa nhập tên)'),data:{cv:x.role,ten:x.name,quyen:x.power}})));
 const g3=grp('Trưởng / Phó các phòng',C.dir.ttDepts.filter(x=>x.name||x.dept).map(x=>{
  const cv=/^TRƯỞNG/i.test(x.role)?`${x.role.toUpperCase()} ${x.dept.toUpperCase()}`:`${(x.role||'LÃNH ĐẠO').toUpperCase()} ${x.dept.toUpperCase()}`;
  return{label:`${x.role||'Trưởng/Phó'} ${x.dept}${x.name?' – '+x.name:' (chưa nhập tên)'}`,data:{cv,ten:x.name,quyen:'TL. GIÁM ĐỐC'}};
 }));
 sel.innerHTML='<option value="">— chọn từ danh bạ —</option>'+g1+g2+g3;
};
$('#lead').onchange=()=>{const v=$('#lead').value;if(v==='')return;const it=_leadMap[+v];if(!it)return;S.cv=it.cv;S.ten=it.ten||'';S.quyen=it.quyen||'';sync();render()};

let _ptOptMap={};
function fillPtPickers(){
 ensureDir();
 const setSel=(id,placeholder,groups,emptyHint)=>{
  const el=$(id);if(!el)return;
  _ptOptMap[id]=[];
  let html=`<option value="">${esc(placeholder)}</option>`,count=0;
  groups.forEach(g=>{
   const opts=g.items.filter(Boolean).map(it=>{const idx=_ptOptMap[id].length;_ptOptMap[id].push(it.val);count++;return `<option value="${idx}">${esc(it.label)}</option>`}).join('');
   if(opts)html+=g.title?`<optgroup label="${at(g.title)}">${opts}</optgroup>`:opts;
  });
  if(!count&&emptyHint)html+=`<option value="" disabled>${esc(emptyHint)}</option>`;
  el.innerHTML=html;
 };
 const spFilled=C.dir.specialists.filter(x=>x.name.trim());
 const dpFilled=C.dir.ttDepts.filter(x=>x.name.trim());
 const ttFilled=C.dir.ttLead.filter(x=>x.name.trim());
 const soFilled=C.dir.soLead.filter(x=>x.name.trim());
 const rooms=getTtRooms();
 const soRooms=C.dir.soDepts.filter(x=>x.name.trim());

 setSel('#pt-pick-nt','— Chọn nhanh Người trình (Chuyên viên) —',[
  {title:'Chuyên viên',items:spFilled.map(x=>({label:`${x.name}${x.dept?' ('+x.dept+')':''}`,val:{name:x.name,dept:x.dept}}))},
  {title:'Trưởng / Phó phòng',items:dpFilled.map(x=>({label:`${x.name} (${x.role} – ${x.dept})`,val:{name:x.name,dept:x.dept}}))}
 ],'Chưa có tên chuyên viên – nhập ở tab 5. Cấu hình đơn vị');

 setSel('#pt-pick-ldp','— Chọn nhanh Trưởng / Phó phòng —',[
  {title:'Trưởng / Phó các phòng',items:dpFilled.map(x=>({label:`${x.role} ${x.dept} – ${x.name}`,val:{name:x.name,role:x.role,dept:x.dept}}))}
 ],'Chưa có tên Trưởng/Phó phòng – nhập ở tab 5. Cấu hình đơn vị');

 setSel('#pt-pick-dvn','— Chọn nhanh phòng trình —',[
  {title:'Các phòng thuộc Trung tâm',items:rooms.map(r=>({label:r,val:r}))}
 ]);

 setSel('#pt-pick-ph','+ Thêm phòng liên quan thuộc Trung tâm',[
  {title:'Các phòng thuộc Trung tâm',items:rooms.map(r=>({label:r,val:r}))}
 ]);

 setSel('#pt-pick-gd','— Chọn nhanh Giám đốc / Lãnh đạo Trung tâm —',[
  {title:'Ban Lãnh đạo Trung tâm',items:ttFilled.map(x=>({label:`${x.role} – ${x.name}`,val:x.name}))}
 ],'Chưa có tên Lãnh đạo Trung tâm – nhập ở tab 5. Cấu hình đơn vị');

 setSel('#pt-pick-pgd','+ Chọn nhanh Phó Giám đốc Trung tâm',[
  {title:'Ban Lãnh đạo Trung tâm',items:ttFilled.slice().sort((a,b)=>(/PHÓ/i.test(b.role)?1:0)-(/PHÓ/i.test(a.role)?1:0)).map(x=>({label:`${x.role} – ${x.name}`,val:x.name}))}
 ],'Chưa có tên Phó Giám đốc – nhập ở tab 5. Cấu hình đơn vị');

 setSel('#pt-pick-soph','+ Thêm phòng chuyên môn của Sở',[
  {title:'Các phòng chuyên môn Sở KH&CN',items:soRooms.map(x=>({label:x.name+(x.head?' ('+x.head+')':''),val:x.name}))}
 ]);

 setSel('#pt-pick-sopgd','+ Chọn nhanh Phó Giám đốc Sở',[
  {title:'Ban Lãnh đạo Sở',items:soFilled.slice().sort((a,b)=>(/PHÓ/i.test(b.role)?1:0)-(/PHÓ/i.test(a.role)?1:0)).map(x=>({label:`${x.role} – ${x.name}`,val:x.name}))}
 ],'Chưa có tên Lãnh đạo Sở – nhập ở tab 5. Cấu hình đơn vị');

 setSel('#pt-pick-sogd','— Chọn nhanh Giám đốc Sở —',[
  {title:'Ban Lãnh đạo Sở',items:soFilled.map(x=>({label:`${x.role} – ${x.name}`,val:x.name}))}
 ],'Chưa có tên Giám đốc Sở – nhập ở tab 5. Cấu hình đơn vị');
}

const appendLine=(cur,val)=>{const lines=(cur||'').split('\n').map(x=>x.trim()).filter(Boolean);if(!lines.some(l=>l.toLowerCase()===val.toLowerCase()))lines.push(val);return lines.join('\n')};
const bindSel=(id,fn)=>{const el=$(id);if(!el)return;el.onchange=()=>{if(el.value==='')return;const v=(_ptOptMap[id]||[])[+el.value];if(v==null)return;fn(v);sync();vis();render()}};
bindSel('#pt-pick-nt',v=>{S.nt=v.name;if(v.dept)S.dvn=v.dept.replace(/^Phòng\s+/i,'')});
bindSel('#pt-pick-ldp',v=>{S.ldp=v.name;S.ldpRole=/^(TRƯỞNG PHÒNG|PHÓ TRƯỞNG PHÒNG)$/i.test(v.role)?v.role.toUpperCase():'';if(!S.dvn&&v.dept)S.dvn=v.dept.replace(/^Phòng\s+/i,'')});
bindSel('#pt-pick-dvn',v=>{S.dvn=String(v).replace(/^Phòng\s+/i,'')});
bindSel('#pt-pick-ph',v=>{S.phOn=true;S.ph=appendLine(S.ph,String(v).replace(/^Phòng\s+/i,''));$('#pt-pick-ph').value=''});
bindSel('#pt-pick-gd',v=>{S.gd=v});
bindSel('#pt-pick-pgd',v=>{S.pgdOn=true;S.pgd=appendLine(S.pgd,v);$('#pt-pick-pgd').value=''});
bindSel('#pt-pick-soph',v=>{S.soPhOn=true;S.soPh=appendLine(S.soPh,v);$('#pt-pick-soph').value=''});
bindSel('#pt-pick-sopgd',v=>{S.soPgdOn=true;S.soPgd=appendLine(S.soPgd,v);$('#pt-pick-sopgd').value=''});
bindSel('#pt-pick-sogd',v=>{S.soGdOn=true;S.soGd=v});

const _cfiOrig=$('#cfi')&&$('#cfi').onclick;
if(_cfiOrig)$('#cfi').onclick=()=>{_cfiOrig();ensureDir();syncDirToLegacy();_redrawDir();fillLead();fillPtPickers()};
const _usetplOrig=$('#usetpl')&&$('#usetpl').onclick;
if(_usetplOrig)$('#usetpl').onclick=()=>{_usetplOrig();if(kind()=='pt'){ensureDir();const gd=C.dir.ttLead.find(x=>/^GIÁM ĐỐC/i.test(x.role)&&x.name);const pgd=C.dir.ttLead.find(x=>/PHÓ GIÁM ĐỐC/i.test(x.role)&&x.name);if(gd)S.gd=gd.name;if(pgd)S.pgd=pgd.name;sync();render()}};
fillPtPickers();

/* ---------- Tra cứu và Lịch sử theo khối ---------- */
let kbF='cq',hsF='cq',hsFolder='__all__';
function seg(target,get,set,fn){const d=document.createElement('div');d.className='bar blk';
 d.innerHTML=[['','Tất cả'],['cq','Khối Chính quyền'],['dang','Khối Đảng']].map(x=>`<button class="btn" data-f="${x[0]}">${x[1]}</button>`).join('');
 const mark=()=>[...d.children].forEach(b=>b.classList.toggle('on',b.dataset.f==get()));
 d._mark=mark;
 d.onclick=e=>{const b=e.target.closest('button');if(!b)return;set(b.dataset.f);mark();fn()};mark();target.before(d);return d}
kb=function(){const s=$('#q').value.toLowerCase();
 $('#kb').innerHTML=KB.filter(k=>{const dg=/Đảng/.test(k[0]),ch=/^(Ngày tháng|Văn bản liên quan)$/.test(k[0]);return(!kbF||ch||(kbF=='dang')==dg)&&(k[0]+k[1]).toLowerCase().includes(s)}).map(k=>{const dg=/Đảng/.test(k[0]),ch=/^(Ngày tháng|Văn bản liên quan)$/.test(k[0]);const tag=ch?'Chung 2 khối':(dg?'Khối Đảng':'Khối Chính quyền');return `<div class="it ok"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${esc(k[0])}</b><span class="tag">${tag}</span></div>${esc(k[1])}</div>`}).join('')||'<p class="mu">Không có kết quả.</p>'};
$('#q').oninput=()=>kb();
hist=function(){const h=ls.g('vts-hs',[]),folders=hsFolders();
 if(hsFolder!=='__all__'&&hsFolder!=='__none__'&&!folders.includes(hsFolder))hsFolder='__all__';
 const byMode=h.map((x,i)=>[x,i]).filter(([x])=>!hsF||x.mode==(hsF=='dang'?'dang':'nn'));
 const cntOf=f=>byMode.filter(([x])=>(x.folder||'')===f).length;
 const noneCnt=cntOf('');
 const v=byMode.filter(([x])=>hsFolder==='__all__'?!0:hsFolder==='__none__'?!(x.folder||''):(x.folder||'')===hsFolder);
 const isCustomFd=hsFolder!=='__all__'&&hsFolder!=='__none__';
 const fbar=`<div class="hs-fbar"><div class="hs-ftabs"><button type="button" class="btn${hsFolder==='__all__'?' on':''}" data-hf="__all__">Tất cả (${byMode.length})</button>${folders.map(f=>`<button type="button" class="btn${hsFolder===f?' on':''}" data-hf="${at(f)}">📁 ${esc(f)} (${cntOf(f)})</button>`).join('')}${folders.length?`<button type="button" class="btn${hsFolder==='__none__'?' on':''}" data-hf="__none__">Chưa phân loại (${noneCnt})</button>`:''}</div><div class="hs-facts"><button type="button" class="btn" id="hs-add-fd">+ Thư mục mới</button>${isCustomFd?`<button type="button" class="btn" id="hs-ren-fd">Đổi tên thư mục</button><button type="button" class="btn" id="hs-del-fd">Xóa thư mục</button>`:''}</div></div>`;
 const listHtml=v.length?v.map(([x,i])=>{const title=x.name||x.S.ty||'(Chưa có trích yếu)';const subTy=x.name&&x.S.ty&&x.name!==x.S.ty?` · Trích yếu: ${esc(x.S.ty)}`:'';const fdTag=x.folder?` <span class="tag">📁 ${esc(x.folder)}</span>`:'';return `<div class="it ok" style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><b>${esc(title)}</b>${fdTag}<br><span class="mu">${x.mode=='nn'?'Khối Chính quyền':'Khối Đảng'} · ${esc(x.S.type)} · ${new Date(x.t).toLocaleString('vi-VN')}${subTy}</span></div><div class="bar" style="margin:0"><button class="btn" data-o="${i}">Mở</button><button class="btn" data-rn="${i}">Đổi tên</button><button class="btn" data-mv="${i}">Thư mục</button><button class="btn" data-d="${i}">Xóa</button></div></div>`}).join(''):`<p class="mu">${isCustomFd?`Thư mục “${esc(hsFolder)}” chưa có bản lưu nào.`:'Chưa có bản nào được lưu.'}</p>`;
 $('#hs').innerHTML=fbar+listHtml;
 $$('[data-hf]').forEach(b=>b.onclick=()=>{hsFolder=b.dataset.hf;hist()});
 const addFd=q('#hs-add-fd');if(addFd)addFd.onclick=async()=>{const nm=await uiPrompt('Tạo thư mục mới','','VD: Công văn 2026','Tạo');if(nm===null)return;if(!nm){msg('Tên thư mục không được để trống.');return}const f=_ensureFolder(nm);hsFolder=f;hist();msg('Đã tạo thư mục “'+f+'”.')};
 const renFd=q('#hs-ren-fd');if(renFd)renFd.onclick=async()=>{const oldF=hsFolder;const nm=await uiPrompt('Đổi tên thư mục',oldF,'Nhập tên thư mục mới...','Cập nhật');if(nm===null)return;if(!nm){msg('Tên thư mục không được để trống.');return}if(nm===oldF)return;const cur=hsFolders();if(cur.some(f=>f!==oldF&&f.toLowerCase()===nm.toLowerCase())){msg('Thư mục “'+nm+'” đã tồn tại.');return}saveHsFolders(cur.map(f=>f===oldF?nm:f));h.forEach(x=>{if(x.folder===oldF)x.folder=nm});ls.s('vts-hs',h);if(ls.g('vts-last-folder','')===oldF)ls.s('vts-last-folder',nm);hsFolder=nm;hist();msg('Đã đổi tên thư mục thành “'+nm+'”.')};
 const delFd=q('#hs-del-fd');if(delFd)delFd.onclick=async()=>{const oldF=hsFolder;if(!(await uiConfirm('Bạn có chắc muốn xóa thư mục “'+oldF+'”? Các bản lưu bên trong sẽ được chuyển về mục Chưa phân loại.','Xác nhận xóa thư mục')))return;saveHsFolders(hsFolders().filter(f=>f!==oldF));h.forEach(x=>{if(x.folder===oldF)x.folder=''});ls.s('vts-hs',h);if(ls.g('vts-last-folder','')===oldF)ls.s('vts-last-folder','');hsFolder='__all__';hist();msg('Đã xóa thư mục “'+oldF+'”.')};
 $$('[data-o]').forEach(b=>b.onclick=()=>{const x=h[b.dataset.o];setMode(x.mode);S=drafts[x.mode]={...blankDraft(x.mode),...x.S};if(!T[mode].some(t=>t[0]==S.type))S.type='KH';fillSel();vis();sync();render();nav('soan')});
 $$('[data-rn]').forEach(b=>b.onclick=async()=>{const i=+b.dataset.rn,x=h[i];if(!x)return;const cur=x.name||x.S.ty||'';const nm=await uiPrompt('Đổi tên bản lưu',cur,'Nhập tên mới...','Cập nhật');if(nm===null)return;if(!nm){msg('Tên bản lưu không được để trống.');return}x.name=nm;ls.s('vts-hs',h);hist();msg('Đã đổi tên bản lưu.')});
 $$('[data-mv]').forEach(b=>b.onclick=async()=>{const i=+b.dataset.mv,x=h[i];if(!x)return;const r=await _folderDlg({title:'Chuyển vào thư mục',showName:false,defFolder:x.folder||'',okText:'Cập nhật'});if(!r)return;x.folder=r.folder||'';ls.s('vts-hs',h);hist();msg(x.folder?'Đã chuyển vào thư mục “'+x.folder+'”.':'Đã chuyển về mục Chưa phân loại.')});
 $$('[data-d]').forEach(b=>b.onclick=async()=>{const i=+b.dataset.d,x=h[i];if(!x)return;const title=x.name||x.S.ty||'(Bản lưu)';if(!(await uiConfirm('Bạn có chắc muốn xóa bản lưu “'+title+'” khỏi lịch sử?','Xác nhận xóa bản lưu')))return;h.splice(i,1);ls.s('vts-hs',h);hist();msg('Đã xóa bản lưu.')})};
const kbSeg=seg(q('#kb'),()=>kbF,v=>kbF=v,()=>kb());
const hsSeg=seg(q('#hs'),()=>hsF,v=>hsF=v,()=>hist());
function syncModeFilters(m){const f=m==='dang'?'dang':'cq';kbF=f;hsF=f;if(kbSeg._mark)kbSeg._mark();if(hsSeg._mark)hsSeg._mark();kb();hist()}

/* ---------- Làm mới ---------- */
fillLead();setMode(mode);syncModeFilters(mode);
})();
