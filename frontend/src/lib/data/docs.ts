export interface DocSection {
  title: string;
  content: string[];
}

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  sections: DocSection[];
}

export const docsData: Record<string, DocPage> = {
  faq: {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about shopping at IMMERSIVE.',
    sections: [
      {
        title: 'How do I create an account?',
        content: [
          'Click the "Sign Up" button in the top navigation bar. Fill in your email address, create a password, and provide your name. You\'ll receive a verification email — click the link to activate your account.',
        ],
      },
      {
        title: 'How do I track my order?',
        content: [
          'Once your order ships, you\'ll receive a confirmation email with a tracking number. You can also log into your account and visit the "Orders" section to view real-time tracking updates.',
        ],
      },
      {
        title: 'Can I change or cancel my order?',
        content: [
          'Orders can be modified or cancelled within 1 hour of placement. After that, we begin processing and may not be able to make changes. Contact our support team immediately if you need help.',
        ],
      },
      {
        title: 'What payment methods do you accept?',
        content: [
          'We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All transactions are secured with industry-standard encryption.',
        ],
      },
      {
        title: 'Do you offer gift wrapping?',
        content: [
          'Yes! During checkout, you can select gift wrapping for any item. We offer premium wrapping with a personalized message card for a small additional fee.',
        ],
      },
    ],
  },
  shipping: {
    slug: 'shipping',
    title: 'Shipping Information',
    description: 'Everything you need to know about our shipping options and delivery times.',
    sections: [
      {
        title: 'Domestic Shipping',
        content: [
          'Standard Shipping: 5-7 business days — Free on orders over $50, otherwise $5.99.',
          'Express Shipping: 2-3 business days — $12.99.',
          'Overnight Shipping: Next business day — $24.99 (order by 2 PM EST).',
        ],
      },
      {
        title: 'International Shipping',
        content: [
          'We ship to over 50 countries worldwide. International delivery typically takes 7-14 business days.',
          'Standard International: $15.99.',
          'Express International: $29.99.',
          'Customs duties and taxes are the responsibility of the recipient.',
        ],
      },
      {
        title: 'Order Processing',
        content: [
          'Orders placed before 2 PM EST on business days are processed the same day. Orders placed after 2 PM EST or on weekends/holidays are processed the next business day.',
          'You will receive a shipping confirmation email with tracking information once your order ships.',
        ],
      },
    ],
  },
  returns: {
    slug: 'returns',
    title: 'Returns & Exchanges',
    description: 'Our hassle-free return policy makes it easy to shop with confidence.',
    sections: [
      {
        title: 'Return Policy',
        content: [
          'We offer a 30-day return window from the date of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached.',
          'To initiate a return, log into your account, go to "Orders," and click "Return Item." You\'ll receive a prepaid return label via email.',
        ],
      },
      {
        title: 'Exchanges',
        content: [
          'Need a different size or color? Select "Exchange" when initiating your return. We\'ll ship the new item as soon as we receive the original.',
          'Exchanges are free of charge — no additional shipping fees.',
        ],
      },
      {
        title: 'Refunds',
        content: [
          'Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method.',
          'Sale items are eligible for exchange or store credit only.',
        ],
      },
    ],
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    sections: [
      {
        title: 'Information We Collect',
        content: [
          'We collect information you provide directly: name, email, shipping address, payment details, and phone number when you create an account or place an order.',
          'We also collect browsing data — pages visited, time spent, and device information — to improve your shopping experience.',
        ],
      },
      {
        title: 'How We Use Your Information',
        content: [
          'Process and fulfill your orders.',
          'Send order confirmations and shipping updates.',
          'Improve our website and personalize your experience.',
          'Send promotional emails (you can unsubscribe anytime).',
        ],
      },
      {
        title: 'Data Security',
        content: [
          'We use SSL encryption and PCI-compliant payment processing. Your payment details are never stored on our servers — they are handled by our certified payment processor.',
          'We never sell or share your personal data with third parties for marketing purposes.',
        ],
      },
      {
        title: 'Cookies',
        content: [
          'We use essential cookies for site functionality (cart, login session) and analytics cookies to understand how visitors use our site. You can disable analytics cookies in your browser settings.',
        ],
      },
    ],
  },
  'terms-of-service': {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    description: 'The terms and conditions governing your use of our website and services.',
    sections: [
      {
        title: 'General',
        content: [
          'By using the IMMERSIVE website, you agree to these terms. If you do not agree, please do not use our services.',
          'We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of any changes.',
        ],
      },
      {
        title: 'Account Responsibility',
        content: [
          'You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use of your account.',
          'You must be at least 13 years old to create an account.',
        ],
      },
      {
        title: 'Intellectual Property',
        content: [
          'All content on this website — including text, images, logos, and design — is the property of IMMERSIVE and is protected by copyright and trademark laws.',
          'You may not reproduce, distribute, or create derivative works without our written permission.',
        ],
      },
    ],
  },
  'about-us': {
    slug: 'about-us',
    title: 'About IMMERSIVE',
    description: 'Our story, mission, and values.',
    sections: [
      {
        title: 'Our Mission',
        content: [
          'IMMERSIVE was founded with a simple belief: everyone deserves access to premium, thoughtfully designed products without the premium price tag.',
          'We curate a collection of products that combine quality craftsmanship, modern design, and sustainable materials.',
        ],
      },
      {
        title: 'What Sets Us Apart',
        content: [
          'Our team personally tests and reviews every product before it makes it to our store. We work directly with manufacturers to eliminate middleman markups.',
          'We\'re committed to transparency — from sourcing to pricing, we tell you exactly where your money goes.',
        ],
      },
      {
        title: 'Sustainability',
        content: [
          'We believe great products shouldn\'t come at the planet\'s expense. We prioritize sustainable materials, minimal packaging, and carbon-neutral shipping.',
          'Our packaging is 100% recyclable, and we offset the carbon footprint of every shipment.',
        ],
      },
    ],
  },
  careers: {
    slug: 'careers',
    title: 'Careers at IMMERSIVE',
    description: 'Join our team and help shape the future of premium e-commerce.',
    sections: [
      {
        title: 'Why Work With Us',
        content: [
          'We\'re a small, passionate team that values creativity, ownership, and impact. Every team member has a voice in shaping our product and culture.',
          'We offer competitive salaries, flexible work arrangements, and a generous employee discount.',
        ],
      },
      {
        title: 'Open Positions',
        content: [
          'We\'re always looking for talented people. Current openings include: Frontend Engineer, Product Designer, Supply Chain Analyst, and Customer Experience Lead.',
          'Don\'t see a fit? Send your resume to careers@immersive.shop — we\'re always interested in meeting great people.',
        ],
      },
    ],
  },
  contact: {
    slug: 'contact',
    title: 'Contact Us',
    description: 'Get in touch with our team — we\'re here to help.',
    sections: [
      {
        title: 'Customer Support',
        content: [
          'Email: support@immersive.shop',
          'Phone: 1-800-IMMERSIVE (Mon-Fri, 9 AM - 6 PM EST)',
          'Live Chat: Available on our website during business hours.',
        ],
      },
      {
        title: 'Business Inquiries',
        content: [
          'For partnerships, wholesale, or press inquiries: partnerships@immersive.shop',
        ],
      },
      {
        title: 'Mailing Address',
        content: [
          'IMMERSIVE Inc.',
          '123 Commerce Street, Suite 400',
          'New York, NY 10001',
        ],
      },
    ],
  },
  'size-guide': {
    slug: 'size-guide',
    title: 'Size Guide',
    description: 'Find your perfect fit with our comprehensive sizing guide.',
    sections: [
      {
        title: 'Clothing',
        content: [
          'XS: Chest 32-34", Waist 26-28"',
          'S: Chest 34-36", Waist 28-30"',
          'M: Chest 38-40", Waist 32-34"',
          'L: Chest 42-44", Waist 36-38"',
          'XL: Chest 46-48", Waist 40-42"',
        ],
      },
      {
        title: 'Shoes',
        content: [
          'US 6 = EU 39 = UK 5.5',
          'US 7 = EU 40 = UK 6.5',
          'US 8 = EU 41 = UK 7.5',
          'US 9 = EU 42 = UK 8.5',
          'US 10 = EU 43 = UK 9.5',
          'US 11 = EU 44 = UK 10.5',
        ],
      },
      {
        title: 'Tips',
        content: [
          'When between sizes, we recommend sizing up for a relaxed fit or sizing down for a snug fit.',
          'All measurements are in inches. For the most accurate results, have someone else measure you while you stand naturally.',
        ],
      },
    ],
  },
  cookies: {
    slug: 'cookies',
    title: 'Cookie Policy',
    description: 'Understanding how we use cookies on our website.',
    sections: [
      {
        title: 'What Are Cookies',
        content: [
          'Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.',
        ],
      },
      {
        title: 'Cookies We Use',
        content: [
          'Essential: Required for cart, checkout, and login functionality. Cannot be disabled.',
          'Analytics: Help us understand how visitors use our site (e.g., Google Analytics). Can be disabled in your browser settings.',
          'Marketing: Used to show relevant product recommendations. Can be disabled.',
        ],
      },
      {
        title: 'Managing Cookies',
        content: [
          'You can manage or disable cookies through your browser settings. Note that disabling essential cookies may affect site functionality.',
        ],
      },
    ],
  },
  sustainability: {
    slug: 'sustainability',
    title: 'Our Sustainability Commitment',
    description: 'How we\'re working toward a more sustainable future.',
    sections: [
      {
        title: 'Responsible Sourcing',
        content: [
          'We partner with suppliers who share our commitment to ethical labor practices and environmental responsibility. Every supplier is audited annually.',
        ],
      },
      {
        title: 'Eco-Friendly Packaging',
        content: [
          'All packaging is 100% recyclable and made from post-consumer materials where possible. We\'ve eliminated single-use plastics from our packaging entirely.',
        ],
      },
      {
        title: 'Carbon Neutral Shipping',
        content: [
          'We offset the carbon footprint of every shipment through verified environmental projects. At no additional cost to you.',
        ],
      },
    ],
  },
};

export function getDocPage(slug: string): DocPage | null {
  return docsData[slug] || null;
}

export function getAllDocSlugs(): string[] {
  return Object.keys(docsData);
}
