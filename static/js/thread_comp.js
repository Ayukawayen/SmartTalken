'use strict';

Vue.component('v_thread', {
	template: `
		<div class="thread">
			<v_header></v_header>
			<h2>Talken #{{g.tid}}</h2>
			<v_talken_list :talkens="g.talkens" ></v_talken_list>
			<div class="editor">
				<textarea class="content" placeholder="Reply" rows="5"></textarea>
				<button class="post" @click="onPostClick" :disabled="isPostDisabled" >Post</button>
			</div>
			<v_talken_list class="responses" :talkens="g.responses" ></v_talken_list>
		</div>
	`,
	
	props: ['g'],
	data: ()=>({
		isPostDisabled: false,
	}),
	
	methods: {
		onPostClick: function(){
			let content = document.querySelector('.thread .editor .content').value;

			this.isPostDisabled = true;
			
			adapter.responseTalken(g.tid, content)
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
