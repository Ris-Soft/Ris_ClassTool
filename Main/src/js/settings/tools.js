// 辅助函数
function formatDate(date) {
    return `${date.getMonth() + 1}.${date.getDate()}`;
}
function parseDate(dateStr) {
    const [month, day] = dateStr.split('.').map(Number);
    if (isNaN(month) || isNaN(day)) return null;
    const date = new Date();
    date.setMonth(month - 1);
    date.setDate(day);
    return date;
}
function getWeekday(date) {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
}
function getOriginalCourses(date, weekday) {
    const courseTable = Config.courseTable || {};
    return courseTable[weekday] || [];
}
async function getConfig() {
    Config = await window.api.config_Get(false);
}