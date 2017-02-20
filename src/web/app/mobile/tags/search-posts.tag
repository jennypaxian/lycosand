<mk-search-posts>
	<mk-timeline init={ init } more={ more } empty={ '「' + query + '」に関する投稿は見つかりませんでした。' }></mk-timeline>
	<style>
		:scope
			display block
			background #fff

	</style>
	<script>
		this.mixin('api');

		this.max = 30
		this.offset = 0

		this.query = this.opts.query
		this.with-media = this.opts.with-media

		this.init = new Promise (res, rej) =>
			this.api('posts/search', {
				query: @query
			}).then((posts) => {
				res posts
				this.trigger('loaded');

		this.more = () => {
			@offset += @max
			this.api('posts/search', {
				query: @query
				max: @max
				offset: @offset
	</script>
</mk-search-posts>
