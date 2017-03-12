<mk-drive-selector>
	<div class="body">
		<header>
			<h1>ファイルを選択<span class="count" if={ files.length > 0 }>({ files.length })</span></h1>
			<button class="close" onclick={ cancel }><i class="fa fa-times"></i></button>
			<button class="ok" onclick={ ok }><i class="fa fa-check"></i></button>
		</header>
		<mk-drive ref="browser" select-file={ true } multiple={ opts.multiple }></mk-drive>
	</div>
	<style>
		:scope
			display block

			> .body
				position fixed
				z-index 2048
				top 0
				left 0
				width 100%
				height 100%
				overflow hidden
				background #fff

				> header
					border-bottom solid 1px #eee

					> h1
						margin 0
						padding 0
						text-align center
						line-height 42px
						font-size 1em
						font-weight normal

						> .count
							margin-left 4px
							opacity 0.5

					> .close
						position absolute
						top 0
						left 0
						line-height 42px
						width 42px

					> .ok
						position absolute
						top 0
						right 0
						line-height 42px
						width 42px

				> mk-drive
					height calc(100% - 42px)
					overflow scroll

	</style>
	<script>
		this.files = [];

		this.on('mount', () => {
			this.refs.browser.on('change-selection', files => {
				this.update({
					files: files
				});
			});
		});

		this.cancel = () => {
			this.trigger('canceled');
			this.unmount();
		};

		this.ok = () => {
			this.trigger('selected', this.files);
			this.unmount();
		};
	</script>
</mk-drive-selector>
