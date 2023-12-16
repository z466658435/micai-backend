import path from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { db } from "../db.js"
import geoip from 'geoip-lite'
import sharp from 'sharp'

//Home主页信息渲染 主要为echarts和访问日志统计
export const get_firstpage_data = (req, res) => {

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

}


//成员页获取照片板块信息
export const get_memberpage_data = (req, res) => {
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
}


//文章页获取文章板块信息
export const get_articlepage_data = (req, res) => {
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
}


//成员页获取照片板块信息
export const get_memberpage_carousel = (req, res) => {
  const imageBuffers = [] // 用于存储所有的 Buffer 对象
  const qid = `SELECT user_uuid,img FROM photo ORDER BY RAND() LIMIT 5` //随机选取五张照片
  db.query(qid, [], (err, data) => {
    if (err) return res.status(500).json(err)
    data.map((item) => {
      const qid = `SELECT id FROM user WHERE uuid = ?`
      db.query(qid, [item.user_uuid], (err, data1) => {
        if (err) return res.status(500).json(err)
        const userId = data1[0].id
        const imagePath = path.join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'uploads', `${userId}`, 'photos', item.img)

        // 使用 sharp 读取图片并生成 Buffer 对象
        sharp(imagePath)
          .toBuffer()
          .then((fileData) => {
            imageBuffers.push(fileData) // 将 Buffer 对象添加到数组中

            if (imageBuffers.length === data.length) {
              // 当所有 Buffer 对象都获取完成时，发送到前端
              return res.status(200).json(imageBuffers)
            }
          })
          .catch((sharpErr) => {
            return res.status(500).json({ error: '获取失败', sharpError: sharpErr.message })
          })
      })
    })
  })
}
