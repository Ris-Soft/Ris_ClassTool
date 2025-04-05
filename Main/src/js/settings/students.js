const { pinyin } = pinyinPro;

// 学生列表
// 动态加载并按拼音首字母排序
function loadStudents(config) {
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '';
    const students = config.students || [];

    // 按拼音首字母排序
    students.sort((a, b) => {
        // 获取拼音首字母
        const firstLetterA = pinyin(a.name, {
            style: pinyin.STYLE_FIRST_LETTER
        })[0][0];
        const firstLetterB = pinyin(b.name, {
            style: pinyin.STYLE_FIRST_LETTER
        })[0][0];

        if (firstLetterA < firstLetterB) {
            return -1;
        }
        if (firstLetterA > firstLetterB) {
            return 1;
        }
        return 0;
    });

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
                                <td contenteditable="true">${student.name}</td>
                                <td contenteditable="true">${student.activeDate || ''}</td>
                                <td><button class="deleteStudentButton redBtn">删除</button></td>
                            `;
        tbody.appendChild(row);
    });
}
// 添加新行
document.getElementById('addStudentButton')?.addEventListener('click', () => {
    const tbody = document.querySelector('#studentsTable tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td><button class="deleteStudentButton redBtn">删除</button></td>
                `;
    tbody.appendChild(newRow);
});
// 删除行
document.querySelector('#studentsTable')?.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteStudentButton')) {
        event.target.closest('tr').remove();
    }
});
// 保存学生配置
document.getElementById('saveStudentsConfigButton')?.addEventListener('click', () => {
    const newConfig = {
        students: [],
    };

    const rows = document.querySelectorAll('#studentsTable tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        newConfig.students.push({
            name: cells[0].textContent.trim(),
            activeDate: cells[1].textContent.trim()
        });
    });

    window.api.config_save(newConfig);
});