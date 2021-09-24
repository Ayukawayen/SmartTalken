'use strict';

Vue.component('v_publisher', {
	template: `
		<div class="publisher">
			<v_header></v_header>
			<div class="profile" v-if="g.publisher">
				<div class="name" :title="g.publisher.address">{{ g.publisher.displayName }}</div>
				<div class="publisherStat">
					<span class="countTalken" >{{ g.publisher.stat.countTalken }}</span>
					<span class="countSubscriber">{{ g.publisher.stat.countSubscriber }}</span>
				</div>
			</div>
			<div class="subscribe" v-if="g.publisher" :subscribed="g.publisher.isSubscribed">
				<button @click="onSubscribeClick(g.publisher.address, g.publisher.isSubscribed)" :disabled="isSubscribeDisabled" >{{ g.publisher.isSubscribed ? 'Unsubscribe' : 'Subscribe' }}</button>
			</div>
			<div class="posts">
				<h2>Posts</h2>
				<v_talken_list v-if="g.publisher" :talkens="g.publisher.talkens" ></v_talken_list>
			</div>
		</div>
	`,
	
	props: ['g'],
	data: ()=>({
		isSubscribeDisabled: false,
	}),
	
	methods: {
		onSubscribeClick: function(publisherAddr, isSubscribed){
			if(this.isSubscribeDisabled) return;

			this.isSubscribeDisabled = true;
			
			(isSubscribed ? adapter.unsubscribePublisher(publisherAddr) : adapter.subscribePublisher(publisherAddr))
			.then(()=>{
				this.isSubscribeDisabled = false;
			})
			.catch((err)=>{
				console.error(err);
				alert('Error: something wrong!');
				this.isSubscribeDisabled = false;
			});
		},
	},
});
