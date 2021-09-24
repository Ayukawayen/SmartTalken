const Network = 42;

var adapter = {};
adapter.provider = new ethers.providers.Web3Provider(window.ethereum, Network);
adapter.contract = new ethers.Contract(ContractAddrs[Network], ContractABI, adapter.provider.getSigner());

function displayName(addr) {
	return addr.substr(0,10);
}

function sortLogDesc(a,b) {
	if(b.blockNumber == a.blockNumber) {
		return b.logIndex - a.logIndex;
	}
	return b.blockNumber - a.blockNumber;
}

adapter.getSubscribings = async (addr)=>{
	let result = [];

	let logs = await adapter.contract.queryFilter( adapter.contract.filters.Subscribe(addr) );

	logs.sort(sortLogDesc);
	
	let states = {};
	logs.forEach((item)=>{
		if(item.removed) return;

		if(states[item.args.publisher]) return;
		
		states[item.args.publisher] = item.args.state;
		
		if(item.args.state > 0) {
			result.push({
				address: item.args.publisher,
				displayName: displayName(item.args.publisher),
				stat: {},
			});
		}
	});
	
	return result;
}
adapter.getSubscribingStat = async (addr)=>{
	let result = {
		countSubscriber: 0,
		countTalken: 0,
		countResponse: 0,
	};
	
	result.countSubscriber = await adapter.getSubscriberCount(addr);
	
	let logs;
	logs = await adapter.contract.queryFilter( adapter.contract.filters.Talken(null, addr) );

	if(logs.length <= 0) return result;
	
	logs.sort(sortLogDesc);
	
	for(let i=0; i<logs.length; ++i) {
		let item = logs[i];
		if(!item.args.talkenId.eq(item.args.threadId)) {
			result.countResponse++;
		} else {
			result.countTalken++;
		}
	}
	
	return result;
}

adapter.getTalkenStats = async (filters, account)=>{
	let result = {};
	
	let logs;
	
	logs = await adapter.contract.queryFilter( filters.like );
	
	logs.sort(sortLogDesc);
	
	let states = {};
	logs.forEach((item)=>{
		if(item.removed) return;
		
		states[item.args.talkenId] ||= {};
		result[item.args.talkenId] ||= {
			countLike: 0,
			countResponse: 0,
		};
		
		if(states[item.args.talkenId][item.args.liker]) return;
		
		states[item.args.talkenId][item.args.liker] = item.args.state;
		
		if(item.args.state > 0) {
			result[item.args.talkenId].countLike++;
			
			if(item.args.liker == account) {
				result[item.args.talkenId].isLiked = true;
			}
		}
	});

	logs = await adapter.contract.queryFilter( filters.response );
	logs.forEach((item)=>{
		if(item.removed) return;
		
		if(item.args.talkenId.eq(item.args.threadId)) return;
		
		result[item.args.threadId] ||= {
			countLike: 0,
			countResponse: 0,
		};
		
		result[item.args.threadId].countResponse++;
	});
	
	return result;
}


adapter.getPublisher = async (addr, account)=>{
	let result = {};
	
	result.address = addr;
	result.displayName = displayName(addr);
	result.isSubscribed = await adapter.getIsSubscribed(addr, account);

	let talkenStats = await adapter.getTalkenStatsByPublisher(addr, account);
	
	let logs = await adapter.contract.queryFilter( adapter.contract.filters.Talken(null, addr) );

	logs.sort(sortLogDesc);
	
	result.talkens = [];
	result.responses = [];
	for(let i=0;i<logs.length;++i) {
		let item = logs[i];
		let talken = {
			talkenId: item.args.talkenId,
			content: item.args.content,
			stat: talkenStats[item.args.talkenId] || {},
			info: {
				publisher: {
					address: item.args.publisher,
					displayName: displayName(item.args.publisher),
				},
				publishTime: new Date(Number(item.args.time)*1000),
			},
		};
		
		if(!item.args.talkenId.eq(item.args.threadId)) {
			result.responses.push(talken);
		} else {
			result.talkens.push(talken);
		}
	}
	
	result.stat = {
		countSubscriber: await adapter.getSubscriberCount(addr),
		countTalken: result.talkens.length,
		countResponse: result.responses.length,
	};

	
	return result;
}

adapter.getIsSubscribed = async (addr, account)=>{
	let logs = await adapter.contract.queryFilter( adapter.contract.filters.Subscribe(account, addr) );
	
	if(logs.length <= 0) return false;
	
	logs.sort(sortLogDesc);
	
	return logs[0].args.state > 0;
}
adapter.getSubscriberCount = async (addr)=>{
	let result = 0;
	
	let logs = await adapter.contract.queryFilter( adapter.contract.filters.Subscribe(null, addr) );

	logs.forEach((item)=>{
		result += item.args.state;
	});
	
	return result;
}


adapter.getTalkenStatsByPublisher = async (addr, account)=>{
	return await adapter.getTalkenStats( {
		like:adapter.contract.filters.Like(null, addr),
		response: adapter.contract.filters.Talken(null, addr),
	}, account );
}

adapter.getThread = async (tid, account)=>{
	let result = {};

	let stats = await adapter.getTalkenStatsByTalkenId(tid, account);
	
	let logs = await adapter.contract.queryFilter( adapter.contract.filters.Talken(null, null, tid) );

	logs.sort(sortLogDesc);
	
	result.talkens = [];
	result.responses = [];
	for(let i=0;i<logs.length;++i) {
		let item = logs[i];
		let talken = {
			talkenId: item.args.talkenId,
			content: item.args.content,
			stat: stats[item.args.talkenId] || null,
			info: {
				publisher: {
					address: item.args.publisher,
					displayName: displayName(item.args.publisher),
				},
				publishTime: new Date(Number(item.args.time)*1000),
			},
		};
		
		if(!item.args.talkenId.eq(item.args.threadId)) {
			result.responses.push(talken);
		} else {
			result.talkens.push(talken);
		}
	}
	
	return result;
}

adapter.getTalkenStatsByTalkenId = async (talkenId, account)=>{
	return await adapter.getTalkenStats( {
		like: adapter.contract.filters.Like(talkenId),
		response: adapter.contract.filters.Talken(null, null, talkenId),
	}, account );
}


adapter.getAccount = async ()=>{
	let accounts = await adapter.provider.listAccounts();
	return accounts[0];
}

adapter.subscribePublisher = async (publisherAddr)=>{
	return adapter.contract.subscribePublisher(publisherAddr);
}
adapter.unsubscribePublisher = async (publisherAddr)=>{
	return adapter.contract.unsubscribePublisher(publisherAddr);
}

adapter.responseTalken = async (talkenId, content)=>{
	return adapter.contract.responseTalken(talkenId, ethers.utils.toUtf8Bytes(content));
}

adapter.postTalken = async (content)=>{
	return adapter.provider.getSigner().sendTransaction({
		to: adapter.contract.address,
		data: ethers.utils.toUtf8Bytes(content)
	});
}

adapter.likeTalken = async (talkenId)=>{
	return adapter.contract.likeTalken(talkenId);
}
adapter.unlikeTalken = async (talkenId)=>{
	return adapter.contract.unlikeTalken(talkenId);
}
