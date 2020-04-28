require('dotenv').config();

const axios = require('axios');
// https://github.com/octokit/rest.js/issues/1647
const { Octokit } = require('@octokit/rest');
const cheerio = require('cheerio');

const { GIST_ID: gistID, GH_TOKEN: githubToken } = process.env;

const octokit = new Octokit({auth: `token ${githubToken}`});

;(async () => {
  const gist = await octokit.gist.get({gist_id: gistID})
    .catch(err => {throw new Error(`Get gist failed\n ${err}`)});
  const fileName = Object.keys(gist.data.files)[0];
  axios
    .get('https://www.zhihu.com/hot', {
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
        $('.Card').children('.HotList-item').each((idx, element) => {
          const $HotItem = $(element).children('.HotList-itemBody').children('.HotList-itemTitle');
          items.push($HotItem.html());
        });
        await octokit.gist.update({
          gist_id: gistID,
          files: {
            [fileName]: {
              fileName: '知乎热榜',
              content: items.join('\n')
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