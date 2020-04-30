const scoresaberRegion = require('./config.json').scoresaberRegion;
const numPlayersToScrape = require('./config.json').numPlayersToScrape;
const globalPagesToScrape = require('./config.json').globalPagesToScrape;
const rp = require('request-promise');
const $ = require('cheerio');

const headers = {
	'user-agent': `${scoresaberRegion.toUpperCase()} Regional Discord Bot`,
	'X-Requested-With': 'XMLHttpRequest',
};
const proxy = 'https://cors-anywhere.herokuapp.com/';

module.exports = {

	async getPlayers() {
		try {
			const pagesToScrape = Math.ceil(numPlayersToScrape / 50);
			const players = [];
			for (let i = 0; i < pagesToScrape; i++) {
				const options = {
					uri: proxy + 'https://scoresaber.com/global/' + (i + 1) + `&country=${scoresaberRegion}`,
					headers: headers,
				};
				await rp(options)
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

	async getTopGlobalPlayers() {
		try {
			const pagesToScrape = globalPagesToScrape;
			const players = [];
			for (let i = 0; i < pagesToScrape; i++) {
				const options = {
					uri: proxy + 'https://scoresaber.com/global/' + (i + 1),
					headers: headers,
				};
				await rp(options)
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

	async getRegion(scoresaber) {
		let region;
		const options = {
			uri: proxy + 'https://scoresaber.com' + scoresaber,
			headers: headers,
		};
		await rp(options)
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

	async getPlayerData(scoresaber) {
		let regionRank;
		let region;
		let globalRank;
		let pp;
		let name;
		const options = {
			uri: proxy + 'https://scoresaber.com' + scoresaber,
			headers: headers,
		};
		await rp(options)
			.then(html => {
				const ul = $('.columns .column:not(.is-narrow) ul', html)[0];

				const rankingLi = $('strong:contains("Player Ranking:")', ul).parent().slice(0, 1);
				const links = $('a', rankingLi);

				const regionLink = links.slice(-1).attr('href');
				region = regionLink.slice(-2);

				const rankingAnchors = $('li:first-child a', ul);
				globalRank = Number(rankingAnchors.slice(0, 1).text().slice(1).replace(',', ''));
				regionRank = Number(rankingAnchors.slice(1, 2).text().slice(2).replace(',', ''));

				const ppLi = $('strong:contains("Performance Points:")', ul).parent().slice(0, 1);

				pp = Number(ppLi.text().replace('pp', '').replace(/\s/g, '').replace('PerformancePoints:', '').replace(',', ''));
				name = $('.title.is-5 a', html).text().trim();
			})
			.catch(err => {
				console.log(err);
			});
		return [regionRank, region, globalRank, pp, name];
	},

	async getPlayerAtRank(rank, region = false) {
		let pageToScrape = Math.ceil(rank / 50);
		if (rank % 50 === 0) {
			pageToScrape = Math.ceil((rank - 1) / 50);
		}
		let player;
		let url;
		if (!region) {
			url = 'https://scoresaber.com/global/' + (pageToScrape);
		} else {
			url = 'https://scoresaber.com/global/' + (pageToScrape) + `&country=${region}`;
		}
		const options = {
			uri: proxy + url,
			headers: headers,
		};
		await rp(options)
			.then(html => {
				const rows = $('tr', html);

				let playerRowNum;
				if (rank % 50 === 0) {
					playerRowNum = 50;
				} else {
					playerRowNum = rank % 50;
				}

				if (rows.length - 1 < playerRowNum) {
					player = false;
					return;
				}

				rows.each(function(n) {
					if(n === playerRowNum) {
						player = $('a', this).attr('href');
					}
				});
			})
			.catch(err => {
				console.log(err);
			});
		return player;
	},
};
