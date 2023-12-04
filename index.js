import express from "express"
import init_dataRoutes from "./routes/init_data.js"
import pictureRoutes from "./routes/picture.js"
import authRoutes from "./routes/auth.js"
import backRoutes from "./routes/back.js"
import single_profileRoutes from "./routes/single_profile.js"
import single_articleRoutes from "./routes/single_article.js"
import uploadRoutes from "./routes/upload.js"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { db } from "./db.js"
import geoip from 'geoip-lite'

//检查封禁IP 使跳转403
const checkBanList = (req, res, next) => {
  const q = `SELECT * FROM banlist`
  db.query(q, [], (err, data) => {
    if (err) return res.status(500).json(err)
    const banlist = data.map(item => item.IP_address)
    const userIP = req.ip // 获取请求的 IP 地址
    if (banlist.includes(userIP)) {
      console.log("您的IP已被封禁，请联系管理员")
      // 如果 IP 地址在封禁列表中，可以选择拒绝请求或重定向到错误页面
      return res.status(403).sendFile(path.join(dirname(fileURLToPath(import.meta.url)), 'public', '403.html'))
    }
    next()
  })
}

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(checkBanList)// 将中间件应用到所有路由 检查封禁IP

app.use("/api/init_data", init_dataRoutes) //获取页面初始数据 包括首页 成员页 文章页
app.use("/api/picture", pictureRoutes) //获取图片 包含头像 文章图片 个人简介图片 照片墙图片
app.use("/api/upload", uploadRoutes) //头像上传 照片上传
app.use("/api/auth", authRoutes) //登录注册 用户验证 邮箱验证
app.use("/api/back", backRoutes) //后台信息渲染
app.use("/api/single_profile", single_profileRoutes) //个人信息页面信息渲染
app.use("/api/single_article", single_articleRoutes) //单个文章页面信息渲染


app.listen(8800, () => {
  console.log('后端连接成功！！！~~~')
})




// 定时清理逾期验证码和使用过的邀请码
setInterval(() => {
  const currentTime = new Date() // 获取当前时间

  const q = "DELETE FROM email WHERE overdue_time < ?" // 查询逾期的验证码
  db.query(q, [currentTime], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${result.affectedRows} 逾期的邮箱验证码已清理.`)
    }
  })

  const q1 = "DELETE FROM invitecode WHERE state =?" // 查询使用过的的邀请码
  db.query(q1, ["used"], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${result.affectedRows} 使用过的的邀请码已清理.`)
    }
  })

}, 24 * 60 * 60 * 1000) // 每分钟检查一次（时间单位为毫秒）


//插入日志记录record
app.post('/api/record', (req, res) => {

  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  const userIPAddress = req.ip // 获取用户的 IP 地址
  const geo = geoip.lookup(userIPAddress) // 查询 IP 地址的地区信息
  if (geo) {
    const userRegion = geo.region // 获取地区信息
    const userCity = geo.city // 获取城市信息
    console.log(`User IP: ${userIPAddress}, Region: ${userRegion}, City: ${userCity}`)
  } else {
    console.log(`Unable to determine user's region from IP address: ${userIPAddress}`)
  }
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  // console.log(656666)
  // console.log(req.body.operation)
  const operation = req.body.operation
  const resource_id = req.body.resource_id
  const IP_address = userIPAddress
  const region = req.body.region
  const user = req.body.user
  const access = req.body.access
  const user_id = req.body.user_id
  const q = `INSERT INTO record(operation,
    resource_id, IP_address, region,
    user, access, user_id
    ) VALUES(?)`
  const values = [
    operation,
    resource_id,
    IP_address,
    region,
    user,
    access,
    user_id
  ]
  db.query(q, [values], (err, data) => {
    if (err) return res.json(err)
    return res.status(200).json(`${operation}日志插入成功~`)
  })
})