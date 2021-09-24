'use strict';

Vue.component('v_subscribing', {
	template: `
		<div class="subscribing">
			<a :href="'p.html?' + subscribing.address">
				<span class="name" :title="subscribing.address">{{ subscribing.displayName }}</span>
			</a>
			<div class="publisherStat">
				<span class="countTalken" v-if="subscribing.stat.countTalken != undefined" >{{ subscribing.stat.countTalken }}</span>
				<span class="countSubscriber" v-if="subscribing.stat.countSubscriber != undefined" >{{ subscribing.stat.countSubscriber }}</span>
			</div>
		</div>
	`,
	
	props: ['subscribing'],
});

Vue.component('v_subscribing_list', {
	template: `
		<div class="subscribings">
			<v_subscribing v-for="subscribing in subscribings" :subscribing="subscribing" :key="subscribing.address"></v_subscribing>
		</div>
	`,
	
	props: ['subscribings'],
});

