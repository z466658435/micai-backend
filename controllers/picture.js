import { db } from "../db.js"
import geoip from 'geoip-lite'


//获取头像图片 avatar
export const get_avatar = (req, res) => { 
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
}

//后台获取照片图片 photo
export const get_photo = (req, res) => { 
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
}

//获取文章封面图片 article_photo
export const get_article_photo = (req, res) => { 
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
}
