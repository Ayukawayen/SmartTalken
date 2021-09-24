'use strict';

let g = {
	account:null,
	tid:null,
	talkens:[],
	responses:[],
};

new Vue({
	el: '#app',
	data: {data:g},
	computed: {
		g:function() { return g; },
	},
});

loadAccount().then(loadTalkens);
/*
loadTalkens().then(()=>{
	
});
*/

async function loadTid() {
	let re = /^\?[0-9]+$/;
	if(!re.test(location.search)) return null;
	
	g.tid = Number(location.search.substr(1));
	
	document.title = `Talken #${g.tid} | Talken Beta`;
}

async function loadTalkens() {
	await loadTid();
	if(!g.tid) return;

	let thread = await adapter.getThread(g.tid, g.account);
	g.talkens.push(thread.talken);
	for(let i=0;i<thread.responses.length;++i) {
		g.responses.push(thread.responses[i]);
	}
}

async function loadAccount() {
	g.account = await adapter.getAccount();
}
