module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'generator-star-spacing': [0],
    // 生成器函数*的前后空格
    'consistent-return': [0],
    // return 后面是否允许省略
    'global-require': [1],
    // 全局引用
    'no-else-return': [0],
    // 如果if语句里面有return,后面不能跟else语句
    'no-restricted-syntax': [0],
    'no-use-before-define': [0],
    // 不允许使用未定义的变量
    'no-nested-ternary': [0],
    // 禁止使用嵌套的三目运算
    'arrow-body-style': [0],
    'no-bitwise': [0],
    // 禁止使用按位运算符
    'no-cond-assign': [0],
    // 禁止在条件表达式中使用赋值语句
    'require-yield': [1],
    // 生成器函数必须有yield
    'computed-property-spacing': [0, 'never'],
    // 是否允许计算后的键名的空格
    'space-in-parens': [0, 'never'],
    // 小括号里面要不要有空格
    'guard-for-in': [0],
    // for in循环要用if语句过滤
    'no-undef': [0],
    // 不能有未定义的变量
    'no-mixed-operators': [0],
    'no-shadow': [0],
    // 外部作用域中的变量不能与它所包含的作用域中的变量或参数同名
    'space-infix-ops': [0],
    // 中缀操作符周围要不要有空格
    'no-param-reassign': [0],
    // 禁止给参数重新赋值
    'linebreak-style': [0],
    // 换行风格
    camelcase: [0],
    // 驼峰
    'key-spacing': [2, {
      beforeColon: false,
      afterColon: true,
    }],
    // 冒号前没空格，后有空格
    'comma-spacing': [2, {
      before: false,
      after: true,
    }],
    // 逗号前没空格，后有空格
    semi: [1],
    // 语句分号结尾
    'no-extra-semi': [1],
    // 禁止不必要的分号
    'no-console': [1],
    // 是否能有console
    'no-return-assign': [0],
    // 在return语句中使用赋值语句
    'no-new-func': [1],
    // 使用new Function
    'no-unused-expressions': [0],
    'no-script-url': [0],
    'no-underscore-dangle': [0],
    'no-await-in-loop': [1],
    'no-plusplus': [2],
    // 禁止使用++，--
    'no-useless-escape': [1],
    'no-prototype-builtins': [0],
    'object-curly-newline': [2, {
      consistent: true,
    }],
    'wrap-iife': [2, 'inside'],
    // 立即执行函数表达式的小括号风格
    'jsx-a11y/no-static-element-interactions': [0],
    'jsx-a11y/no-noninteractive-tabindex': [0],
    'jsx-a11y/click-events-have-key-events': [0],
    'jsx-a11y/no-noninteractive-element-interactions': [0],
    'jsx-a11y/anchor-is-valid': [0],
    'import/first': [0],
    'import/prefer-default-export': [0],
    'import/no-extraneous-dependencies': [0],
    'import/extensions': [0],
    'import/no-unresolved': [0],
    'import/no-mutable-exports': [0],
    '@typescript-eslint/no-var-requires': [0],
    '@typescript-eslint/no-unused-vars': [0],
  },
};
