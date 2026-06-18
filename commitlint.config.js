// Conventional Commits 校验。允许的 type 见 config-conventional：
// feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert。
// 中文 subject 不受 case 规则影响；merge 提交默认忽略。
export default {
  extends: ['@commitlint/config-conventional'],
};
