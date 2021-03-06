module.exports = function({ mainDB, statistic, ctt, express, config, wrap }) {
    const router = express.Router();
    /**图说详情 */
    router.get('/Detail/:code', ctt, wrap(async({ params: replacements, memberCode }, res) => {
        replacements.memberCode = memberCode
        replacements.picBaseURL = config.picBaseURL
        let [result] = await mainDB.query("select *,LikeCount LikesCount,concat(:picBaseURL,Original_Image) Composite_Image from wf_imagetext where Status=1 and `Code`=:code", { replacements })
        if (result.length) {
            let [it] = result
            //点赞数和我是否已经点赞
            let [likeCount] = await mainDB.query(`select count(*) myLikes from wf_imagetext_likes where ITCode=:code and CreateUser=:memberCode`, { replacements })
            it.IsLikes = likeCount[0]["myLikes"] > 0;
            ([result] = await mainDB.query('select `Code` from wf_imagetext where Id<:Id and Status=1 order by Id desc limit 1', { replacements: it }));
            if (result.length)([{ Code: it.NextCode }] = result);
            else it.NextCode = "";
            ([result] = await mainDB.query('select `Code` from wf_imagetext where  Id>:Id and Status=1 limit 1', { replacements: it }));
            if (result.length)([{ Code: it.LastCode }] = result);
            else it.LastCode = "";
            //埋点
            statistic.page({ LoginId: memberCode, TypeId: 18, PageId: it.Id, IsLogin: true })
            Object.deleteProperties(it, "Id", "Original_Image", "Thumbnail", "Status", "State", "MemberCode", "CreateTime", "LikeCount")
            res.send({ Status: 0, Explain: "", Data: it })
        } else {
            res.send({ Status: -1, Explain: "该图说不存在!" })
        }
    }));
    /**删除我发布的图说 */
    router.delete('/Delete', ctt, wrap(async({ query: { code }, memberCode }, res) => {
        if (!code) {
            res.send({ Status: 40002, Explain: "Code不能为空!" })
            return
        }
        let [result] = await mainDB.query("update wf_imagetext set Status=0 where Status=1 and `Code`=:code and MemberCode=:memberCode", { replacements: { code, memberCode } })
        res.send({ Status: 0, Explain: "成功", Data: result })
    }))
    return router
}