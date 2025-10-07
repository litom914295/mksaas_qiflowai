#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取任务文件
const tasksFile = path.join(
  __dirname,
  '..',
  '.taskmaster',
  'tasks',
  'tasks.json'
);
const tasksData = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));

console.log('📋 Taskmaster 任务状态报告');
console.log('='.repeat(50));

// 检查 master 标签
if (tasksData.tags.master) {
  console.log('\n🏷️  Master 标签任务:');
  const masterTasks = tasksData.tags.master.tasks;

  let completedTasks = 0;
  const totalTasks = masterTasks.length;

  masterTasks.forEach((task) => {
    const status = task.status === 'done' ? '✅' : '⏳';
    console.log(`  ${status} ${task.id}. ${task.title} (${task.status})`);

    if (task.status === 'done') completedTasks++;

    // 检查子任务
    if (task.subtasks && task.subtasks.length > 0) {
      let completedSubtasks = 0;
      task.subtasks.forEach((subtask) => {
        const subtaskStatus = subtask.status === 'done' ? '✅' : '⏳';
        console.log(
          `    ${subtaskStatus} ${subtask.id}. ${subtask.title} (${subtask.status})`
        );
        if (subtask.status === 'done') completedSubtasks++;
      });
      console.log(
        `    📊 子任务完成率: ${completedSubtasks}/${task.subtasks.length}`
      );
    }
  });

  console.log(
    `\n📊 Master 任务完成率: ${completedTasks}/${totalTasks} (${Math.round((completedTasks / totalTasks) * 100)}%)`
  );
}

// 检查 migration-qiflow 标签
if (tasksData.tags['migration-qiflow']) {
  console.log('\n🏷️  Migration-QiFlow 标签任务:');
  const migrationTasks = tasksData.tags['migration-qiflow'].tasks;

  let completedMigrationTasks = 0;
  const totalMigrationTasks = migrationTasks.length;

  migrationTasks.forEach((task) => {
    const status = task.status === 'done' ? '✅' : '⏳';
    console.log(`  ${status} C${task.id}. ${task.title} (${task.status})`);

    if (task.status === 'done') completedMigrationTasks++;

    // 检查子任务
    if (task.subtasks && task.subtasks.length > 0) {
      let completedSubtasks = 0;
      task.subtasks.forEach((subtask) => {
        const subtaskStatus = subtask.status === 'done' ? '✅' : '⏳';
        console.log(
          `    ${subtaskStatus} ${subtask.id}. ${subtask.title} (${subtask.status})`
        );
        if (subtask.status === 'done') completedSubtasks++;
      });
      console.log(
        `    📊 子任务完成率: ${completedSubtasks}/${task.subtasks.length}`
      );
    }
  });

  console.log(
    `\n📊 Migration-QiFlow 任务完成率: ${completedMigrationTasks}/${totalMigrationTasks} (${Math.round((completedMigrationTasks / totalMigrationTasks) * 100)}%)`
  );
}

console.log('\n🎉 任务状态检查完成！');

