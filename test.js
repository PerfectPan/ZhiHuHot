const axios = require("axios");
const cheerio = require("cheerio");
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
;(async() => {
  console.log(1);
  await axios
	.get("https://www.zhihu.com/billboard",{
    headers: {
      "User-Agent": "",
      "Cookie": ""
    }
  })
	.then((res) => {
		if (res.status === 200) {
			const { data } = res;
			const items = [];
      const $ = cheerio.load(data);
			$('.Card').children('.HotList-item').each((idx, element) => {
        const $HotItem = $(element).children('.HotList-itemBody').children('.HotList-itemTitle');
        items.push(entities.decode($HotItem.html()));
			});
			console.log(items.join("\n"));
		} else {
			throw new Error("Network Error");
		}
	})
	.catch((err) => {
		throw err;
	});
})();
