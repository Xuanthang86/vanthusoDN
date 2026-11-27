/* features.js – Tối ưu hóa thể thức theo cá nhân (upload file) & Đánh giá trải nghiệm */
(function () {
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const at = s => esc(s).replace(/"/g, '&quot;');

  /* ---------- CSS bổ sung ---------- */
  const css = document.createElement('style');
  css.textContent = `
  .opt-grid{display:grid;grid-template-columns:minmax(320px,430px) 1fr;gap:16px}
  @media(max-width:900px){.opt-grid{grid-template-columns:1fr}}
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
    lineHeight: 1.3,
    indentCm: 1.0,
    marginPreset: 'nd30',
    marginsMm: { top: 20, bottom: 20, left: 30, right: 15 },
    autoNormalizeText: true,
    perType: {}
  });

  function loadProfiles() {
    const raw = ls.g(PF_KEY, null);
    if (raw && Array.isArray(raw.items) && raw.items.length) return raw;
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
      lineHeight: Number(ov.lineHeight || p.lineHeight || 1.3),
      indentCm: ov.indentCm !== undefined ? Number(ov.indentCm) : Number(p.indentCm ?? 1.0),
      marginsMm: { ...(p.marginsMm || { top: 20, bottom: 20, left: 30, right: 15 }), ...(ov.marginsMm || {}) },
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
    const pxFont = Math.round(fmt.fontSizePt * 1.08); // ~14pt -> 15px
    paper.style.fontSize = pxFont + 'px';
    paper.style.lineHeight = String(fmt.lineHeight);
    const mmToPx = mm => Math.round(mm * 1.9);
    paper.style.padding = `${mmToPx(fmt.marginsMm.top)}px ${mmToPx(fmt.marginsMm.right)}px ${mmToPx(fmt.marginsMm.bottom)}px ${mmToPx(fmt.marginsMm.left)}px`;
    qa('#paper p').forEach(el => {
      if (el.style.textIndent) el.style.textIndent = fmt.indentCm + 'cm';
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
    xml = xml.replace(/<w:spacing([^>]*?)w:line="312"/g, `<w:spacing$1w:line="${lineVal}"`);
    xml = xml.replace(/w:firstLine="567"/g, `w:firstLine="${indentTwips}"`);
    xml = xml.replace(
      /<w:pgMar w:top="\d+" w:right="\d+" w:bottom="\d+" w:left="\d+"/,
      `<w:pgMar w:top="${mm2tw(fmt.marginsMm.top)}" w:right="${mm2tw(fmt.marginsMm.right)}" w:bottom="${mm2tw(fmt.marginsMm.bottom)}" w:left="${mm2tw(fmt.marginsMm.left)}"`
    );
    return xml;
  };

  /* ========================================================================
   * PHẦN 2: PHÂN TÍCH & TỐI ƯU HÓA FILE UPLOAD (.docx / .txt / .html)
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
      throw new Error('Định dạng .doc cũ chưa hỗ trợ trực tiếp trên trình duyệt. Hãy mở file trong Word và chọn Lưu dạng .docx rồi tải lại.');
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

      // Fallback font/size từ styles.xml
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
        right: tw2mm(pgMar.getAttribute('w:right')) || 15
      } : null;

      return analyzeExtractedData(lines, {
        format: 'DOCX',
        fontFamily: topKey(fontCount) || 'Times New Roman',
        fontSizePt: Number(topKey(sizeCount)) || 14,
        lineHeight: Number(topKey(lineSpCount)) || 1.3,
        indentCm: Number(topKey(indentCount)) || 1.0,
        marginsMm
      }, file.name);
    }

    const raw = await file.text();
    let lines;
    if (ext === 'html' || ext === 'htm') {
      const doc = new DOMParser().parseFromString(raw, 'text/html');
      lines = (doc.body ? doc.body.innerText : raw).split('\n').map(x => x.trim()).filter(Boolean);
    } else {
      lines = raw.split('\n').map(x => x.trim()).filter(Boolean);
    }
    return analyzeExtractedData(lines, {
      format: ext.toUpperCase() || 'TXT',
      fontFamily: null,
      fontSizePt: null,
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
              <option value="1.15"${p.lineHeight == 1.15 ? ' selected' : ''}>1.15 (chặt)</option>
              <option value="1.3"${p.lineHeight == 1.3 ? ' selected' : ''}>1.3 (chuẩn NĐ 30)</option>
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
            <select id="pf-mar">
              <option value="nd30"${p.marginPreset === 'nd30' ? ' selected' : ''}>Chuẩn NĐ 30 (20 / 20 / 30 / 15)</option>
              <option value="thoang"${p.marginPreset === 'thoang' ? ' selected' : ''}>Rộng đều (22 / 22 / 32 / 18)</option>
              <option value="max"${p.marginPreset === 'max' ? ' selected' : ''}>Lề trên/dưới tối đa (25 / 25 / 35 / 20)</option>
            </select>
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
        <p class="mu" style="margin:4px 0 10px">Hỗ trợ <b>.docx</b> (Word), <b>.txt</b>, <b>.html</b>. Xử lý trực tiếp trên trình duyệt, không gửi nội dung văn bản lên máy chủ.</p>
        <div class="drop" id="opt-drop">
          <input type="file" id="opt-file" accept=".docx,.txt,.md,.html,.htm" style="display:none">
          <b>Kéo thả file văn bản vào đây hoặc bấm để chọn file</b>
          <div class="mu" style="margin-top:4px;font-size:12px">Hệ thống tự nhận diện Khối, Loại văn bản, Căn cứ, Nơi nhận, Lề, Font và tối ưu theo hồ sơ "${esc(p.name)}"</div>
        </div>
        <div id="opt-result" style="margin-top:14px">${renderAnalysisHtml(lastAnalysis, eff)}</div>
      </div>
    </div>`;

    bindOptEvents();
  }

  function renderAnalysisHtml(a, eff) {
    if (!a) return '<p class="mu">Chưa có file nào được tải lên. Hãy chọn một file .docx hoặc .txt để bắt đầu tối ưu hóa thể thức.</p>';
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
          <tr><td>Phông chữ</td><td>${esc(m.fontFamily || 'Chưa rõ (TXT)')}</td><td>Times New Roman</td></tr>
          <tr><td>Cỡ chữ nội dung</td><td>${m.fontSizePt ? m.fontSizePt + ' pt' : 'Chưa rõ'}</td><td>${eff.fontSizePt} pt</td></tr>
          <tr><td>Giãn dòng / Thụt đầu dòng</td><td>${m.lineHeight ? m.lineHeight + ' / ' + (m.indentCm ?? '?') + ' cm' : 'Chưa rõ'}</td><td>${eff.lineHeight} / ${eff.indentCm} cm</td></tr>
          <tr><td>Lề A4 (Trên/Dưới/Trái/Phải)</td><td>${m.marginsMm ? `${m.marginsMm.top}/${m.marginsMm.bottom}/${m.marginsMm.left}/${m.marginsMm.right} mm` : 'Chưa rõ'}</td><td>${eff.marginsMm.top}/${eff.marginsMm.bottom}/${eff.marginsMm.left}/${eff.marginsMm.right} mm</td></tr>
          <tr><td>Trích yếu nhận diện</td><td colspan="2">${esc(a.draft.ty || '(Chưa nhận diện)')}</td></tr>
        </tbody>
      </table>
      ${a.issues.length ? a.issues.map(i => `<div class="it wa">${esc(i)}</div>`).join('') : '<div class="it ok">Cấu trúc và thông số cơ bản phù hợp thể thức quy định.</div>'}
      <div class="bar" style="margin-top:12px">
        <button type="button" class="btn p" id="opt-to-editor">Tối ưu & Nạp vào Soạn thảo</button>
        <button type="button" class="btn" id="opt-dl-docx">Xuất ngay Word (.docx) đã tối ưu</button>
        <button type="button" class="btn" id="opt-learn">Học thói quen file vào hồ sơ cá nhân</button>
        <button type="button" class="btn" id="opt-to-review">Gửi sang Rà soát</button>
      </div>
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
      p.name = q('#pf-name').value.trim() || 'Hồ sơ cá nhân';
      p.deptAbbr = q('#pf-dv').value.trim();
      p.defaultSignerRole = q('#pf-cv').value.trim();
      p.defaultSignerName = q('#pf-ten').value.trim();
      p.fontSizePt = Number(q('#pf-sz').value) || 14;
      p.lineHeight = Number(q('#pf-lh').value) || 1.3;
      p.indentCm = Number(q('#pf-ind').value);
      p.marginPreset = q('#pf-mar').value;
      p.marginsMm = p.marginPreset === 'thoang'
        ? { top: 22, bottom: 22, left: 32, right: 18 }
        : p.marginPreset === 'max'
          ? { top: 25, bottom: 25, left: 35, right: 20 }
          : { top: 20, bottom: 20, left: 30, right: 15 };
      p.autoNormalizeText = q('#pf-norm').checked;
      saveProfiles();
      refreshEditorProfileSelect();
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

    const dlBtn = q('#opt-dl-docx');
    if (dlBtn && lastAnalysis) dlBtn.onclick = async () => {
      const snapS = { ...S }, snapM = mode;
      try {
        Object.assign(S, lastAnalysis.draft);
        mode = lastAnalysis.detectedMode;
        const blob = await makeDocx();
        const fn = `ToiUu-${lastAnalysis.detectedType}-${(lastAnalysis.fileName || 'van-ban').replace(/\.[^.]+$/, '').replace(/[^\w-]/g, '_')}.docx`;
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

  let rvState = { stars: 5, hover: 0, tags: new Set(), note: '' };
  let reviews = ls.g(RV_KEY, []);

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

    el.innerHTML = `<div class="opt-grid">
      <div class="card">
        <b>Đánh giá trải nghiệm của bạn</b>
        <p class="mu" style="margin:4px 0 10px">Chỉ cần chọn số sao và bấm vào các gợi ý bên dưới — không cần gõ chữ.</p>
        <label>1. Mức độ hài lòng</label>
        <div class="stars" id="dg-stars">
          ${[1, 2, 3, 4, 5].map(i => `<button type="button" class="star-btn${i <= (rvState.hover || rvState.stars) ? ' on' : ''}" data-s="${i}" title="${i} sao">★</button>`).join('')}
        </div>
        <div id="dg-star-lbl" style="font-weight:600;color:var(--pr);margin-bottom:8px">${STAR_LABELS[rvState.stars]}</div>

        <label>2. Chọn nhanh nhận xét gợi ý (có thể chọn nhiều)</label>
        <div class="chips" id="dg-chips">
          ${chips.map(c => `<button type="button" class="chip${rvState.tags.has(c) ? ' on' : ''}" data-c="${at(c)}">${esc(c)}</button>`).join('')}
        </div>

        <label>3. Góp ý thêm (tùy chọn – không bắt buộc)</label>
        <input id="dg-note" maxlength="500" value="${at(rvState.note)}" placeholder="Không bắt buộc phải nhập...">
        <div class="bar" style="margin-top:14px">
          <button type="button" class="btn p" id="dg-submit">Gửi đánh giá</button>
          <button type="button" class="btn" id="dg-reset">Làm lại</button>
        </div>
      </div>

      <div class="card">
        <b>Thống kê & Lịch sử đánh giá</b>
        <div class="kpi-row">
          <div class="kpi"><span class="mu">Điểm trung bình</span><b>${avg} / 5 ★</b></div>
          <div class="kpi"><span class="mu">Tổng lượt đánh giá</span><b>${total} lượt</b></div>
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
   * PHẦN 4: KẾT NỐI SỰ KIỆN ĐIỀU HƯỚNG & KHỞI TẠO
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
})();
