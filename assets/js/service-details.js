/* ==========================================================================
   KoreFlame - Dynamic Service Details Engine
   Renders relevant image, culinary story, inclusions, FAQs, and pricing
   based on the selected service ID (VIP, Corporate, Birthday, Grillmaster)
   ========================================================================== */

const SERVICES_DATA = {
  vip: {
    id: 'vip',
    breadcrumb: 'VIP Private Dining Suites',
    badge: { icon: 'crown', text: 'Exclusivity', class: 'badge-spice' },
    title: 'VIP Private Dining Suites',
    lead: 'Exclusivity, privacy, and Michelin-caliber Korean BBQ hospitality. Designed for intimate anniversaries, high-stakes business dinners, and family milestones.',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    imgAlt: 'VIP Private Dining Suite at KoreFlame',
    storyHeading: 'The Ultimate Private Seoul Sizzle Experience',
    storyDesc: [
      'Step behind our hand-carved charred cedar sliding doors into an acoustically shielded dining sanctuary. Our VIP suites feature sunken Hinoki-finished dining tables fitted with subterranean Japanese smokeless downdraft grills, ensuring an ambiance completely free of residual cooking smoke.',
      'From dedicated head grillmasters carving certified BMS 9+ Miyazaki Wagyu tableside to private sommeliers curating vintage soju flights, every detail is orchestrated to deliver unmatched dining refinement and effortless privacy.'
    ],
    inclusionsTitle: 'Exclusive VIP Suite Inclusions',
    inclusions: [
      {
        title: 'Dedicated Head Grillmaster',
        desc: 'A dedicated chef stationed at your table to carve BMS 9+ Wagyu and Prime Galbi to your desired doneness.',
        highlight: 'text-flame',
        icon: 'flame'
      },
      {
        title: 'Private Sommelier & Mixologist',
        desc: 'Bespoke soju flights, Korean wild black raspberry wines, and custom celebratory cocktail towers.',
        highlight: 'text-gold',
        icon: 'wine'
      },
      {
        title: 'Acoustic Soundproofing & 4K AV',
        desc: 'Independent Bluetooth sound systems, ambient dimmable lighting, and presentation-ready 4K displays.',
        highlight: 'text-flame',
        icon: 'volume-2'
      },
      {
        title: 'Reserve Banchan Cellar Access',
        desc: 'Rare tastings of aged 5-year mukeunji kimchi, fermented perilla leaf, and wild mountain root namul.',
        highlight: 'text-gold',
        icon: 'award'
      }
    ],
    faqs: [
      {
        q: 'What is the capacity and minimum spend for VIP Suites?',
        a: 'Our suites accommodate between 6 and 18 seated diners. Minimum spend requirements range from $600 to $1,500 depending on weekday lunch versus weekend prime evening slots.'
      },
      {
        q: 'Can we customize the feast menu in advance?',
        a: 'Yes! 48 hours prior to your reservation, our Executive Chef reviews dietary restrictions, Wagyu marble preferences, and bespoke drink pairings with your party host.'
      },
      {
        q: 'Is there an acoustic door to guarantee total conversation privacy?',
        a: 'Every VIP suite features double-layered acoustic timber sliding doors that ensure private business negotiations, family speeches, and toasts remain entirely confidential.'
      }
    ],
    card: {
      label: 'Reserve Private Suite',
      title: 'Imperial Suite Booking',
      desc: 'Instant booking through our multi-step engine or direct concierge hotline.',
      party: '6 - 18 Diners',
      duration: '2.5 Hours',
      chef: 'Dedicated Head Grillmaster',
      price: '$115 / guest',
      ctaText: 'Reserve Private Suite Now',
      ctaLink: 'pricing.html#reservations',
      inquireText: 'Contact VIP Concierge',
      inquireLink: 'contact.html?subject=VIP+Suite+Inquiry'
    }
  },

  corporate: {
    id: 'corporate',
    breadcrumb: 'Corporate & Team Banquets',
    badge: { icon: 'users', text: 'Corporate Feasting', class: 'badge-prime' },
    title: 'Corporate & Team Rehearsal Banquets',
    lead: 'Seamless multi-grill alcoves designed for team building, closing dinners, and company milestones with all-inclusive per-guest feast tiers and master billing.',
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1200&auto=format&fit=crop',
    imgAlt: 'Corporate and Team Banquets at KoreFlame',
    storyHeading: 'Energize Your Team Around the Communal Hearth',
    storyDesc: [
      'Corporate dining at KoreFlame turns stiff networking dinners into lively, interactive celebrations. Multiple sunken grill tables situated side-by-side allow teams of 15 to 60 diners to converse freely, share artisan feast platters, and celebrate company milestones in a high-energy, smokeless environment.',
      'Our dedicated event captains manage simultaneous table courses, ensuring all colleagues toast and eat in unison while our operations team provides consolidated corporate card receipts and company billing.'
    ],
    inclusionsTitle: 'Corporate Banquet Inclusions',
    inclusions: [
      {
        title: 'Synchronized Table Searing',
        desc: 'Multi-grill coordination ensuring all team members are served steaming hot Prime Galbi simultaneously.',
        highlight: 'text-flame',
        icon: 'check-circle'
      },
      {
        title: 'Endless Craft Beer & Soju Towers',
        desc: 'Chilled tableside towers of craft Korean lager, crisp Terra beer, and fruit-infused Chamisul soju.',
        highlight: 'text-gold',
        icon: 'beer'
      },
      {
        title: 'Consolidated Master Invoicing',
        desc: 'Single master receipt with itemized gratuity, pre-approved corporate card split, or direct company PO support.',
        highlight: 'text-flame',
        icon: 'file-text'
      },
      {
        title: 'Presentation Space & Gigabit Wi-Fi',
        desc: 'High-speed commercial Wi-Fi, handheld wireless microphones for keynote toasts, and projection space.',
        highlight: 'text-gold',
        icon: 'wifi'
      }
    ],
    faqs: [
      {
        q: 'How does corporate split billing or invoicing work?',
        a: 'We offer single-invoice master billing with corporate credit card receipts, multi-card equal division, or corporate ACH invoicing with Net-15 terms for verified enterprise accounts.'
      },
      {
        q: 'Can you accommodate vegetarians and dietary restrictions in large teams?',
        a: 'Absolutely. We prepare dedicated clean-grill vegetable platters, king oyster steaks, organic tofu stews, and certified Halal beef cuts upon advance request.'
      },
      {
        q: 'Can we give speeches or set up company banners?',
        a: 'Yes, our banquet alcoves include wireless handheld microphones, podium access, and discreet mounting spots for corporate banners or milestone photo backdrops.'
      }
    ],
    card: {
      label: 'Corporate Gathering',
      title: 'Team Banquet Buyout',
      desc: 'All-inclusive packages with dedicated event coordination and seamless company billing.',
      party: '15 - 60 Diners',
      duration: '3.0 Hours',
      chef: 'Table Squad Captains',
      price: '$68 / guest',
      ctaText: 'Book Team Banquet',
      ctaLink: 'pricing.html#reservations',
      inquireText: 'Inquire Corporate Buyout',
      inquireLink: 'contact.html?subject=Corporate+Banquet+Inquiry'
    }
  },

  birthday: {
    id: 'birthday',
    breadcrumb: 'Birthday & Milestone Celebrations',
    badge: { icon: 'sparkles', text: 'Celebration Special', class: 'badge-popular' },
    title: 'Birthday & Milestone Celebrations',
    lead: 'Turn birthdays, bachelorettes, and anniversaries into dazzling spectacles with tableside fireworks sparklers, custom dessert platters, and festive table decor.',
    img: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=1200&auto=format&fit=crop',
    imgAlt: 'Birthday and Milestone Celebrations at KoreFlame',
    storyHeading: 'Sparkler Meat Towers & Unforgettable Korean Hospitality',
    storyDesc: [
      'Celebrate life’s biggest moments surrounded by roaring flames, golden sparklers, and joyful toasts. Our events team decorates your party table, curates celebratory cocktail carafes, and surprises the guest of honor with our signature fireworks meat parade.',
      'From 21st birthdays and landmark 50th celebrations to lively bachelorette dinners, KoreFlame blends high-energy Seoul feast traditions with modern hospitality to make the host shine.'
    ],
    inclusionsTitle: 'Celebration Package Inclusions',
    inclusions: [
      {
        title: 'Complimentary Sparkler Meat Tower',
        desc: 'Multi-tiered USDA Prime beef platter brought out with dazzling golden sparklers and celebratory fanfare.',
        highlight: 'text-flame',
        icon: 'sparkles'
      },
      {
        title: 'Volcano Steamed Egg & Dessert',
        desc: 'Traditional celebratory Gyeran-jjim paired with artisan Korean bingsu or chilled yuzu cheesecake.',
        highlight: 'text-gold',
        icon: 'cake'
      },
      {
        title: 'Custom-Printed Souvenir Menus',
        desc: 'Personalized keepsake menus featuring the guest of honor’s name, celebratory photo, and party date.',
        highlight: 'text-flame',
        icon: 'book-open'
      },
      {
        title: 'Party Polaroids & Festive Decor',
        desc: 'Instant camera polaroids captured by our host for party guests to take home, plus festive table styling.',
        highlight: 'text-gold',
        icon: 'camera'
      }
    ],
    faqs: [
      {
        q: 'How do we claim the complimentary birthday sparkler dessert?',
        a: 'Simply select "Birthday Celebration" when booking online or tell your host upon arrival. Our team prepares the sparkler dessert and celebration presentation automatically at zero extra cost.'
      },
      {
        q: 'Can we bring our own celebration cake?',
        a: 'Yes! Our staff will gladly store your cake in our refrigeration unit, provide celebratory candles, and slice/plate it tableside with zero corkage or cake-cutting fees.'
      },
      {
        q: 'Can we decorate the table before guests arrive?',
        a: 'Yes, celebration organizers are welcome to arrive 20 minutes prior to reservation time to arrange balloons, party favors, or table runners.'
      }
    ],
    card: {
      label: 'Festive Gathering',
      title: 'Milestone Party Booking',
      desc: 'Complete party package with sparkler meat presentation and festive dessert included.',
      party: '4 - 30 Diners',
      duration: '2.5 Hours',
      chef: 'Dedicated Festive Host',
      price: '$45 / guest',
      ctaText: 'Book Celebration Table',
      ctaLink: 'pricing.html#reservations',
      inquireText: 'Contact Party Specialist',
      inquireLink: 'contact.html?subject=Birthday+Party+Inquiry'
    }
  },

  grillmaster: {
    id: 'grillmaster',
    breadcrumb: 'Dedicated Grillmaster Experience',
    badge: { icon: 'flame', text: 'Culinary Masterclass', class: 'badge-prime' },
    title: 'Dedicated Table Grillmaster Experience',
    lead: 'Sit back and let our certified culinary grill captains handle the tongs. Learn the lore of Korean table grilling, the secrets of Binchotan heat control, and the art of the perfect ssam.',
    img: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=1200&auto=format&fit=crop',
    imgAlt: 'Dedicated Grillmaster Experience at KoreFlame',
    storyHeading: 'The Art & Heritage of Tableside Binchotan Grilling',
    storyDesc: [
      'Experience Korean BBQ at its highest culinary standard without lifting a pair of tongs. Our certified grill captains understand the exact searing temperature and caramelization timing for every cut—from thin-shaved brisket flashed in seconds to thick-cut Prime Galbi caramelized over white Binchotan embers.',
      'Throughout the evening, your personal grillmaster shares culinary traditions, guides ssam leaf and fermented banchan pairings, and serves each bite at the precise peak of tenderness.'
    ],
    inclusionsTitle: 'Grillmaster Service Inclusions',
    inclusions: [
      {
        title: '1-on-1 Certified Table Grill Captain',
        desc: 'A dedicated meat sommelier stationed at your table from the first sizzle of brisket to the final sear of Wagyu.',
        highlight: 'text-flame',
        icon: 'user-check'
      },
      {
        title: 'Interactive Ssam & Flavor Pairing',
        desc: 'Guided education on matching specific banchan, roasted sea salt, garlic confit, and aged ssamjang with each cut.',
        highlight: 'text-gold',
        icon: 'compass'
      },
      {
        title: 'Reserve Cut Tasting Flight',
        desc: 'Chef-selected off-menu portions of dry-aged Wagyu ribeye and rare Berkshire pork jowl.',
        highlight: 'text-flame',
        icon: 'utensils'
      },
      {
        title: 'Binchotan Heat & Smoke Control',
        desc: 'Artisanal high-temperature grilling over smokeless white charcoal that seals in juices with pristine flavor.',
        highlight: 'text-gold',
        icon: 'shield-check'
      }
    ],
    faqs: [
      {
        q: 'What is the difference between standard dining and Grillmaster service?',
        a: 'In standard dining, guests manage their own table grill. With Grillmaster service, a dedicated culinary captain stays with your party to expertly season, sear, rest, carve, and serve every single cut.'
      },
      {
        q: 'Can the grillmaster accommodate specific meat doneness preferences?',
        a: 'Yes, absolutely. Your captain will inquire with each guest and precisely customize doneness from rare to well-done for each portion.'
      },
      {
        q: 'Is this experience available for small parties or couples?',
        a: 'Yes! The Dedicated Grillmaster Experience is available for parties of 2 all the way up to groups of 12.'
      }
    ],
    card: {
      label: 'Artisan Experience',
      title: 'Grillmaster Table Booking',
      desc: 'Enjoy hands-free Michelin-caliber Korean BBQ hospitality with your own personal chef.',
      party: '2 - 12 Diners',
      duration: '2.0 Hours',
      chef: 'Personal Tableside Master',
      price: '$85 / guest',
      ctaText: 'Reserve Grillmaster Table',
      ctaLink: 'pricing.html#reservations',
      inquireText: 'Ask Grillmaster Details',
      inquireLink: 'contact.html?subject=Grillmaster+Service+Inquiry'
    }
  }
};

/**
 * Renders the chosen service into the DOM
 * @param {string} serviceKey
 */
function renderServiceDetails(serviceKey) {
  const normalizedKey = (serviceKey || '').toLowerCase().trim();
  const data = SERVICES_DATA[normalizedKey] || SERVICES_DATA.vip;

  // 1. Update Document Title
  document.title = `KoreFlame — ${data.title}`;

  // 2. Update Breadcrumb & Header
  const breadcrumbEl = document.getElementById('service-breadcrumb');
  if (breadcrumbEl) breadcrumbEl.textContent = data.breadcrumb;

  const titleEl = document.getElementById('service-title');
  if (titleEl) titleEl.textContent = data.title;

  const leadEl = document.getElementById('service-lead');
  if (leadEl) leadEl.textContent = data.lead;

  // 3. Update Hero Image with Smooth Fade
  const imgEl = document.getElementById('service-img');
  if (imgEl) {
    imgEl.style.opacity = '0.5';
    imgEl.src = data.img;
    imgEl.alt = data.imgAlt;
    imgEl.onload = () => {
      imgEl.style.opacity = '1';
    };
  }

  // 4. Update Story Heading & Description
  const storyHeadingEl = document.getElementById('service-story-heading');
  if (storyHeadingEl) storyHeadingEl.textContent = data.storyHeading;

  const storyDescEl = document.getElementById('service-story-desc');
  if (storyDescEl) {
    storyDescEl.innerHTML = data.storyDesc
      .map(p => `<p class="text-secondary mb-3" style="line-height: 1.7; font-size: 1.02rem;">${p}</p>`)
      .join('');
  }

  // 5. Update Inclusions Heading & Grid
  const inclusionsTitleEl = document.getElementById('service-inclusions-title');
  if (inclusionsTitleEl) inclusionsTitleEl.textContent = data.inclusionsTitle;

  const inclusionsGridEl = document.getElementById('service-inclusions-grid');
  if (inclusionsGridEl) {
    inclusionsGridEl.innerHTML = data.inclusions
      .map(item => `
        <div class="col-md-6">
          <div class="p-3 bg-surface-app border border-subtle rounded-3 h-100 d-flex flex-column">
            <div class="d-flex align-items-start gap-2 mb-2">
              <span class="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width: 28px; height: 28px; background: rgba(230, 57, 36, 0.12); color: var(--color-primary); margin-top: 2px;">
                <i data-lucide="${item.icon}" style="width: 15px; height: 15px;"></i>
              </span>
              <strong class="d-block ${item.highlight} mb-0" style="font-size: 0.95rem; line-height: 1.35;">${item.title}</strong>
            </div>
            <span class="small text-muted" style="line-height: 1.55;">${item.desc}</span>
          </div>
        </div>
      `).join('');
  }

  // 6. Update FAQs Accordion
  const faqAccordionEl = document.getElementById('serviceFaqAccordion');
  if (faqAccordionEl) {
    faqAccordionEl.innerHTML = data.faqs
      .map((faq, index) => {
        const collapseId = `faq-${data.id}-${index}`;
        return `
          <div class="accordion-item bg-surface-app border-subtle mb-2 rounded-2 overflow-hidden">
            <h2 class="accordion-header" id="heading-${collapseId}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                ${faq.q}
              </button>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#serviceFaqAccordion">
              <div class="accordion-body text-secondary small" style="line-height: 1.6;">
                ${faq.a}
              </div>
            </div>
          </div>
        `;
      }).join('');
  }

  // 7. Update Right-Hand Sticky Booking Card
  const cardLabelEl = document.getElementById('service-card-label');
  if (cardLabelEl) cardLabelEl.textContent = data.card.label;

  const cardTitleEl = document.getElementById('service-card-title');
  if (cardTitleEl) cardTitleEl.textContent = data.card.title;

  const cardDescEl = document.getElementById('service-card-desc');
  if (cardDescEl) cardDescEl.textContent = data.card.desc;

  const specPartyEl = document.getElementById('service-spec-party');
  if (specPartyEl) specPartyEl.textContent = data.card.party;

  const specDurationEl = document.getElementById('service-spec-duration');
  if (specDurationEl) specDurationEl.textContent = data.card.duration;

  const specChefEl = document.getElementById('service-spec-chef');
  if (specChefEl) specChefEl.textContent = data.card.chef;

  const specPriceEl = document.getElementById('service-spec-price');
  if (specPriceEl) specPriceEl.textContent = data.card.price;

  const bookBtnEl = document.getElementById('service-book-btn');
  if (bookBtnEl) {
    bookBtnEl.textContent = data.card.ctaText;
    bookBtnEl.href = data.card.ctaLink;
  }

  const inquireBtnEl = document.getElementById('service-inquire-btn');
  if (inquireBtnEl) {
    inquireBtnEl.textContent = data.card.inquireText;
    inquireBtnEl.href = data.card.inquireLink;
  }

  // 8. Update Active Switcher Pills
  document.querySelectorAll('.btn-service-tab').forEach(btn => {
    if (btn.getAttribute('data-service') === data.id) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 9. Re-render Lucide Icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Read service from URL query params: ?id=vip or ?service=corporate
  const urlParams = new URLSearchParams(window.location.search);
  const initialService = urlParams.get('id') || urlParams.get('service') || 'vip';

  renderServiceDetails(initialService);

  // Setup click listeners on switcher tabs for instantaneous switching
  document.querySelectorAll('.btn-service-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetService = btn.getAttribute('data-service');
      if (targetService) {
        renderServiceDetails(targetService);
        const newUrl = `${window.location.pathname}?id=${targetService}`;
        window.history.pushState({ service: targetService }, '', newUrl);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const currentParams = new URLSearchParams(window.location.search);
    const serviceFromUrl = currentParams.get('id') || currentParams.get('service') || 'vip';
    renderServiceDetails(serviceFromUrl);
  });
});
