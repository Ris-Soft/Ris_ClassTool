function loadSchedule(config, enableDay, repeatMode) {
    const tbody = document.querySelector('#scheduleTable tbody');
    tbody.innerHTML = ''; // 清空旧的数据
    const timeTable = config.timeTable || {};
    const courseTable = config.courseTable || {};

    let selectedDay = null;

    // 遍历课表，查找第一个符合启用天数和重复模式的课表
    for (let day in courseTable) {
        const dayConfig = courseTable[day];
        if (dayConfig.enableDay === enableDay && dayConfig.repeatMode === repeatMode) {
            selectedDay = dayConfig;
            break;
        }
    }

    if (!selectedDay) {
        alert('未找到符合条件的课表');
        return;
    }

    const selectedTimeTable = timeTable[selectedDay.timeTable] || [];

    selectedTimeTable.forEach((time, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${time}</td>
            <td>
            <select>
                ${(selectedDay.courseOptions || []).map(option => `
                <option value="${option}" ${option === selectedDay.course[index] ? 'selected' : ''}>${option}</option>
                `).join('')}
            </select>
            </td>
            <td><button class="deleteRowButton" data-index="${index}">删除</button></td>
        `;
        tbody.appendChild(row);
    });
}
// 添加新行
document.getElementById('addRowButton')?.addEventListener('click', () => {
    const tbody = document.querySelector('#scheduleTable tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td><button class="deleteRowButton">删除</button></td>
        `;
    tbody.appendChild(newRow);
});
// 删除行
document.querySelector('#scheduleTable')?.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteRowButton')) {
        event.target.closest('tr').remove();
    }
});
// 保存课程设定
document.getElementById('saveScheduleConfigButton')?.addEventListener('click', () => {
    const newConfig = {
        timeTable: {},
        courseTable: {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        }
    };

    const rows = document.querySelectorAll('#scheduleTable tbody tr');
    let valid = true;

    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        const timeValue = cells[0].textContent.trim();

        if (!timeValue.includes('-')) {
            alert(`时间格式错误: ${timeValue}，请确保时间包含“-”`);
            valid = false;
            return;
        }

        newConfig.timeTable[index + 1] = timeValue; // 获取时间列的内容
        newConfig.courseTable.Monday.push(cells[1].textContent.trim());
        newConfig.courseTable.Tuesday.push(cells[2].textContent.trim());
        newConfig.courseTable.Wednesday.push(cells[3].textContent.trim());
        newConfig.courseTable.Thursday.push(cells[4].textContent.trim());
        newConfig.courseTable.Friday.push(cells[5].textContent.trim());
        newConfig.courseTable.Saturday.push(cells[6].textContent.trim());
        newConfig.courseTable.Sunday.push(cells[7].textContent.trim());
    });

    if (valid) {
        window.api.config_save(newConfig);
    }
});

// =============================================================================
// 调休换课
// 动态载入
function loadPlans(config) {
    const tbody = document.querySelector('#plansTable tbody');
    tbody.innerHTML = ''; // 清空旧的数据
    const plans = config.plans || [];

    plans.forEach(plan => {
        const row = document.createElement('tr');
        row.innerHTML = `
                        <td contenteditable="true">${plan.date}</td>
                        <td contenteditable="true">${JSON.stringify(plan.courses)}</td>
                        <td><button class="deletePlanButton redBtn">删除</button></td>
                    `;
        tbody.appendChild(row);
    });
}
// 新增规则
document.getElementById('addPlanButton')?.addEventListener('click', () => {
    const dateInput = document.getElementById('planDate').value;
    const date = parseDate(dateInput) || new Date();
    const weekday = getWeekday(date);
    const courses = getOriginalCourses(date, weekday);
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
                    <td contenteditable="true">${dateInput || formatDate(date)}</td>
                    <td contenteditable="true">${JSON.stringify(courses)}</td>
                    <td><button class="deletePlanButton redBtn">删除</button></td>
                `;
    document.querySelector('#plansTable tbody').appendChild(newRow);
});
// 删除规则
document.querySelector('#plansTable')?.addEventListener('click', (event) => {
    if (event.target.classList.contains('deletePlanButton')) {
        event.target.closest('tr').remove();
    }
});
// 保存调休换课配置
document.getElementById('savePlansConfigButton')?.addEventListener('click', () => {
    const newConfig = {
        plans: []
    };

    const rows = document.querySelectorAll('#plansTable tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const plan = {
            date: cells[0].textContent.trim(),
            courses: JSON.parse(cells[1].textContent.trim())
        };
        newConfig.plans.push(plan);
    });

    window.api.config_save(newConfig);
});

// 时间表编辑功能
function loadTimeTable(config) {
    const tbody = document.querySelector('#timeTableEditor tbody');
    tbody.innerHTML = '';
    const timeTable = config.timeTable.default || [];
    timeTable.forEach((time, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td contenteditable="true">${time}</td>
            <td><button class="deleteTimeRowButton" data-index="${index}">删除</button></td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('addTimeRowButton')?.addEventListener('click', () => {
    const tbody = document.querySelector('#timeTableEditor tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
            <td class="time-cell" data-index="0" data-type="start">${time.start}</td>
            <td class="time-cell" data-index="1" data-type="end">${time.end}</td>
        <td><button class="deleteTimeRowButton">删除</button></td>
    `;
    tbody.appendChild(newRow);
    regsterTimePicker();

});

document.querySelector('#timeTableEditor')?.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteTimeRowButton')) {
        event.target.closest('tr').remove();
    }
});

document.querySelector('#timeTableEditor')?.addEventListener('click', (event) => {
    if (event.target.classList.contains('editTimeButton')) {
        const row = event.target.closest('tr');
        const timeCell = row.querySelector('td:first-child');
        const [start, end] = timeCell.textContent.split('-');
        document.getElementById('startTime').value = start.trim();
        document.getElementById('endTime').value = end.trim();
        document.getElementById('timeEditModal').style.display = 'block';
        document.getElementById('saveTimeModalButton').onclick = () => {
            const newStart = document.getElementById('startTime').value;
            const newEnd = document.getElementById('endTime').value;
            if (newStart && newEnd) {
                timeCell.textContent = `${newStart} - ${newEnd}`;
                document.getElementById('timeEditModal').style.display = 'none';
            } else {
                alert('请填写完整的时间段');
            }
        };
    }
});

document.getElementById('saveTimeTableButton')?.addEventListener('click', () => {
    const rows = document.querySelectorAll('#timeTableEditor tbody tr');
    const newTimeTable = [];
    rows.forEach(row => {
        const time = row.querySelector('td').textContent.trim();
        if (time) newTimeTable.push(time);
    });
    window.api.config_save({ timeTable: { default: newTimeTable } });
});

// 动态加载时间表列表
function loadTimeTableList(config) {
    const timeTableList = document.getElementById('timeTableList');
    timeTableList.innerHTML = '';
    const timeTables = config.timeTable || {};

    Object.keys(timeTables).forEach((key) => {
        const li = document.createElement('li');
        li.textContent = key;
        li.dataset.key = key;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            const activeItems = document.querySelectorAll('#timeTableList > .active');
            activeItems.forEach(item => item.classList.remove('active'));
            li.classList.add('active');
            loadTimeTable(config, key);
            document.getElementById('timeTableName').value = key;
        });
        timeTableList.appendChild(li);
    });
}

// 新建时间表
document.getElementById('addTimeTableButton')?.addEventListener('click', () => {
    prompt('请输入新时间表名称:', (newTableName) => {
        if (!newTableName) {
            alert('时间表名称不能为空');
            return;
        }
        Config.timeTable[newTableName] = [];
        loadTimeTableList(Config);
    });
});

// 加载时间表内容
function loadTimeTable(config, tableName) {
    const tbody = document.querySelector('#timeTableEditor tbody');
    tbody.innerHTML = '';
    const timeTable = config.timeTable[tableName] || [];
    timeTable.forEach((time, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="time-cell" data-index="${index}" data-type="start">${time.start}</td>
            <td class="time-cell" data-index="${index}" data-type="end">${time.end}</td>
            <td><button class="deleteTimeRowButton" data-index="${index}">删除</button></td>
        `;
        tbody.appendChild(row);
    });
    regsterTimePicker();
}

// 保存时间表
document.getElementById('saveTimeTableButton')?.addEventListener('click', () => {
    const tableName = document.getElementById('timeTableName').value.trim();
    const linePos = document.getElementById('linePos').value.trim();
    if (!tableName) {
        alert('时间表名称不能为空');
        return;
    }

    const rows = document.querySelectorAll('#timeTableEditor tbody tr');
    const newTimeTable = [];
    let valid = true;

    rows.forEach(row => {
        const start = row.querySelector('td:nth-child(1)').textContent.trim();
        const end = row.querySelector('td:nth-child(2)').textContent.trim();
        if (!start || !end) {
            valid = false;
            alert('时间段的开始时间和结束时间不能为空');
            return;
        }
        newTimeTable.push({ start, end });
    });

    if (valid) {
        Config.timeTable[tableName] = newTimeTable;
        Config.linePos = linePos ? JSON.parse(linePos) : [];
        window.api.config_save(Config);
        alert('时间表已保存');
    }
});

// 删除时间段
document.querySelector('#timeTableEditor')?.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteTimeRowButton')) {
        event.target.closest('tr').remove();
    }
});

// 科目表编辑功能
function loadCourseTable(config, day) {
    const tbody = document.querySelector('#courseTableEditor tbody');
    tbody.innerHTML = '';
    const courses = config.courseTable[day]?.course || [];
    const timeTable = config.timeTable.default || [];
    timeTable.forEach((time, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${time}</td>
            <td contenteditable="true">${courses[index] || ''}</td>
            <td><button class="deleteCourseRowButton" data-index="${index}">删除</button></td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('enableDay')?.addEventListener('change', (event) => {
    const day = event.target.value;
    loadCourseTable(Config, day);
});

document.getElementById('saveCourseTableButton')?.addEventListener('click', () => {
    const day = document.getElementById('enableDay').value;
    const rows = document.querySelectorAll('#courseTableEditor tbody tr');
    const newCourses = [];
    let valid = true;
    rows.forEach(row => {
        const course = row.querySelector('td:nth-child(2)').textContent.trim();
        newCourses.push(course);
        const shortName = row.querySelector('td:nth-child(1)').textContent.trim();
        const fullName = row.querySelector('td:nth-child(2)').textContent.trim();
        if (!shortName || !fullName) {
            valid = false;
            alert('课程简称和全称为必填项');
        }
    });
    if (valid) {
        Config.courseTable[day].course = newCourses;
        window.api.config_save({ courseTable: Config.courseTable });
        alert('科目表已保存');
    }
});

// 初始化加载
window.api.config_onRecive((config) => {
    Config = config;
    loadTimeTableList(config);
    const defaultTableName = Object.keys(config.timeTable)[0] || 'default';
    loadTimeTable(config, defaultTableName);
    document.getElementById('timeTableName').value = defaultTableName;
    document.getElementById('linePos').value = JSON.stringify(config.linePos || []);
    loadCourseTable(config, 'Monday');
});