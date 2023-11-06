import { db } from "../db.js"
import path from "path"
import { fileURLToPath } from 'url'
import { dirname } from 'path'

//single页面通过uuid获取用户信息
export const getsingle = (req, res) => {
  const uuid = req.params.uuid
  const q = `SELECT username,img,uuid,
  name,gender,date,nativePlace,college,
  major,serviceTime,servicePlace,station,services
  FROM user
  WHERE uuid=?`
  db.query(q, [uuid], (err, data) => {
    if (err) return res.status(500).json(err)
    console.log(data[0])
    return res.status(200).json(data[0])
  })
}

export const getavatar = (req, res) => {
  const imageName = req.params.imageName
  const qid = `SELECT id FROM user
  WHERE img = ?`
  db.query(qid, [imageName], (err, data) => {
    if (err) return res.status(500).json(err)
    const userId = data[0].id
    const imagePath = path.join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'uploads', `${userId}`, 'avatar', imageName)
    if (!imagePath) {
      return res.status(500).json({ error: '获取失败' })
    }
    return res.status(200).sendFile(imagePath)
  })
}

export const getphoto = (req, res) => {
  const imageName = req.params.imageName
  const qid = `SELECT user.id FROM user
  JOIN photo ON user.uuid = photo.user_uuid
  WHERE photo.img = ?`
  db.query(qid, [imageName], (err, data) => {
    if (err) return res.status(500).json(err)
    const userId = data[0].id
    const imagePath = path.join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'uploads', `${userId}`, 'photos', imageName)
    if (!imagePath) {
      return res.status(500).json({ error: '获取失败' })
    }
    return res.status(200).sendFile(imagePath)
  })
}