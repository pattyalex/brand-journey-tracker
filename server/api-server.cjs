// Load environment variables from .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3001;

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured. Payment features will not work.');
} else {
  console.log('✅ Stripe configured successfully');
}
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Initialize Resend (email)
const resend = new Resend(process.env.RESEND_API_KEY);
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not configured. Email features will not work.');
} else {
  console.log('✅ Resend configured successfully');
}

// Initialize Supabase (anon client for auth verification)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Initialize Supabase admin client (service role - bypasses RLS)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors({ origin: ['https://www.heymeg.ai', 'http://localhost:5173', 'http://localhost:5001'] }));
app.use(express.json());

// Rate limiters
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // 60 AI requests per hour per IP
  message: { error: 'Too many requests. Please try again later.' },
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10, // 10 emails per hour per IP
  message: { error: 'Too many requests. Please try again later.' },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 payment requests per 15 min per IP
  message: { error: 'Too many requests. Please try again later.' },
});

// Auth middleware
async function verifySupabaseAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
}

// Middleware: restrict to internal (localhost) requests only
function internalOnly(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

// Middleware: allow either authenticated user OR internal request
function authOrInternal(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return next();
  }
  return verifySupabaseAuth(req, res, next);
}

// ============================================================
// CLAUDE API PROXY (keeps API key server-side only)
// ============================================================
app.post('/api/claude', aiLimiter, verifySupabaseAuth, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  try {
    const { model, max_tokens, system, messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-haiku-4-5-20251001',
        max_tokens: max_tokens || 800,
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Claude proxy error:', err);
    res.status(500).json({ error: 'Failed to call Claude API' });
  }
});

// Create customer endpoint
app.post('/api/create-customer', paymentLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { email, name, userId } = req.body;

    console.log('Creating Stripe customer:', { email, name, userId });

    // Verify user ID matches authenticated user
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'User ID mismatch' });
    }

    // Check if customer already exists with this email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      console.log('Customer already exists:', existingCustomers.data[0].id);
      return res.json({ customerId: existingCustomers.data[0].id });
    }

    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        supabase_user_id: userId // Store Supabase user ID
      }
    });

    console.log('Stripe customer created:', customer.id);

    res.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Attach payment method endpoint
app.post('/api/attach-payment-method', verifySupabaseAuth, async (req, res) => {
  try {
    const { paymentMethodId, customerId } = req.body;
    
    console.log('Attaching payment method:', { paymentMethodId, customerId });
    
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    console.log('Payment method attached and set as default');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error attaching payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create subscription endpoint
app.post('/api/create-subscription', paymentLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { customerId, priceId, paymentMethodId, trialPeriodDays, promotionCodeId } = req.body;
    const effectiveTrialDays = trialPeriodDays != null ? trialPeriodDays : 7;

    console.log('Creating subscription:', { customerId, priceId, paymentMethodId, trialPeriodDays: effectiveTrialDays, promotionCodeId });

    // Create subscription (no trial if user already used one)
    const subParams = {
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    };
    if (paymentMethodId) {
      subParams.default_payment_method = paymentMethodId;
    }
    if (effectiveTrialDays > 0) {
      subParams.trial_period_days = effectiveTrialDays;
    }
    if (promotionCodeId) {
      subParams.discounts = [{ promotion_code: promotionCodeId }];
    }
    const subscription = await stripe.subscriptions.create(subParams);
    
    console.log('Subscription created:', subscription.id);
    
    res.json({ subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validate promotion code
app.post('/api/validate-promo-code', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Promotion code is required' });
    }

    const promoCodes = await stripe.promotionCodes.list({
      code: code.trim(),
      active: true,
      limit: 1,
    });

    if (!promoCodes.data || promoCodes.data.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired promotion code' });
    }

    const promoCode = promoCodes.data[0];
    const coupon = promoCode.coupon;

    if (!coupon || !coupon.valid) {
      return res.status(404).json({ error: 'This promotion code is no longer valid' });
    }

    let discountText = '';
    if (coupon.percent_off) {
      discountText = `${coupon.percent_off}% off`;
    } else if (coupon.amount_off) {
      discountText = `$${(coupon.amount_off / 100).toFixed(2)} off`;
    }
    if (coupon.duration === 'once') {
      discountText += ' (first payment)';
    } else if (coupon.duration === 'repeating' && coupon.duration_in_months) {
      discountText += ` for ${coupon.duration_in_months} months`;
    } else if (coupon.duration === 'forever') {
      discountText += ' forever';
    }

    res.json({ valid: true, promotionCodeId: promoCode.id, discountText, fullDiscount: coupon.percent_off === 100 });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription (at period end)
app.post('/api/cancel-subscription', verifySupabaseAuth, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) return res.status(400).json({ error: 'subscriptionId is required' });

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log('Subscription set to cancel at period end:', subscription.id);
    res.json({ subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update subscription (switch plan)
app.post('/api/update-subscription', verifySupabaseAuth, async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.body;
    if (!subscriptionId || !newPriceId) {
      return res.status(400).json({ error: 'subscriptionId and newPriceId are required' });
    }

    // Get current subscription to find item ID
    const currentSub = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = currentSub.items.data[0]?.id;
    if (!itemId) return res.status(400).json({ error: 'Could not find subscription item' });

    // Update to new price with proration
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'create_prorations',
      cancel_at_period_end: false,
    });

    console.log('Subscription updated to new price:', subscription.id);
    res.json({ subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment method for a customer
app.get('/api/get-payment-method', verifySupabaseAuth, async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) return res.status(400).json({ error: 'customerId is required' });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    });

    const pm = paymentMethods.data[0];
    res.json({
      paymentMethod: pm ? {
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoices for a customer
app.get('/api/get-invoices', verifySupabaseAuth, async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) return res.status(400).json({ error: 'customerId is required' });

    const invoiceList = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    const invoices = invoiceList.data.filter((inv) => inv.amount_paid > 0).map((inv) => ({
      id: inv.id,
      date: inv.created,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      invoicePdf: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));

    res.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer by email
app.post('/api/get-customer-by-email', verifySupabaseAuth, async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Looking up customer by email:', email);

    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length > 0) {
      console.log('Customer found:', customers.data[0].id);
      res.json({ customerId: customers.data[0].id, customer: customers.data[0] });
    } else {
      console.log('No customer found for email');
      res.json({ customerId: null });
    }
  } catch (error) {
    console.error('Error finding customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription for a customer
app.post('/api/get-subscription', verifySupabaseAuth, async (req, res) => {
  try {
    const { customerId } = req.body;

    console.log('Fetching subscriptions for customer:', customerId);

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      expand: ['data.items.data.price']
    });

    if (subscriptions.data.length > 0) {
      console.log('Subscription found:', subscriptions.data[0].id);
      res.json({ subscription: subscriptions.data[0] });
    } else {
      console.log('No subscriptions found for customer');
      res.json({ subscription: null });
    }
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create billing portal session endpoint
app.post('/api/create-portal-session', verifySupabaseAuth, async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    console.log('Creating billing portal session:', { customerId, returnUrl });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log('Billing portal session created:', session.id);

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to capture screenshot from social media URL
async function captureScreenshot(url, contentType) {
  console.log('Launching Puppeteer to capture screenshot...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  try {
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Set larger viewport for better content capture
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for content to load based on platform
    if (contentType === 'instagram') {
      // Wait for Instagram post to fully load
      await page.waitForSelector('article', { timeout: 10000 }).catch(() => {});

      // Wait longer for video elements to load
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if it's a video and get metadata
      const contentInfo = await page.evaluate(() => {
        // Try multiple selectors for video detection
        const videoElement = document.querySelector('video') ||
                           document.querySelector('article video') ||
                           document.querySelector('[role="button"] video') ||
                           document.querySelector('div[style*="video"]');

        // Also check for play button or video controls
        const hasPlayButton = !!document.querySelector('button[aria-label*="Play"], button[aria-label*="play"], svg[aria-label*="Play"]');

        const isVideo = !!videoElement || hasPlayButton;

        // Try to get post caption/text - look for any text content
        let caption = '';
        const captionSelectors = [
          'article h1',
          'article [role="button"] + div',
          'article span[dir="auto"]',
          'article div[class*="Caption"]',
          'h1'
        ];

        for (const selector of captionSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent && element.textContent.trim()) {
            caption = element.textContent.trim();
            break;
          }
        }

        // Look for any text overlays in the image
        const textElements = Array.from(document.querySelectorAll('img[alt], [aria-label]'));
        const altTexts = textElements.map(el => el.getAttribute('alt') || el.getAttribute('aria-label')).filter(Boolean);

        return { isVideo, caption, altTexts, hasPlayButton };
      }).catch(() => ({ isVideo: false, caption: '', altTexts: [], hasPlayButton: false }));

      console.log('Content info:', contentInfo);

      // Fallback: Most modern Instagram posts are videos/reels
      // If we couldn't detect definitively, assume it's a video
      if (!contentInfo.isVideo && url.includes('/p/')) {
        console.log('Assuming this is a video based on Instagram post pattern');
        contentInfo.isVideo = true;
      }

      // Try to find and screenshot just the main post article
      const articleElement = await page.$('article').catch(() => null);

      if (articleElement) {
        console.log('Capturing screenshot of Instagram post...');
        const screenshot = await articleElement.screenshot({
          type: 'jpeg',
          quality: 95
        });
        await browser.close();

        // Return both screenshot and metadata
        return {
          screenshot: screenshot.toString('base64'),
          metadata: contentInfo
        };
      }
    } else if (contentType === 'tiktok') {
      // Wait for TikTok video to load
      await page.waitForSelector('video', { timeout: 10000 }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Fallback: Take full page screenshot
    console.log('Capturing full page screenshot...');
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 95,
      fullPage: false
    });

    await browser.close();

    return {
      screenshot: screenshot.toString('base64'),
      metadata: { isVideo: false, caption: '', altTexts: [] }
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

// Claude API endpoint for analyzing content with vision
app.post('/api/analyze-content', aiLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { contentUrl, contentType, imageData: providedImageData, mediaType: providedMediaType, directUrl } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_claude_api_key_here') {
      return res.status(400).json({ error: 'Claude API key not configured' });
    }

    console.log('Analyzing content with Claude Vision API...', contentType);

    // Use provided image data or capture from URL
    let imageData;
    let mediaType = providedMediaType || 'image/jpeg';
    let contentMetadata = {};

    if (providedImageData) {
      // Image data provided directly (from screenshot upload)
      imageData = providedImageData;
      console.log('Using provided image data');
    } else if (directUrl) {
      // User provided a direct Instagram/TikTok URL - use Puppeteer to capture
      try {
        const captureResult = await captureScreenshot(directUrl, contentType);

        // Handle both old string format and new object format
        if (typeof captureResult === 'string') {
          imageData = captureResult;
        } else {
          imageData = captureResult.screenshot;
          contentMetadata = captureResult.metadata || {};
        }

        mediaType = 'image/jpeg';
        console.log('Screenshot captured successfully');
        console.log('Content metadata:', contentMetadata);
      } catch (error) {
        console.error('Error capturing screenshot:', error);
        return res.status(400).json({ error: 'Could not capture content from URL. The page may be private or require login.' });
      }
    } else if (contentUrl) {
      // Thumbnail URL provided - fetch it directly
      try {
        const imageResponse = await fetch(contentUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch content: ${imageResponse.status}`);
        }

        const contentTypeHeader = imageResponse.headers.get('content-type');
        if (contentTypeHeader) {
          mediaType = contentTypeHeader;
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        imageData = Buffer.from(arrayBuffer).toString('base64');
      } catch (error) {
        console.error('Error fetching content:', error);
        return res.status(400).json({ error: 'Could not fetch content from URL' });
      }
    } else {
      return res.status(400).json({ error: 'Either contentUrl, directUrl, or imageData must be provided' });
    }

    // Build context hint from metadata
    let contextHint = '';
    if (contentMetadata && contentMetadata.isVideo) {
      contextHint = '\n\nIMPORTANT: This is a VIDEO/REEL, not a static image. The screenshot shows just one frame from the video.';
    }
    if (contentMetadata && contentMetadata.caption) {
      contextHint += `\n\nPost caption/description: "${contentMetadata.caption}"`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData
              }
            },
            {
              type: 'text',
              text: `Analyze this social media content carefully.${contextHint}

Focus on:
1. Any TEXT OVERLAYS or CAPTIONS in the image/video - these reveal the core message
2. The person's body language and setting
3. The overall theme and message being conveyed

Provide your analysis in JSON format:

{
  "pillar": "The main topic/pillar based on the message (e.g., Business/Entrepreneurship, Personal Development, Networking, Career, Nutrition, Lifestyle, Fashion, etc.)",
  "format": "The content format - if you see a video play button or were told it's a video, say 'Reel' or 'Video'. Other formats: Carousel, Static image post, etc.",
  "deliveryStyle": "The delivery style (e.g., Educational, Entertaining, Inspirational, Motivational, Relatable, etc.)",
  "hook": "The hook or main message - quote the largest/most prominent TEXT OVERLAY you see in the image. This text is usually the hook or main point.",
  "comments": "What people would likely comment about based on the message (e.g., Relatability, Disagreement, Agreement, Inspiration, Requests for more, etc.)",
  "summary": "A brief 2-3 sentence natural language summary explaining the core message and what makes this content effective"
}

CRITICAL INSTRUCTIONS:
- The largest text overlay you see IS the hook/main message - quote it exactly
- If it's a video (you see play button or were told), say format is "Reel" or "Video"
- The TEXT reveals the topic, not the person's appearance
- Focus on the MESSAGE and TOPIC being communicated, not visual aesthetics`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
    }

    const data = await response.json();
    console.log('Content analyzed successfully');

    res.json(data);
  } catch (error) {
    console.error('Error analyzing content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Claude API endpoint for generating content ideas
app.post('/api/generate-ideas', aiLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_claude_api_key_here') {
      return res.status(400).json({ error: 'Claude API key not configured' });
    }

    console.log('Generating ideas with Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
    }

    const data = await response.json();
    console.log('Ideas generated successfully');

    res.json(data);
  } catch (error) {
    console.error('Error generating ideas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate sub-categories for a content pillar
app.post('/api/generate-subcategories', aiLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { pillarName, existingCategories } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_anthropic_api_key') {
      return res.status(400).json({ error: 'Anthropic API key not configured' });
    }

    if (!pillarName || pillarName.trim().length < 2) {
      return res.status(400).json({ error: 'Pillar name must be at least 2 characters' });
    }

    console.log(`Generating sub-categories for pillar: "${pillarName}"...`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `Generate sub-categories for content pillars.

STRICT RULES:
- Each sub-category MUST be 1-2 words ONLY
- Maximum 15 characters per sub-category
- NO sentences, NO hooks, NO content ideas
- Think: folder names, not video titles

CORRECT FORMAT:
["Fundraising", "Leadership", "Hiring", "Failures", "Growth"]

WRONG FORMAT (DO NOT DO THIS):
["How I raised money", "My leadership journey", "Hiring mistakes I made"]

Return ONLY a JSON array.`,
        messages: [{
          role: 'user',
          content: `Content pillar: "${pillarName}"

Generate 5-7 sub-categories. Each must be 1-2 words only (like folder names).
${existingCategories && existingCategories.length > 0 ? `\nDO NOT include any of these already existing categories: ${JSON.stringify(existingCategories)}\nGenerate DIFFERENT ones only.\n` : ''}
Example: For "Fitness" → ["Workouts", "Nutrition", "Recovery", "Mindset", "Equipment"]

Return JSON array only.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Parse the JSON array from the response
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const subCategories = JSON.parse(match[0]);
      console.log(`Generated ${subCategories.length} sub-categories for "${pillarName}"`);
      res.json({ subCategories });
    } else {
      console.error('No valid JSON array found in response:', text);
      res.status(500).json({ error: 'Failed to parse sub-categories from AI response' });
    }
  } catch (error) {
    console.error('Error generating sub-categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate content ideas for a pillar + sub-category
app.post('/api/generate-content-ideas', aiLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { pillarName, subCategory, count, direction, allThemes, previousIdeas } = req.body;
    const ideaCount = count || 7;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_anthropic_api_key') {
      return res.status(400).json({ error: 'Anthropic API key not configured' });
    }

    if (!pillarName || !subCategory) {
      return res.status(400).json({ error: 'Both pillarName and subCategory are required' });
    }

    console.log(`Generating content ideas for "${pillarName}" > "${subCategory}"...`);

    // MegAI system prompt — kept in sync with src/lib/megai-prompt.ts
    const systemPrompt = `You are MegAI, a creative strategist that generates content ideas for brand creators.

## Core Rules

1. **Theme specificity is non-negotiable.** Every idea you generate must be deeply specific to the user's topic and theme. If an idea would still make sense for a completely different niche just by swapping out a keyword, discard it and try again. Generic ideas are failures.

2. **No generic hook templates.** Never fall back on formulaic hooks like "X things you didn't know about Y" or "Stop scrolling if you Z." Every hook must be crafted from the specific substance of the topic, not filled into a reusable template.

3. **Vary narrative structure across ideas.** Do not repeat the same format or storytelling arc within a set of ideas. Mix approaches — use contrast, tension, personal stakes, unexpected angles, behind-the-scenes framing, provocative questions, or micro-stories. Each idea should feel structurally distinct from the others.

4. **User direction is the highest priority instruction.** When the user provides direction, tone preferences, or constraints, treat those as overriding instructions. Shape every idea around what the user has asked for, not what seems generically "engaging."

5. **Avoid repetition.** When provided with previousIdeas, never regenerate or closely rephrase any of them. Each new idea must offer a genuinely different angle.

## Output Rules
- Write as actual video/post titles that make people stop scrolling
- NO emojis
- Each idea should spark curiosity or emotion
- Keep titles concise (under 15 words)
- Return ONLY a JSON array of ${ideaCount} strings, nothing else.`;

    const themesContext = allThemes && allThemes.length > 0
      ? `\n\nThe creator's full set of content themes: ${allThemes.join(', ')}. The ACTIVE theme is "${pillarName}" — generate ideas only for this theme.`
      : '';

    const previousIdeasBlock = previousIdeas && previousIdeas.length > 0
      ? `\n\nPREVIOUSLY GENERATED IDEAS (do NOT repeat or closely rephrase any of these):\n${previousIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}`
      : '';

    const directionBlock = direction
      ? `\n\nIMPORTANT DIRECTION: The ideas should have a "${direction}" tone/angle. Lean heavily into this direction.`
      : '';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Generate ${ideaCount} content ideas for a creator focused on "${pillarName}", specifically about "${subCategory}".${themesContext}${directionBlock}${previousIdeasBlock}

Return only a JSON array of strings.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
    }

    const data = await response.json();
    const text = data.content[0].text;

    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const ideas = JSON.parse(match[0]);
      console.log(`Generated ${ideas.length} content ideas for "${pillarName}" > "${subCategory}"`);
      res.json({ ideas });
    } else {
      console.error('No valid JSON array found in response:', text);
      res.status(500).json({ error: 'Failed to parse ideas from AI response' });
    }
  } catch (error) {
    console.error('Error generating content ideas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Shot suggestion endpoint for storyboard
app.post('/api/suggest-shots', aiLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { sceneTitle, sceneVisualNotes, scriptExcerpt, format, platform, shotTemplates, apiKey: clientApiKey } = req.body;
    // Use client-provided API key first, fallback to environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_claude_api_key_here') {
      return res.status(400).json({ error: 'Claude API key not configured' });
    }

    console.log('Generating shot suggestions with Claude API...');

    // Build template reference for the prompt
    const templateReference = shotTemplates.map(t =>
      `- ID: "${t.id}" | Name: "${t.user_facing_name}" | Tags: [${t.internal_tags.join(', ')}]`
    ).join('\n');

    const validTemplateIds = shotTemplates.map(t => t.id);

    const systemPrompt = `You are a cinematography assistant helping content creators choose how to film their scenes.

IMPORTANT RULES:
1. You MUST only select from the provided shot template IDs below. NEVER invent new shot types.
2. Return exactly 2-3 recommendations.
3. Keep reasons short (1 sentence max).
4. DO NOT repeat the shot name in your reason. Start directly with why it works (e.g., "Works well for..." or "Creates intimacy..." or "Adds visual variety...").
5. Consider the scene's emotional tone, purpose, and content type.

AVAILABLE SHOT TEMPLATES (use ONLY these IDs):
${templateReference}

VALID TEMPLATE IDs: ${validTemplateIds.join(', ')}

Respond ONLY with valid JSON in this exact format:
{
  "suggestions": [
    {"template_id": "exact-id-from-list", "reason": "Works well for [brief reason]"},
    {"template_id": "exact-id-from-list", "reason": "Creates [brief effect/benefit]"}
  ]
}`;

    const userPrompt = `Suggest 2-3 shot types for this scene:

Scene Title: ${sceneTitle || 'Untitled'}
Visual Notes: ${sceneVisualNotes || 'None provided'}
Script Excerpt: "${scriptExcerpt || 'No script'}"
${format ? `Video Format: ${format}` : ''}
${platform ? `Platform: ${platform}` : ''}

Remember: Only use template IDs from the provided list.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse the JSON response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Validate that all template IDs are valid
    const validatedSuggestions = [];
    for (const suggestion of parsed.suggestions || []) {
      if (validTemplateIds.includes(suggestion.template_id)) {
        validatedSuggestions.push({
          template_id: suggestion.template_id,
          reason: suggestion.reason || 'Recommended for this scene'
        });
      }
    }

    if (validatedSuggestions.length === 0) {
      return res.status(500).json({ error: 'AI returned invalid shot types. Please try again.' });
    }

    console.log('Shot suggestions generated:', validatedSuggestions.length);
    res.json({ suggestions: validatedSuggestions });

  } catch (error) {
    console.error('Error generating shot suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate storyboard from script endpoint
app.post('/api/generate-storyboard', aiLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { script, format, platform, shotTemplates, apiKey: clientApiKey } = req.body;
    // Use client-provided API key first, fallback to environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_claude_api_key_here') {
      return res.status(400).json({ error: 'Claude API key not configured' });
    }

    if (!script || script.trim().length < 10) {
      return res.status(400).json({ error: 'Script is too short' });
    }

    console.log('Generating storyboard with Claude API...');

    // Build template reference for the prompt
    const templateReference = shotTemplates.map(t =>
      `- "${t.id}": ${t.user_facing_name} - ${t.description.slice(0, 100)}...`
    ).join('\n');

    const validTemplateIds = shotTemplates.map(t => t.id);

    const systemPrompt = `You are a professional video director helping content creators plan their shoots.
Your task is to analyze a script and break it into filmable scenes, selecting the most appropriate shot type for each.

AVAILABLE SHOT TYPES (you MUST only use these exact IDs):
${templateReference}

CRITICAL RULES:
1. Break the script into logical moments/scenes (each line or sentence that represents one shot)
2. For "scriptLine" you MUST use the EXACT TEXT copied directly from the script - do NOT paraphrase or summarize
3. For each scene, select the MOST appropriate shot from the available options using ONLY the provided IDs
4. Write a practical, beginner-friendly filming description (framing + simple direction)
5. Keep descriptions concise but actionable (1-2 sentences)
6. Vary the shot types for visual interest - don't use the same shot repeatedly
7. Consider the content type: ${format || 'video'} for ${platform || 'social media'}

IMPORTANT: The "scriptLine" field must contain EXACT quotes from the script, not summaries or descriptions.

RESPOND WITH ONLY a JSON array in this exact format (no other text):
[
  {
    "scriptLine": "Copy the EXACT text from the script here - no paraphrasing",
    "shotTemplateId": "one-of-the-valid-shot-ids",
    "filmingDescription": "Brief, practical direction for how to film this shot"
  }
]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Here is the script to break into filmable scenes:\n\n${script}` }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse the JSON response
    let scenes = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.scriptLine && item.shotTemplateId && item.filmingDescription) {
              // Validate shot ID - default to medium-shot if invalid
              const shotId = validTemplateIds.includes(item.shotTemplateId)
                ? item.shotTemplateId
                : 'medium-shot';

              const template = shotTemplates.find(t => t.id === shotId);

              scenes.push({
                scriptLine: item.scriptLine,
                shotTemplateId: shotId,
                shotName: template?.user_facing_name || 'Medium Shot',
                filmingDescription: item.filmingDescription
              });
            }
          }
        }
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    if (scenes.length === 0) {
      return res.status(500).json({ error: 'Could not generate scenes from script. Please try again.' });
    }

    console.log('Storyboard generated:', scenes.length, 'scenes');
    res.json({ scenes });

  } catch (error) {
    console.error('Error generating storyboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== GOOGLE CALENDAR INTEGRATION ==========

const { google } = require('googleapis');

// Create OAuth2 client for Google Calendar
const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/google-calendar/callback'
  );
};

// Generate Google OAuth URL
app.get('/api/google-calendar/auth-url', (req, res) => {
  try {
    const { userId } = req.query;

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(400).json({
        error: 'Google Calendar not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.'
      });
    }

    const oauth2Client = createOAuth2Client();

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId || 'default'
    });

    console.log('Generated Google Calendar auth URL for user:', userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle OAuth callback
app.get('/api/google-calendar/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code) {
      return res.redirect('/?google-calendar-error=no-code');
    }

    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    console.log('Google Calendar connected for:', userInfo.email);

    // Return HTML that passes tokens back to the frontend via postMessage
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Calendar Connected</title>
          <style>
            body {
              font-family: 'DM Sans', -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(145deg, #f5f0f3 0%, #ede5ea 100%);
            }
            .container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 20px;
              box-shadow: 0 4px 24px rgba(45, 42, 38, 0.08);
            }
            .success-icon {
              width: 64px;
              height: 64px;
              background: linear-gradient(145deg, #4285f4 0%, #1a73e8 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
            }
            .success-icon svg { width: 32px; height: 32px; color: white; }
            h2 { color: #2d2a26; margin-bottom: 10px; }
            p { color: #8B7082; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>Google Calendar Connected!</h2>
            <p>You can close this window now.</p>
          </div>
          <script>
            const data = {
              success: true,
              tokens: ${JSON.stringify(tokens)},
              email: ${JSON.stringify(userInfo.email)}
            };
            // Store tokens in localStorage regardless
            localStorage.setItem('google_calendar_tokens', JSON.stringify(data.tokens));
            localStorage.setItem('google_calendar_email', data.email);
            localStorage.setItem('google_calendar_connected', 'true');

            if (window.opener) {
              window.opener.postMessage({ type: 'google-calendar-callback', ...data }, 'https://www.heymeg.ai');
              setTimeout(() => window.close(), 2000);
            } else {
              // No opener available - just stay on this success page
              // The parent window will pick up the connection from localStorage
              document.querySelector('p').textContent = 'Connected! You can close this tab and return to HeyMeg.';
            }
          </script>
        </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    res.redirect('/?google-calendar-error=' + encodeURIComponent(error.message));
  }
});

// Check connection status (validates tokens)
app.post('/api/google-calendar/status', async (req, res) => {
  try {
    const { tokens } = req.body;

    if (!tokens || !tokens.access_token) {
      return res.json({ isConnected: false });
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    // Try to get user info to validate tokens
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    res.json({
      isConnected: true,
      email: userInfo.email,
      tokens: oauth2Client.credentials // Return potentially refreshed tokens
    });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    res.json({ isConnected: false, error: error.message });
  }
});

// Disconnect and revoke tokens
app.post('/api/google-calendar/disconnect', async (req, res) => {
  try {
    const { tokens } = req.body;

    if (tokens && tokens.access_token) {
      const oauth2Client = createOAuth2Client();
      oauth2Client.setCredentials(tokens);

      try {
        await oauth2Client.revokeToken(tokens.access_token);
        console.log('Google Calendar tokens revoked');
      } catch (revokeError) {
        console.warn('Could not revoke token (may already be invalid):', revokeError.message);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch calendar events
app.post('/api/google-calendar/events', async (req, res) => {
  try {
    const { tokens, startDate, endDate } = req.body;

    if (!tokens || !tokens.access_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Build time range - add buffer to cover all timezones
    // Subtract 1 day from start and add 1 day to end to ensure we capture events
    // that may span timezone boundaries. Frontend filters by local date.
    const startMs = startDate ? new Date(startDate).getTime() : Date.now();
    const endMs = endDate ? new Date(endDate).getTime() : Date.now() + 30 * 24 * 60 * 60 * 1000;
    const timeMin = new Date(startMs - 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(endMs + 24 * 60 * 60 * 1000).toISOString();

    console.log('Fetching Google Calendar events:', { timeMin, timeMax });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250
    });

    const events = response.data.items || [];
    console.log('Fetched', events.length, 'Google Calendar events');

    // Transform events to HeyMeg format
    const transformedEvents = events.map(event => {
      const isAllDay = !event.start?.dateTime;
      const startDateTime = event.start?.dateTime || event.start?.date;
      const endDateTime = event.end?.dateTime || event.end?.date;

      // Parse date and time
      let date, startTime, endTime;

      if (isAllDay) {
        date = event.start?.date; // YYYY-MM-DD format
      } else {
        // Parse date and time directly from the dateTime string (e.g. "2026-02-12T17:00:00-08:00")
        // This preserves the event's local timezone rather than converting to UTC
        date = startDateTime.slice(0, 10); // "2026-02-12"
        startTime = startDateTime.slice(11, 16); // "17:00"
        endTime = endDateTime.slice(11, 16);
      }

      return {
        id: event.id,
        title: event.summary || '(No title)',
        description: event.description,
        date,
        startTime,
        endTime,
        isAllDay,
        source: 'google',
        htmlLink: event.htmlLink,
        location: event.location
      };
    });

    res.json({
      events: transformedEvents,
      tokens: oauth2Client.credentials // Return potentially refreshed tokens
    });
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);

    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({ error: 'Token expired or revoked', needsReauth: true });
    }

    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
// Save onboarding responses
app.post('/api/save-onboarding-responses', verifySupabaseAuth, async (req, res) => {
  try {
    const { post_frequency, ideation_method, team_structure, creator_dream, platforms, stuck_areas, other_stuck_area } = req.body;

    // Use the user's token so RLS auth.uid() check passes
    const token = req.headers.authorization.replace('Bearer ', '');
    const userClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { error } = await userClient
      .from('user_onboarding_responses')
      .insert({
        user_id: req.user.id,
        post_frequency,
        ideation_method,
        team_structure,
        creator_dream,
        platforms,
        stuck_areas,
        other_stuck_area: other_stuck_area || null
      });

    if (error) {
      console.error('Error saving onboarding responses:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Onboarding responses saved for user:', req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to save onboarding responses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user's account and ALL associated data
app.post('/api/delete-user', verifySupabaseAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🗑️ Starting full account deletion for user:', userId);

    // 1. Cancel active Stripe subscription if exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        console.log('✅ Stripe subscription canceled:', profile.stripe_subscription_id);
      } catch (stripeErr) {
        console.error('Stripe cancel error (continuing):', stripeErr.message);
      }
    }

    // 2. Delete all user data from every table
    // brand_deal_deliverables has no user_id — it cascades from brand_deals
    // planner_items cascades from planner_days if FK is set, but delete explicitly to be safe
    const tablesToDelete = [
      'brand_deals',
      'planner_items',
      'planner_days',
      'content_items',
      'content_ideas',
      'content_pillars',
      'calendar_events',
      'collaborations',
      'collab_brands',
      'collab_columns',
      'tasks',
      'production_cards',
      'notes',
      'quick_notes',
      'user_strategy',
      'user_goals',
      'analytics',
      'social_accounts',
      'settings',
      'user_preferences',
      'vision_board_items',
      'research_items',
      'user_onboarding_responses',
      'work_habits',
    ];

    for (const table of tablesToDelete) {
      try {
        const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId);
        if (error) {
          console.warn(`Warning deleting from ${table}:`, error.message);
        } else {
          console.log(`✅ Deleted from ${table}`);
        }
      } catch (tableErr) {
        console.warn(`Error deleting from ${table}:`, tableErr.message);
      }
    }

    // 3. Delete profile and users table entries (use 'id' not 'user_id')
    await supabaseAdmin.from('users').delete().eq('id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);
    console.log('✅ All user data deleted from database');

    // 4. Delete the auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Error deleting auth user:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Account fully deleted for user:', userId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in delete-user endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================================
// EMAIL ENDPOINTS (Resend)
// ============================================================

// Send welcome email when a new user signs up
app.post('/api/send-welcome-email', emailLimiter, authOrInternal, async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const firstName = name ? name.split(' ')[0] : 'there';

    const { data, error } = await resend.emails.send({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to: email,
      subject: `Welcome to HeyMeg, ${firstName}! 🎉`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Welcome to HeyMeg!</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hi ${firstName},
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We're so excited to have you on board! Your 14-day free trial has started, and you now have full access to everything HeyMeg has to offer.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Here's what you can do to get started:
          </p>
          <ul style="color: #555; font-size: 16px; line-height: 1.8;">
            <li>Set up your brand profile</li>
            <li>Define your content pillars</li>
            <li>Plan your content calendar</li>
            <li>Track your partnerships</li>
          </ul>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            If you have any questions, just reply to this email — we're here to help!
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            — The HeyMeg Team
          </p>
          <p style="color: #999; font-size: 12px; line-height: 1.4; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            This is an automated message. Please do not reply to this email. If you need help, contact us at contact@heymeg.ai.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Welcome email sent to:', email);
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Generic send email endpoint
app.post('/api/send-email', emailLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, and html are required' });
    }

    const { data, error } = await resend.emails.send({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// New user signup - admin notification
app.post('/api/send-signup-admin-notification', emailLimiter, authOrInternal, async (req, res) => {
  try {
    const { email, name, userId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const signedUpAt = new Date().toLocaleString();

    const { data, error } = await resend.emails.send({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to: 'patricia.cincora@gmail.com',
      subject: `New User Signup: ${name || 'Unknown'} (${email})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">New User Signed Up! 🎉</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">A new user has joined HeyMeg.</p>
          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Name:</td><td style="padding: 8px 16px; color: #555;">${name || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Email:</td><td style="padding: 8px 16px; color: #555;">${email}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">User ID:</td><td style="padding: 8px 16px; color: #555;">${userId || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Signed up at:</td><td style="padding: 8px 16px; color: #555;">${signedUpAt}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Trial ends:</td><td style="padding: 8px 16px; color: #555;">${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td></tr>
          </table>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Signup admin notification sent for:', email);
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Trial ending reminder email
app.post('/api/send-trial-reminder', internalOnly, async (req, res) => {
  try {
    const { email, name, trialEndsAt } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const firstName = name ? name.split(' ')[0] : 'there';
    const endDate = new Date(trialEndsAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const { data, error } = await resend.emails.send({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to: email,
      subject: `Your HeyMeg trial ends in 2 days`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Your trial is ending soon</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Just a heads up — your HeyMeg free trial ends on <strong>${endDate}</strong>.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">After your trial ends, your subscription will automatically begin and your card on file will be charged.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">If you'd like to cancel before your trial ends, you can do so from your account settings.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">We hope you've been enjoying HeyMeg!</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">— The HeyMeg Team</p>
          <p style="color: #999; font-size: 12px; line-height: 1.4; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">This is an automated message. Please do not reply to this email. If you need help, contact us at contact@heymeg.ai.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Trial reminder sent to:', email);
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Payment failed email
app.post('/api/send-payment-failed', internalOnly, async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const firstName = name ? name.split(' ')[0] : 'there';

    const { data, error } = await resend.emails.send({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to: email,
      subject: `Action required: Your HeyMeg payment failed`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Payment Failed</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">We were unable to process your latest payment for HeyMeg. This can happen if your card has expired or if there are insufficient funds.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Please update your payment method in your account settings to avoid any interruption to your service.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">If you believe this is a mistake or need help, don't hesitate to reach out to us at contact@heymeg.ai.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">— The HeyMeg Team</p>
          <p style="color: #999; font-size: 12px; line-height: 1.4; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">This is an automated message. Please do not reply to this email. If you need help, contact us at contact@heymeg.ai.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Payment failed email sent to:', email);
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Subscription cancelled email
app.post('/api/send-subscription-cancelled', emailLimiter, authOrInternal, async (req, res) => {
  try {
    const { email, name, accessEndsAt } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const firstName = name ? name.split(' ')[0] : 'there';
    const endDate = accessEndsAt
      ? new Date(accessEndsAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'the end of your current billing period';

    const { data, error } = await resend.emails.send({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to: email,
      subject: `Your HeyMeg subscription has been cancelled`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Subscription Cancelled</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Your HeyMeg subscription has been cancelled as requested.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">You will continue to have full access to all features until <strong>${endDate}</strong>.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Resubscribe to regain access to all your content and features.</p>
          <div style="text-align: left; margin: 30px 0;">
            <a href="https://heymeg.ai/membership" style="display: inline-block; padding: 14px 32px; background-color: #612a4f; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Resubscribe to HeyMeg</a>
          </div>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">If you have any questions or feedback, please don't hesitate to reach out to us at <a href="mailto:contact@heymeg.ai" style="color: #612a4f; text-decoration: none;">contact@heymeg.ai</a>.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Thank you for being part of HeyMeg.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">— The HeyMeg Team</p>
          <p style="color: #999; font-size: 12px; line-height: 1.4; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">This is an automated message. Please do not reply to this email. If you need help, contact us at contact@heymeg.ai.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Subscription cancelled email sent to:', email);
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Resubscription confirmation email
app.post('/api/send-resubscription-email', emailLimiter, verifySupabaseAuth, async (req, res) => {
  try {
    const { email, name, planType } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const firstName = name ? name.split(' ')[0] : 'there';
    const planLabel = planType === 'annual' ? 'Annual' : 'Monthly';
    const priceLabel = planType === 'annual' ? '$21/month (billed annually at $252)' : '$29/month';

    const { data, error } = await resend.emails.send({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to: email,
      subject: `Welcome back to HeyMeg!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Welcome Back!</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Your HeyMeg subscription is now active! You have full access to all your content and features.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Here's a summary of your subscription:</p>
          <table style="border-collapse: collapse; margin: 20px 0; width: 100%; max-width: 400px;">
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Plan:</td><td style="padding: 8px 16px; color: #555;">HeyMeg ${planLabel}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Amount charged:</td><td style="padding: 8px 16px; color: #555;">${planType === 'annual' ? '$252.00' : '$29.00'}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Billing:</td><td style="padding: 8px 16px; color: #555;">${priceLabel}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Date:</td><td style="padding: 8px 16px; color: #555;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>
          </table>
          <div style="text-align: left; margin: 30px 0;">
            <a href="https://heymeg.ai/home-page" style="display: inline-block; padding: 14px 32px; background-color: #612a4f; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to HeyMeg</a>
          </div>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">If you have any questions, reach out to us at <a href="mailto:contact@heymeg.ai" style="color: #612a4f; text-decoration: none;">contact@heymeg.ai</a>.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">We're happy to have you back!</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">— The HeyMeg Team</p>
          <p style="color: #999; font-size: 12px; line-height: 1.4; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">This is an automated message. Please do not reply to this email. If you need help, contact us at contact@heymeg.ai.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Resubscription email sent to:', email);
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Payment receipt/confirmation email
app.post('/api/send-payment-receipt', internalOnly, async (req, res) => {
  try {
    const { email, name, amount, planType } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const firstName = name ? name.split(' ')[0] : 'there';
    const formattedAmount = amount ? `$${(amount / 100).toFixed(2)}` : (planType === 'annual' ? '$252.00' : '$29.00');
    const planLabel = planType === 'annual' ? 'Annual' : 'Monthly';
    const paidDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const { data, error } = await resend.emails.send({
      from: 'HeyMeg <noreply@heymeg.ai>',
      to: email,
      subject: `Payment received — thank you!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">Payment Received</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">We've received your payment. Here's your receipt:</p>
          <table style="border-collapse: collapse; margin: 20px 0; width: 100%; max-width: 400px;">
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Amount:</td><td style="padding: 8px 16px; color: #555;">${formattedAmount}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Plan:</td><td style="padding: 8px 16px; color: #555;">HeyMeg ${planLabel}</td></tr>
            <tr><td style="padding: 8px 16px; font-weight: bold; color: #333;">Date:</td><td style="padding: 8px 16px; color: #555;">${paidDate}</td></tr>
          </table>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">You can manage your billing details anytime from your account settings.</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">— The HeyMeg Team</p>
          <p style="color: #999; font-size: 12px; line-height: 1.4; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">This is an automated message. Please do not reply to this email. If you need help, contact us at contact@heymeg.ai.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Payment receipt sent to:', email);
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ============================================================
// STRIPE WEBHOOK (handles payment events and triggers emails)
// ============================================================

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sigHeader = req.headers['stripe-signature'];

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!sigHeader) {
    console.error('Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sigHeader, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log('📩 Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        // Update subscription status in Supabase
        await supabaseAdmin.from('profiles').update({ subscription_status: 'past_due' }).eq('stripe_customer_id', customerId);
        // Look up user by stripe_customer_id
        const { data: profile } = await supabaseAdmin.from('profiles').select('email, full_name').eq('stripe_customer_id', customerId).single();
        if (profile) {
          await fetch(`http://localhost:${port}/api/send-payment-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profile.email, name: profile.full_name }),
          });
        }
        break;
      }

      // Payment succeeded (receipt)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        // Update subscription status to active in Supabase
        await supabaseAdmin.from('profiles').update({ subscription_status: 'active', is_on_trial: false }).eq('stripe_customer_id', customerId);
        // Skip the receipt email if it's a trial (amount = 0)
        if (invoice.amount_paid === 0) break;
        const { data: profile } = await supabaseAdmin.from('profiles').select('email, full_name, plan_type').eq('stripe_customer_id', customerId).single();
        if (profile) {
          await fetch(`http://localhost:${port}/api/send-payment-receipt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profile.email, name: profile.full_name, amount: invoice.amount_paid, planType: profile.plan_type }),
          });
        }
        break;
      }

      // Subscription cancelled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        // Update subscription status to canceled in Supabase
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'canceled',
          is_on_trial: false,
        }).eq('stripe_customer_id', customerId);
        console.log('✅ Subscription status set to canceled for customer:', customerId);
        const { data: profile } = await supabaseAdmin.from('profiles').select('email, full_name').eq('stripe_customer_id', customerId).single();
        if (profile) {
          const accessEndsAt = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;
          await fetch(`http://localhost:${port}/api/send-subscription-cancelled`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profile.email, name: profile.full_name, accessEndsAt }),
          });
        }
        break;
      }

      // Trial ending soon (Stripe sends this 3 days before trial ends)
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const { data: profile } = await supabaseAdmin.from('profiles').select('email, full_name, trial_ends_at').eq('stripe_customer_id', customerId).single();
        if (profile) {
          await fetch(`http://localhost:${port}/api/send-trial-reminder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profile.email, name: profile.full_name, trialEndsAt: profile.trial_ends_at }),
          });
        }
        break;
      }

      default:
        console.log('Unhandled Stripe event type:', event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API server running at http://0.0.0.0:${port}`);
});
