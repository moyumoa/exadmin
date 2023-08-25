const fs = require('fs')
const path = require('path')

const allowedDirectories = ['logs', 'text', 'other']

exports.read = async (req, res, next) => { 
  const requestedPath = req.params.path
  const fullPath = path.join(process.cwd(), requestedPath) // 使用 process.cwd() 获取当前工作目录

   // 将请求路径拆分成多个部分
   const pathParts = requestedPath.split('/').filter(Boolean)
  
   // 验证请求的子路径是否在允许的目录列表中
   if (!isAllowedPath(pathParts)) {
     res.status(403).json({ error: 'Access denied' })
     return
  }
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)

      if (stats.isDirectory()) {
        // 如果是文件夹，列出其中的文件和子文件夹
        const files = fs.readdirSync(fullPath)
        res.json({ type: 'directory', content: files })
      } else if (stats.isFile()) {
        // 如果是文件，读取文件内容
        const content = fs.readFileSync(fullPath, 'utf-8')
        res.json({ type: 'file', content })
      } else {
        res.status(500).json({ error: 'Unknown path type' })
      }
    } else {
      res.status(404).json({ error: 'Path not found' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

function isAllowedPath(pathParts) {
  return allowedDirectories.includes(pathParts[0])
}