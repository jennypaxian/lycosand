<mk-error>
	<img src="/assets/error.jpg" alt=""/>
	<h1>%i18n:common.tags.mk-error.title%</h1>
	<p class="text">%i18n:common.tags.mk-error.description%</p>
	<p class="thanks">%i18n:common.tags.mk-error.thanks%</p>
	<style>
		:scope
			display block
			width 100%
			padding 32px 18px
			text-align center

			> img
				display block
				height 200px
				margin 0 auto
				pointer-events none
				user-select none

			> h1
				display block
				margin 1.25em auto 0.65em auto
				font-size 1.5em
				color #555

			> .text
				display block
				margin 0 auto
				max-width 600px
				font-size 1em
				color #666

			> .thanks
				display block
				margin 2em auto 0 auto
				padding 2em 0 0 0
				max-width 600px
				font-size 0.9em
				font-style oblique
				color #aaa
				border-top solid 1px #eee

			@media (max-width 500px)
				padding 24px 18px
				font-size 80%

				> img
					height 150px

	</style>
	<script>
		this.on('mount', () => {
			document.title = 'Oops!';
			document.documentElement.style.background = '#f8f8f8';
		});
	</script>
</mk-error>
