/* patch.js – Văn thư số thành phố Đà Nẵng – bản vá 1 (chạy sau script chính của index.html) */
(function(){
const NB='\u00a0',q=s=>document.querySelector(s),at=s=>esc(s).replace(/"/g,'&quot;');

/* ---------- CSS bổ sung ---------- */
const st=document.createElement('style');st.textContent=`#toast{top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;background:#1e3a8a!important;font-size:16px;font-weight:600;padding:18px 28px;text-align:center;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.45)!important;max-width:min(520px,90%);cursor:pointer}
.cfg{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}.cfg>div{border:1px solid var(--bd);border-radius:10px;padding:12px}@media(max-width:760px){.cfg{grid-template-columns:1fr}}
.lr{display:grid;grid-template-columns:1fr 1.2fr 1fr auto;gap:6px;margin:5px 0}.lr input{padding:7px}
.btn.on{background:var(--pr);color:#fff;border-color:var(--pr)}.blk{margin-bottom:10px}
[data-c="dv"]{margin-bottom:6px}`;
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
  const ki=m.B.findIndex(b=>b.rs&&/^Kính gửi/.test(b.rs[0].x));if(ki>-1)m.B.splice(ki,0,sp,sp);
  window._pt={solo:!S.pgdOn,mc:m.F.mc}}
 return m};

const _r=render;render=function(){_r();
 if(kind()=='bb'){const l=$('#paper').lastElementChild;if(l&&/Nơi nhận/.test(l.textContent))l.remove()}
 if(kind()=='pt'&&window._pt&&_pt.solo){const tr=$$('#paper table tr');[4,5,6].forEach(i=>{const r=tr[i];if(!r)return;const c=[...r.children],k=c[c.length-1];c.slice(0,-1).forEach(x=>x.remove());k.colSpan=_pt.mc})}};

const _dx=docXml;docXml=function(){let x=_dx();
 if(kind()=='bb')x=x.replace(/<w:p>(?:(?!<w:p>).)*?Nơi nhận:<\/w:t><\/w:r><\/w:p>/s,'');
 if(kind()=='pt'&&window._pt&&_pt.solo){let n=0;const mc=_pt.mc;
  x=x.replace(/<w:tr>.*?<\/w:tr>/gs,r=>{if(n++<5)return r;const tc=r.match(/<w:tc>.*?<\/w:tc>/gs);if(!tc)return r;
   const k=tc[tc.length-1].replace(/<w:tcW[^>]*\/>/,`<w:tcW w:w="9071" w:type="dxa"/><w:gridSpan w:val="${mc}"/>`);return r.replace(/<w:tc>.*<\/w:tc>/s,()=>k)})}
 return x};

const _ck=check;check=function(t){return _ck(t).filter(r=>!(kind()=='bb'&&/Thiếu Nơi nhận/.test(r[1]))&&!(isQBase()&&/kèm theo Quyết định/.test(r[1]))&&!(isQ()&&(/Thiếu chức vụ hoặc họ tên/.test(r[1])||/Thiếu Nơi nhận/.test(r[1])))).map(r=>[r[0],r[1].replace(/([Kk])hối Nhà nước/g,'$1hối Chính quyền')])};

const _v=vis;vis=function(){_v();
 const kd=kind(),hideSo=(noSo()&&!S.qcDirect);
 const fSo=q('#f-so'),fQcd=q('#f-qcd');
 if(fSo)fSo.style.display=hideSo?'none':'';
 if(fQcd)fQcd.style.display=isQBase()?'':'none';
 if(kd=='bb'||isQ())$('#f-nn').style.display='none';
 if(isQ())$('#f-sg').style.display='none'};

const _sm=setMode;setMode=function(m){const ch=m!=mode;
 if(ch){if(m=='dang'&&/GIÁM ĐỐC/i.test(S.cv)){S.cv='BÍ THƯ';S.quyen='T/M ĐẢNG UỶ';S.ten=''}
  if(m=='nn'&&/BÍ THƯ/i.test(S.cv)){S.cv='GIÁM ĐỐC';S.quyen='';S.ten=''}
  if(m=='dang')S.nn=(S.nn||'').replace('Lưu Văn phòng.','Lưu VP.')}
 _sm(m);$('#mtag').textContent=m=='nn'?'Khối Chính quyền – NĐ 30/2020':'Khối Đảng – HD 05-HD/VPTW';fillLead();if(ch){sync();render()}};

/* ---------- In / Lưu PDF (mở cửa sổ riêng) ---------- */
$('#print').onclick=()=>{const w=window.open('','_blank');
 if(!w){try{window.print()}catch(e){msg('Trình duyệt chặn cửa sổ in – hãy cho phép cửa sổ bật lên rồi bấm lại.')}return}
 w.document.write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>'+esc(S.ty||'Văn bản')+'</title><style>@page{size:A4;margin:20mm 20mm 20mm 30mm}body{margin:0;font:15px/1.5 "Times New Roman",Times,serif;color:#000}.hd{display:grid;grid-template-columns:1fr 1.15fr;gap:8px;text-align:center;font-size:13px;line-height:1.2}p{margin:3px 0;text-align:justify}.ln{border-top:1px solid #000;margin:2px auto}</style></head><body>'+$('#paper').innerHTML+'</body></html>');
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
const g=document.createElement('div');g.className='cfg';g.append(Lc,Rc);card.insertBefore(g,kids[il]);card.style.maxWidth='1100px';
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
 bDel.onclick=()=>{
  const cur=by(so.value);if(!cur||!cur.custom)return;
  if(nodes().some(c=>c.p===cur.id)){msg('Không thể xóa khi vẫn còn đơn vị cấp dưới trực thuộc.');return}
  OT[key]=nodes().filter(x=>x.id!==cur.id);ls.s('vts-org',OT);
  const pid=sp.value;fillP();sp.value=pid;fillO();apply();msg('Đã xóa đơn vị tự thêm “'+cur.n+'”.')};
 bRst.onclick=()=>{
  OT[key]=nodes().filter(x=>!x.custom);ls.s('vts-org',OT);
  init();apply();msg('Đã khôi phục danh mục đơn vị gốc.')};
 init()}

function led(box,t,title){const h=document.createElement('b');h.style.cssText='display:block;margin-top:14px';h.textContent=title;const w=document.createElement('div');box.append(h,w,t);t.style.display='none';
 const rows=()=>t.value.split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(a=>a.some(Boolean)),
 coll=()=>[...w.querySelectorAll('.lr')].map(r=>[...r.querySelectorAll('input')].map(i=>i.value.replace(/\|/g,'').trim())),
 save=a=>{t.value=a.map(r=>r.join(' | ')).join('\n');t.dispatchEvent(new Event('input',{bubbles:true}))},
 draw=(a=rows())=>{w.innerHTML='<div class="mu" style="font-size:12px">Chức vụ · Họ và tên · Quyền hạn ký (nếu có, tối đa 30 người)</div>'+a.map((r,i)=>`<div class="lr">${[0,1,2].map(j=>`<input maxlength="80" value="${at(r[j]||'')}" placeholder="${['Chức vụ','Họ và tên','VD: KT. GIÁM ĐỐC'][j]}">`).join('')}<button type="button" class="btn" data-x="${i}" title="Xóa">×</button></div>`).join('')+'<button type="button" class="btn" data-a="1">+ Thêm người</button>'};
 w.addEventListener('input',()=>save(coll()));
 w.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=coll();
  if(b.dataset.x!=null){a.splice(+b.dataset.x,1);save(a);draw()}
  else{
   if(a.length>=30){msg('Danh bạ lãnh đạo tối đa 30 người cho mỗi khối.');return}
   if(a.some(r=>!r[0]&&!r[1])){msg('Hãy nhập thông tin vào dòng trống hiện có trước khi thêm người mới.');return}
   a.push(['','','']);draw(a)
  }});
 draw()}

orgUI(Lc,'cq',{P:'nP',O:'nO',A:'nA',N:'nOn'});
orgUI(Rc,'dang',{P:'dP',O:'dO',A:'dA'});
led(Lc,ta,'Danh bạ lãnh đạo – Khối Chính quyền (tự điền người ký)');
const t2=ta.cloneNode(false);t2.setAttribute('data-c','leadersD');t2.value=C.leadersD;
t2.addEventListener('input',()=>{C.leadersD=t2.value;fillLead()});
led(Rc,t2,'Danh bạ lãnh đạo – Khối Đảng (Bí thư, Phó Bí thư…)');

/* ---------- Tra cứu và Lịch sử theo khối ---------- */
let kbF='',hsF='';
function seg(target,get,set,fn){const d=document.createElement('div');d.className='bar blk';
 d.innerHTML=[['','Tất cả'],['cq','Khối Chính quyền'],['dang','Khối Đảng']].map(x=>`<button class="btn" data-f="${x[0]}">${x[1]}</button>`).join('');
 const mark=()=>[...d.children].forEach(b=>b.classList.toggle('on',b.dataset.f==get()));
 d.onclick=e=>{const b=e.target.closest('button');if(!b)return;set(b.dataset.f);mark();fn()};mark();target.before(d)}
kb=function(){const s=$('#q').value.toLowerCase();
 $('#kb').innerHTML=KB.filter(k=>{const dg=/Đảng/.test(k[0]),ch=/Văn bản liên quan/.test(k[0]);return(!kbF||ch||(kbF=='dang')==dg)&&(k[0]+k[1]).toLowerCase().includes(s)}).map(k=>`<div class="it ok"><b>${esc(k[0])}</b><br>${esc(k[1])}</div>`).join('')||'<p class="mu">Không có kết quả.</p>'};
$('#q').oninput=()=>kb();
hist=function(){const h=ls.g('vts-hs',[]),v=h.map((x,i)=>[x,i]).filter(([x])=>!hsF||x.mode==(hsF=='dang'?'dang':'nn'));
 $('#hs').innerHTML=v.length?v.map(([x,i])=>`<div class="it ok" style="display:flex;gap:8px;align-items:center;justify-content:space-between"><div><b>${esc(x.S.ty||'(Chưa có trích yếu)')}</b><br><span class="mu">${x.mode=='nn'?'Khối Chính quyền':'Khối Đảng'} · ${esc(x.S.type)} · ${new Date(x.t).toLocaleString('vi-VN')}</span></div><div><button class="btn" data-o="${i}">Mở</button> <button class="btn" data-d="${i}">Xóa</button></div></div>`).join(''):'<p class="mu">Chưa có bản nào được lưu.</p>';
 $$('[data-o]').forEach(b=>b.onclick=()=>{const x=h[b.dataset.o];S={...S,...x.S};setMode(x.mode);nav('soan')});
 $$('[data-d]').forEach(b=>b.onclick=()=>{h.splice(b.dataset.d,1);ls.s('vts-hs',h);hist()})};
seg(q('#kb'),()=>kbF,v=>kbF=v,()=>kb());
seg(q('#hs'),()=>hsF,v=>hsF=v,()=>hist());

/* ---------- Làm mới ---------- */
fillLead();setMode(mode);
})();
