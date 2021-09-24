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
	result.countTalken = logs.length;
	
	logs = await adapter.contract.queryFilter( adapter.contract.filters.Response(null, null, addr) );
	result.countResponse = logs.length;
	
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
		if(item.removed) return;
		
		result += item.args.state;
	});
	
	return result;
}


adapter.getPublisher = async (addr, account)=>{
	let result = {};
	
	result.address = addr;
	result.displayName = displayName(addr);
	result.isSubscribed = await adapter.getIsSubscribed(addr, account);

	let likeStats = await adapter.getLikeStats(adapter.contract.filters.Like(null, addr), account);
	let responseStats = await adapter.getResponseStats(adapter.contract.filters.Response(null, addr), account);
	
	let logs = await adapter.contract.queryFilter( adapter.contract.filters.Talken(null, addr) );

	logs.sort(sortLogDesc);
	
	result.talkens = [];
	logs.forEach((item)=>{
		if(item.removed) return;
		
		let talken = {
			talkenId: item.args.talkenId,
			content: item.args.content,
			likeStat: likeStats[item.args.talkenId] || {},
			responseStat: responseStats[item.args.talkenId] || {},
			info: {
				publisher: {
					address: item.args.publisher,
					displayName: displayName(item.args.publisher),
				},
				publishTime: new Date(Number(item.args.time)*1000),
			},
		};
		
		result.talkens.push(talken);
	});
	
	result.stat = {
		countSubscriber: await adapter.getSubscriberCount(addr),
		countTalken: result.talkens.length,
	};

	
	return result;
}

adapter.getThread = async (tid, account)=>{
	let result = {
		talken: null,
		responses: [],
	};

	let logs;
	
	logs = await adapter.contract.queryFilter( adapter.contract.filters.Talken(tid) );
	if(logs.length <= 0) return result;
	
	let likeStats = await adapter.getLikeStats(adapter.contract.filters.Like(tid), account);
	
	let item = logs[0];
	result.talken = {
		talkenId: item.args.talkenId,
		content: item.args.content,
		likeStat: likeStats[item.args.talkenId] || {},
		responseStat: { countResponse:0, },
		info: {
			publisher: {
				address: item.args.publisher,
				displayName: displayName(item.args.publisher),
			},
			publishTime: new Date(Number(item.args.time)*1000),
		},
	};

	logs = await adapter.contract.queryFilter( adapter.contract.filters.Response(tid) );
	logs.sort(sortLogDesc);
	
	logs.forEach((item)=>{
		if(item.removed) return;
		
		let response = {
			content: item.args.content,
			info: {
				publisher: {
					address: item.args.responser,
					displayName: displayName(item.args.responser),
				},
				publishTime: new Date(Number(item.args.time)*1000),
			},
		};
		
		result.responses.push(response);
		
		
		result.talken.responseStat.countResponse++;
		
		if(item.args.response == account) {
			result.talken.responseStat.isResponsed = true;
		}
	});
	
	return result;
}


adapter.getLikeStats = async (filter, account)=>{
	let result = {};
	
	let logs = await adapter.contract.queryFilter( filter );
	
	logs.sort(sortLogDesc);
	
	let states = {};
	logs.forEach((item)=>{
		if(item.removed) return;
		
		states[item.args.talkenId] ||= {};
		if(states[item.args.talkenId][item.args.liker]) return;
		states[item.args.talkenId][item.args.liker] = item.args.state;
		
		result[item.args.talkenId] ||= {
			countLike: 0,
		};
		if(item.args.state > 0) {
			result[item.args.talkenId].countLike++;
			
			if(item.args.liker == account) {
				result[item.args.talkenId].isLiked = true;
			}
		}
	});
	
	return result;
}

adapter.getResponseStats = async (filter, account)=>{
	let result = {};
	
	let logs = await adapter.contract.queryFilter( filter );

	logs.forEach((item)=>{
		if(item.removed) return;
		
		result[item.args.talkenId] ||= {
			countResponse: 0,
		};
		
		result[item.args.talkenId].countResponse++;
		
		if(item.args.response == account) {
			result[item.args.talkenId].isResponsed = true;
		}
	});

	return result;
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
