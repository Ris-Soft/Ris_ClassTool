// 保存配置
function saveConfigOnBlur(element) {
    const newConfig = {};

    if (element.classList.contains('doNotSave')) return;

    // 根据元素类型处理值
    if (element.type === 'checkbox' || element.type === 'radio') {
        newConfig[element.id] = element.checked;
    } else if (element.tagName === 'SELECT') {
        newConfig[element.id] = element.value !== '';
    } else if (element.id === 'linePos') {
        newConfig[element.id] = JSON.parse(element.value) ?? null;
    } else if (element.id === 'timeOffset') {
        newConfig[element.id] = parseInt(element.value) || 0;
    } else {
        newConfig[element.id] = element.value;
    }

    // 调用API保存配置
    window.api.config_save(newConfig);
}

// 数据管理
function exportSchedules() {
    const courseTable = Config.courseTable || {};
    const timeTable = Config.timeTable || {};
    const maxRows = Math.max(
        Object.keys(timeTable).length,
        Object.keys(courseTable.Monday || {}).length
    );

    const sheetData = [['时间', '周一', '周二', '周三', '周四', '周五', '周六', '周日']];

    for (let i = 1; i <= maxRows; i++) {
        sheetData.push([
            timeTable[i] || '00:00-00:00',
            courseTable.Monday ? courseTable.Monday[i - 1] || '' : '',
            courseTable.Tuesday ? courseTable.Tuesday[i - 1] || '' : '',
            courseTable.Wednesday ? courseTable.Wednesday[i - 1] || '' : '',
            courseTable.Thursday ? courseTable.Thursday[i - 1] || '' : '',
            courseTable.Friday ? courseTable.Friday[i - 1] || '' : '',
            courseTable.Saturday ? courseTable.Saturday[i - 1] || '' : '',
            courseTable.Sunday ? courseTable.Sunday[i - 1] || '' : ''
        ]);
    }

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, '课程表');
    XLSX.writeFile(workbook, '课程表.xlsx');
}
function exportStudents() {
    const students = Config.students || [];
    const sheetData = [['姓名', '活动日期']];

    students.forEach(student => {
        sheetData.push([student.name, student.activeDate || '']);
    });

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, '学生列表');
    XLSX.writeFile(workbook, '学生列表.xlsx');
}
function exportAll() {
    const configData = JSON.stringify(Config, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ris_ClassToolConfig.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function importSchedule() {
    if (!confirm('此操作将清除现有课程数据，是否继续？')) {
        return;
    }
    const file = document.getElementById('S_importSchedule').files[0];
    const tidy = document.getElementById('S_Tidy').checked;
    const startX = parseInt(document.getElementById('S_startX').value) || 2;
    const startY = parseInt(document.getElementById('S_startY').value) || 2;
    if (!file) {
        alert('请先选择文件');
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const courseTable = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        };

        for (let i = startX - 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            for (let j = startY - 1; j < row.length; j++) {
                let cell = row[j];
                if (tidy) {
                    cell = cell.match(/[\u4e00-\u9fa5]/)?.[0] || cell;
                }
                switch (j - startY + 1) {
                    case 0:
                        courseTable.Monday.push(cell);
                        break;
                    case 1:
                        courseTable.Tuesday.push(cell);
                        break;
                    case 2:
                        courseTable.Wednesday.push(cell);
                        break;
                    case 3:
                        courseTable.Thursday.push(cell);
                        break;
                    case 4:
                        courseTable.Friday.push(cell);
                        break;
                    case 5:
                        courseTable.Saturday.push(cell);
                        break;
                    case 6:
                        courseTable.Sunday.push(cell);
                        break;
                }
            }
        }

        // 获取当前配置的时间表
        const timeTable = Config.timeTable || {};
        const timeTableKeys = Object.keys(timeTable).map(Number);
        const maxTimeKey = Math.max(...timeTableKeys);
        let lastTimeValue = timeTable[maxTimeKey].toString() || '00:00-00:00';
        lastTimeValue = lastTimeValue.indexOf("-") === -1 ? '00:00-00:00' : lastTimeValue;
        if (lastTimeValue.indexOf("-") === -1) alert('您的时间表格式有误，将自动使用默认数据补全');

        // 如果原配置的时间节次小于导入的课程表，则补充时间表
        if (timeTableKeys.length < sheetData.length - startX + 1) {
            alert('您的节次（时间表行数）小于导入课程表的最大行数，将自动补齐相同时间');
            for (let i = timeTableKeys.length + 1; i <= sheetData.length - startX + 1; i++) {
                const lastTimeParts = lastTimeValue.split('-');
                const lastStartTime = lastTimeParts[0].split(':');
                const lastEndTime = lastTimeParts[1].split(':');
                const newStartTime = new Date();
                const newEndTime = new Date();

                newStartTime.setHours(parseInt(lastEndTime[0]));
                newStartTime.setMinutes(parseInt(lastEndTime[1]) + 1);
                newEndTime.setHours(parseInt(lastEndTime[0]));
                newEndTime.setMinutes(parseInt(lastEndTime[1]) + 2);

                const newTimeValue = `${newStartTime.getHours()}:${newStartTime.getMinutes()}-${newEndTime.getHours()}:${newEndTime.getMinutes()}`;
                timeTable[i] = newTimeValue;
            }
            // 保存更新后的时间表
            window.api.config_save({ timeTable });
        }

        // 保存课程表
        window.api.config_save({ courseTable });
    };
    reader.readAsArrayBuffer(file);
}
function importTime() {
    if (!confirm('此操作将覆盖现有时间数据，是否继续？')) {
        return;
    }
    const file = document.getElementById('T_importTime').files[0];
    const startX = parseInt(document.getElementById('T_startX').value) || 2;
    const startY = parseInt(document.getElementById('T_startY').value) || 2;
    if (!file) {
        alert('请先选择文件');
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const timeTable = {};

        for (let i = startX - 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            const timeValue = row[startY - 1];
            if (timeValue) {
                timeTable[i - startX + 2] = timeValue;
            }
        }

        window.api.config_save({ timeTable });
    };
    reader.readAsArrayBuffer(file);
}
function importStudents() {
    if (!confirm('此操作将覆盖现有学生数据，是否继续？')) {
        return;
    }
    const file = document.getElementById('ST_importStudents').files[0];
    const startX = parseInt(document.getElementById('ST_startX').value) || 2;
    const startY = parseInt(document.getElementById('ST_startY').value) || 1;
    const includeDate = document.getElementById('ST_includeDate').checked;
    if (!file) {
        alert('请先选择文件');
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const students = [];

        for (let i = startX - 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            const student = {
                name: row[startY - 1],
                activeDate: includeDate ? row[startY] : ''
            };
            students.push(student);
        }

        window.api.config_save({ students });
    };
    reader.readAsArrayBuffer(file);
}
function importAll() {
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = '.json';
    file.onchange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) {
            alert('请先选择文件');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedConfig = JSON.parse(e.target.result);
                window.api.config_save(importedConfig);
                alert('配置导入成功');
            } catch (error) {
                alert('导入失败，请检查文件格式');
            }
        };
        reader.readAsText(selectedFile);
    };
    file.click();
}


