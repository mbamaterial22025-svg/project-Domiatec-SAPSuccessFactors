function validateTask(req, res, next) {
    const { titleAr, points, startDate, dueDate, assigneeAr, status, categoryId } = req.body;

    if (!titleAr || !titleAr.trim()) {
        return res.status(400).json({
            error: 'اسم النشاط بالعربية حقل مطلوب.',
            errorEn: 'Activity title in Arabic is required.'
        });
    }

    if (!startDate || !dueDate) {
        return res.status(400).json({
            error: 'تاريخ البدء وتاريخ الاستحقاق حقول مطلوبة.',
            errorEn: 'Start date and Due date are required.'
        });
    }

    if (dueDate < startDate) {
        return res.status(400).json({
            error: 'تنبيه: تاريخ الاستحقاق يجب أن يكون مساوياً أو بعد تاريخ البدء.',
            errorEn: 'Warning: Due date must be on or after Start date.'
        });
    }

    if (points !== undefined && (isNaN(Number(points)) || Number(points) <= 0)) {
        return res.status(400).json({
            error: 'قيمة النقاط يجب أن تكون رقماً موجباً.',
            errorEn: 'Points must be a positive number.'
        });
    }

    const validStatuses = ['backlog', 'inprogress', 'review', 'done'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            error: `حالة النشاط غير صالحة. الحالات المتاحة: ${validStatuses.join(', ')}`,
            errorEn: `Invalid status. Available: ${validStatuses.join(', ')}`
        });
    }

    next();
}

module.exports = { validateTask };

