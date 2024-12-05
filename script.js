document.getElementById('delete-pages-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('file-input');
    const pageRange = document.getElementById('page-range').value;
    const output = document.getElementById('output');

    if (!fileInput.files.length) {
        showNotification('يرجى اختيار ملف');
        return;
    }

    const file = fileInput.files[0];
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        await deletePdfPages(file, pageRange, output);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        await deleteWordPages(file, pageRange, output);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        await deletePptPages(file, pageRange, output);
    } else {
        showNotification('يرجى اختيار ملف PDF أو Word أو PowerPoint');
    }
});

async function deletePdfPages(file, pageRange, output) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const newPdfDoc = await PDFLib.PDFDocument.create();

    const ranges = parsePageRange(pageRange, pages.length);
    const pagesToKeep = [];
    for (let i = 0; i < pages.length; i++) {
        let keep = true;
        for (const range of ranges) {
            if (i + 1 >= range.start && i + 1 <= range.end) {
                keep = false;
                break;
            }
        }
        if (keep) {
            pagesToKeep.push(i);
        }
    }

    for (const pageIndex of pagesToKeep) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
        newPdfDoc.addPage(copiedPage);
    }

    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'remaining-pages.pdf';
    link.textContent = 'تحميل الملف المعدل';
    output.innerHTML = '';
    output.appendChild(link);

    showNotification('تم حذف الصفحات بنجاح');
}

async function deleteWordPages(file, pageRange, output) {
    // معالجة ملفات Word هنا
    showNotification('حذف الصفحات من ملفات Word غير مدعوم حاليًا');
}

async function deletePptPages(file, pageRange, output) {
    // معالجة ملفات PowerPoint هنا
    showNotification('حذف الصفحات من ملفات PowerPoint غير مدعوم حاليًا');
}

function parsePageRange(pageRange, totalPages) {
    const ranges = [];
    const parts = pageRange.split(',');
    for (const part of parts) {
        const [start, end] = part.split('-').map(Number);
        if (end) {
            ranges.push({ start: Math.max(1, start), end: Math.min(totalPages, end) });
        } else {
            ranges.push({ start: Math.max(1, start), end: Math.max(1, start) });
        }
    }
    return ranges;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const overlay = document.getElementById('overlay');
    notification.textContent = message;
    notification.classList.add('show');
    overlay.style.display = 'block';
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            notification.classList.remove('hide');
            overlay.style.display = 'none';
        }, 500);
    }, 3000000);
}