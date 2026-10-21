/**
 * KoreFlame - Dynamic Blog Details Engine
 * Dynamically renders the selected blog post based on query param (?id=post-1, post-2, post-3)
 * Updates hero image, category, title, meta bar, full HTML story, author card, and related guides.
 */

const BLOG_ARTICLES_DATA = {
  "post-1": {
    id: "post-1",
    slug: "art-of-the-perfect-ssam",
    category: "Korean Dining Culture",
    title: "The Art of the Perfect Ssam: How Koreans Wrap and Savor Grilled Meat",
    author: "Chef Min-Jun Kang",
    authorInitials: "MK",
    authorImage: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=400&auto=format&fit=crop",
    authorBadge: "Executive Grill Master",
    authorBio: "With over 20 years perfecting Binchotan charcoal roasting in Seoul and New York, Chef Min-Jun champions authentic Korean heritage dining.",
    date: "October 14, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "The Art of the Perfect Ssam - Korean BBQ Meat Wrapping",
    content: `
      <p class="lead text-primary-app font-weight-normal mb-4">
        In Korea, barbecue is never a passive meal. It is a shared performance where everyone at the table contributes to the rhythm of the grill. At the heart of this ancient social dining communion lies the <em>ssam</em>—literally translated as "wrap".
      </p>

      <h3 class="text-primary-app mt-4 mb-3">The Architectural Anatomy of a Ssam</h3>
      <p>
        To an uninitiated guest, wrapping barbecue might look like a casual sandwich wrap. But in authentic Korean gastronomy, every layer has a functional role: managing fat, contrasting textures, balancing temperature, and delivering digestive probiotics.
      </p>

      <div class="kf-card p-4 my-4 bg-surface-app border border-subtle">
        <h5 class="text-gold mb-3">The Golden 5-Step Layering Rule:</h5>
        <ol class="mb-0 text-secondary" style="padding-left: 1.25rem;">
          <li class="mb-2"><strong>The Outer Vessel:</strong> Select a crisp, tender red leaf lettuce leaf. Rest it flat on your palm.</li>
          <li class="mb-2"><strong>The Herbal Core:</strong> Lay an aromatic perilla leaf face-up in the center for its peppery, minty citrus finish.</li>
          <li class="mb-2"><strong>The Hot Protein:</strong> Lift your sizzling pork belly or Galbi directly from the charcoal grate and dip lightly in toasted sesame salt oil.</li>
          <li class="mb-2"><strong>The Fermented Pungency:</strong> Place a small dollop of house savory bean and chili paste (ssamjang) and a charred clove of roasted garlic.</li>
          <li class="mb-0"><strong>The Crisp Acid:</strong> Top with a tangle of seasoned scallion slaw or pickled daikon slice.</li>
        </ol>
      </div>

      <h3 class="text-primary-app mt-4 mb-3">The Cardinal Rule: One Single Bite</h3>
      <p>
        Perhaps the most essential etiquette rule of Korean barbecue: <strong>the wrap must enter the mouth in one single bite</strong>.
      </p>
      <p>
        Attempting to bite a wrap in half causes the juices to burst outward, unraveling the careful balance of textures. Instead, gather the edges of the lettuce gently into a compact parcel, pause for a moment, and experience the harmonic explosion of sizzling meat fat, cool greens, and pungent garlic all at once.
      </p>

      <div class="alert alert-dark bg-secondary-app border-0 p-4 rounded my-4">
        <div class="d-flex gap-3 align-items-center">
          <i data-lucide="heart" class="text-flame" style="width: 32px; height: 32px; flex-shrink: 0;"></i>
          <div>
            <strong class="text-primary-app d-block mb-1">Cultural Etiquette Tip:</strong>
            <span class="small text-muted">In Korean tradition, wrapping a generous portion and feeding it directly to a loved one, friend, or elder is a profound gesture of affection and respect known as heartfelt hospitality.</span>
          </div>
        </div>
      </div>
    `
  },

  "post-2": {
    id: "post-2",
    slug: "binchotan-charcoal-difference",
    category: "Grill Techniques",
    title: "Why Binchotan Charcoal Makes Korean BBQ Taste So Immensely Better",
    author: "Master Griller Jin-Woo",
    authorInitials: "JW",
    authorImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop",
    authorBadge: "Master of Charcoal & Fire",
    authorBio: "Trained under renowned Korean binchotan kiln masters in Gangwon Province, Jin-Woo specializes in heat thermodynamics, smokeless extraction, and flame caramelization.",
    date: "September 28, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "White Binchotan Charcoal Table Grill at KoreFlame",
    content: `
      <p class="lead text-primary-app font-weight-normal mb-4">
        The difference between an ordinary barbecue dinner and a transcendental sensory feast begins deep beneath the table grates. At KoreFlame, that difference is fueled by authentic Japanese and Korean white oak <em>Binchotan</em> charcoal.
      </p>

      <h3 class="text-primary-app mt-4 mb-3">Far-Infrared Radiation vs. Standard Briquettes</h3>
      <p>
        Common commercial briquettes burn at roughly 450°C to 500°C and release chemical binders, sulfur fumes, and erratic flame flares that deposit bitter black soot onto premium meats. White Binchotan, kiln-fired from dense Ubame oak at over 1,000°C, produces virtually zero acrid smoke and emits powerful far-infrared radiant heat waves.
      </p>

      <div class="kf-card p-4 my-4 bg-surface-app border border-subtle">
        <h5 class="text-gold mb-3">Heat Profile Comparison Matrix:</h5>
        <div class="row g-3 text-secondary small">
          <div class="col-md-6">
            <div class="p-3 bg-secondary-app rounded border border-subtle h-100">
              <strong class="text-flame d-block mb-1">✕ Standard Briquettes</strong>
              <ul class="p-0 ps-3 mb-0">
                <li>Low, uneven heat (400°C – 500°C)</li>
                <li>Petroleum binders & chemical odors</li>
                <li>Flare-ups cause charred, bitter crusts</li>
                <li>Boils juices out of thin meats</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 bg-secondary-app rounded border border-subtle h-100">
              <strong class="text-gold d-block mb-1">✓ KoreFlame White Binchotan</strong>
              <ul class="p-0 ps-3 mb-0">
                <li>Intense 1,000°C far-infrared radiation</li>
                <li>100% natural oak, zero odor or soot</li>
                <li>Instant Maillard sear seals intramuscular fat</li>
                <li>Maintains succulent tenderness in seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <h3 class="text-primary-app mt-4 mb-3">The Science of Instant Caramelization</h3>
      <p>
        Because Binchotan radiates heat directly into the meat fibers without open roaring flames, the exterior proteins caramelize into an amber, umami-packed crust while the interior marbling stays buttery soft. Delicate cuts like thin-sliced Chadolbaegi (beef brisket) sear to perfection in just 5 seconds per side, preserving their natural sweetness.
      </p>

      <div class="alert alert-dark bg-secondary-app border-0 p-4 rounded my-4">
        <div class="d-flex gap-3 align-items-center">
          <i data-lucide="shield-check" class="text-flame" style="width: 32px; height: 32px; flex-shrink: 0;"></i>
          <div>
            <strong class="text-primary-app d-block mb-1">Smokeless Downdraft Integration:</strong>
            <span class="small text-muted">When white Binchotan embers are paired with our subterranean downdraft extraction, cooking vapors are drawn downward before they can disperse into the room, preserving a clean, breathable dining atmosphere.</span>
          </div>
        </div>
      </div>
    `
  },

  "post-3": {
    id: "post-3",
    slug: "guide-to-probiotic-banchan",
    category: "Side Dishes & Health",
    title: "Beyond Kimchi: The Fascinating World of Korean Banchan and Gut Health",
    author: "So-Yeon Park",
    authorInitials: "SP",
    authorImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
    authorBadge: "Fermentation Specialist",
    authorBio: "So-Yeon holds a master's in Food Science from Seoul National University and oversees KoreFlame's artisan onggi fermentation room and seasonal banchan cellar.",
    date: "September 12, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Authentic Korean Banchan Varieties and Fermented Side Dishes",
    content: `
      <p class="lead text-primary-app font-weight-normal mb-4">
        In Korean culinary philosophy, side dishes—<em>banchan</em>—are neither garnishes nor appetizers. They represent hundreds of years of ancestral food science engineered to balance rich charcoal-grilled proteins with active probiotic cultures, dietary fiber, and natural digestive enzymes.
      </p>

      <h3 class="text-primary-app mt-4 mb-3">The Probiotic Synergy with Grilled Meats</h3>
      <p>
        Eating heavily marbled cuts like Galbi or Berkshire Pork Belly can tax digestion if consumed in isolation. Korean dining culture solves this organically: every table is served an array of naturally lacto-fermented vegetables populated with billions of beneficial <em>Lactobacillus</em> and <em>Weissella</em> bacteria that stimulate gut motility and break down animal fats in real time.
      </p>

      <div class="kf-card p-4 my-4 bg-surface-app border border-subtle">
        <h5 class="text-gold mb-3">The 5 Core Banchan Pillars at KoreFlame:</h5>
        <div class="row g-3 text-secondary small">
          <div class="col-12">
            <p class="mb-2"><strong>1. 3-Year Aged Mukeunji Kimchi:</strong> Slowly fermented in breathing Onggi earthenware, yielding rich lactic acidity and high bioavailability of vitamins A, B, and C.</p>
            <p class="mb-2"><strong>2. Oi Sobagi (Stuffed Cucumber Kimchi):</strong> Crisp, cooling cucumbers packed with garlic chives and alkaline hydration to soothe charcoal heat.</p>
            <p class="mb-2"><strong>3. Kongnamul & Sukjunamul (Seasoned Sprouts):</strong> Rich in asparagine—a natural amino acid that accelerates alcohol metabolism and digestive wellness.</p>
            <p class="mb-2"><strong>4. Gaji Namul (Steamed Eggplant with Sesame):</strong> High in nasunin anthocyanins that soothe stomach lining and regulate blood lipid balance.</p>
            <p class="mb-0"><strong>5. Dongchimi (Radish Water Kimchi):</strong> Natural digestive enzymes like diastase and amylase in fermented radish brine function as an effervescent digestive tonic.</p>
          </div>
        </div>
      </div>

      <h3 class="text-primary-app mt-4 mb-3">The Onggi Clay Pot Secret</h3>
      <p>
        At KoreFlame, we ferment all our seasonal kimchi in traditional Korean porous earthenware vessels called <em>Onggi</em>. Microscopic pores in the baked clay breathe fresh oxygen into the mash while expelling excess fermentation gases, creating optimal microbial diversity that modern plastic or stainless steel containers cannot replicate.
      </p>

      <div class="alert alert-dark bg-secondary-app border-0 p-4 rounded my-4">
        <div class="d-flex gap-3 align-items-center">
          <i data-lucide="sparkles" class="text-flame" style="width: 32px; height: 32px; flex-shrink: 0;"></i>
          <div>
            <strong class="text-primary-app d-block mb-1">Nutritionist's Pairing Tip:</strong>
            <span class="small text-muted">Alternate between a hot morsel of Wagyu and a chilled bite of pickled radish or aged kimchi. The temperature shift and acidity prime your digestive receptors and keep your palate invigorated throughout the feast.</span>
          </div>
        </div>
      </div>
    `
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderBlogDetails();
  });
}

function renderBlogDetails() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id') || 'post-1';
  const post = BLOG_ARTICLES_DATA[postId] || BLOG_ARTICLES_DATA['post-1'];

  // Update Page Title
  document.title = `${post.title} — KoreFlame Korean BBQ Blog`;

  // Update Breadcrumb Category
  const breadcrumbCategory = document.getElementById('blog-breadcrumb-category');
  if (breadcrumbCategory) breadcrumbCategory.textContent = post.category;

  // Update Title
  const articleTitle = document.getElementById('blog-article-title');
  if (articleTitle) articleTitle.textContent = post.title;

  // Update Header Meta Bar
  const articleAuthor = document.getElementById('blog-article-author');
  if (articleAuthor) {
    articleAuthor.innerHTML = `<i data-lucide="user" style="width: 14px; height: 14px;"></i> <span>${post.author}</span>`;
  }

  const articleDate = document.getElementById('blog-article-date');
  if (articleDate) {
    articleDate.innerHTML = `<i data-lucide="calendar" style="width: 14px; height: 14px;"></i> <span>${post.date}</span>`;
  }

  const articleReadTime = document.getElementById('blog-article-readtime');
  if (articleReadTime) {
    articleReadTime.innerHTML = `<i data-lucide="clock" style="width: 14px; height: 14px;"></i> <span>${post.readTime}</span>`;
  }

  // Update Hero Image
  const articleImg = document.getElementById('blog-article-img');
  if (articleImg) {
    articleImg.src = post.image;
    articleImg.alt = post.imageAlt || post.title;
  }

  // Update Body Content
  const articleBody = document.getElementById('blog-article-body');
  if (articleBody) {
    articleBody.innerHTML = post.content;
  }

  // Update Sidebar Author Card
  const authorAvatar = document.getElementById('blog-author-avatar');
  if (authorAvatar) {
    if (post.authorImage) {
      authorAvatar.innerHTML = `<img src="${post.authorImage}" alt="${post.author}" class="avatar-img" onerror="this.remove(); this.parentElement.textContent='${post.authorInitials || 'KF'}';">`;
    } else {
      authorAvatar.textContent = post.authorInitials || 'KF';
    }
  }

  const authorName = document.getElementById('blog-author-name');
  if (authorName) authorName.textContent = post.author;

  const authorBadge = document.getElementById('blog-author-badge');
  if (authorBadge) authorBadge.textContent = post.authorBadge;

  const authorBio = document.getElementById('blog-author-bio');
  if (authorBio) authorBio.textContent = post.authorBio;

  // Render Related Articles (exclude current post)
  const relatedContainer = document.getElementById('blog-related-posts');
  if (relatedContainer) {
    const otherPosts = Object.values(BLOG_ARTICLES_DATA).filter(p => p.id !== post.id);
    relatedContainer.innerHTML = otherPosts.map(p => `
      <a href="blog-details.html?id=${p.id}" class="d-flex gap-3 text-decoration-none">
        <img src="${p.image}" alt="${p.title}" style="width: 65px; height: 65px; border-radius: 6px; object-fit: cover; flex-shrink: 0;">
        <div>
          <h6 class="text-primary-app small mb-1" style="line-height: 1.35;">${p.title}</h6>
          <span class="text-muted small">${p.readTime}</span>
        </div>
      </a>
    `).join('');
  }

  // Update article switcher active state
  document.querySelectorAll('#blog-article-switcher .btn-service-tab').forEach(tab => {
    if (tab.getAttribute('data-post') === post.id) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Refresh Lucide icons for dynamically injected markup
  if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

if (typeof window !== 'undefined') {
  window.BLOG_ARTICLES_DATA = BLOG_ARTICLES_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BLOG_ARTICLES_DATA, renderBlogDetails };
}
