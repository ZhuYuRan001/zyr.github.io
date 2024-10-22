import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { execSync } from "child_process";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: "auto-commit-push",
      closeBundle: () => {
        try {
          // 获取当前时间
          const now = new Date();
          const timestamp = now.toISOString().replace(/[:.]/g, "-");

          // 获取改动的文件列表
          const changedFiles = execSync("git diff --name-only")
            .toString()
            .trim()
            .split("\n")
            .map((file) => file.trim()) // 去除每个文件名的首尾空白
            .join(", ");

          // 提交信息，限制文件列表的长度
          const fileList =
            changedFiles.length > 100
              ? `${changedFiles.slice(0, 100)}...`
              : changedFiles; // 限制文件列表长度
          const commitMessage = `Build ${timestamp} -- Changed files: ${fileList}.`;

          // Git 操作
          execSync("git add docs");
          execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`); // 转义引号
          execSync("git push origin HEAD:main");

          console.log("Build artifacts committed and pushed to main branch");
        } catch (error) {
          console.error("Error during git operations:", error.message);
          if (error.stdout) {
            console.error("Stdout:", error.stdout.toString());
          }
          if (error.stderr) {
            console.error("Stderr:", error.stderr.toString());
          }
        }
      },
    },
  ],
  base: "./",
  build: {
    outDir: "docs",
  },
});
