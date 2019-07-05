# Beat Saber Rank Bot

A bot for automatically updating roles on a discord server to the relevant rank roles


## Setup

Create a database, this bot implements keyv so see the keyv documentation for more information: https://github.com/lukechilds/keyv#official-storage-adapters

Create a config.json of the following form in the root directory but with the fields changed to match your server:

```JSON
{
	"prefix": "%",
	"token": "discord bot token",
	"staff": ["ExampleStaff#1234", "OtherStaff#9876", "YetAnotherStaff#1111"],
	"serverId": "discord server id",
	"interval": 30,
	"rankGroups": [["Top Regional Player", 1], ["Top 10", 10], ["Top 25", 25], ["Top 50", 50]],
	"globalRankGroups":[["Top 32 (global)", 32], ["Top 50 (global)", 50], ["Top 100 (global)", 100]],
	"scoresaberRegion": "gb",
	"database": "mongodb://user:pass@localhost:27017/dbname",
	"roleMap": [["gb", "British"], ["", "Non UK"]],
	"errorChannelId": "discord channel id",
	"rankUpdateChannelId": "discord channel id",
	"numPlayersToScrape": 550,
	"customRegionName": ""
}
```

### Notes
* inverval is the time in minutes between automatic rank role update checks
* rank groups are regional, each role must be in order, highest to lowest, in the form ``["rank role", int]`` where ``rank role`` is the name of the role and ``int`` is the number of players in the bracket
* scoresaberRegion is two letter abbreviation for the region used in the scoresaber url for the top players in the region, ie for Great Britain the url is ``https://scoresaber.com/global?country=gb`` so the region code is ``gb``


If you have any questions, feels free to send me a message on discord (Rocker#1234).
