/*
	Read Only by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

	var $window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$titleBar = null,
		$nav = $('#nav'),
		$wrapper = $('#wrapper');

	// Breakpoints.
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['1025px', '1280px'],
		medium: ['737px', '1024px'],
		small: ['481px', '736px'],
		xsmall: [null, '480px'],
	});

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Tweaks/fixes.

	// Polyfill: Object fit.
	if (!browser.canUse('object-fit')) {

		$('.image[data-position]').each(function () {

			var $this = $(this),
				$img = $this.children('img');

			// Apply img as background.
			$this
				.css('background-image', 'url("' + $img.attr('src') + '")')
				.css('background-position', $this.data('position'))
				.css('background-size', 'cover')
				.css('background-repeat', 'no-repeat');

			// Hide img.
			$img
				.css('opacity', '0');

		});

	}

	// Header Panel.

	// Nav.
	var $nav_a = $nav.find('a');

	$nav_a
		.addClass('scrolly')
		.on('click', function () {

			var $this = $(this);

			// External link? Bail.
			if ($this.attr('href').charAt(0) != '#')
				return;

			// Deactivate all links.
			$nav_a.removeClass('active');

			// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
			$this
				.addClass('active')
				.addClass('active-locked');

		})
		.each(function () {

			var $this = $(this),
				id = $this.attr('href'),
				$section = $(id);

			// No section for this link? Bail.
			if ($section.length < 1)
				return;

			// Scrollex.
			$section.scrollex({
				mode: 'middle',
				top: '5vh',
				bottom: '5vh',
				initialize: function () {

					// Deactivate section.
					$section.addClass('inactive');

				},
				enter: function () {

					// Activate section.
					$section.removeClass('inactive');

					// No locked links? Deactivate all links and activate this section's one.
					if ($nav_a.filter('.active-locked').length == 0) {

						$nav_a.removeClass('active');
						$this.addClass('active');

					}

					// Otherwise, if this section's link is the one that's locked, unlock it.
					else if ($this.hasClass('active-locked'))
						$this.removeClass('active-locked');

				}
			});

		});

	// Title Bar.
	$titleBar = $(
		'<div id="titleBar">' +
		'<a href="#header" class="toggle"></a>' +
		'<span class="title">' + $('#logo').html() + '</span>' +
		'</div>'
	)
		.appendTo($body);

	// Panel.
	$header
		.panel({
			delay: 500,
			hideOnClick: true,
			hideOnSwipe: true,
			resetScroll: true,
			resetForms: true,
			side: 'right',
			target: $body,
			visibleClass: 'header-visible'
		});

	// Scrolly.
	$('.scrolly').scrolly({
		speed: 1000,
		offset: function () {

			if (breakpoints.active('<=medium'))
				return $titleBar.height();

			return 0;

		}
	});

	// ** New code for dynamically generating the publication sections **
	fetch('structured_data/publications.json')
		.then(response => response.json())
		.then(data => {
			const container = document.querySelector('#publications-container');

			// List of names to bold-face
			const namesToBold = ["Benjamin Ruppik", "Benjamin Matthias Ruppik"];  // Add more names to this array as needed

			// Function to bold-face specified names
			function boldFaceNames(authors, names) {
				names.forEach(name => {
					const regex = new RegExp(`\\b${name}\\b`, 'g'); // Word boundary to match exact name
					authors = authors.replace(regex, `<strong>${name}</strong>`);
				});
				return authors;
			}

			data.forEach(section => {
				// Create a section header
				const sectionHeader = document.createElement('h4');
				sectionHeader.textContent = section.section;
				container.appendChild(sectionHeader);

				// Create a div for the publications
				const publicationsDiv = document.createElement('div');
				publicationsDiv.classList.add('features');

				section.publications.forEach(publication => {
					const article = document.createElement('article');
					article.innerHTML = `
                    <a href="#" class="image"><img src="${publication.image}" alt="Image related to ${publication.title}" /></a>
                    <div class="inner">
                        <h4>${publication.title}</h4>
                    </div>
                `;

					// Check if 'authors' field exists and append them with bold-faced names
					if (publication.authors) {
						let authorsHtml = publication.authors;
						authorsHtml = boldFaceNames(authorsHtml, namesToBold);
						article.querySelector('.inner').insertAdjacentHTML('beforeend', `<p style="font-size: 85%;">[${authorsHtml}]</p>`);
					}

					// Add the stub text
					const stubHtml = `<p>${publication.stub}</p>`;
					article.querySelector('.inner').insertAdjacentHTML('beforeend', stubHtml);

					// Check if 'links' field exists and append them
					if (publication.links && publication.links.length > 0) {
						const linksHtml = publication.links.map(link => `<a href="${link.url}" style="color:purple;">${link.text}</a><br>`).join('');
						const linksContainer = document.createElement('p');
						linksContainer.innerHTML = linksHtml;
						article.querySelector('.inner').appendChild(linksContainer);
					}

					// Check for extra links and append them if they exist (without purple style)
					if (publication.extra_links && publication.extra_links.length > 0) {
						const extraLinksHtml = publication.extra_links.map(link => `<a href="${link.url}">${link.text}</a><br>`).join('');
						const extraLinksContainer = document.createElement('p');
						extraLinksContainer.innerHTML = extraLinksHtml;
						article.querySelector('.inner').appendChild(extraLinksContainer);
					}

					publicationsDiv.appendChild(article);
				});

				// Append the publications div to the container
				container.appendChild(publicationsDiv);
			});

			// Trigger MathJax to reprocess the newly added elements
			if (window.MathJax) {
				MathJax.typesetPromise();
			}
		})
		.catch(error => console.error('Error loading publications:', error));


})(jQuery);