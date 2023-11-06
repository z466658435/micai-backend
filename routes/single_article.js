import express from "express"
import { readingsADD, likesADD, likesDELETE, commentsADD, commentsDELETE, child_commentsADD, child_commentsDELETE,get_comments } from "../controllers/single_article.js"

const router = express.Router()

//因为单个文章页面tops5板块需要拿取全部数据再slice(0,5)所以没有单独的路由获取单个页面数据 直接从全部数据进行find了
//感觉后期得进行调整 不然可能单个页面加载负荷会有点重？maybe
router.get('/readingsADD/:id', readingsADD)//进入单个文章页面后 文章阅读数+1

//likes点赞属性在post文章表中是一个JSON格式 本意存为列表 存入点赞用户的ID 即登录后的currentuser.id 例[1,5,2,3,8]
router.put('/likesADD/:id/:user_id', likesADD)//进入单个文章页面后 进行点赞 点赞数+1
router.delete('/likesDELETE/:id/:user_id', likesDELETE)//进入单个文章页面后 进行点赞取消 点赞数-1

//comments评论属性在post文章表中是一个JSON格式 本意存为列表 存入评论表的对象ID 例[1,5,2,3,8]
//经过考虑 决定将post表中的comments属性变为INT属性 只存储数量 在每次发表评论的url中对post的comments值进行更新
//原因：第一次做网站没有经验 决定两种方法都试一下 自我觉得可行 JSON在点赞中实现了 在评论中使用INT也可以减少代码量 
//同时点赞没有单独的表 而评论有表 刚好可以使用这种偷懒代码量少的方式
router.get('/get_comments/:post_id', get_comments)//进入单个文章页面后 评论人进行评论 评论数+1
router.post('/commentsADD', commentsADD)//进入单个文章页面后 评论人进行评论 评论数+1
router.delete('/commentsDELETE/:id', commentsDELETE)//进入单个文章页面后 作者或评论本人进行评论删除 评论数-1
router.post('/child_commentsADD', child_commentsADD)//进入单个文章页面后 评论人对楼主的评论进行子评论 评论数+1
router.delete('/child_commentsDELETE/:id', child_commentsDELETE)//进入单个文章页面后 作者或评论本人进行评论删除 评论数-1

export default router