import { db } from "../db.js"
import multer from "multer"
import jwt from 'jsonwebtoken'
import fs from 'fs'

var imageurl = ""

///////////////////////////////////////////////////////////////////////////////////////
//上传avatar
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir0 = `./public/uploads/${req.params.id}`
    if (!fs.existsSync(dir0)) {
      fs.mkdirSync(dir0, { recursive: true })
    }
    const dir = `./public/uploads/${req.params.id}/avatar`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    } else {
      //如果存在avatar文件夹删除其中的所有文件（头像文件只保留一个）
      const files = fs.readdirSync(dir)
      for (const file of files) {
        const filePath = `${dir}/${file}`
        fs.unlinkSync(filePath)
      }
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const lastIndex = file.originalname.lastIndexOf('.')
    imageurl = Date.now() + file.originalname.slice(lastIndex)
    cb(null, imageurl)
  }
})

const upload = multer({ storage })

export const upload_avatar = (req, res) => {
  // 上传处理函数
  upload.single('file')(req, res, function (err) {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: '上传失败' })
    }
    // 在这里可以将文件信息保存到数据库或进行其他处理
    const q = ` UPDATE user SET img = ? WHERE id = ? `
    db.query(q, [imageurl, req.params.id], (err, data) => {
      if (err) return res.json(err)
      //更新token
      const q = "SELECT * FROM user WHERE id=?"
      db.query(q, [req.params.id], (err, data1) => {
        if (err) return res.json(err)
        if (data1.length === 0) return res.status(404).json("用户不存在")
        const token = jwt.sign({ id: data1[0].id }, "jwtkey")
        const { password, ...other } = data1[0]

        res.cookie("access_token", token, {
          httpOnly: true
        }).status(200).json({ message: '上传成功', other })
      })
    })
  })
}

///////////////////////////////////////////////////////////////////////////////////////
//上传照片墙photo
storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir0 = `./public/uploads/${req.params.id}`
    if (!fs.existsSync(dir0)) {
      fs.mkdirSync(dir0, { recursive: true })
    }
    const dir = `./public/uploads/${req.params.id}/photos`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const lastIndex = file.originalname.lastIndexOf('.')
    imageurl = Date.now() + file.originalname.slice(lastIndex)
    cb(null, imageurl)
  }
})

const upload1 = multer({ storage })

export const upload_back_photo = (req, res) => {
  upload1.single('file')(req, res, function (err) {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: '上传失败' })
    }
    const photo_info = JSON.parse(req.body.photo_info)//JSON对象要先转化为JS对象
    const q = "INSERT INTO photo(`user_uuid`,`img`,`username`,`name`,`createdate`)VALUES(?)"
    const values = [
      photo_info.uuid,
      imageurl,
      photo_info.username,
      photo_info.name,
      new Date(photo_info.date),
    ]
    db.query(q, [values], (err, data) => {
      if (err) {
        console.log(err)
        return res.json(err)
      }
      console.log("照片墙照片上传success!!!")
      return res.status(200).json("照片墙照片上传success!!!")
    })
  })
}


///////////////////////////////////////////////////////////////////////////////////////
//上传文章photo
storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir0 = `./public/uploads/${req.params.user_id}`
    if (!fs.existsSync(dir0)) {
      fs.mkdirSync(dir0, { recursive: true })
    }
    const dir = `./public/uploads/${req.params.user_id}/article_photos`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    //type为0是发表新文章 为1是编辑 需要删除原来的图片
    if (req.params.type == 1) {
      const filePathToDelete = `${dir}/${req.params.file_name}`
      console.log(666666666666)
      console.log(666666666666)
      console.log(666666666666)
      console.log(666666666666)
      console.log(req.params.type)
      console.log(req.params.file_name)
      console.log(filePathToDelete)
      console.log(666666666666)
      console.log(666666666666)
      console.log(666666666666)
      console.log(666666666666)
      if (fs.existsSync(filePathToDelete)) fs.unlinkSync(filePathToDelete)
    }

    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const lastIndex = req.params.file_name.lastIndexOf('.')
    imageurl = Date.now() + req.params.file_name.slice(lastIndex)
    cb(null, imageurl)
  }
})

const upload2 = multer({ storage })

export const upload_article_photo = (req, res) => {
  upload2.single('file')(req, res, function (err) {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: '上传失败' })
    }
    // console.log(2222222)
    // console.log(imageurl)
    // console.log(req.params.id)
    const q = ` UPDATE post SET img = ? WHERE id = ? `
    db.query(q, [imageurl, req.params.id], (err, data) => {
      if (err) return res.json(err)
      // console.log(imageurl)
      // console.log(req.params.id)
      // console.log("文章照片上传success!!!")
      return res.status(200).json("照片墙照片上传success!!!")
    })
  })
}

