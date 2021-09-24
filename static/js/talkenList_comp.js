'use strict';

Vue.component('v_talken', {
	template: `
		<div class="talken">
			<div class="info">
				<span class="publisher" :title="talken.info.publisher.address">
					<a :href="'p.html?' + talken.info.publisher.address">{{ talken.info.publisher.displayName }}</a>
				</span>
				<span class="publishTime" :title="talken.info.publishTime.toLocaleString()">
					<a :href="talken.talkenId ? 't.html?' + talken.talkenId : null">{{ talken.info.publishTime | publishTime }}</a>
				</span>
			</div>
			<div class="content">{{ talken.content }}</div>
			<div class="stat">
				<span class="like" v-if="talken.likeStat" :liked="talken.likeStat.isLiked" :title="talken.likeStat.isLiked ? 'Cancel Like' : 'Like'" @click="onLikeClick(talken.talkenId, talken.likeStat.isLiked)" :disabled="isLikeDisabled" >{{ talken.likeStat.countLike || 0 }}</span>
				<span class="reply" v-if="talken.responseStat" :liked="talken.likeStat.isResponsed">{{ talken.responseStat.countResponse || 0 }}</span>
			</div>
		</div>
	`,
	
	props: ['talken'],
	data: ()=>({
		isLikeDisabled: false,
	}),
	
	filters: {
		publishTime: function(value) {
			let units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'];
			
			let diff = new Date( new Date() - value ).toISOString().split(/[-T:.Z]/);
			let base = new Date( 0 ).toISOString().split(/[-T:.Z]/);

			for(let i=0;i<units.length;++i) {
				let d = diff[i] - base[i];
				if(d <= 0) continue;
				
				return `${d} ${units[i]} ago`;
			}

			return 'Just now';
		},
	},
	
	methods: {
		onLikeClick: function(talkenId, isLiked){
			if(this.isLikeDisabled) return;

			this.isLikeDisabled = true;
			
			(isLiked ? adapter.unlikeTalken(talkenId) : adapter.likeTalken(talkenId))
			.then(()=>{
				this.isLikeDisabled = false;
			})
			.catch((err)=>{
				console.error(err);
				alert('Error: something wrong!');
				this.isLikeDisabled = false;
			});
		},
	},
});

Vue.component('v_talken_list', {
	template: `
		<div class="talkens">
			<v_talken v-for="talken in talkens" :talken="talken" :key="talken.id"></v_talken>
		</div>
	`,
	
	props: ['talkens'],
});

