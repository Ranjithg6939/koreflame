const fs = require('fs');

let content = fs.readFileSync('index-2.html', 'utf8');

const target = `            <div class="d-flex flex-wrap gap-2 mb-3">
              <a href="pricing.html#reservations" class="btn-flame" style="padding: 0.65rem 1.35rem; font-size: 0.9rem;">
                <i data-lucide="users" style="width: 18px; height: 18px;"></i>
                <span>Reserve Group Table (2 - 30 Guests)</span>
              </a>
              <a href="pricing.html" class="btn-flame-outline" style="padding: 0.65rem 1.25rem; font-size: 0.9rem;">
                <i data-lucide="gift" style="width: 18px; height: 18px;"></i>
                <span>Celebration Packages</span>
              </a>
            </div>`;

const replacement = `            <div class="hero-cta-group d-flex flex-column flex-sm-row flex-wrap gap-2.5 mb-3 align-items-stretch align-items-sm-center">
              <a href="pricing.html#reservations" class="btn-flame text-nowrap justify-content-center" style="padding: 0.68rem 1.35rem; font-size: 0.9rem;">
                <i data-lucide="users" style="width: 18px; height: 18px;"></i>
                <span><span class="d-none d-sm-inline">Reserve Group Table (2 - 30 Guests)</span><span class="d-sm-none">Reserve Group Table (2-30)</span></span>
              </a>
              <a href="pricing.html" class="btn-flame-outline text-nowrap justify-content-center" style="padding: 0.68rem 1.35rem; font-size: 0.9rem;">
                <i data-lucide="gift" style="width: 18px; height: 18px;"></i>
                <span>Celebration Packages</span>
              </a>
            </div>`;

// Normalize CRLF to LF for matching, or check both
if (content.includes(target.replace(/\r?\n/g, '\r\n'))) {
  content = content.replace(target.replace(/\r?\n/g, '\r\n'), replacement.replace(/\r?\n/g, '\r\n'));
  fs.writeFileSync('index-2.html', content, 'utf8');
  console.log('Successfully updated index-2.html (CRLF)');
} else if (content.includes(target.replace(/\r?\n/g, '\n'))) {
  content = content.replace(target.replace(/\r?\n/g, '\n'), replacement.replace(/\r?\n/g, '\n'));
  fs.writeFileSync('index-2.html', content, 'utf8');
  console.log('Successfully updated index-2.html (LF)');
} else {
  console.error('Target not found');
}
