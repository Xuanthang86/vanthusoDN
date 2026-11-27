/* features.js – Tối ưu hóa thể thức theo cá nhân (upload file) & Đánh giá trải nghiệm */
(function () {
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const at = s => esc(s).replace(/"/g, '&quot;');

  /* ---------- CSS bổ sung ---------- */
  const css = document.createElement('style');
  css.textContent = `
  .opt-grid{display:grid;grid-template-columns:minmax(380px,520px) 1fr;gap:16px}
  .dg-grid{display:grid;grid-template-columns:1.2fr minmax(430px,540px);gap:16px}
  @media(max-width:1020px){.opt-grid,.dg-grid{grid-template-columns:1fr}}
  .dg-grid .chips{gap:6px;margin:6px 0 8px}
  .dg-grid .chip{padding:5px 10px;font-size:12.5px}
  .dg-grid .kpi-row{grid-template-columns:repeat(3,minmax(0,1fr))}
  .dg-grid .kpi .mu{white-space:nowrap;font-size:12.5px}
  .mar-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
  .mar-grid span{display:block;font-size:11px;color:var(--mu);margin-bottom:2px}
  .mar-grid input{padding:6px 7px;text-align:center}
  .ai-ext{border-top:1px dashed var(--bd);margin-top:10px;padding-top:10px}
  .ai-ext-links{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
  .ai-ext-links a{text-decoration:none;display:inline-flex;align-items:center;gap:4px;font-size:12.5px;padding:6px 10px}
  .drop{border:2px dashed var(--bd);border-radius:12px;padding:22px 16px;text-align:center;background:var(--bg);cursor:pointer;transition:.15s border-color,.15s background}
  .drop.ov{border-color:var(--pr);background:rgba(30,58,138,.08)}
  .kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:10px 0}
  .kpi{background:var(--bg);border:1px solid var(--bd);border-radius:10px;padding:10px 12px}
  .kpi b{font-size:16px;display:block}
  .tbl-cmp{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}
  .tbl-cmp th,.tbl-cmp td{border:1px solid var(--bd);padding:7px 9px;text-align:left;vertical-align:top}
  .tbl-cmp th{background:var(--bg);color:var(--mu)}
  .stars{display:flex;gap:6px;align-items:center;margin:8px 0}
  .star-btn{background:none;border:0;font-size:32px;line-height:1;cursor:pointer;color:#cbd5e1;padding:2px 4px;transition:transform .1s,color .1s}
  .star-btn.on,.star-btn.hv{color:#f59e0b}
  .star-btn:hover{transform:scale(1.12)}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
  .chip{border:1px solid var(--bd);background:var(--bg);color:var(--tx);padding:7px 12px;border-radius:99px;cursor:pointer;font-size:13px;font-weight:500;transition:.15s}
  .chip.on{background:var(--pr);color:#fff;border-color:var(--pr)}
  .rbar{display:flex;align-items:center;gap:8px;font-size:13px;margin:4px 0}
  .rbar-track{flex:1;height:8px;background:var(--bg);border-radius:99px;overflow:hidden;border:1px solid var(--bd)}
  .rbar-fill{height:100%;background:#f59e0b}
  .prof-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 10px;background:var(--bg);border:1px solid var(--bd);border-radius:10px;margin:8px 0}
  .ai-box{border:1px solid var(--pr);background:var(--bg);border-radius:10px;padding:10px 12px;margin:10px 0}
  .ai-box summary{cursor:pointer;font-weight:700;color:var(--pr);display:flex;align-items:center;justify-content:space-between;list-style:none}
  .ai-box summary::-webkit-details-marker{display:none}
  .ai-out{background:var(--cd);border:1px solid var(--bd);border-radius:8px;padding:10px;margin-top:10px;font-size:13px}
  .ai-pre{white-space:pre-wrap;font:13px/1.45 "Times New Roman",Times,serif;max-height:220px;overflow-y:auto;background:var(--bg);border:1px solid var(--bd);border-radius:6px;padding:8px;margin:6px 0}
  .ai-err{border-left:4px solid var(--er);background:var(--cd);padding:8px 10px;border-radius:6px;margin-top:8px;font-size:13px;color:var(--er)}
  `;
  document.head.appendChild(css);

  /* ========================================================================
   * PHẦN 1: HỒ SƠ CÁ NHÂN HÓA THỂ THỨC & TÍCH HỢP XUẤT/HIỂN THỊ
   * ======================================================================== */
  const PF_KEY = 'vts-profiles-v1';
  const defaultProfile = (id = 'default', name = 'Cá nhân mặc định') => ({
    id,
    name,
    authorName: '',
    deptAbbr: C.dv || 'TTTK',
    deptFull: C.dvn || '',
    defaultSignerRole: '',
    defaultSignerName: '',
    defaultSignerPower: '',
    fontSizePt: 14,
    lineHeight: 1.0,
    indentCm: 1.0,
    marginPreset: 'nd30',
    marginsMm: { top: 20, bottom: 20, left: 30, right: 20 },
    autoNormalizeText: true,
    perType: {},
    v: 2
  });

  function loadProfiles() {
    const raw = ls.g(PF_KEY, null);
    if (raw && Array.isArray(raw.items) && raw.items.length) {
      let dirty = false;
      raw.items.forEach(p => {
        if (!p.v || p.v < 2) {
          if (p.marginPreset === 'nd30' && p.marginsMm && p.marginsMm.right === 15) {
            p.marginsMm.right = 20;
          }
          if (p.lineHeight === 1.3) p.lineHeight = 1.0;
          p.v = 2;
          dirty = true;
        }
      });
      if (dirty) ls.s(PF_KEY, raw);
      return raw;
    }
    return { activeId: 'default', items: [defaultProfile()] };
  }
  let PF = loadProfiles();
  const saveProfiles = () => ls.s(PF_KEY, PF);
  const activeProfile = () => PF.items.find(x => x.id === PF.activeId) || PF.items[0];

  function effectiveFormat(docType) {
    const p = activeProfile();
    const ov = (p.perType && p.perType[docType]) || {};
    return {
      fontSizePt: Number(ov.fontSizePt || p.fontSizePt || 14),
      lineHeight: Number(ov.lineHeight || p.lineHeight || 1.0),
      indentCm: ov.indentCm !== undefined ? Number(ov.indentCm) : Number(p.indentCm ?? 1.0),
      marginsMm: { ...(p.marginsMm || { top: 20, bottom: 20, left: 30, right: 20 }), ...(ov.marginsMm || {}) },
      autoNormalizeText: p.autoNormalizeText !== false
    };
  }

  /* Thanh chọn hồ sơ cá nhân nhanh ngay trong tab Soạn thảo */
  (function mountEditorProfileBar() {
    const card = q('#soan .grid .card');
    if (!card) return;
    const bar = document.createElement('div');
    bar.className = 'prof-bar';
    bar.id = 'soan-prof-bar';
    bar.innerHTML = `<span class="mu" style="font-size:12px;font-weight:600">Hồ sơ cá nhân:</span>
      <select id="soan-prof-sel" style="width:auto;flex:1;min-width:140px;padding:6px 8px"></select>
      <button type="button" class="btn" id="soan-prof-apply" style="padding:6px 10px;font-size:12px">Áp dụng định dạng</button>
      <button type="button" class="btn" id="soan-prof-go" style="padding:6px 10px;font-size:12px">Tối ưu file</button>`;
    const firstLabel = card.querySelector('label');
    if (firstLabel) card.insertBefore(bar, firstLabel);
    else card.appendChild(bar);
  })();

  function refreshEditorProfileSelect() {
    const sel = q('#soan-prof-sel');
    if (!sel) return;
    sel.innerHTML = PF.items.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    sel.value = activeProfile().id;
  }

  function applyProfileDefaultsToDraft() {
    const p = activeProfile();
    if (p.deptAbbr) S.dv = p.deptAbbr;
    if (p.deptFull) S.dvn = p.deptFull;
    if (p.defaultSignerRole && !S.cv) S.cv = p.defaultSignerRole;
    if (p.defaultSignerName && !S.ten) S.ten = p.defaultSignerName;
    if (p.defaultSignerPower && !S.quyen) S.quyen = p.defaultSignerPower;
    if (S.dv && S.nn) {
      S.nn = S.nn.replace(/^(-\s*Lưu:\s*VT,)[^\n]*$/m, (_, b) => `${b} ${S.dv}.`);
    }
    sync();
    render();
  }

  /* Bọc render() & docXml() để áp dụng thể thức cá nhân hóa thật sự trên bản xem trước và file .docx */
  const _baseRender = render;
  render = function () {
    _baseRender();
    const fmt = effectiveFormat(S.type);
    const paper = q('#paper');
    if (!paper) return;
    paper.style.fontSize = fmt.fontSizePt + 'pt';
    paper.style.lineHeight = String(fmt.lineHeight);
    paper.style.padding = `${fmt.marginsMm.top}mm ${fmt.marginsMm.right}mm ${fmt.marginsMm.bottom}mm ${fmt.marginsMm.left}mm`;
    qa('#paper p').forEach(el => {
      if (el.style.textIndent) el.style.textIndent = fmt.indentCm + 'cm';
      if (el.style.lineHeight) el.style.lineHeight = String(fmt.lineHeight);
    });
  };

  const _baseDocXml = docXml;
  docXml = function () {
    let xml = _baseDocXml();
    const fmt = effectiveFormat(S.type);
    const bodySz = Math.round(fmt.fontSizePt * 2);
    const lineVal = Math.round(fmt.lineHeight * 240);
    const indentTwips = Math.round(fmt.indentCm * 567);
    const mm2tw = mm => Math.round(Number(mm) * 56.7);

    if (bodySz !== 28) {
      xml = xml.replace(/(<w:jc w:val="both"\/>\s*<w:rPr><w:sz w:val=")28(")/g, `$1${bodySz}$2`);
      xml = xml.replace(/(<w:sz w:val=")28("\/>\s*<w:szCs w:val=")28(")/g, `$1${bodySz}$2${bodySz}$3`);
    }
    if (lineVal !== 240) {
      xml = xml.replace(/(<w:spacing w:before="(?:0|120)" w:after="(?:0|120)" )w:line="240"([^>]*\/><w:ind[^>]*\/><w:jc w:val="both")/g, `$1w:line="${lineVal}"$2`);
    }
    xml = xml.replace(/w:firstLine="567"/g, `w:firstLine="${indentTwips}"`);
    xml = xml.replace(
      /<w:pgMar w:top="\d+" w:right="\d+" w:bottom="\d+" w:left="\d+"/,
      `<w:pgMar w:top="${mm2tw(fmt.marginsMm.top)}" w:right="${mm2tw(fmt.marginsMm.right)}" w:bottom="${mm2tw(fmt.marginsMm.bottom)}" w:left="${mm2tw(fmt.marginsMm.left)}"`
    );
    return xml;
  };

  /* ========================================================================
   * PHẦN 2: PHÂN TÍCH & TỐI ƯU HÓA FILE UPLOAD (.docx / .pdf)
   * ======================================================================== */
  let lastAnalysis = null;

  function normalizeTextRules(text, isStateMode) {
    let t = (text || '').replace(/\r\n/g, '\n');
    // Chuẩn hóa khoảng trắng & dấu câu
    t = t.replace(/[ \t]{2,}/g, ' ');
    t = t.replace(/ ([,.;:!?])/g, (m, p, idx, str) => {
      if (str.slice(Math.max(0, idx - 2), idx + 3).includes('./.')) return m;
      return p;
    });
    t = t.replace(/([,;:])([^\s\n\d./])/g, '$1 $2');
    // Chuẩn hóa ngày tháng nhỏ hơn 10 -> 01..09
    t = t.replace(/\bngày\s+([1-9])\s+tháng/gi, 'ngày 0$1 tháng');
    t = t.replace(/\btháng\s+([1-9])\s+năm/gi, 'tháng 0$1 năm');
    // Chuẩn hóa Ủy / Uỷ theo khối
    if (isStateMode) t = t.replace(/Uỷ/g, 'Ủy').replace(/uỷ/g, 'ủy');
    else t = t.replace(/Ủy/g, 'Uỷ').replace(/ủy/g, 'uỷ');
    // Trim từng dòng và bỏ dòng trống dư
    const lines = t.split('\n').map(l => l.trim()).filter((l, i, arr) => l || (i > 0 && arr[i - 1]));
    return lines.join('\n').trim();
  }

  function detectDocType(lines, rawText) {
    const joined = rawText;
    const upperLines = lines.slice(0, 18).map(l => l.toUpperCase());
    const map = [
      ['NQ', /^(NGHỊ QUYẾT)\b/],
      ['QĐ', /^(QUYẾT ĐỊNH)\b/],
      ['QyĐ', /^(QUY ĐỊNH)\b/],
      ['QC', /^(QUY CHẾ)\b/],
      ['KH', /^(KẾ HOẠCH)\b/],
      ['BC', /^(BÁO CÁO)\b/],
      ['TB', /^(THÔNG BÁO)\b/],
      ['TTr', /^(TỜ TRÌNH)\b/],
      ['PT', /^(PHIẾU TRÌNH)\b/],
      ['BB', /^(BIÊN BẢN)\b/],
      ['GM', /^(GIẤY MỜI)\b/],
      ['ĐA', /^(ĐỀ ÁN)\b/],
      ['CT', /^(CHỈ THỊ)\b/],
      ['KL', /^(KẾT LUẬN)\b/],
      ['TT', /^(THÔNG TRI)\b/],
      ['HD', /^(HƯỚNG DẪN)\b/],
      ['CTr', /^(CHƯƠNG TRÌNH)\b/]
    ];
    for (const [code, rx] of map) {
      if (upperLines.some(l => rx.test(l))) return code;
    }
    if (/V\/v\s+/i.test(joined) || /Kính gửi\s*:/i.test(joined)) return 'CV';
    return 'KH';
  }

  function analyzeExtractedData(lines, meta, fileName) {
    const rawText = lines.join('\n');
    const isDang = /ĐẢNG CỘNG SẢN VIỆT NAM|T\/M ĐẢNG UỶ|THÀNH UỶ|CHI BỘ/i.test(rawText) && !/CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM/i.test(rawText);
    const detectedMode = isDang ? 'dang' : 'nn';
    const detectedType = detectDocType(lines, rawText);

    // Số văn bản
    let so = '';
    const soMatch = rawText.match(/Số\s*:?\s*(\d{1,4})\s*[/-]/i);
    if (soMatch) so = soMatch[1].length === 1 ? '0' + soMatch[1] : soMatch[1];

    // Ngày ban hành
    let date = iso();
    const dtMatch = rawText.match(/ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/i);
    if (dtMatch) {
      const dd = dtMatch[1].padStart(2, '0');
      const mm = dtMatch[2].padStart(2, '0');
      date = `${dtMatch[3]}-${mm}-${dd}`;
    }

    // Trích yếu
    let ty = '';
    const vvMatch = rawText.match(/V\/v\s+([^\n]+)/i);
    if (vvMatch) ty = vvMatch[1].trim().replace(/[.;]+$/, '');

    // Kính gửi / Kính trình
    let kg = '';
    const kgMatch = rawText.match(/Kính\s+(?:gửi|trình)\s*:\s*([^\n]+)/i);
    if (kgMatch) kg = kgMatch[1].trim();

    // Căn cứ & Nội dung & Nơi nhận & Người ký
    const ccLines = [];
    const bodyLines = [];
    const nnLines = [];
    let inNn = false;
    let passedTypeTitle = false;
    let tqLines = [];
    const typeNameUpper = (T[detectedMode].find(t => t[0] === detectedType) || ['', ''])[1].toUpperCase();

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!l) continue;
      // Bỏ qua phần quốc hiệu / cơ quan / số / ngày tháng ở đầu nếu đã nhận diện
      if (i < 10 && (/^(CỘNG HÒA XÃ HỘI|Độc lập - Tự do|ĐẢNG CỘNG SẢN|Số\s*:?|V\/v\s+|\*+$|[- ]{4,}$)/i.test(l) || /ngày\s+\d{1,2}\s+tháng\s+\d{1,2}\s+năm\s+\d{4}/i.test(l))) {
        continue;
      }
      if (i < 8 && l === l.toUpperCase() && l.length > 4 && l !== typeNameUpper && !/^(CHƯƠNG|I+\.|QUYẾT)/.test(l)) {
        // Có thể là tên cơ quan ở header
        if (i < 5) continue;
      }
      if (!passedTypeTitle && typeNameUpper && l.toUpperCase() === typeNameUpper) {
        passedTypeTitle = true;
        if (!ty && lines[i + 1] && !/^(Căn cứ|Kính|QUYẾT|Điều|I+\.)/i.test(lines[i + 1])) {
          ty = lines[i + 1].trim().replace(/[.;]+$/, '');
          i++;
        }
        continue;
      }
      if (/^Nơi nhận\s*:/i.test(l)) {
        inNn = true;
        const after = l.replace(/^Nơi nhận\s*:\s*/i, '').trim();
        if (after) nnLines.push(after);
        continue;
      }
      if (inNn) {
        // Dừng Nơi nhận nếu gặp phần ký
        if (/^(KT\.|TM\.|T\/M|TL\.|TUQ\.|GIÁM ĐỐC|PHÓ GIÁM ĐỐC|CHỦ TỊCH|BÍ THƯ|CHỦ TỌA|THƯ KÝ)\b/.test(l)) {
          inNn = false;
        } else {
          nnLines.push(l);
          continue;
        }
      }
      if (/^Kính\s+(?:gửi|trình)\s*:/i.test(l)) continue;
      if (/^(Căn cứ|Xét|Theo đề nghị của)\b/i.test(l) && bodyLines.length === 0) {
        ccLines.push(l);
        continue;
      }
      if ((detectedType === 'QĐ' || detectedType === 'NQ') && /^(GIÁM ĐỐC|CHỦ TỊCH|ỦY BAN|HỘI ĐỒNG)/.test(l) && bodyLines.length === 0) {
        tqLines.push(l);
        continue;
      }
      if (/^(QUYẾT ĐỊNH|QUYẾT NGHỊ)\s*:?$/i.test(l) && bodyLines.length === 0) continue;
      bodyLines.push(l);
    }

    // Thử tách người ký ở cuối bodyLines
    let quyen = '', cv = '', ten = '';
    while (bodyLines.length > 0 && nnLines.length === 0) {
      const last = bodyLines[bodyLines.length - 1];
      if (/^(KT\.|TM\.|T\/M|TL\.|TUQ\.)/i.test(last)) {
        quyen = last;
        bodyLines.pop();
      } else if (/^(GIÁM ĐỐC|PHÓ GIÁM ĐỐC|CHỦ TỊCH|PHÓ CHỦ TỊCH|BÍ THƯ|PHÓ BÍ THƯ|CHỦ TỌA|TRƯỞNG PHÒNG)/i.test(last)) {
        cv = last;
        bodyLines.pop();
      } else if (bodyLines.length >= 2 && /^[A-ZÀ-Ỹ][a-zà-ỹ]+(\s+[A-ZÀ-Ỹ][a-zà-ỹ]+){1,4}$/.test(last) && !/[.;:!?]$/.test(last)) {
        ten = last;
        bodyLines.pop();
      } else break;
    }

    // Kiểm tra các vấn đề định dạng phát hiện
    const issues = [];
    if (meta.fontFamily && !/Times New Roman/i.test(meta.fontFamily)) {
      issues.push(`Phông chữ file gốc là "${meta.fontFamily}" → Chuẩn quy định bắt buộc "Times New Roman".`);
    }
    if (meta.fontSizePt && (meta.fontSizePt < 13 || meta.fontSizePt > 15)) {
      issues.push(`Cỡ chữ phổ biến là ${meta.fontSizePt}pt → NĐ 30/2020 quy định 13–14pt (Văn bản Đảng 14–15pt).`);
    }
    if (meta.marginsMm) {
      const { top, bottom, left, right } = meta.marginsMm;
      if (left < 28 || right < 14 || top < 18 || bottom < 18) {
        issues.push(`Lề trang hiện tại (${top}/${bottom}/${left}/${right} mm) lệch chuẩn A4 (trên/dưới 20–25mm, trái 30–35mm, phải 15–20mm).`);
      }
    }
    if (/ {2,}/.test(rawText)) issues.push('Có khoảng trắng kép trong văn bản → sẽ tự động loại bỏ.');
    if (/ngày\s+[1-9]\s+tháng/i.test(rawText) || /tháng\s+[1-9]\s+năm/i.test(rawText)) {
      issues.push('Ngày/tháng nhỏ hơn 10 chưa thêm số 0 phía trước → sẽ tự động chuẩn hóa.');
    }
    if (detectedMode === 'nn' && /uỷ/i.test(rawText)) issues.push('Dùng "Uỷ" trong văn bản Chính quyền → sẽ tự động chuyển thành "Ủy".');
    if (detectedMode === 'dang' && /ủy/i.test(rawText)) issues.push('Dùng "Ủy" trong văn bản Đảng → sẽ tự động chuyển thành "Uỷ".');

    // Tối ưu hóa nội dung theo chuẩn + hồ sơ cá nhân
    const prof = activeProfile();
    const isState = detectedMode === 'nn';
    const cleanCc = ccLines.map((c, idx) => {
      let s = normalizeTextRules(c, isState).replace(/[.;]+$/, '');
      if (idx === ccLines.length - 1 && /^Theo đề nghị/i.test(s) && isState) return s + '.';
      return s + ';';
    });

    let cleanBody = normalizeTextRules(bodyLines.join('\n'), isState);
    if (cleanBody && !/[.\/]\s*$/.test(cleanBody)) cleanBody += './.';

    const dvUse = prof.deptAbbr || S.dv || C.dv || 'TTTK';
    const sep = isState ? ';' : ',';
    let cleanNn = nnLines.map(x => normalizeTextRules(x, isState).replace(/^[-•+]\s*/, '- ')).filter(Boolean);
    if (!cleanNn.length) {
      cleanNn = isState
        ? ['- Như trên;', `- Lưu: VT, ${dvUse}.`]
        : ['- Như trên,', '- Lưu VP.'];
    } else {
      cleanNn = cleanNn.map((x, idx) => {
        let line = x.startsWith('-') ? x : '- ' + x;
        line = line.replace(/[;,.]+$/, '');
        if (/Lưu\s*:/i.test(line) && isState && dvUse) {
          line = `- Lưu: VT, ${dvUse}`;
        }
        return idx < cleanNn.length - 1 ? line + sep : line + '.';
      });
    }

    return {
      fileName,
      meta,
      issues,
      detectedMode,
      detectedType,
      draft: {
        type: detectedType,
        so,
        date,
        ty: ty || fileName.replace(/\.[^.]+$/, ''),
        tq: tqLines.join('\n'),
        cc: cleanCc.join('\n'),
        kg,
        dv: dvUse,
        nd: cleanBody,
        nn: cleanNn.join('\n'),
        quyen: quyen || prof.defaultSignerPower || '',
        cv: cv || prof.defaultSignerRole || (isState ? 'GIÁM ĐỐC' : 'BÍ THƯ'),
        ten: ten || prof.defaultSignerName || '',
        qcDirect: detectedMode === 'nn' && ['QC', 'QyĐ'].includes(detectedType) && !!(so || ten || nnLines.length)
      }
    };
  }

  async function parseUploadedFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'doc') {
      throw new Error('Định dạng .doc cũ chưa hỗ trợ trực tiếp trên trình duyệt. Hãy mở file trong Word và chọn Lưu dạng .docx hoặc .pdf rồi tải lại.');
    }
    if (ext !== 'docx' && ext !== 'pdf') {
      throw new Error('Chỉ hỗ trợ file .docx (Word) hoặc .pdf (PDF).');
    }
    if (ext === 'docx') {
      if (typeof JSZip === 'undefined') throw new Error('Chưa tải được JSZip để đọc file .docx.');
      const zip = await JSZip.loadAsync(file);
      const docFile = zip.file('word/document.xml');
      if (!docFile) throw new Error('File .docx không hợp lệ (thiếu word/document.xml).');
      const docXmlStr = await docFile.async('string');
      const stylesFile = zip.file('word/styles.xml');
      const stylesXmlStr = stylesFile ? await stylesFile.async('string') : '';

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXmlStr, 'application/xml');
      const stylesDoc = stylesXmlStr ? parser.parseFromString(stylesXmlStr, 'application/xml') : null;

      const lines = [];
      const fontCount = {};
      const sizeCount = {};
      const lineSpCount = {};
      const indentCount = {};

      const ps = [...xmlDoc.getElementsByTagName('w:p')];
      ps.forEach(p => {
        const ts = [...p.getElementsByTagName('w:t')].map(t => t.textContent).join('');
        const text = ts.replace(/\s+/g, ' ').trim();
        if (text) lines.push(text);

        const rFonts = p.getElementsByTagName('w:rFonts')[0];
        const fName = rFonts && (rFonts.getAttribute('w:ascii') || rFonts.getAttribute('w:hAnsi'));
        if (fName) fontCount[fName] = (fontCount[fName] || 0) + 1;

        const szEl = p.getElementsByTagName('w:sz')[0];
        const szVal = szEl && parseInt(szEl.getAttribute('w:val'), 10);
        if (szVal) {
          const pt = szVal / 2;
          if (pt >= 10 && pt <= 20) sizeCount[pt] = (sizeCount[pt] || 0) + 1;
        }

        const spEl = p.getElementsByTagName('w:spacing')[0];
        const lnVal = spEl && parseInt(spEl.getAttribute('w:line'), 10);
        if (lnVal && lnVal >= 200 && lnVal <= 480) {
          const mult = Math.round((lnVal / 240) * 100) / 100;
          lineSpCount[mult] = (lineSpCount[mult] || 0) + 1;
        }

        const indEl = p.getElementsByTagName('w:ind')[0];
        const flVal = indEl && parseInt(indEl.getAttribute('w:firstLine'), 10);
        if (flVal && flVal > 100 && flVal < 1500) {
          const cm = Math.round((flVal / 567) * 100) / 100;
          indentCount[cm] = (indentCount[cm] || 0) + 1;
        }
      });

      if (stylesDoc) {
        const defRPr = stylesDoc.getElementsByTagName('w:rPrDefault')[0];
        if (defRPr) {
          const rf = defRPr.getElementsByTagName('w:rFonts')[0];
          const fn = rf && (rf.getAttribute('w:ascii') || rf.getAttribute('w:hAnsi'));
          if (fn && !Object.keys(fontCount).length) fontCount[fn] = 1;
          const sz = defRPr.getElementsByTagName('w:sz')[0];
          const sv = sz && parseInt(sz.getAttribute('w:val'), 10);
          if (sv && !Object.keys(sizeCount).length) sizeCount[sv / 2] = 1;
        }
      }

      const topKey = obj => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0];
      const pgMar = xmlDoc.getElementsByTagName('w:pgMar')[0];
      const tw2mm = v => v ? Math.round(parseInt(v, 10) / 56.7) : null;
      const marginsMm = pgMar ? {
        top: tw2mm(pgMar.getAttribute('w:top')) || 20,
        bottom: tw2mm(pgMar.getAttribute('w:bottom')) || 20,
        left: tw2mm(pgMar.getAttribute('w:left')) || 30,
        right: tw2mm(pgMar.getAttribute('w:right')) || 20
      } : null;

      return analyzeExtractedData(lines, {
        format: 'DOCX',
        fontFamily: topKey(fontCount) || 'Times New Roman',
        fontSizePt: Number(topKey(sizeCount)) || 14,
        lineHeight: Number(topKey(lineSpCount)) || 1.0,
        indentCm: Number(topKey(indentCount)) || 1.0,
        marginsMm
      }, file.name);
    }

    if (typeof pdfjsLib === 'undefined') {
      throw new Error('Chưa tải được thư viện đọc PDF (pdf.js). Hãy kiểm tra kết nối mạng và thử lại.');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    const lines = [];
    const sizeCount = {};
    const fontCount = {};

    for (let pno = 1; pno <= pdf.numPages; pno++) {
      const page = await pdf.getPage(pno);
      const tc = await page.getTextContent();
      const styles = tc.styles || {};
      const rows = new Map();
      for (const item of tc.items) {
        const str = (item.str || '').replace(/\s+/g, ' ');
        if (!str.trim()) continue;
        const y = Math.round((item.transform?.[5] || 0) / 3) * 3;
        const x = item.transform?.[4] || 0;
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y).push({ x, str });

        const hPt = Math.round(Math.hypot(item.transform?.[0] || 0, item.transform?.[1] || 0));
        if (hPt >= 10 && hPt <= 20) sizeCount[hPt] = (sizeCount[hPt] || 0) + str.length;
        const ff = styles[item.fontName]?.fontFamily;
        if (ff) fontCount[ff] = (fontCount[ff] || 0) + str.length;
      }
      const ys = [...rows.keys()].sort((a, b) => b - a);
      for (const y of ys) {
        const parts = rows.get(y).sort((a, b) => a.x - b.x).map(p => p.str.trim()).filter(Boolean);
        const line = parts.join(' ').replace(/\s+/g, ' ').trim();
        if (line) lines.push(line);
      }
    }
    if (!lines.length) {
      throw new Error('File PDF không có lớp văn bản (có thể là bản scan ảnh). Hãy dùng PDF có chữ chọn được hoặc file .docx.');
    }
    const topKey = obj => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0];
    return analyzeExtractedData(lines, {
      format: 'PDF',
      fontFamily: topKey(fontCount) || null,
      fontSizePt: Number(topKey(sizeCount)) || null,
      lineHeight: null,
      indentCm: null,
      marginsMm: null
    }, file.name);
  }

  function renderOptTab() {
    const el = q('#opt');
    if (!el) return;
    const p = activeProfile();
    const curType = (lastAnalysis && lastAnalysis.detectedType) || S.type || 'KH';
    const eff = effectiveFormat(curType);
    const learnedTypes = Object.keys(p.perType || {});

    el.innerHTML = `<div class="opt-grid">
      <div class="card">
        <b>Hồ sơ tối ưu thể thức theo cá nhân</b>
        <p class="mu" style="margin:4px 0 10px">Mỗi cá nhân có thể lưu thói quen soạn thảo riêng (cỡ chữ, lề, thụt dòng, phòng ban, người ký) và tối ưu riêng theo từng loại văn bản.</p>
        <label>Chọn hồ sơ cá nhân</label>
        <div class="row">
          <select id="pf-sel">${PF.items.map(x => `<option value="${esc(x.id)}"${x.id === p.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
          <div class="bar" style="margin:0">
            <button type="button" class="btn" id="pf-add">+ Hồ sơ mới</button>
            ${PF.items.length > 1 ? '<button type="button" class="btn" id="pf-del">Xóa</button>' : ''}
          </div>
        </div>
        <div class="row">
          <div><label>Tên hồ sơ / Cá nhân</label><input id="pf-name" maxlength="80" value="${at(p.name)}"></div>
          <div><label>Phòng viết tắt mặc định</label><input id="pf-dv" maxlength="20" value="${at(p.deptAbbr || '')}" placeholder="VD: TTTK"></div>
        </div>
        <div class="row">
          <div><label>Chức vụ người ký hay dùng</label><input id="pf-cv" maxlength="80" value="${at(p.defaultSignerRole || '')}" placeholder="VD: GIÁM ĐỐC"></div>
          <div><label>Họ tên người ký hay dùng</label><input id="pf-ten" maxlength="80" value="${at(p.defaultSignerName || '')}" list="dl-names"></div>
        </div>
        <b style="display:block;margin-top:14px">Thông số định dạng chuẩn cá nhân (áp dụng cả xem trước & xuất .docx)</b>
        <div class="row">
          <div><label>Cỡ chữ nội dung (pt)</label>
            <select id="pf-sz">
              <option value="13"${p.fontSizePt == 13 ? ' selected' : ''}>13 pt (NĐ 30/2020 – gọn)</option>
              <option value="14"${p.fontSizePt == 14 ? ' selected' : ''}>14 pt (NĐ 30/2020 & Đảng – chuẩn)</option>
              <option value="15"${p.fontSizePt == 15 ? ' selected' : ''}>15 pt (Khối Đảng – chữ lớn)</option>
            </select>
          </div>
          <div><label>Giãn dòng đoạn văn</label>
            <select id="pf-lh">
              <option value="1"${p.lineHeight == 1 ? ' selected' : ''}>1.0 (chuẩn)</option>
              <option value="1.15"${p.lineHeight == 1.15 ? ' selected' : ''}>1.15 (vừa)</option>
              <option value="1.3"${p.lineHeight == 1.3 ? ' selected' : ''}>1.3 (rộng)</option>
              <option value="1.5"${p.lineHeight == 1.5 ? ' selected' : ''}>1.5 (thoáng)</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div><label>Thụt đầu dòng</label>
            <select id="pf-ind">
              <option value="1"${p.indentCm == 1 ? ' selected' : ''}>1.0 cm (chuẩn NĐ 30)</option>
              <option value="1.27"${p.indentCm == 1.27 ? ' selected' : ''}>1.27 cm (0.5 inch)</option>
              <option value="0"${p.indentCm == 0 ? ' selected' : ''}>Không thụt đầu dòng</option>
            </select>
          </div>
          <div><label>Lề trang A4 (mm: trên/dưới/trái/phải)</label>
            <div class="mar-grid">
              <div><span>Trên</span><input type="number" id="pf-mar-top" min="5" max="50" value="${Number(p.marginsMm?.top ?? 20)}"></div>
              <div><span>Dưới</span><input type="number" id="pf-mar-bottom" min="5" max="50" value="${Number(p.marginsMm?.bottom ?? 20)}"></div>
              <div><span>Trái</span><input type="number" id="pf-mar-left" min="5" max="50" value="${Number(p.marginsMm?.left ?? 30)}"></div>
              <div><span>Phải</span><input type="number" id="pf-mar-right" min="5" max="50" value="${Number(p.marginsMm?.right ?? 20)}"></div>
            </div>
            <div style="margin-top:6px"><button type="button" class="btn" id="pf-mar-std" style="padding:4px 9px;font-size:12px">Chuẩn (20/20/30/20)</button></div>
          </div>
        </div>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;margin-top:10px">
          <input type="checkbox" id="pf-norm" style="width:auto"${p.autoNormalizeText !== false ? ' checked' : ''}> Tự động chuẩn hóa dấu câu, ngày tháng, Ủy/Uỷ khi tối ưu file
        </label>
        <div class="bar" style="margin-top:12px">
          <button type="button" class="btn p" id="pf-save">Lưu hồ sơ cá nhân</button>
          <button type="button" class="btn" id="pf-apply-now">Áp dụng vào bản đang soạn</button>
        </div>
        ${learnedTypes.length ? `<div style="margin-top:8px"><span class="mu" style="font-size:12px">Đã cá nhân hóa theo loại văn bản:</span> <div class="chips">${learnedTypes.map(k => `<span class="tag">${esc(k)}: ${p.perType[k].fontSizePt || p.fontSizePt}pt · thụt ${p.perType[k].indentCm ?? p.indentCm}cm</span>`).join('')}</div></div>` : ''}
      </div>

      <div class="card">
        <b>Tải lên file văn bản để phân tích & tối ưu thể thức</b>
        <p class="mu" style="margin:4px 0 10px">Hỗ trợ <b>.docx</b> (Word), <b>.pdf</b> (PDF). Xử lý trực tiếp trên trình duyệt, không gửi nội dung văn bản lên máy chủ.</p>
        <div class="drop" id="opt-drop">
          <input type="file" id="opt-file" accept=".docx,.pdf" style="display:none">
          <b>Kéo thả file văn bản vào đây hoặc bấm để chọn file</b>
          <div class="mu" style="margin-top:4px;font-size:12px">Hệ thống tự nhận diện Khối, Loại văn bản, Căn cứ, Nơi nhận, Lề, Font và tối ưu theo hồ sơ "${esc(p.name)}"</div>
        </div>
        <div id="opt-result" style="margin-top:14px">${renderAnalysisHtml(lastAnalysis, eff)}</div>
      </div>
    </div>`;

    bindOptEvents();
  }

  function renderAnalysisHtml(a, eff) {
    if (!a) return '<p class="mu">Chưa có file nào được tải lên. Hãy chọn một file .docx hoặc .pdf để bắt đầu tối ưu hóa thể thức.</p>';
    const m = a.meta;
    const modeLabel = a.detectedMode === 'nn' ? 'Khối Chính quyền (NĐ 30/2020)' : 'Khối Đảng (HD 05-HD/VPTW)';
    const typeObj = (T[a.detectedMode].find(t => t[0] === a.detectedType) || T[a.detectedMode][0]);
    return `
      <div class="kpi-row">
        <div class="kpi"><span class="mu">Tệp đã tải</span><b>${esc(a.fileName)}</b></div>
        <div class="kpi"><span class="mu">Khối nhận diện</span><b>${esc(modeLabel)}</b></div>
        <div class="kpi"><span class="mu">Loại văn bản</span><b>${esc(typeObj[1])} (${esc(a.detectedType)})</b></div>
        <div class="kpi"><span class="mu">Số lỗi/lệch chuẩn</span><b>${a.issues.length} mục</b></div>
      </div>
      <table class="tbl-cmp">
        <thead><tr><th>Tiêu chí thể thức</th><th>File gốc tải lên</th><th>Tối ưu theo chuẩn & cá nhân</th></tr></thead>
        <tbody>
          <tr><td>Phông chữ</td><td>${esc(m.fontFamily || `Chưa rõ (${m.format || 'PDF'})`)}</td><td>Times New Roman</td></tr>
          <tr><td>Cỡ chữ nội dung</td><td>${m.fontSizePt ? m.fontSizePt + ' pt' : 'Chưa rõ'}</td><td>${eff.fontSizePt} pt</td></tr>
          <tr><td>Giãn dòng / Thụt đầu dòng</td><td>${m.lineHeight ? m.lineHeight + ' / ' + (m.indentCm ?? '?') + ' cm' : 'Chưa rõ'}</td><td>${eff.lineHeight} / ${eff.indentCm} cm</td></tr>
          <tr><td>Lề A4 (Trên/Dưới/Trái/Phải)</td><td>${m.marginsMm ? `${m.marginsMm.top}/${m.marginsMm.bottom}/${m.marginsMm.left}/${m.marginsMm.right} mm` : 'Chưa rõ'}</td><td>${eff.marginsMm.top}/${eff.marginsMm.bottom}/${eff.marginsMm.left}/${eff.marginsMm.right} mm</td></tr>
          <tr><td>Trích yếu nhận diện</td><td colspan="2">${esc(a.draft.ty || '(Chưa nhận diện)')}</td></tr>
        </tbody>
      </table>
      ${a.issues.length ? a.issues.map(i => `<div class="it wa">${esc(i)}</div>`).join('') : '<div class="it ok">Cấu trúc và thông số cơ bản phù hợp thể thức quy định.</div>'}
      <div class="bar" style="margin-top:12px;align-items:center">
        <button type="button" class="btn p" id="opt-to-editor">Tối ưu & Nạp vào Soạn thảo</button>
        <select id="opt-ai-provider" style="width:auto;min-width:170px;padding:7px 8px" title="Chọn công cụ AI"></select>
        <button type="button" class="btn" id="opt-ai-polish" style="border-color:var(--pr);color:var(--pr)">✨ AI biên tập câu từ & nạp Soạn thảo</button>
        <button type="button" class="btn" id="opt-dl-docx">Xuất ngay Word (.docx) đã tối ưu</button>
        <button type="button" class="btn" id="opt-learn">Học thói quen file vào hồ sơ cá nhân</button>
        <button type="button" class="btn" id="opt-to-review">Gửi sang Rà soát</button>
      </div>
      <div id="opt-ai-err"></div>
    `;
  }

  function bindOptEvents() {
    const p = activeProfile();
    const sel = q('#pf-sel');
    if (sel) sel.onchange = () => {
      PF.activeId = sel.value;
      saveProfiles();
      refreshEditorProfileSelect();
      renderOptTab();
      render();
      msg('Đã chuyển sang hồ sơ "' + activeProfile().name + '".');
    };
    const addBtn = q('#pf-add');
    if (addBtn) addBtn.onclick = () => {
      if (PF.items.length >= 10) { msg('Tối đa 10 hồ sơ cá nhân trên trình duyệt này.'); return; }
      const idx = PF.items.length + 1;
      const np = defaultProfile('pf-' + Date.now(), 'Hồ sơ cá nhân ' + idx);
      PF.items.push(np);
      PF.activeId = np.id;
      saveProfiles();
      refreshEditorProfileSelect();
      renderOptTab();
      msg('Đã tạo hồ sơ mới.');
    };
    const delBtn = q('#pf-del');
    if (delBtn) delBtn.onclick = () => {
      if (PF.items.length <= 1) return;
      PF.items = PF.items.filter(x => x.id !== p.id);
      PF.activeId = PF.items[0].id;
      saveProfiles();
      refreshEditorProfileSelect();
      renderOptTab();
      render();
      msg('Đã xóa hồ sơ.');
    };

    const readFormToProfile = () => {
      const clampMm = (v, d) => {
        const n = Math.round(Number(v));
        return Number.isFinite(n) ? Math.min(50, Math.max(5, n)) : d;
      };
      p.name = q('#pf-name').value.trim() || 'Hồ sơ cá nhân';
      p.deptAbbr = q('#pf-dv').value.trim();
      p.defaultSignerRole = q('#pf-cv').value.trim();
      p.defaultSignerName = q('#pf-ten').value.trim();
      p.fontSizePt = Number(q('#pf-sz').value) || 14;
      p.lineHeight = Number(q('#pf-lh').value) || 1.0;
      p.indentCm = Number(q('#pf-ind').value);
      p.marginPreset = 'custom';
      p.marginsMm = {
        top: clampMm(q('#pf-mar-top')?.value, 20),
        bottom: clampMm(q('#pf-mar-bottom')?.value, 20),
        left: clampMm(q('#pf-mar-left')?.value, 30),
        right: clampMm(q('#pf-mar-right')?.value, 20)
      };
      p.autoNormalizeText = q('#pf-norm').checked;
      saveProfiles();
      refreshEditorProfileSelect();
    };

    const marStdBtn = q('#pf-mar-std');
    if (marStdBtn) marStdBtn.onclick = () => {
      if (q('#pf-mar-top')) q('#pf-mar-top').value = 20;
      if (q('#pf-mar-bottom')) q('#pf-mar-bottom').value = 20;
      if (q('#pf-mar-left')) q('#pf-mar-left').value = 30;
      if (q('#pf-mar-right')) q('#pf-mar-right').value = 20;
      readFormToProfile();
      render();
      msg('Đã đặt lề trang A4 về chuẩn (20/20/30/20 mm).');
    };

    const saveBtn = q('#pf-save');
    if (saveBtn) saveBtn.onclick = () => {
      readFormToProfile();
      render();
      renderOptTab();
      msg('Đã lưu hồ sơ "' + p.name + '".');
    };

    const applyBtn = q('#pf-apply-now');
    if (applyBtn) applyBtn.onclick = () => {
      readFormToProfile();
      applyProfileDefaultsToDraft();
      nav('soan');
      msg('Đã áp dụng định dạng cá nhân "' + p.name + '" vào bản soạn thảo.');
    };

    const drop = q('#opt-drop'), finp = q('#opt-file');
    if (drop && finp) {
      drop.onclick = () => finp.click();
      drop.ondragover = e => { e.preventDefault(); drop.classList.add('ov'); };
      drop.ondragleave = () => drop.classList.remove('ov');
      drop.ondrop = e => {
        e.preventDefault();
        drop.classList.remove('ov');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      };
      finp.onchange = () => { if (finp.files[0]) handleFile(finp.files[0]); };
    }

    const toEd = q('#opt-to-editor');
    if (toEd && lastAnalysis) toEd.onclick = () => {
      Object.assign(S, lastAnalysis.draft);
      setMode(lastAnalysis.detectedMode);
      sync();
      vis();
      render();
      nav('soan');
      msg('Đã tối ưu thể thức từ file "' + lastAnalysis.fileName + '" và nạp vào Soạn thảo.');
    };

    const optSel = q('#opt-ai-provider');
    if (optSel) populateProviderSelect(optSel);

    const optAi = q('#opt-ai-polish');
    if (optAi && lastAnalysis) optAi.onclick = async () => {
      const errBox = q('#opt-ai-err');
      if (errBox) errBox.innerHTML = '';
      const origTxt = optAi.textContent;
      optAi.disabled = true;
      optAi.textContent = 'Đang nhờ AI biên tập...';
      try {
        const d = lastAnalysis.draft;
        const orgName = lastAnalysis.detectedMode === 'dang' ? C.dO : C.nO;
        const res = await callAiPolish({
          mode: lastAnalysis.detectedMode,
          docType: lastAnalysis.detectedType,
          docTypeName: (T[lastAnalysis.detectedMode].find(t => t[0] === lastAnalysis.detectedType) || [])[1] || lastAnalysis.detectedType,
          orgName,
          editStyle: 'polish',
          provider: optSel ? optSel.value : selectedAiProvider,
          rawInfo: '',
          currentDraft: { ty: d.ty || '', cc: d.cc || '', nd: d.nd || '' }
        });
        Object.assign(S, d);
        if (res.ty) S.ty = res.ty;
        if (res.cc && res.cc.length) S.cc = res.cc.join('\n');
        if (res.nd) S.nd = res.nd;
        setMode(lastAnalysis.detectedMode);
        sync();
        vis();
        render();
        nav('soan');
        msg('AI (' + (res.provider || 'Miễn phí') + ') đã biên tập mượt mà & nạp vào Soạn thảo.');
      } catch (e) {
        if (errBox) errBox.innerHTML = `<div class="ai-err">${esc(e.message || 'Không thể kết nối AI.')}</div>`;
        msg(e.message || 'Không thể xử lý AI.');
      } finally {
        optAi.disabled = false;
        optAi.textContent = origTxt;
      }
    };

    const dlBtn = q('#opt-dl-docx');
    if (dlBtn && lastAnalysis) dlBtn.onclick = async () => {
      const snapS = { ...S }, snapM = mode;
      try {
        Object.assign(S, lastAnalysis.draft);
        mode = lastAnalysis.detectedMode;
        const blob = await makeDocx();
        const fn = typeof docFn === 'function'
          ? docFn(lastAnalysis.detectedType, lastAnalysis.draft.date || S.date, lastAnalysis.draft.ty || lastAnalysis.fileName)
          : `${lastAnalysis.detectedType}.docx`;
        const u = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = u;
        a.download = fn;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 10000);
        msg('Đã xuất file Word (.docx) tối ưu theo chuẩn & hồ sơ cá nhân.');
      } catch (e) {
        msg('Không xuất được tệp: ' + (e.message || e));
      } finally {
        Object.assign(S, snapS);
        mode = snapM;
      }
    };

    const learnBtn = q('#opt-learn');
    if (learnBtn && lastAnalysis) learnBtn.onclick = () => {
      const m = lastAnalysis.meta;
      const t = lastAnalysis.detectedType;
      p.perType = p.perType || {};
      const clampedSz = m.fontSizePt ? (m.fontSizePt <= 13 ? 13 : m.fontSizePt >= 15 ? 15 : 14) : p.fontSizePt;
      const clampedInd = m.indentCm !== null && m.indentCm !== undefined ? (m.indentCm === 0 ? 0 : m.indentCm >= 1.15 ? 1.27 : 1.0) : p.indentCm;
      const clampedLh = m.lineHeight ? (m.lineHeight <= 1.2 ? 1.15 : m.lineHeight >= 1.4 ? 1.5 : 1.3) : p.lineHeight;
      p.perType[t] = {
        fontSizePt: clampedSz,
        indentCm: clampedInd,
        lineHeight: clampedLh,
        marginsMm: m.marginsMm ? {
          top: Math.min(25, Math.max(20, m.marginsMm.top)),
          bottom: Math.min(25, Math.max(20, m.marginsMm.bottom)),
          left: Math.min(35, Math.max(30, m.marginsMm.left)),
          right: Math.min(20, Math.max(15, m.marginsMm.right))
        } : p.marginsMm
      };
      if (lastAnalysis.draft.cv && !p.defaultSignerRole) p.defaultSignerRole = lastAnalysis.draft.cv;
      if (lastAnalysis.draft.ten && !p.defaultSignerName) p.defaultSignerName = lastAnalysis.draft.ten;
      saveProfiles();
      renderOptTab();
      render();
      msg(`Đã học thói quen định dạng loại "${t}" (chuẩn hóa trong khung NĐ 30/2020) vào hồ sơ "${p.name}".`);
    };

    const toRev = q('#opt-to-review');
    if (toRev && lastAnalysis) toRev.onclick = () => {
      q('#rs').value = (lastAnalysis.draft.cc ? lastAnalysis.draft.cc + '\n' : '') + lastAnalysis.draft.nd;
      nav('ra');
      runCheck(q('#rs').value);
    };
  }

  async function handleFile(file) {
    try {
      lastAnalysis = await parseUploadedFile(file);
      renderOptTab();
      msg('Đã phân tích xong file "' + file.name + '".');
    } catch (e) {
      msg(e.message || 'Không đọc được tệp đã chọn.');
    }
  }

  /* ========================================================================
   * PHẦN 3: NGƯỜI DÙNG ĐÁNH GIÁ TRẢI NGHIỆM (CHỌN SAO + GỢI Ý NHANH)
   * ======================================================================== */
  const RV_KEY = 'vts-reviews-v1';
  const STAR_LABELS = {
    1: '1/5 – Chưa hài lòng, cần khắc phục',
    2: '2/5 – Còn nhiều điểm chưa thuận tiện',
    3: '3/5 – Bình thường, đáp ứng cơ bản',
    4: '4/5 – Tốt, dễ sử dụng',
    5: '5/5 – Rất hài lòng, chuẩn và hữu ích!'
  };
  const SUGGESTIONS_POS = [
    'Giao diện rõ ràng, dễ thao tác',
    'Đúng thể thức NĐ 30/2020 & HD 05-HD/VPTW',
    'Xuất file Word (.docx) nhanh, đúng chuẩn',
    'Mẫu soạn sẵn đầy đủ, tiết kiệm thời gian',
    'Rà soát lỗi thể thức chính xác',
    'Cấu hình đơn vị & danh bạ lãnh đạo rất tiện',
    'Tối ưu hóa file tải lên rất hữu ích'
  ];
  const SUGGESTIONS_IMP = [
    'Cần thêm mẫu văn bản chuyên ngành',
    'Cần tối ưu thêm căn lề khi xuất Word',
    'Cấu hình đơn vị cần trực quan hơn',
    'Cần hướng dẫn sử dụng chi tiết hơn',
    'Rà soát cần bắt thêm lỗi chính tả',
    'Muốn đồng bộ dữ liệu giữa nhiều máy'
  ];

  const VS_KEY = 'vts-visits-v1';
  let visitCount = Number(ls.g(VS_KEY, 0)) || 0;
  let rvState = { stars: 5, hover: 0, tags: new Set(), note: '' };
  let reviews = ls.g(RV_KEY, []);

  async function syncVisits() {
    const visited = sessionStorage.getItem('vts-visited-v1');
    if (!visited) {
      sessionStorage.setItem('vts-visited-v1', '1');
      visitCount += 1;
      ls.s(VS_KEY, visitCount);
    }
    try {
      const r = await fetch('/api/visits', {
        method: visited ? 'GET' : 'POST',
        headers: { Accept: 'application/json' }
      });
      const ct = r.headers.get('content-type') || '';
      if (r.ok && ct.includes('application/json')) {
        const d = await r.json();
        if (d && Number.isFinite(Number(d.visits))) {
          visitCount = Math.max(visitCount, Number(d.visits));
          ls.s(VS_KEY, visitCount);
          if (q('#dg.on')) renderDgTab();
        }
      }
    } catch (_) {}
  }

  async function syncServerReviews() {
    try {
      const r = await fetch('/api/reviews', { headers: { Accept: 'application/json' } });
      const ct = r.headers.get('content-type') || '';
      if (r.ok && ct.includes('application/json')) {
        const list = await r.json();
        if (Array.isArray(list) && list.length) {
          const seen = new Set(reviews.map(x => x.id));
          list.forEach(x => { if (x && x.id && !seen.has(x.id)) reviews.push(x); });
          reviews.sort((a, b) => b.ts - a.ts);
          ls.s(RV_KEY, reviews.slice(0, 100));
          if (q('#dg.on')) renderDgTab();
        }
      }
    } catch (_) {
      /* Bỏ qua nếu chạy trên static host không có API */
    }
  }

  function renderDgTab() {
    const el = q('#dg');
    if (!el) return;
    const chips = rvState.stars >= 4
      ? [...SUGGESTIONS_POS, ...SUGGESTIONS_IMP]
      : [...SUGGESTIONS_IMP, ...SUGGESTIONS_POS];

    const total = reviews.length;
    const avg = total ? (reviews.reduce((s, r) => s + r.stars, 0) / total).toFixed(1) : '—';
    const counts = [5, 4, 3, 2, 1].map(st => reviews.filter(r => r.stars === st).length);

    el.innerHTML = `<div class="dg-grid">
      <div class="card">
        <b>Đánh giá trải nghiệm của bạn</b>
        <label style="margin-top:8px">1. Mức độ hài lòng</label>
        <div class="stars" id="dg-stars" style="margin:4px 0">
          ${[1, 2, 3, 4, 5].map(i => `<button type="button" class="star-btn${i <= (rvState.hover || rvState.stars) ? ' on' : ''}" data-s="${i}" title="${i} sao">★</button>`).join('')}
        </div>
        <div id="dg-star-lbl" style="font-weight:600;color:var(--pr);margin-bottom:6px">${STAR_LABELS[rvState.stars]}</div>

        <label style="margin-top:6px">2. Chọn nhanh nhận xét gợi ý (có thể chọn nhiều)</label>
        <div class="chips" id="dg-chips">
          ${chips.map(c => `<button type="button" class="chip${rvState.tags.has(c) ? ' on' : ''}" data-c="${at(c)}">${esc(c)}</button>`).join('')}
        </div>

        <label style="margin-top:6px">3. Góp ý thêm (tùy chọn – không bắt buộc)</label>
        <input id="dg-note" maxlength="500" value="${at(rvState.note)}">
        <div class="bar" style="margin-top:12px">
          <button type="button" class="btn p" id="dg-submit">Gửi đánh giá</button>
          <button type="button" class="btn" id="dg-reset">Làm lại</button>
        </div>
      </div>

      <div class="card">
        <b>Thống kê & Lịch sử đánh giá</b>
        <div class="kpi-row">
          <div class="kpi"><span class="mu">Điểm trung bình</span><b>${avg} / 5 ★</b></div>
          <div class="kpi"><span class="mu">Tổng lượt đánh giá</span><b>${total} lượt</b></div>
          <div class="kpi"><span class="mu">Lượt truy cập</span><b>${visitCount.toLocaleString('vi-VN')} lượt</b></div>
        </div>
        <div style="margin:10px 0">
          ${[5, 4, 3, 2, 1].map((st, idx) => {
            const pct = total ? Math.round((counts[idx] / total) * 100) : 0;
            return `<div class="rbar"><span style="width:42px">${st} sao</span><div class="rbar-track"><div class="rbar-fill" style="width:${pct}%"></div></div><span class="mu" style="width:38px;text-align:right">${counts[idx]}</span></div>`;
          }).join('')}
        </div>
        <b style="display:block;margin:12px 0 6px">Các đánh giá gần đây</b>
        <div id="dg-list">
          ${total ? reviews.slice(0, 20).map(r => `
            <div class="it ok">
              <div style="display:flex;justify-content:space-between;gap:8px">
                <b style="color:#d97706">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</b>
                <span class="mu" style="font-size:12px">${new Date(r.ts).toLocaleString('vi-VN')}</span>
              </div>
              ${r.tags && r.tags.length ? `<div class="chips" style="margin:6px 0">${r.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
              ${r.note ? `<div>${esc(r.note)}</div>` : ''}
            </div>`).join('') : '<p class="mu">Chưa có đánh giá nào. Hãy là người đầu tiên gửi đánh giá!</p>'}
        </div>
      </div>
    </div>`;

    bindDgEvents();
  }

  function bindDgEvents() {
    qa('#dg-stars .star-btn').forEach(b => {
      const val = Number(b.dataset.s);
      b.onmouseenter = () => {
        rvState.hover = val;
        qa('#dg-stars .star-btn').forEach(x => x.classList.toggle('hv', Number(x.dataset.s) <= val));
      };
      b.onmouseleave = () => {
        rvState.hover = 0;
        qa('#dg-stars .star-btn').forEach(x => x.classList.remove('hv'));
      };
      b.onclick = () => {
        rvState.stars = val;
        renderDgTab();
      };
    });

    qa('#dg-chips .chip').forEach(c => {
      c.onclick = () => {
        const txt = c.dataset.c;
        if (rvState.tags.has(txt)) rvState.tags.delete(txt);
        else rvState.tags.add(txt);
        c.classList.toggle('on');
      };
    });

    const noteEl = q('#dg-note');
    if (noteEl) noteEl.oninput = () => { rvState.note = noteEl.value; };

    const resetBtn = q('#dg-reset');
    if (resetBtn) resetBtn.onclick = () => {
      rvState = { stars: 5, hover: 0, tags: new Set(), note: '' };
      renderDgTab();
    };

    const subBtn = q('#dg-submit');
    if (subBtn) subBtn.onclick = async () => {
      const entry = {
        id: 'rv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        stars: rvState.stars,
        tags: [...rvState.tags],
        note: (rvState.note || '').trim(),
        ts: Date.now()
      };
      reviews.unshift(entry);
      ls.s(RV_KEY, reviews.slice(0, 100));
      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      } catch (_) {}
      rvState = { stars: 5, hover: 0, tags: new Set(), note: '' };
      renderDgTab();
      msg('Cảm ơn bạn đã gửi đánh giá trải nghiệm!');
    };
  }

  /* ========================================================================
   * PHẦN 4: TRỢ LÝ AI BIÊN TẬP & HOÀN THIỆN NỘI DUNG VĂN BẢN (ĐA CÔNG CỤ AI)
   * ======================================================================== */
  const AI_PROVIDERS = [
    ['auto', 'Tự động (ưu tiên AI sẵn có)'],
    ['gemini', 'Google Gemini'],
    ['openai', 'ChatGPT (OpenAI)'],
    ['claude', 'Claude (Anthropic)'],
    ['groq', 'Groq (Llama 3.3)'],
    ['workers_ai', 'Cloudflare Workers AI']
  ];
  let availableProviders = {};
  let selectedAiProvider = ls.g('vts-ai-prov', 'auto');

  function populateProviderSelect(sel) {
    if (!sel) return;
    sel.innerHTML = AI_PROVIDERS.map(([id, label]) => {
      const tag = id === 'auto'
        ? ''
        : (availableProviders[id] ? ' ✓' : (Object.keys(availableProviders).length ? ' (chưa cấu hình)' : ''));
      return `<option value="${id}">${esc(label + tag)}</option>`;
    }).join('');
    sel.value = AI_PROVIDERS.some(x => x[0] === selectedAiProvider) ? selectedAiProvider : 'auto';
    sel.onchange = () => {
      selectedAiProvider = sel.value;
      ls.s('vts-ai-prov', selectedAiProvider);
      qa('#ai-provider, #opt-ai-provider').forEach(o => { if (o !== sel) o.value = selectedAiProvider; });
    };
  }

  async function detectAiProviders() {
    try {
      const resp = await fetch('/api/ai/polish', { headers: { Accept: 'application/json' } });
      const ct = resp.headers.get('content-type') || '';
      if (resp.ok && ct.includes('application/json')) {
        const d = await resp.json();
        if (d && d.providers) {
          availableProviders = d.providers;
          populateProviderSelect(q('#ai-provider'));
          populateProviderSelect(q('#opt-ai-provider'));
        }
      }
    } catch (_) {}
  }

  async function callAiPolish(payload) {
    const resp = await fetch('/api/ai/polish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const ct = resp.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      throw new Error('Máy chủ không trả về JSON cho /api/ai/polish (mã ' + resp.status + '). Hãy kiểm tra thư mục functions/api/ai/polish.js trên Cloudflare Pages (Build output directory phải là "/" để kích hoạt Functions).');
    }
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || ('Lỗi máy chủ AI (' + resp.status + ').'));
    }
    return data;
  }

  function buildPersonalAiPrompt() {
    const rawInfo = (q('#ai-raw')?.value || '').trim();
    const editStyle = q('#ai-style')?.value || 'polish';
    const std = mode === 'dang' ? 'Hướng dẫn 05-HD/VPTW (Khối Đảng)' : 'Nghị định 30/2020/NĐ-CP (Khối Chính quyền)';
    const styleNote = editStyle === 'draft'
      ? 'Hãy soạn thảo hoàn chỉnh thành văn bản hành chính chuẩn mực từ ghi chú thô.'
      : editStyle === 'concise'
        ? 'Hãy biên tập lại ngắn gọn, cô đọng, súc tích hơn và loại bỏ ý lặp.'
        : 'Hãy biên tập lại câu từ hành chính mượt mà, chặt chẽ, loại bỏ ý trùng lặp.';
    return [
      `Bạn là chuyên gia văn thư hành chính Việt Nam. ${styleNote}`,
      `Chuẩn thể thức: ${std}.`,
      `Cơ quan ban hành: ${(mode === 'dang' ? C.dO : C.nO) || 'Trung tâm Đổi mới sáng tạo'}.`,
      `Loại văn bản: ${name(S.type)} (${S.type}).`,
      rawInfo ? `\nThông tin gốc / ghi chú:\n${rawInfo}` : '',
      S.ty ? `\nTrích yếu hiện tại:\n${S.ty}` : '',
      S.cc ? `\nCăn cứ hiện tại:\n${S.cc}` : '',
      S.nd ? `\nNội dung nháp hiện tại:\n${S.nd}` : '',
      `\nHãy trả về đúng định dạng sau (không thêm lời giải thích thừa):`,
      `Trích yếu: <trích yếu ngắn gọn>`,
      `Căn cứ:\n<mỗi dòng một căn cứ, nếu có>`,
      `Nội dung:\n<toàn bộ phần nội dung đã hoàn thiện, giữ nguyên cấu trúc Điều/khoản/mục nếu có>`
    ].filter(Boolean).join('\n');
  }

  function parseExternalAiText(text) {
    const t = String(text || '').trim();
    if (!t) return null;
    const jsonMatch = t.match(/\{[\s\S]*"nd"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const obj = JSON.parse(jsonMatch[0]);
        return {
          ty: typeof obj.ty === 'string' ? obj.ty.trim() : '',
          cc: Array.isArray(obj.cc) ? obj.cc.map(x => String(x).trim()).filter(Boolean) : [],
          nd: typeof obj.nd === 'string' ? obj.nd.trim() : ''
        };
      } catch (_) {}
    }
    let ty = '', cc = [], nd = '';
    const tyM = t.match(/(?:^|\n)\s*(?:Trích yếu|V\/v)\s*:\s*(.+)/i);
    if (tyM) ty = tyM[1].trim();
    const ndIdx = t.search(/(?:^|\n)\s*Nội dung(?:\s+văn bản)?\s*:/i);
    const ccIdx = t.search(/(?:^|\n)\s*Căn cứ(?:\s+ban hành)?\s*:/i);
    if (ndIdx >= 0) {
      nd = t.slice(ndIdx).replace(/^\s*Nội dung(?:\s+văn bản)?\s*:\s*/i, '').trim();
      if (ccIdx >= 0 && ccIdx < ndIdx) {
        cc = t.slice(ccIdx, ndIdx).replace(/^\s*Căn cứ(?:\s+ban hành)?\s*:\s*/i, '').split('\n').map(x => x.trim()).filter(Boolean);
      }
    } else {
      nd = t;
    }
    return { ty, cc, nd };
  }

  (function mountAiBoxInEditor() {
    const card = q('#soan .grid .card');
    if (!card) return;
    const ndLabel = [...card.querySelectorAll('label')].find(lb => lb.textContent.includes('Nội dung văn bản'));
    const box = document.createElement('details');
    box.className = 'ai-box';
    box.id = 'ai-box';
    box.innerHTML = `
      <summary>
        <span>✨ Trợ lý AI biên tập &amp; hoàn thiện nội dung văn bản</span>
      </summary>
      <div style="margin-top:8px">
        <p class="mu" style="margin:0 0 6px;font-size:12px">Dán thông tin gốc, gạch đầu dòng thô hoặc ý chính cần trình bày. AI sẽ biên tập lại câu từ suôn mượt, cô đọng, bỏ ý trùng lặp và đúng thể thức NĐ 30/2020 hoặc HD 05-HD/VPTW.</p>
        <label style="margin-top:4px">Thông tin gốc / ghi chú thô (tùy chọn nếu đã có nội dung bên dưới)</label>
        <textarea id="ai-raw" style="min-height:86px" placeholder="VD: Họp giao ban tuần tới sáng thứ Hai lúc 8h tại phòng họp số 2, đánh giá tiến độ chuyển đổi số quý II, các phòng báo cáo kết quả, hoàn thành trước 15/5..."></textarea>
        <div class="row" style="margin-top:6px">
          <div>
            <label style="margin-top:4px">Công cụ AI máy chủ</label>
            <select id="ai-provider"></select>
          </div>
          <div>
            <label style="margin-top:4px">Chế độ biên tập</label>
            <select id="ai-style">
              <option value="polish">Biên tập suôn mượt, bỏ lặp nội dung</option>
              <option value="draft">Hoàn thiện thành văn bản từ ghi chú thô</option>
              <option value="concise">Rút gọn cô đọng, súc tích hơn nữa</option>
            </select>
          </div>
        </div>
        <div style="margin-top:8px">
          <button type="button" class="btn p" id="ai-run" style="width:100%">✨ Biên tập với AI</button>
        </div>
        <div id="ai-err"></div>
        <div id="ai-out" style="display:none"></div>

        <div class="ai-ext">
          <b style="font-size:12.5px">Hoặc kết nối trực tiếp bằng tài khoản AI của bạn (không cần API Key máy chủ)</b>
          <p class="mu" style="margin:3px 0 6px;font-size:12px">Bước 1: Sao chép yêu cầu &amp; nội dung → Bước 2: Chọn công cụ AI của bạn để mở và dán → Bước 3: Dán kết quả vào ô dưới.</p>
          <div class="ai-ext-links">
            <button type="button" class="btn" id="ai-copy-prompt">📋 Sao chép yêu cầu &amp; nội dung</button>
            <a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT ↗</a>
            <a class="btn" href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">Google Gemini ↗</a>
            <a class="btn" href="https://claude.ai/" target="_blank" rel="noopener noreferrer">Claude ↗</a>
            <a class="btn" href="https://copilot.microsoft.com/" target="_blank" rel="noopener noreferrer">Copilot ↗</a>
            <a class="btn" href="https://grok.com/" target="_blank" rel="noopener noreferrer">Grok ↗</a>
          </div>
          <textarea id="ai-paste" style="min-height:70px;margin-top:6px" placeholder="Dán kết quả từ ChatGPT / Gemini / Claude vào đây rồi bấm Áp dụng..."></textarea>
          <div class="bar" style="margin:6px 0 0">
            <button type="button" class="btn p" id="ai-paste-apply">📥 Áp dụng kết quả đã dán</button>
          </div>
        </div>
      </div>
    `;
    if (ndLabel) card.insertBefore(box, ndLabel);
    else card.appendChild(box);

    populateProviderSelect(q('#ai-provider'));
    detectAiProviders();

    let lastAiResult = null;
    const runBtn = q('#ai-run');
    const errEl = q('#ai-err');
    const outEl = q('#ai-out');

    const copyPromptBtn = q('#ai-copy-prompt');
    if (copyPromptBtn) copyPromptBtn.onclick = async () => {
      const promptTxt = buildPersonalAiPrompt();
      try {
        await navigator.clipboard.writeText(promptTxt);
        msg('Đã sao chép yêu cầu & nội dung! Hãy chọn ChatGPT / Gemini / Claude bên cạnh rồi dán (Ctrl+V).');
      } catch (_) {
        const ta = q('#ai-paste');
        if (ta) {
          ta.value = promptTxt;
          ta.select();
          try { document.execCommand('copy'); } catch (__) {}
        }
        msg('Đã đưa yêu cầu vào ô bên dưới — hãy nhấn Ctrl+C để sao chép rồi mở công cụ AI.');
      }
    };

    const pasteApplyBtn = q('#ai-paste-apply');
    if (pasteApplyBtn) pasteApplyBtn.onclick = () => {
      const parsed = parseExternalAiText(q('#ai-paste')?.value || '');
      if (!parsed || (!parsed.nd && !parsed.ty)) {
        msg('Hãy dán nội dung kết quả từ ChatGPT / Gemini / Claude trước khi áp dụng.');
        return;
      }
      if (parsed.ty) S.ty = parsed.ty;
      if (parsed.cc && parsed.cc.length) S.cc = parsed.cc.join('\n');
      if (parsed.nd) S.nd = parsed.nd;
      sync();
      render();
      msg('Đã áp dụng kết quả AI vào bản soạn thảo.');
    };

    if (runBtn) runBtn.onclick = async () => {
      errEl.innerHTML = '';
      const rawInfo = (q('#ai-raw')?.value || '').trim();
      const editStyle = q('#ai-style')?.value || 'polish';
      const provider = q('#ai-provider')?.value || selectedAiProvider || 'auto';
      if (!rawInfo && !(S.nd || '').trim() && !(S.ty || '').trim()) {
        errEl.innerHTML = '<div class="ai-err">Hãy nhập thông tin gốc vào ô trên hoặc điền nháp ở ô Nội dung văn bản rồi bấm lại.</div>';
        return;
      }

      const orig = runBtn.textContent;
      runBtn.disabled = true;
      runBtn.textContent = 'Đang biên tập...';
      outEl.style.display = 'none';

      try {
        const res = await callAiPolish({
          mode,
          docType: S.type,
          docTypeName: name(S.type),
          orgName: mode === 'dang' ? C.dO : C.nO,
          editStyle,
          provider,
          rawInfo,
          currentDraft: {
            ty: S.ty || '',
            cc: S.cc || '',
            nd: S.nd || ''
          }
        });
        lastAiResult = res;
        outEl.className = 'ai-out';
        outEl.style.display = 'block';
        outEl.innerHTML = `
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px">
            <b>Đề xuất đã biên tập</b>
            <span class="tag">${esc(res.provider || 'AI miễn phí')}</span>
          </div>
          ${res.summary ? `<div class="it ok" style="margin:4px 0 8px">${esc(res.summary)}</div>` : ''}
          ${res.ty ? `<div><span class="mu">Trích yếu:</span> <b>${esc(res.ty)}</b></div>` : ''}
          ${res.cc && res.cc.length ? `<div style="margin-top:4px"><span class="mu">Căn cứ (${res.cc.length} dòng):</span><div class="ai-pre" style="max-height:90px">${esc(res.cc.join('\n'))}</div></div>` : ''}
          <div><span class="mu">Nội dung đã biên tập:</span><div class="ai-pre">${esc(res.nd || '')}</div></div>
          <div class="bar" style="margin:8px 0 0">
            <button type="button" class="btn p" id="ai-apply-all">Áp dụng toàn bộ (Trích yếu, Căn cứ, Nội dung)</button>
            <button type="button" class="btn" id="ai-apply-nd">Chỉ thay Nội dung</button>
            <button type="button" class="btn" id="ai-close">Đóng</button>
          </div>
        `;
        q('#ai-apply-all').onclick = () => {
          if (!lastAiResult) return;
          if (lastAiResult.ty) S.ty = lastAiResult.ty;
          if (lastAiResult.cc && lastAiResult.cc.length) S.cc = lastAiResult.cc.join('\n');
          if (lastAiResult.nd) S.nd = lastAiResult.nd;
          sync();
          render();
          msg('Đã áp dụng bản biên tập AI vào văn bản đang soạn.');
        };
        q('#ai-apply-nd').onclick = () => {
          if (!lastAiResult) return;
          if (lastAiResult.nd) S.nd = lastAiResult.nd;
          sync();
          render();
          msg('Đã cập nhật phần Nội dung văn bản từ gợi ý AI.');
        };
        q('#ai-close').onclick = () => { outEl.style.display = 'none'; };
      } catch (e) {
        errEl.innerHTML = `<div class="ai-err">${esc(e.message || 'Không thể kết nối máy chủ AI.')} <span style="color:var(--tx)">Bạn có thể dùng mục <b>"Hoặc kết nối trực tiếp bằng tài khoản AI của bạn"</b> ngay bên dưới mà không cần cấu hình máy chủ.</span></div>`;
      } finally {
        runBtn.disabled = false;
        runBtn.textContent = orig;
      }
    };
  })();

  /* ========================================================================
   * PHẦN 5: KẾT NỐI SỰ KIỆN ĐIỀU HƯỚNG & KHỞI TẠO
   * ======================================================================== */
  qa('#nav button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.t === 'opt') renderOptTab();
      if (b.dataset.t === 'dg') renderDgTab();
    });
  });

  const soanProfSel = q('#soan-prof-sel');
  if (soanProfSel) soanProfSel.onchange = () => {
    PF.activeId = soanProfSel.value;
    saveProfiles();
    render();
    msg('Đã chọn hồ sơ cá nhân "' + activeProfile().name + '".');
  };
  const soanProfApply = q('#soan-prof-apply');
  if (soanProfApply) soanProfApply.onclick = () => {
    applyProfileDefaultsToDraft();
    msg('Đã áp dụng thông tin & định dạng hồ sơ "' + activeProfile().name + '".');
  };
  const soanProfGo = q('#soan-prof-go');
  if (soanProfGo) soanProfGo.onclick = () => {
    nav('opt');
    renderOptTab();
  };

  refreshEditorProfileSelect();
  renderOptTab();
  renderDgTab();
  render();
  syncServerReviews();
  syncVisits();
})();
