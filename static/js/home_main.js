'use strict';

let g = {
	account:null,
	me:null,
	talkens:[],
	subscribings:[],
};

new Vue({
	el: '#app',
	data: {data:g},
	computed: {
		g:function() { return g; },
	},
});

loadAccount()
.then(loadSubscribings)
.then(loadSubscribingStats)

async function loadSubscribingStats() {
	for(let i=0;i<g.subscribings.length;++i) {
		adapter.getSubscribingStat(g.subscribings[i].address).then((stat)=>{

			g.subscribings[i].stat = stat;
		});
	}
}
async function loadSubscribings() {
	let subscribings = await adapter.getSubscribings(g.account);

	for(let i=0;i<subscribings.length;++i) {
		g.subscribings.push(subscribings[i]);
	}
}

async function loadTalkens() {
	let publisher = await adapter.getPublisher(g.account, g.account);

	for(let i=0;i<publisher.talkens.length;++i) {
		g.talkens.push(publisher.talkens[i]);
	}
}

async function loadAccount() {
	g.account = await adapter.getAccount();
	let stat = await adapter.getSubscribingStat(g.account);

	g.me = {
		address: g.account,
		displayName: displayName(g.account),
		stat: stat,
	};
}
