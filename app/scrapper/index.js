
// require class modules
const navigate = require('./navigate');
const extract = require('./extract');

// the scrapper class
class Scrapper {
  constructor(page, logger, config) {
    this.page = page;
    this.config = config;
    this.logger = logger;

    if (this.config.inject) {
      // a bit like cheating, as this will print transactions without delay or alert
      this.page.evaluateOnNewDocument(() => {
        Math.random = () => 0.99;
      });
    }

    // page events are persistent accross navigation, so they are registered once
    this.page.on('dialog', async (dialog) => {
      // dismiss any dialog
      this.logger.debug('dialog →', dialog.message());
      dialog.dismiss();

      // btnGenerate is generated right after
      await this.page.waitForSelector('#btnGenerate');
      const btn = await this.page.$('#btnGenerate');
      btn.click();
      this.logger.debug('Clicked reload button!');
    });

    // scrapper is ready
    this.logger.debug('Scrapper initialized!');
  }

  async fetch(url) {
    // 1. navigate to url and get frame (body or iframe) holding transactions table
    const frame = await this.navigate(url);
    // 2. extract transactions from frame into proper array
    return this.extract(frame);
  }
}

// separate logic in their own file
Scrapper.prototype.navigate = navigate;
Scrapper.prototype.extract = extract;

module.exports = Scrapper;
