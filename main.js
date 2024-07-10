const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

const url = 'https://siikomik.com/';
const token = 'token bot Telegram lu';
const chatId = 'chat id telegram lu';
const bot = new TelegramBot(token, { polling: true });

let lastUpdateUrl = '';

const sendProjectUpdate = (project) => {
  const latestChapter = project.chapters[0];
  const message = `
*UPDATE SIIKOMIK*

*TITLE:* ${project.title}
*CHAPTERS:* ${latestChapter.title}
*RELEASE DATE:* ${latestChapter.updated}
*URL CHAPTERS:* [Click Here](${latestChapter.url})
  `;
  bot.sendPhoto(chatId, project.imageUrl, { caption: message, parse_mode: 'Markdown' });
};

const siikomikUpdate= async () => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const projects = [];

    $('div.bixbox').each((i, element) => {
      if ($(element).find('h2').text().trim() === 'Project Update') {
        $(element).find('div.utao.styletwo > div.uta').each((j, el) => {
          const project = {};

          project.title = $(el).find('div.luf > a.series > h4').text().trim();
          project.url = $(el).find('div.imgu > a.series').attr('href');
          project.imageUrl = $(el).find('div.imgu > a.series > img').attr('src');

          project.chapters = [];
          $(el).find('div.luf > ul > li').each((k, li) => {
            const chapter = {};
            chapter.title = $(li).find('a').text().trim();
            chapter.url = $(li).find('a').attr('href');
            chapter.updated = $(li).find('span').text().trim();
            project.chapters.push(chapter);
          });

          projects.push(project);
        });
      }
    });

    if (projects.length > 0) {
      const latestProject = projects[0];
      const latestChapterUrl = latestProject.chapters[0].url;

      if (latestChapterUrl !== lastUpdateUrl) {
        lastUpdateUrl = latestChapterUrl;
        sendProjectUpdate(latestProject);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

setInterval(siikomikUpdate, 10000);
