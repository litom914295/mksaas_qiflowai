const fs = require('fs');

// 需要添加的表格翻译键
const tableTranslations = {
  Table: {
    ascending: '升序',
    descending: '降序',
    noResults: '没有结果',
    rowsPerPage: '每页行数',
    page: '页',
    firstPage: '第一页',
    previousPage: '上一页',
    nextPage: '下一页',
    lastPage: '最后一页',
    of: '共',
    rows: '行',
  },
  Common: {
    retry: '重试',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    actions: '操作',
    status: '状态',
    date: '日期',
    name: '名称',
    description: '描述',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    submit: '提交',
    reset: '重置',
    close: '关闭',
    refresh: '刷新',
  },
  errors: {
    calculation_error: '计算错误',
    try_again_later: '请稍后再试',
    network_error: '网络错误',
    unknown_error: '未知错误',
  },
};

// 英文翻译
const tableTranslationsEn = {
  Table: {
    ascending: 'Ascending',
    descending: 'Descending',
    noResults: 'No results',
    rowsPerPage: 'Rows per page',
    page: 'Page',
    firstPage: 'First page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    lastPage: 'Last page',
    of: 'of',
    rows: 'rows',
  },
  Common: {
    retry: 'Retry',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    name: 'Name',
    description: 'Description',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    close: 'Close',
    refresh: 'Refresh',
  },
  errors: {
    calculation_error: 'Calculation error',
    try_again_later: 'Please try again later',
    network_error: 'Network error',
    unknown_error: 'Unknown error',
  },
};

// 读取并更新文件
function updateTranslations(filePath, newTranslations) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content.replace(/^\uFEFF/, '')); // 移除BOM

  // 合并翻译
  Object.keys(newTranslations).forEach((key) => {
    if (!data[key]) {
      data[key] = newTranslations[key];
    } else {
      data[key] = { ...newTranslations[key], ...data[key] };
    }
  });

  // 写回文件
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Updated ${filePath}`);
}

// 更新中文和英文翻译
updateTranslations('./messages/zh-CN.json', tableTranslations);
updateTranslations('./messages/en.json', tableTranslationsEn);

console.log('\n✅ All table translations added successfully!');
