import { db } from "../db.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import geoip from 'geoip-lite'



export const readingsADD = (req, res) => {
  const articleID = req.params.id
  const q = `UPDATE post SET readings = readings + 1 WHERE id = ?`
  db.query(q, [articleID], async (err, data) => {
    if (err) return res.status(500).json(err)
    console.log(`id为${articleID}的文章---阅读量+1`)
    return res.status(200).json()
  })
}

export const likesADD = (req, res) => {
  const articleID = req.params.id
  const user_id = parseInt(req.params.user_id)
  console.log(articleID)
  console.log(user_id)

  const getLikesQuery = 'SELECT likes FROM post WHERE id = ?'
  db.query(getLikesQuery, [articleID], (err, arr) => {
    if (err) {
      return res.status(500).json(err)
    }

    let likesArray = arr[0].likes // 获取数据库中的likes值
    // console.log(likesArray)
    // console.log(typeof (likesArray))//string
    // console.log(typeof (user_id))//number
    if (likesArray === null) {
      likesArray = [user_id]
    } else if (!likesArray.includes(user_id)) {
      likesArray = JSON.parse(likesArray)
      likesArray.push(user_id)
    } else return res.status(200).json()
    console.log(3)
    const q = 'UPDATE post SET likes = ? WHERE id = ?'

    db.query(q, [JSON.stringify(likesArray), articleID], async (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).json(err)
      }
      console.log(`id为${articleID}的文章---点赞量+1`)
      return res.status(200).json()
    })
  })
}

export const likesDELETE = (req, res) => {
  const articleID = req.params.id
  const user_id = parseInt(req.params.user_id)
  console.log(articleID)
  console.log(user_id)

  const getLikesQuery = 'SELECT likes FROM post WHERE id = ?'
  db.query(getLikesQuery, [articleID], (err, arr) => {
    if (err) {
      return res.status(500).json(err)
    }

    let likesArray = arr[0].likes // 获取数据库中的likes值
    let filteredArray // likesArray进行处理后的数据
    // console.log(likesArray)
    // console.log(typeof (likesArray))//string
    // console.log(typeof (user_id))//number
    if (likesArray === null) {
      return res.status(200).json()
    } else if (likesArray.includes(user_id)) {
      likesArray = JSON.parse(likesArray)
      filteredArray = likesArray.filter(element => element !== user_id)
    } else return res.status(200).json()
    console.log(3)

    const q = 'UPDATE post SET likes = ? WHERE id = ?'
    db.query(q, [JSON.stringify(filteredArray), articleID], async (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).json(err)
      }
      console.log(`id为${articleID}的文章---点赞量-1`)
      return res.status(200).json(data)
    })
  })
}

export const get_comments = (req, res) => {
  // console.log(req.params)
  const post_id = req.params.post_id
  var comment_data
  const q = "SELECT * FROM comment WHERE post_id=?"
  db.query(q, [post_id], async (err, data0) => {
    if (err) return res.status(500).json(err)
    // console.log(data0)

    ////////////有助于理解promise////////////
    const fetchCommentData = async (item) => {
      const q1 = "SELECT * FROM user WHERE uuid=?"
      return new Promise((resolve, reject) => {
        db.query(q1, [item.user_uuid], (err, user_data0) => {
          if (err) return reject(err)
          const commentItem = {
            id: item.id,
            user_id: user_data0[0].id,
            user_uuid: item.user_uuid,
            user_name: user_data0[0].name,
            user_major: user_data0[0].major,
            user_img: user_data0[0].img,
            post_id: item.post_id,
            father_comment_id: -1,
            reply_to_id: -1,
            comment_content: item.comment_content,
            comment_date: item.comment_date
          }
          resolve(commentItem)
        })
      })
    }
    const comment_data = await Promise.all(data0.map(item => fetchCommentData(item)))
    // console.log(comment_data)

    const q = "SELECT * FROM comment_child WHERE post_id=?"
    db.query(q, [post_id], async (err, data1) => {
      if (err) return res.status(500).json(err)
      const fetchCommentData = async (item) => {
        const q1 = "SELECT * FROM user WHERE uuid=?"
        return new Promise((resolve, reject) => {
          db.query(q1, [item.user_uuid], (err, user_data1) => {
            if (err) return reject(err)
            const commentItem = {
              id: item.id,
              user_id: user_data1[0].id,
              user_uuid: item.user_uuid,
              user_name: user_data1[0].name,
              user_major: user_data1[0].major,
              user_img: user_data1[0].img,
              post_id: item.post_id,
              father_comment_id: item.father_comment_id,
              reply_to_id: item.reply_to_id,
              comment_content: item.comment_content,
              comment_date: item.comment_date
            }
            resolve(commentItem)
          })
        })
      }
      const comment_child_data = await Promise.all(data1.map(item => fetchCommentData(item)))
      // console.log(comment_child_data)
      const combine_data = [...comment_data, ...comment_child_data]
      // console.log(combine_data)
      return res.status(200).json(combine_data)
    })
  })
}

export const commentsADD = (req, res) => {
  const values = [
    req.body.user_uuid,
    req.body.post_id,
    req.body.comment_content,
  ]
  console.log(req.body)
  const q = "INSERT INTO comment(`user_uuid`,`post_id`,`comment_content`)VALUES(?)"
  db.query(q, [values], async (err, data) => {
    if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    const comments_json = JSON.stringify({
      comments_num: req.body.comments_num + 1
    })
    const q1 = "UPDATE post SET comments=? WHERE id=?"
    db.query(q1, [comments_json, req.body.post_id], async (err, data) => {
      if (err) {
        console.log(err)
        return res.status(500).json(err)
      }
      console.log(`id为${req.body.post_id}的文章---评论+1`)
      return res.status(200).json(`id为${req.body.post_id}的文章---评论+1`)
    })
  })
}

export const commentsDELETE = (req, res) => {
  const comment_id = req.params.id
  const post_id = req.query.post_id
  const comments_num = req.query.comments_num
  console.log(comment_id)
  const q = `DELETE FROM comment WHERE id=?`
  db.query(q, [comment_id], async (err, data) => {
    if (err) return res.status(500).json(err)
    const comments_json = JSON.stringify({
      comments_num: comments_num - 1
    })
    const q1 = "UPDATE post SET comments=? WHERE id=?"
    db.query(q1, [comments_json, post_id], async (err, data) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json("评论及所属子评论删除成功！")
    })
  })
}

export const child_commentsADD = (req, res) => {
  console.log(21321)
  const values = [
    req.body.user_uuid,
    req.body.post_id,
    req.body.comment_content,
    req.body.father_comment_id,
    req.body.reply_to_id,
  ]
  const q = "INSERT INTO comment_child(`user_uuid`,`post_id`,`comment_content`,`father_comment_id`,`reply_to_id`)VALUES(?)"
  db.query(q, [values], async (err, data) => {
    if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    const comments_json = JSON.stringify({
      comments_num: req.body.comments_num + 1
    })
    const q1 = "UPDATE post SET comments=? WHERE id=?"
    db.query(q1, [comments_json, req.body.post_id], async (err, data) => {
      if (err) return res.status(500).json(err)
      console.log(`id为${req.body.post_id}的文章---评论+1`)
      return res.status(200).json(`id为${req.body.post_id}的文章---评论+1`)
    })
  })
}

export const child_commentsDELETE = (req, res) => {
  const child_comment_id = req.params.id
  const post_id = req.query.post_id
  const comments_num = req.query.comments_num
  console.log(child_comment_id)
  const q = `DELETE FROM comment_child WHERE id=?`
  db.query(q, [child_comment_id], async (err, data) => {
    if (err) return res.status(500).json(err)
    const comments_json = JSON.stringify({
      comments_num: comments_num - 1
    })
    const q1 = "UPDATE post SET comments=? WHERE id=?"
    db.query(q1, [comments_json, post_id], async (err, data) => {
      if (err) return res.status(500).json(err)
      return res.status(200).json("子评论删除成功！")
    })
  })
}