'use strict';

Vue.component('v_home', {
	template: `
		<div class="home">
			<v_header></v_header>
			<div class="editor">
				<textarea class="content" placeholder="What's happening?" rows="5"></textarea>
				<button class="post" @click="onPostClick" :disabled="isPostDisabled" >Post</button>
			</div>
			<div class="subscription me">
				<h2>Me</h2>
				<v_subscribing_list v-if="g.me" :subscribings="[g.me]" ></v_subscribing_list>
			</div>
			<div class="subscription">
				<h2>My Subscriptions</h2>
				<v_subscribing_list :subscribings="g.subscribings" ></v_subscribing_list>
			</div>
		</div>
	`,
	
	props: ['g'],
	data: ()=>({
		isPostDisabled: false,
	}),
	
	methods: {
		onPostClick: function(){
			let content = document.querySelector('.home .editor .content').value;

			this.isPostDisabled = true;
			
			adapter.postTalken(content)
			.then(()=>{
				this.isPostDisabled = false;
			})
			.catch((err)=>{
				console.error(err);
				alert('Error: something wrong!');
				this.isPostDisabled = false;
			});
		},
	},
});
