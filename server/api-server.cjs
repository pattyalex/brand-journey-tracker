// Load environment variables from .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const puppeteer = require('puppeteer');

const app = express();
const port = 3001;

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured. Payment features will not work.');
} else {
  console.log('✅ Stripe configured successfully');
}
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

app.use(cors());
app.use(express.json());

// Clerk webhook handler for user deletion
app.post('/api/webhooks/clerk', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('Clerk webhook received:', type);

    // Handle user deletion
    if (type === 'user.deleted') {
      const userId = data.id;
      console.log('User deleted in Clerk:', userId);

      // Import Supabase (you'll need to set this up properly)
      // For now, we'll just handle Stripe deletion

      // Find and delete Stripe customer
      const customers = await stripe.customers.list({
        limit: 100
      });

      const customer = customers.data.find(c => c.metadata.clerk_user_id === userId);

      if (customer) {
        console.log('Deleting Stripe customer:', customer.id);
        await stripe.customers.del(customer.id);
        console.log('Stripe customer deleted successfully');
      } else {
        console.log('No Stripe customer found for user:', userId);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create customer endpoint
app.post('/api/create-customer', async (req, res) => {
  try {
    const { email, name, userId } = req.body;

    console.log('Creating Stripe customer:', { email, name, userId });

    // Check if customer already exists with this Clerk user ID
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
        clerk_user_id: userId // Store Clerk user ID
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
app.post('/api/attach-payment-method', async (req, res) => {
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
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId, paymentMethodId } = req.body;
    
    console.log('Creating subscription:', { customerId, priceId, paymentMethodId });
    
    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      trial_period_days: 7,
      expand: ['latest_invoice.payment_intent'],
    });
    
    console.log('Subscription created:', subscription.id);
    
    res.json({ subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer by email
app.post('/api/get-customer-by-email', async (req, res) => {
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
app.post('/api/get-subscription', async (req, res) => {
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
app.post('/api/create-portal-session', async (req, res) => {
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
app.post('/api/analyze-content', async (req, res) => {
  try {
    const { contentUrl, contentType, imageData: providedImageData, mediaType: providedMediaType, directUrl } = req.body;
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

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
app.post('/api/generate-ideas', async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API server running at http://0.0.0.0:${port}`);
});
