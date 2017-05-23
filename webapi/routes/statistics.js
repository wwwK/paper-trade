import sqlstr from '../../common/sqlStr'
import singleton from '../../common/singleton'
import _config from '../config'

module.exports = function({ mainDB, statistic, ctt, express, config, wrap }) {
    const router = express.Router();
    /**页面停留时间埋点 */
    router.post('/StayTimeStatistics', ctt, wrap(async({ memberCode, body }, res) => {
        res.end()
        let result = {}
        body.LoginId = memberCode
        body.IsLogin = 1
        switch (body.PageType) {
            case "news": //资讯类
                switch (body.TypeId) {
                    case 13: //投票
                        result = mainDB.query("select VoteId from wf_vote where VoteCode=:VoteCode", { replacements: { VoteCode: body.PageId }, type: "SELECT" })
                        if (result.length) {
                            body.PageId = result.VoteId
                            statistic.pageStay(body)
                        }
                        break
                    case 14: //书籍
                        result = mainDB.query("select Id from wf_books where Code=:Code", { replacements: { Code: body.PageId }, type: "SELECT" })
                        if (result.length) {
                            body.PageId = result.Id
                            statistic.pageStay(body)
                        }
                        break
                    case 15: //专题
                        result = mainDB.query("select Id from wf_dissertation_type where Code=:Code", { replacements: { Code: body.PageId }, type: "SELECT" })
                        if (result.length) {
                            body.PageId = result.Id
                            statistic.pageStay(body)
                        }
                        break
                    case 16: //栏目
                        result = mainDB.query("select ColumnId from wf_news_column where ColumnNo=:ColumnNo", { replacements: { ColumnNo: body.PageId }, type: "SELECT" })
                        if (result.length) {
                            body.PageId = result.ColumnId
                            statistic.pageStay(body)
                        }
                        break
                    case 17: //精选
                        result = mainDB.query("select Id from wf_choiceness where Code=:Code", { replacements: { Code: body.PageId }, type: "SELECT" })
                        if (result.length) {
                            body.PageId = result.Id
                            statistic.pageStay(body)
                        }
                        break
                    case 18: //图说
                        result = mainDB.query("select Id from wf_imagetext where Code=:Code", { replacements: { Code: body.PageId }, type: "SELECT" })
                        if (result.length) {
                            body.PageId = result.Id
                            statistic.pageStay(body)
                        }
                        break
                    case 19: //资讯
                        result = mainDB.query("select Id from wf_news where Code=:Code", { replacements: { Code: body.PageId }, type: "SELECT" })
                        if (result.length) {
                            body.PageId = result.Id
                            statistic.pageStay(body)
                        }
                        break
                    case 20: //视频
                        result = mainDB.query("select VideoId from wf_live_video where VideoCode=:VideoCode", { replacements: { VideoCode: body.PageId }, type: "SELECT" })
                        if (result.length) {
                            body.PageId = result.VideoId
                            statistic.pageStay(body)
                        }
                        break
                }
                break
            case "stock": //股票详情页面停留时间
                statistic.stockPageStay(body)
                break
        }
    }));
    /**股票详情页面埋点 */
    router.post('/StockStatistics/:StockType/:StockNo', ctt, wrap(async({ params: { StockType, StockNo }, body, memberCode }, res) => {
        res.end()
        body.StockType = StockType
        body.StockNo = StockNo
        body.LoginId = memberCode
        body.IsLogin = 1
        statistic.stockPageStay(body)
    }));
    return router
}