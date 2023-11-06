import { db } from "../db.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs, { access } from 'fs'
import geoip from 'geoip-lite'


///////////////////////////////////////////////////////////////////////////////////////
//普通用户
export const getback = (req, res) => {  //拿到个人信息
  const token = req.cookies.access_token
  // console.log(req.params)
  // console.log(23232323)
  if (!token) {
    // console.log(155551)
    return res.status(401).json('身份验证失败')
  }
  jwt.verify(token, 'jwtkey', (err, userInfo) => {
    if (err) {
      return res.status(403).json('Token不合法，无访问权限')
    }
    const userId = userInfo.id
    if (userId == req.params.id) {
      const q = `SELECT id,username,img,uuid,
      name,gender,date,nativePlace,college,
      major,QQnumber,serviceTime,servicePlace,station,services
      FROM user
      WHERE id=?`
      db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).json(err)
        // console.log(data[0])
        return res.status(200).json(data[0])
      })
    } else {
      return res.status(403).json('用户ID匹配无效，无访问权限')
    }
  })

}

export const updateback = (req, res) => {  //更新个人信息
  const token = req.cookies.access_token
  const originalDate = new Date(req.body.date + "-01")
  req.body.date = originalDate.toISOString().slice(0, 10)
  if (!token) {
    return res.status(401).json('身份验证失败')
  }
  jwt.verify(token, 'jwtkey', (err, userInfo) => {
    if (err) {
      return res.status(403).json('Token不合法，无访问权限')
    }
    const userId = userInfo.id
    if (userId == req.params.id) {
      const q = ` UPDATE user SET ? WHERE id = ? `
      var updatedata = req.body
      for (const key in updatedata) {
        if (updatedata.hasOwnProperty(key) && updatedata[key] === '') {
          updatedata[key] = null
        }
      }
      if (updatedata['name'] === null) updatedata['name'] = '祖国的好同志'
      // console.log(updatedata)
      // console.log(123123123123)
      db.query(q, [updatedata, req.params.id], (err, data) => {
        if (err) {
          console.log(updatedata)
          return res.status(500).json(err)
        }
        //更新token
        const q = "SELECT * FROM user WHERE id=?"
        db.query(q, [req.params.id], (err, data1) => {
          if (err) return res.json(err)
          if (data1.length === 0) return res.status(404).json("用户不存在")
          const token = jwt.sign({ id: data1[0].id }, "jwtkey")
          const { password, ...other } = data1[0]

          res.cookie("access_token", token, {
            httpOnly: true
          }).status(200).json(other)
        })
      })
    } else {
      return res.status(403).json('用户ID匹配无效，无访问权限')
    }
  })
}

export const getphotoback = (req, res) => {  //拿到照片墙照片信息
  const q = `SELECT img FROM photo WHERE user_uuid=?`
  db.query(q, [req.params.uuid], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}

export const deletephotoback = (req, res) => {  //删除照片墙照片
  const q = `DELETE FROM photo WHERE img = ?`
  db.query(q, [req.params.img], (err, data) => {
    if (err) return res.status(500).json(err)
    const dir = `./public/uploads/${req.params.id}/photos`
    const filePathToDelete = `${dir}/${req.params.img}`
    if (fs.existsSync(filePathToDelete)) fs.unlinkSync(filePathToDelete)
    return res.status(200).json("照片删除成功~")
  })
}


///////////////////////////////////////////////////////////////////////////////////////
//管理员操作
function formatDateToYearMonth (dateString) {
  const dateObject = new Date(dateString)
  const year = dateObject.getFullYear()
  const month = dateObject.getMonth() + 1 // 月份是从0开始的，所以要加1
  return `${year}-${month.toString().padStart(2, "0")}`
}

export const getmemfile = (req, res) => {  //管理员拿到所有个人信息
  const name = req.params.name
  // console.log(name)
  // console.log(111)
  if (name == "null") {
    const q = `SELECT * FROM user`
    db.query(q, [], (err, data) => {
      if (err) return res.status(500).json(err)
      const sanitizedData = data.map((item) => {
        const { password, img, date, ...other } = item
        const yearMonth = formatDateToYearMonth(date)
        return { ...other, date: yearMonth }
      })
      return res.status(200).json(sanitizedData)
    })
  } else {
    const q = `SELECT * FROM user WHERE name LIKE ?`
    const searchTerm = `%${name}%`
    db.query(q, [searchTerm], (err, data) => {
      if (err) return res.status(500).json(err)
      const sanitizedData = data.map((item) => {
        const { password, img, date, ...other } = item
        const yearMonth = formatDateToYearMonth(date)
        return { ...other, date: yearMonth }
      })
      return res.status(200).json(sanitizedData)
    })
  }
}


export const deletememfile = (req, res) => {  //管理员删除个人账号    
  const q0 = `SELECT uuid FROM user WHERE id = ?`
  db.query(q0, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err)
    const user_uuid = data[0].uuid
    const q = `DELETE FROM user WHERE id = ?`
    db.query(q, [req.params.id], (err, data) => {
      if (err) return res.status(500).json(err)
      const q1 = `DELETE FROM photo WHERE user_uuid = ?`
      db.query(q1, [user_uuid], (err, data) => {
        if (err) return res.status(500).json(err)
        const dir = `./public/uploads/${req.params.id}`
        if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true })
        return res.status(200).json("账号删除成功~")
      })
    })
  })

}


export const getsinglemem = (req, res) => {  //管理员拿到个人uuid
  const q = `SELECT uuid,name FROM user WHERE id=?`
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data[0])
  })
}


///////////////////////////////////////////////////////////////////////////////////////
//管理员权限
export const beadmin = (req, res) => {  //普通用户成为管理员
  const admin_info = req.body
  const q = "INSERT INTO admin(`user_uuid`,`username`,`name`,`become_date`)VALUES(?)"
  const values = [
    admin_info.uuid,
    admin_info.username,
    admin_info.name,
    new Date(admin_info.date),
  ]
  db.query(q, [values], (err, data) => {
    if (err) {
      console.log(err)
      return res.json(err)
    }
    return res.status(200).json("管理员创建success!!!")
  })
}


export const adminconfirm = (req, res) => {  //管理员权限审核
  const q = `SELECT id,name FROM admin WHERE user_uuid=?`
  db.query(q, [req.params.uuid], (err, data) => {
    if (err) return res.status(500).json(err)
    if (data.length === 0) {
      return res.status(200).json(false)
    }
    return res.status(200).json(data[0])
  })
}


///////////////////////////////////////////////////////////////////////////////////////
//日志记录
export const rocordinfo = (req, res) => {  //管理员拿到日志记录
  const q = `SELECT * FROM record`
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}


///////////////////////////////////////////////////////////////////////////////////////
//流量统计
export const getstatistic = (req, res) => {//管理员拿到流量统计信息
  const q = `SELECT * FROM statistic
              WHERE IP_address NOT IN (
                SELECT IP_address FROM banlist)`
  db.query(q, [], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}


export const getbanlist = (req, res) => {  //管理员拿到封禁IP信息
  const q = `SELECT * FROM banlist`
  db.query(q, [], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}


export const deleteban = (req, res) => {  //管理员解封IP
  const q = `DELETE FROM banlist WHERE id = ?`
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json("解封成功~")
  })
}

export const ban = (req, res) => {  //管理员封禁IP
  const q = `INSERT INTO banlist(IP_address) VALUES(?)`
  db.query(q, [req.params.ip], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(`IP已封禁`)
  })
}

///////////////////////////////////////////////////////////////////////////////////////
//邀请码
export const getinvitecode = (req, res) => {  //拿到邀请码
  const q = `SELECT * FROM invitecode`
  db.query(q, [], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data)
  })
}

export const createcode = (req, res) => {  //创建邀请码
  function generateInviteCode (length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let inviteCode = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      inviteCode += characters.charAt(randomIndex)
    }
    return inviteCode
  }
  const inviteCode = generateInviteCode(10)
  const q = `INSERT INTO invitecode(code) VALUES(?)`
  db.query(q, [inviteCode], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(`IP已封禁`)
  })
}

///////////////////////////////////////////////////////////////////////////////////////
//文章
export const getarticle = (req, res) => {//拿到某人所有文章
  const q = `SELECT * FROM post WHERE user_uuid = ?`
  db.query(q, [req.params.uuid], async (err, data) => {
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
    console.log(5555555)
    console.log(data)
    return res.status(200).json(data)
  })
}
export const postarticle = (req, res) => {//发表文章
  const q = "INSERT INTO post(`user_uuid`,`title`,`content`,`img`,`category`)VALUES(?)"
  const values = [
    req.body.user_uuid,
    req.body.title,
    req.body.content,
    req.body.img,
    req.body.category,
  ]
  if (!req.body.title || !req.body.content) return res.status(500).json('输入有误，标题、正文请勿为空')
  // console.log(values)
  console.log(566666666)
  db.query(q, [values], (err, data) => {
    if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    console.log(data.insertId)
    console.log(99999)
    return res.status(200).json(data.insertId)
  })
}
export const getsinglearticle = (req, res) => {//拿到单个文章
  const q = `SELECT * FROM post WHERE id=?`
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json(data[0])
  })
}
export const updatearticle = (req, res) => {//更新单个文章
  const q = ` UPDATE post SET ? WHERE id = ? `
  db.query(q, [req.body, req.params.id], (err, data) => {
    if (err) return res.status(500).json(err)
    return res.status(200).json("文章更新成功")
  })
}
export const deletearticle = (req, res) => {//删除单个文章]
  // console.log(123123213)
  const id = req.params.id
  console.log(id)
  const q = `SELECT * FROM post WHERE id=?`
  db.query(q, [id], (err, data) => {
    if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    const deleteimg = data[0].img
    const user_uuid = data[0].user_uuid
    const q = `DELETE FROM post WHERE id = ?`
    db.query(q, [id], (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).json(err)
      }
      const q = `SELECT id FROM user WHERE uuid=?`
      db.query(q, [user_uuid], (err, data) => {
        if (err) {
          console.log(err)
          return res.status(500).json(err)
        }
        if (deleteimg) {
          const dir = `./public/uploads/${data[0].id}/article_photos`
          const filePathToDelete = `${dir}/${deleteimg}`
          // console.log(33333333)
          // console.log(data[0].id)
          // console.log(deleteimg)
          // console.log(filePathToDelete)
          // console.log(33333333)
          if (fs.existsSync(filePathToDelete)) fs.unlinkSync(filePathToDelete)
        }
        return res.status(200).json("文章及照片删除成功~")
      })
    })
  })
}