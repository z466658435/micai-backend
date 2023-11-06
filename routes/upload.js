import express from "express"
import { upload_avatar,upload_back_photo,upload_article_photo } from "../controllers/upload.js"

const router=express.Router()

router.post('/avatar/:id', upload_avatar)//上传头像
router.post('/back_photo/:id', upload_back_photo)//上传照片
router.post('/article_photo/:id/:user_id/:file_name/:type', upload_article_photo)//上传照片 type为0是发表新文章 为1是编辑 需要删除原来的图片再上传新的

export default router