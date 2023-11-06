import express from "express"
import {
  getback,
  updateback,
  getphotoback,
  deletephotoback,
  getmemfile,
  deletememfile,
  getsinglemem,
  beadmin,
  adminconfirm,
  rocordinfo,
  getstatistic,
  getbanlist,
  deleteban,
  ban,
  getinvitecode,
  createcode, 
  postarticle,
  getarticle, 
  getsinglearticle,
  updatearticle, 
  deletearticle
} from "../controllers/back.js"

const router = express.Router()

//普通用户
router.get('/:id', getback)//渲染个人信息
router.put('/:id', updateback)//更新个人信息
router.get('/photo/:uuid', getphotoback)//个人拿到照片
router.delete('/photo/:id/:img', deletephotoback)//个人删除照片

router.get('/article/:uuid', getarticle)//拿到某人所有文章信息
router.post('/article/single', postarticle)//发表文章
router.get('/article/single/:id', getsinglearticle)//拿到单个文章信息
router.put('/article/single/:id', updatearticle)//更新单个文章信息
router.delete('/article/single/:id', deletearticle)//删除单个文章

//管理员
router.get('/mem/:name', getmemfile)//管理员拿到所有个人信息
router.delete('/mem/:id', deletememfile)//管理员删除个人账户
router.get('/singlemem/:id', getsinglemem)//通过id拿到个人uuid

router.post('/beadmin', beadmin)//成为管理员
router.get('/adminconfirm/:uuid', adminconfirm)//管理员权限确认

router.get('/rocordinfo/:id', rocordinfo)//日志

router.get('/statistic/:id', getstatistic)//访问流量统计

router.get('/banlist/:id', getbanlist)//IP黑名单列表
router.post('/banIP/:ip', ban)//IP封禁
router.delete('/unbanIP/:id', deleteban)//IP解封

router.get('/invitecode/:id', getinvitecode)//拿到邀请码
router.post('/createcode', createcode)//创建邀请码



export default router