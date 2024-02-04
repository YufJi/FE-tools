import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';

const cwd = process.cwd();

const questions = [{
  type: 'input',
  name: 'projectName',
  message: '请输入项目名称:',
  validate(input) {
    if (!input) {
      return '项目名不能为空！';
    }
    if (fs.existsSync(input)) {
      return '当前目录已经存在同名项目，请换一个项目名！';
    }
    return true;
  },
}];

export default async function main() {
  try {
    const answers = await inquirer.prompt(questions);
    const { projectName } = answers;
    const templateRoot = path.join(__dirname, '../template');
    const projectPath = path.join(cwd, projectName);

    fs.copySync(templateRoot, projectPath);
    console.log(chalk.cyan('初始化项目成功！'));
    console.log(chalk.cyan(`cd ${path.relative(cwd, projectPath)} && npm install`));
    console.log(chalk.cyan('npm run dev 开始工作吧!！😝'));
  } catch (error) {
    console.log(chalk.red(`${error.message}`));
  }
}
