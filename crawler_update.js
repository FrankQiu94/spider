const fs = require('fs')
const http = require('http')
const request = require('request')
const xlsx = require('node-xlsx')
const cheerio = require('cheerio')
const url = 'http://xuehuli.com/pc/excise?id=1379281&subjectId=74&derive=0'
let outPutData = ''

http.get(url, (res) => {
    let urlTime = new Date().getTime()
    let html = ''
    res.on('data', (chunk) => {
        html += chunk
    })
    res.on('end', () => {
        const $ = cheerio.load(html)
        let urlTime2 = new Date().getTime()
        request.post(`http://xuehuli.com/app/getcatalogue?urltimer=${urlTime2}`, {
            form: {
                openid: '',
                tel: '13936353488',
                pwd: 'sunyue159357',
                guid: 'b29f7b68-4cfe-4de8-9ad5-cccfc7c6c430',
                derive: '59770',
                subjectId: '74'
            }
        }, (error2, res2, body2) => {
            const result2 = JSON.parse(body2)
            result2.forEach((r) => {
                let urlnow = new Date().getTime()
                getTest(urlnow, r.Name, r.Id)
            })
        })
    })
})


function formatData(data) {
    let questions = ''
    const Question = data["Question"];
    const Option = data["Option"];
    const Topics = data["Topic"];
    for (var i = 0; i < Question.length; i++) {
        var Title = Question[i]["Title"];
        var Explain = Question[i]["Explain"];
        var Style = Question[i]["Style"];
        var collCount = Question[i]["Collection"];
        var Topic = Question[i]["Topic"];
        var topic = "";
        if (Topic != null && Topic != undefined && Topic != "" && Topic > 0) {
            if (i == 0 || i > 0 && Question[i - 1]["Topic"] != Topic) {
                //加专题材料
                for (var k = 0; k < Topics.length; k++) {
                    if (Topics[k]["Id"] == Topic) {
                        topic = `<div class='test'><p class='material-title'>${Topics[k]["Content"]}</p></div>`;
                    }
                }
            }
        }
        var count = 0;
        var answer = "";
        var title = "";
        var options = "";
        var operation = "";
        var opt = "";
        var j;
        var inline;
        if (Style == 1) {
            for (j = 0; j < Option.length; j++) {
                if (Option[j]["QuestionsId"] == Question[i]["Id"]) {
                    options += "<li><label class='anserlab' value='" + Option[j]["Option"] + "' data-answer-id='" + Option[j]["Option"] + "' id='" + Option[j]["Id"] + "'>" +
                        "<i>" + Option[j]["Option"] + "</i></label></li>";
                    if (Option[j]["IsTrue"] == 1) {
                        answer = Option[j]["Option"];
                    }
                    count++;
                }
            }
            title = "<div class='content-loop'>" + topic + "<p class='loop-title'>" + (i + 1) + ".【判断题】</p>" +
                "<div class='test'><div class='loop-questions judgment' data-answer-id='" + answer + "' data-question-id='" + Question[i]["Id"] + "'>" +
                "<p>" + Title + "</p><ul class='answer'>";
            operation = "</ul><div class='my-analysis'><div class='content'><span class='true'>正确答案</span>,<span class='user-answer'></span>" +
                "</div></div><div class='analysis'><i class='triangle-up'></i><p class='resolution'>解析：" + Explain + "</p></div>" +
                "</div></div></div>";
            questions += title + options + operation;
        } else if (Style == 2) {
            for (j = 0; j < Option.length; j++) {
                if (Option[j]["QuestionsId"] == Question[i]["Id"]) {
                    opt = String.fromCharCode(65 + count);
                    if (Option[j]["Type"] == 1) {
                        options += "<li style='display: inline-block'><label class='anserlab' value='" + Option[j]["Option"] + "' id='" + Option[j]["Id"] +
                            "' data-answer-id='" + Option[j]["Option"] + "'><i>" + Option[j]["Option"] + "</i></label></li>";
                        if (Option[j]["IsTrue"] == 1) {
                            answer = Option[j]["Option"];
                        }
                    } else {
                        options += "<li><label class='anserlab' value='" + opt + "' id='" + Option[j]["Id"] +
                            "' data-answer-id='" + opt + "'><i>" + opt + "</i>" + Option[j]["Option"] + "</label></li>";
                        if (Option[j]["IsTrue"] == 1) {
                            answer = opt;
                        }
                    }
                    count++;
                }
            }
            title = "<div class='content-loop'>" + topic + "<p class='loop-title'>" + (i + 1) + ".【单选题】</p>" +
                "<div class='test'><div class='loop-questions radio' data-answer-id='" + answer + "' data-question-id='" + Question[i]["Id"] + "'>" +
                "<p>" + Title + "</p><ul class='answer'>";
            operation = "</ul><div class='my-analysis'><div class='content'><span class='true'>正确答案</span>,<span class='user-answer'></span>" +
                "</div></div><div class='analysis'><i class='triangle-up'></i><p class='resolution'>解析：" + Explain + "</p></div>" +
                "</div></div></div>";
            questions += title + options + operation;
        } else if (Style == 3 || Style == 4) {
            for (j = 0; j < Option.length; j++) {
                if (Option[j]["QuestionsId"] == Question[i]["Id"]) {
                    opt = String.fromCharCode(65 + count);
                    if (Option[j]["Type"] == 1) {
                        options += "<li style='display: inline-block'><label class='anserlab' id='" + Option[j]["Id"] + "' value='" + Option[j]["Option"] +
                            "'><i>" + Option[j]["Option"] + "</i></label></li>";
                        if (Option[j]["IsTrue"] == 1) {
                            if (answer == "") {
                                answer = Option[j]["Option"];
                            } else {
                                answer += "," + Option[j]["Option"];
                            }
                        }
                    } else {
                        options += "<li><label class='anserlab' id='" + Option[j]["Id"] + "' value='" + opt +
                            "'><i>" + opt + "</i>" + Option[j]["Option"] + "</label></li>";
                        if (Option[j]["IsTrue"] == 1) {
                            if (answer == "") {
                                answer = opt;
                            } else {
                                answer += "," + opt;
                            }
                        }
                    }
                    count++;
                }
            }
            title = "<div class='content-loop'>" + topic + "<p class='loop-title'>" + (i + 1) + ".【多选题】</p>" +
                "<div class='test'><div class='loop-questions multiple' data-answer-id='" + answer + "' data-question-id='" + Question[i]["Id"] + "'>" +
                "<p>" + Title + "</p><ul class='answer'>";
            operation = "</ul><div class='my-analysis'><div class='content'><span class='true'>正确答案</span>,<span class='user-answer'></span>" +
                "</div></div><div class='analysis'><i class='triangle-up'></i><p class='resolution'>解析：" + Explain + "</p></div>" +
                "</div></div></div>";
            questions += title + options + operation;
        }
    }
    return questions
}


function getTest(urlnow, name, c_id) {
    request.post(`http://xuehuli.com/app/gettid?urltimer=${urlnow}`, {
        form: {
            openid: '',
            tel: '13936353488',
            pwd: 'sunyue159357',
            guid: 'b29f7b68-4cfe-4de8-9ad5-cccfc7c6c430',
            cid: c_id,
            type: '0',
            subjectId: '74'
        }
    }, (err, response, body) => {
        let urlTime3 = new Date().getTime()
        let tid = body.toString()
        request.post(`http://xuehuli.com/app/gettestmodel?url=${urlTime3}`, {
            form: {
                openid: '',
                tel: '13936353488',
                pwd: 'sunyue159357',
                guid: 'b29f7b68-4cfe-4de8-9ad5-cccfc7c6c430',
                tid: `0,${tid}`,
                type: '0',
                subjectId: '74'
            }
        }, (error, response2, test) => {
            // fs.writeFile('test.json', test, () => {
            //   console.log('爬完了')
            // })
            let result = JSON.parse(test)
            let htmlData = formatData(result)
            let $h = cheerio.load(htmlData)
            let contentInfo = $h('.content-loop')
            outPutData = ''
            contentInfo.each((c_index, c_content) => {
                let $this = $h(c_content)
                let m_t_txt = $this.find('.material-title').text()
                if (m_t_txt) {
                    outPutData += `${m_t_txt}\r\n`
                }
                let loopQuestion = $this.find('.loop-questions')
                outPutData += `${$this.children('.loop-title').text()}\r\n${loopQuestion.children('p').text()}\r\n`
                let answers = $this.find('.anserlab')
                answers.each((a_i, a_c) => {
                    outPutData += `${$h(a_c).text()}\r\n`
                })
                outPutData += `正确答案：${loopQuestion.attr('data-answer-id')}\r\n${$this.find('.analysis').text()}\r\n`
            })
            fs.writeFile(`${name}.txt`, outPutData, () => {
                console.log('爬完了！')
            })
        })
    })
}
