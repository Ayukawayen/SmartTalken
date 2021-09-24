'use strict';

let g = {
	account:null,
	addr:null,
	publisher:null,
};

new Vue({
	el: '#app',
	data: {data:g},
	computed: {
		g:function() { return g; },
	},
});

loadAccount().then(loadPublisher);


async function loadPublisherAddr() {
	let re = /^\?0x[0-9a-fA-F]{40}$/;
	if(!re.test(location.search)) return null;
	
	g.addr = location.search.substr(1);
	
	document.title = `${g.addr} | Talken Beta`;
}

async function loadPublisher() {
	await loadPublisherAddr();
	if(!g.addr) return;

	g.publisher = await adapter.getPublisher(g.addr, g.account);
}

async function loadAccount() {
	g.account = await adapter.getAccount();
}
