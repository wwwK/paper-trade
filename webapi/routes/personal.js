import express from 'express'
const myMainListSql = `
SELECT *,CONCAT(:picBaseURL,a.SelectPicture) AS SelectPicture FROM 
	(SELECT
		'video' AS Type,
		wf_live_video.VideoCode AS Code,
		wf_live_video.VideoName AS Title,
		wf_live_video.VideoImage AS SelectPicture,
		wf_live_video.TimeLong,
		wf_live_video.ShowTime AS ShowTime,
		'' SecuritiesNo,
		'' SecuritiesType,
		'' LikeCount,
		'' CommentCount
	FROM
		wf_live_video
	LEFT JOIN wf_member ON wf_live_video.MemberCode = wf_member.MemberCode
	WHERE
		wf_live_video.\`Status\` = '0'
	AND wf_live_video.MemberCode = :memberCode
	UNION
	SELECT
		'news' AS Type,
		wf_News.\`Code\`,
		wf_News.Title,
		wf_News.SelectPicture AS SelectPicture,
		'' AS TimeLong,
		wf_News.ShowTime AS ShowTime,
		wf_News.SecuritiesNo,
		wf_News.SecuritiesType,
		'' LikeCount,
		'' CommentCount
	FROM
		wf_News
	LEFT JOIN wf_member ON wf_News.CreateUser = wf_member.MemberCode
	WHERE
		Type = '9'
	AND NOW() > ShowTime
	AND IsStartNews = '0'
	AND wf_News.CreateUser = :memberCode
	UNION
	SELECT
		'imageTalk' AS Type,
		wf_imagetext.\`Code\`,
		wf_imagetext.Details AS Title,
		wf_imagetext.Thumbnail AS SelectPicture,
		'' AS TimeLong,
		wf_imagetext.CreateTime AS ShowTime,
		'' SecuritiesNo,
		'' SecuritiesType,
		wf_imagetext.LikeCount,
		wf_imagetext.CommentCount
	FROM
		wf_imagetext
	LEFT JOIN wf_member ON wf_imagetext.MemberCode = wf_member.MemberCode
	WHERE
		wf_imagetext.\`Status\` = 1
	AND wf_imagetext.MemberCode = :memberCode
) a order by  a.ShowTime DESC;
`

let mainListCache = {}
async function mainList({ memberCode, pageNum, pageSize, res, sequelize, config }) {
    if (Number.isNaN(pageNum) || Number.isNaN(pageSize)) {
        res.status(200).send({ Status: "40003", Explain: "参数类型应该是整数，您传的是：" + JSON.stringify(req.query) })
    } else {
        if (pageSize < 0) pageSize = 10
        if (pageNum < 0) pageNum = 0
        if (pageNum == 0 || !mainListCache[memberCode]) {
            let [result] = await sequelize.query(myMainListSql, { replacements: { memberCode, picBaseURL: config.picBaseURL } })
            mainListCache[memberCode] = result
        }
        let result = mainListCache[memberCode].slice(pageNum, pageNum + pageSize)
        res.status(200).send({ Status: "0", Explain: "", DataList: result })
    }
}
module.exports = function(shareData) {
    const router = express.Router();
    let { sequelize, ctt, config } = shareData
    /**个人主页我的发布或者他人主页中的发布列表 */
    router.get('/GetMyMainList', [ctt], (req, res) => {
        let { pageNum = 0, pageSize = 10 } = req.query
        let memberCode = req.memberCode
        pageNum = Number(pageNum)
        pageSize = Number(pageSize)
        try { mainList({ memberCode, pageNum, pageSize, res, sequelize, config }) } catch (ex) {
            res.status(200).send({ Status: "500", Explain: ex })
        }
    })
    router.get('/GetHeMainList', (req, res) => {
        let { pageNum = 0, pageSize = 10, memberCode } = req.query
        pageNum = Number(pageNum)
        pageSize = Number(pageSize)
        if (!memberCode) {
            res.json({ Status: "40002", Explain: "memberCode 为空" })
        } else
            try { mainList({ memberCode, pageNum, pageSize, res, sequelize, config }) } catch (ex) {
                res.status(200).send({ Status: "500", Explain: ex })
            }
    })
    return router
}