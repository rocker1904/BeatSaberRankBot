const rp = require('request-promise');
const $ = require('cheerio');

module.exports = {
	async getPlayers() {
		try {
			const pagesToScrape = 10;
			const players = [];
			for (let i = 0; i < pagesToScrape; i++) {
				const url = 'https://scoresaber.com/global/' + (i + 1) + '&country=gb';
				await rp(url)
					.then(html => {
						const rows = $('tr', html);
						rows.each(function(n) {
							if(n !== 0) {
								players[50 * i + n - 1] = $('a', this).attr('href');
							}
						});
					})
					.catch(err => {
						console.log(err);
					});
			}
			return players;
		} catch (e) {
			console.log(e);
			throw e;
		}
	},
};