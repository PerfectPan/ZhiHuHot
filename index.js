require('dotenv').config();

const axios = require('axios');
// https://github.com/octokit/rest.js/issues/1647
const { Octokit } = require('@octokit/rest');
const cheerio = require('cheerio');
// 中文解码
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const { GIST_ID: gistID, GH_TOKEN: githubToken } = process.env;

const octokit = new Octokit({auth: `token ${githubToken}`});

;(async () => {
  const gist = await octokit.gists.get({gist_id: gistID})
    .catch(err => {throw new Error(`Get gist failed\n ${err}`)});
  const fileName = Object.keys(gist.data.files)[0];
  console.log(`fileName: ${fileName}`);
  axios
    .get('https://www.zhihu.com/billboard', {
      headers: {
        "User-Agent": "",
        "Cookie": ""
      }
    })
    .then(async (res) => {
      if (res.status === 200) {
        const { data } = res;
        const items = [];
        const $ = cheerio.load(data);
        console.log(data);
        console.log('len: ',$('.Card').children('.HotList-item').length);
        $('.Card').children('.HotList-item').each((idx, element) => {
          const $HotItem = $(element).children('.HotList-itemBody').children('.HotList-itemTitle');
          items.push(`${idx}. ${entities.decode($HotItem.html())}`);
        });
        await octokit.gists.update({
          gist_id: gistID,
          files: {
            [fileName]: {
              fileName: 'Zhihu',
              content: `知乎热榜\n${items.join('\n')}`
            }
          }
        }).catch(error => {
          console.error('Cannot update gist');
          throw error;
        });
      } else {
        throw new Error('Network Error');
      }
    })
    .catch(err => {
      throw err;
    });
})();