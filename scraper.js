const scoresaberRegion = require('./config.json').scoresaberRegion;
const numPlayersToScrape = require('./config.json').numPlayersToScrape;
const rp = require('request-promise');
const $ = require('cheerio');

module.exports = {

	async getPlayers() {
		try {
			const pagesToScrape = Math.ceil(numPlayersToScrape / 50);
			const players = [];
			for (let i = 0; i < pagesToScrape; i++) {
				const url = 'https://scoresaber.com/global/' + (i + 1) + `&country=${scoresaberRegion}`;
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

	async getRegion(player) {
		const url = 'https://scoresaber.com' + player;
		let region;
		await rp(url)
			.then(html => {
				const ul = $('ul', html).slice(0, 1);
				const li = $('li', ul).slice(0, 1);
				const links = $('a', li);
				const regionLink = links.slice(-1).attr('href');
				region = regionLink.slice(-2);
			})
			.catch(err => {
				console.log(err);
			});
		return region;
	},

	async getPlayerData(player) {
		const url = 'https://scoresaber.com' + player;
		let regionRank;
		let region;
		let globalRank;
		await rp(url)
			.then(html => {
				const ul = $('ul', html).slice(0, 1);
				const li = $('li', ul).slice(0, 1);
				const links = $('a', li);
				const regionLink = links.slice(-1).attr('href');
				region = regionLink.slice(-2);
				const a = $('a', html);
				globalRank = parseInt(a.slice(7, 8).text().slice(1));
				regionRank = parseInt(a.slice(8, 9).text().slice(2));
			})
			.catch(err => {
				console.log(err);
			});
		return [regionRank, region, globalRank];
	},
};