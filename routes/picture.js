import express from "express"
import { get_avatar, get_photo, get_article_photo } from "../controllers/picture.js"

const router = express.Router()

router.get('/image/:imageName', get_avatar)//前端获取头像图片 avatar
router.get('/photo/:imageName', get_photo)//前端获取照片图片 photo
router.get('/article_photo/:imageName', get_article_photo)//前端获取文章封面图片 article_photo

export default router