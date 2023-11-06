import express from "express"
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
import fs from "fs"
import geoip from 'geoip-lite'

const app = express()

app.use(express.json())
app.use(cookieParser())


app.use("/api/upload", uploadRoutes) //头像上传 照片上传
app.use("/api/auth", authRoutes) //登录注册 用户验证 邮箱验证
app.use("/api/back", backRoutes) //后台信息渲染
app.use("/api/single_profile", single_profileRoutes) //个人信息页面信息渲染
app.use("/api/single_article", single_articleRoutes) //单个文章页面信息渲染


// 定时清理逾期验证码和使用过的邀请码
setInterval(() => {
  // 获取当前时间
  const currentTime = new Date()

  // 查询逾期的验证码
  const q = "DELETE FROM email WHERE overdue_time < ?"
  db.query(q, [currentTime], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${result.affectedRows} 逾期的邮箱验证码已清理.`)
    }
  })

  // 查询使用过的的邀请码
  const q1 = "DELETE FROM invitecode WHERE state =?"
  db.query(q1, ["used"], (err, result) => {
    if (err) {
      console.log(err)
    } else {
      console.log(`${result.affectedRows} 使用过的的邀请码已清理.`)
    }
  })
}, 24 * 60 * 60 * 1000) // 每分钟检查一次（时间单位为毫秒）

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
app.use(checkBanList)// 将中间件应用到所有路由


//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////数据///////////////////////////////////////////////////////
//Home主页信息渲染 主要为echarts和访问日志统计
app.get('/api/home', (req, res) => {

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
  const q1 = `SELECT * FROM statistic WHERE IP_address = ?`
  db.query(q1, [userIPAddress], (err, data) => {
    if (err) return res.json(err)
    if (data.length === 0) {
      const q2 = `INSERT INTO statistic(IP_address) VALUES(?)`
      db.query(q2, [userIPAddress], (err, data) => {
        if (err) console.log(err)
        console.log(`网站访问统计成功，有新IP访问~`)
      })
    } else {
      const existingCount = data[0].count
      const updateCount = existingCount + 1
      const updateTime = new Date().toISOString().replace("T", " ").replace("Z", "")
      const updateQuery = `UPDATE statistic SET count = ?, record_time = ? WHERE IP_address = ?`
      db.query(updateQuery, [updateCount, updateTime, userIPAddress], (err, updateResult) => {
        if (err) console.log(err)
        console.log(`网站访问统计成功，旧IP访问数+1~`)
      })
    }
  })
  const q = `SELECT id, gender, date, college, services
  FROM user
  WHERE gender IS NOT NULL
    AND date IS NOT NULL
    AND college IS NOT NULL
    AND services IS NOT NULL;`
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err)
    // console.log(data)
    data.forEach(item => {
      item.date = item.date.getFullYear()
      item.gender = item.gender == "0" ? "男" : "女"
    })
    return res.status(200).json(data)
  })

})


//前端获取照片板块信息
app.get('/api/pic/:data/:type', (req, res) => {
  // console.log(req.params.data)
  // console.log(req.params.type)
  const type = req.params.type
  if (type == 0) {
    const q = `SELECT id,img,uuid,
        name,
        major
        FROM user`
    db.query(q, [], (err, data) => {
      if (err) return res.status(500).json(err)
      const filteredData = data.filter(item => item.name !== '祖国的好同志')
      return res.status(200).json(filteredData)
    })
  } else if (type == 1) {
    const college = req.params.data
    const q = `SELECT id,img,uuid,
        name,
        major
        FROM user
        WHERE college=?`
    db.query(q, [college], (err, data) => {
      if (err) return res.status(500).json(err)
      console.log(data)
      const filteredData = data.filter(item => item.name !== '祖国的好同志')
      return res.status(200).json(filteredData)
    })
  } else {
    const search = req.params.data
    const q = `SELECT id,img,uuid,
        name,
        major
        FROM user
        WHERE name=?`
    db.query(q, [search], (err, data) => {
      if (err) return res.status(500).json(err)
      console.log(data)
      const filteredData = data.filter(item => item.name !== '祖国的好同志')
      return res.status(200).json(filteredData)
    })
  }
})


//前端获取文章板块信息
app.get('/api/art/:data/:type', (req, res) => {
  // console.log(req.params.data)
  // console.log(req.params.type)
  //type为0 查找所有文章 为1 查找特定作者的文章其中data为作者姓名 
  const type = req.params.type
  if (type == 0) {
    const q = `SELECT * FROM post`
    db.query(q, [], async (err, data) => {
      if (err) return res.status(500).json(err)
      await Promise.all(data.map(async (item) => {
        const uuid = item.user_uuid
        const q = `SELECT id,name,major,img FROM user WHERE uuid=?`
        const newdata = await new Promise((resolve, reject) => {
          db.query(q, [uuid], async (err, data0) => {
            if (err) return res.status(500).json(err)
            const user_name = data0[0].name
            const user_major = data0[0].major
            const user_id = data0[0].id
            const user_img = data0[0].img
            item['user_name'] = user_name
            item['user_major'] = user_major
            item['user_id'] = user_id
            item['user_img'] = user_img
            resolve(item)
          })
        })
      }))
      return res.status(200).json(data)
    })
  } else if (type == 1) {
    // 查询作者姓名和文章标题包含搜索词的文章
    console.log(55555)
    const search_data = req.params.data
    console.log(search_data)
    const searchValue = `%${search_data}%`
    const q = `
      SELECT post.*, user.name AS user_name, user.major AS user_major, user.id AS user_id, user.img AS user_img
      FROM post
      JOIN user ON post.user_uuid = user.uuid
      WHERE user.name LIKE ? OR post.title LIKE ? OR user.major LIKE ?
    `
    db.query(q, [searchValue, searchValue, searchValue], async (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).json(err)
      }
      console.log(data)
      return res.status(200).json(data)
    })
  }
})


//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////图片///////////////////////////////////////////////////////
//前端获取头像图片 avatar
app.get('/api/image/:imageName', (req, res) => {
  const imageName = req.params.imageName
  const userid = req.query.userid
  // console.log(123123123123213)
  // console.log(userid)
  // console.log(imageName)
  const imagePath = path.join(dirname(fileURLToPath(import.meta.url)), 'public', 'uploads', `${userid}`, 'avatar', imageName)
  if (!imagePath) {
    return res.status(500).json({ error: '获取失败' })
  }
  res.status(200).sendFile(imagePath)
})

//前端获取照片图片 photo
app.get('/api/photo/:imageName', (req, res) => {
  const imageName = req.params.imageName
  const userid = req.query.userid
  // console.log(123123123123213)
  // console.log(userid)
  // console.log(imageName)
  const imagePath = path.join(dirname(fileURLToPath(import.meta.url)), 'public', 'uploads', `${userid}`, 'photos', imageName)
  if (!imagePath) {
    return res.status(500).json({ error: '获取失败' })
  }
  res.status(200).sendFile(imagePath)
})

//前端获取文章封面图片 article_photo
app.get('/api/article_photo/:imageName', (req, res) => {
  const imageName = req.params.imageName
  const userid = req.query.userid
  // console.log(123123123123213)
  // console.log(userid)
  // console.log(imageName)
  const imagePath = path.join(dirname(fileURLToPath(import.meta.url)), 'public', 'uploads', `${userid}`, 'article_photos', imageName)
  if (!imagePath) {
    return res.status(500).json({ error: '获取失败' })
  }
  res.status(200).sendFile(imagePath)
})

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

//////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(8800, () => {
  console.log('后端连接成功！！！~~~')
})