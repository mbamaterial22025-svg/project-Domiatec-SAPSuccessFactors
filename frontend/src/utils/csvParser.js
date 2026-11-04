// Robust CSV & Data Importer for Domiatec SAP SuccessFactors
// Handles quotes, commas within quotes, multi-line values, and Domiatec ActivityTracker headers

export function parseCSVToRows(text) {
  const p = [];
  let row = [''];
  let inQuotes = false;

  // Strip UTF-8 BOM if present
  let cleanText = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < cleanText.length; i++) {
    const c = cleanText[i];
    const next = cleanText[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      p.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    p.push(row);
  }

  return p.map(r => r.map(cell => cell.trim()));
}

export function parseActivitiesFile(content, fileExtension, categories = []) {
  if (fileExtension === 'json') {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data;
    } else if (data.tasks && Array.isArray(data.tasks)) {
      return data.tasks;
    }
    throw new Error('الملف لا يحتوي على قائمة أنشطة صالحة (tasks array not found)');
  }

  // Parse CSV
  const allRows = parseCSVToRows(content);
  if (allRows.length === 0) {
    throw new Error('الملف فارغ أو لا يحتوي على بيانات');
  }

  // Find header row: look for a row with multiple header keywords (at least 2 matches)
  let headerRowIndex = -1;
  const headerKeywords = ['activity', 'title', 'عنوان', 'نشاط', 'priority', 'أولوية', 'persons', 'assignee', 'مسؤول', 'deadline', 'completion', 'complete', 'notes', 'ملاحظات', 'status', 'points', 'weight', 'done'];

  for (let i = 0; i < Math.min(allRows.length, 10); i++) {
    const rowCells = allRows[i].map(c => c.toLowerCase().trim()).filter(Boolean);
    const matchCount = rowCells.filter(cell => headerKeywords.some(k => cell.includes(k))).length;
    if (matchCount >= 2) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    // Fallback: look for row with single keyword if it has >= 3 columns
    for (let i = 0; i < Math.min(allRows.length, 10); i++) {
      const lower = allRows[i].map(c => c.toLowerCase());
      if (allRows[i].filter(Boolean).length >= 3 && lower.some(c => c.includes('activity') || c.includes('title') || c.includes('عنوان') || c.includes('نشاط'))) {
        headerRowIndex = i;
        break;
      }
    }
  }

  if (headerRowIndex === -1) {
    // If no explicit header found, assume row 0 is header if it has >= 3 columns
    if (allRows[0].length >= 3) {
      headerRowIndex = 0;
    } else {
      throw new Error('تعذر العثور على صف العناوين الرئيسي في ملف CSV');
    }
  }

  const headers = allRows[headerRowIndex].map(h => h.trim().toLowerCase());
  const dataRows = allRows.slice(headerRowIndex + 1).filter(r => r.some(c => c.trim() !== ''));

  // Column index finders
  const findCol = (keywords) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  };

  const activityCol = findCol(['activity', 'title', 'عنوان', 'نشاط']);
  const titleArCol = findCol(['title (ar)', 'عربي']);
  const titleEnCol = findCol(['title (en)', 'إنجليزي', 'english']);
  const priorityCol = findCol(['priority', 'أولوية', 'أهمية']);
  const pointsCol = findCol(['points', 'weight', 'وزن', 'نقاط']);
  const assigneeCol = findCol(['key persons', 'assignee', 'assigned', 'مسؤول', 'المسؤول', 'شخص']);
  const dueDateCol = findCol(['dead line', 'due date', 'استحقاق', 'موعد']);
  const compDateCol = findCol(['actual completion', 'completion date', 'اكتمال']);
  const percentCol = findCol(['% complete', 'percent', 'نسبة']);
  const doneCol = findCol(['done', 'مكتمل', 'منجز']);
  const notesCol = findCol(['notes', 'ملاحظات', 'تفاصيل', 'description', 'وصف']);
  const categoryCol = findCol(['category', 'قسم', 'مرحلة', 'فئة']);

  const tasks = [];
  const today = new Date().toISOString().split('T')[0];

  dataRows.forEach((row, idx) => {
    const mainTitle = (activityCol !== -1 ? row[activityCol] : '') ||
                      (titleArCol !== -1 ? row[titleArCol] : '') ||
                      (titleEnCol !== -1 ? row[titleEnCol] : '');

    if (!mainTitle || mainTitle.trim() === '') return;

    const titleAr = (titleArCol !== -1 && row[titleArCol]) ? row[titleArCol] : mainTitle;
    const titleEn = (titleEnCol !== -1 && row[titleEnCol]) ? row[titleEnCol] : mainTitle;

    // Status detection
    let status = 'backlog';
    const doneVal = doneCol !== -1 ? row[doneCol]?.toLowerCase() : '';
    const pctVal = percentCol !== -1 ? parseFloat(row[percentCol]) : NaN;

    if (doneVal === '1' || doneVal === 'true' || doneVal === 'yes' || doneVal === 'مكتمل' || doneVal === 'done' || pctVal >= 1) {
      status = 'done';
    } else if (!isNaN(pctVal) && pctVal >= 0.7) {
      status = 'review';
    } else if (!isNaN(pctVal) && pctVal > 0) {
      status = 'inprogress';
    }

    // Points / Priority
    let pts = 3;
    if (pointsCol !== -1 && row[pointsCol]) {
      const p = parseInt(row[pointsCol], 10);
      if (!isNaN(p)) pts = p;
    } else if (priorityCol !== -1 && row[priorityCol]) {
      const p = parseInt(row[priorityCol], 10);
      if (!isNaN(p)) pts = p;
    }

    // Assignee
    const rawAssignee = assigneeCol !== -1 ? row[assigneeCol] : '';
    let assigneeAr = rawAssignee;
    let assigneeEn = rawAssignee;
    const aLower = rawAssignee.toLowerCase();
    if (aLower.includes('solex') && aLower.includes('domiatec')) {
      assigneeAr = 'سولكس وفريق دومياتك المشترك';
      assigneeEn = 'Solex & Domiatec HR Team';
    } else if (aLower.includes('domiatec')) {
      assigneeAr = 'فريق الموارد البشرية - دومياتك';
      assigneeEn = 'Domiatec HR Team';
    } else if (aLower.includes('solex')) {
      assigneeAr = 'سولكس للاستشارات';
      assigneeEn = 'Solex';
    }

    // Notes
    const notes = notesCol !== -1 ? row[notesCol] : '';

    // Category
    let catId = 'management';
    if (categoryCol !== -1 && row[categoryCol]) {
      const cVal = row[categoryCol].toLowerCase();
      const match = categories.find(c => 
        (c.id && c.id.toLowerCase() === cVal) ||
        (c.key && c.key.toLowerCase() === cVal) ||
        (c.nameAr && c.nameAr.toLowerCase().includes(cVal)) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(cVal))
      );
      if (match) catId = match.id || match.key;
    } else {
      // Smart category keyword guess
      const tLower = mainTitle.toLowerCase();
      if (tLower.includes('fingerprint') || tLower.includes('mobile app') || tLower.includes('terminal') || tLower.includes('بصمة') || tLower.includes('بنية')) {
        catId = 'infra';
      } else if (tLower.includes('recorded working time') || tLower.includes('database') || tLower.includes('بيانات')) {
        catId = 'database';
      } else if (tLower.includes('alert') || tLower.includes('unauthorized') || tLower.includes('security') || tLower.includes('rbp') || tLower.includes('أمان')) {
        catId = 'security';
      } else if (tLower.includes('workbook') || tLower.includes('validation') || tLower.includes('acceptance') || tLower.includes('اختبار')) {
        catId = 'qa';
      } else if (tLower.includes('timesheet alerts') || tLower.includes('ui') || tLower.includes('واجهة')) {
        catId = 'frontend';
      }
    }

    // Dates
    const rawDue = dueDateCol !== -1 ? row[dueDateCol] : '';
    const dueDate = rawDue && /^\d{4}-\d{2}-\d{2}$/.test(rawDue) ? rawDue : '2026-11-20';
    const startDate = '2026-11-01';

    tasks.push({
      id: `act-${String(idx + 1).padStart(2, '0')}`,
      projectId: 'main-project',
      titleAr,
      titleEn,
      notesAr: notes,
      notesEn: notes,
      descriptionAr: notes,
      descriptionEn: notes,
      categoryId: catId,
      category: catId,
      points: pts,
      weight: pts,
      status,
      startDate,
      dueDate,
      assigneeAr: assignee,
      assigneeEn: assignee,
      assignedTo: assignee,
      position: idx + 1,
      sortOrder: idx + 1,
      createdAt: new Date().toISOString()
    });
  });

  return tasks;
}
