# 使用官方 Node.js LTS 版本作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制项目源代码
COPY . .

# 暴露应用运行的端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]